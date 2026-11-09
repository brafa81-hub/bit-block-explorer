import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  ATTEMPTS,
  SNAKE_TAG,
  aliasSchema,
  credentialsSchema,
  dayNumber,
  gameEventSchema,
  madridDay,
  madridWeek,
  movesSchema,
  type Ranking,
  type RankingRow,
  type SnakeOutcome,
  type SnakeStart,
} from "./game";
import { makeLayout, simulate, type Move } from "./snake";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* Snake minero: el navegador juega y solo envía los giros. Aquí se repite la partida con el
 * mismo motor (src/lib/snake.ts) y se calculan los puntos. Sin cambios en la base de datos:
 * las partidas del Snake se distinguen por extra.juego = "snake" en sus eventos y por
 * confirmation_hash = "snake" en game_entries. */

const seed = () => process.env["GAME_SEED"] ?? "";
const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
/** Instante UTC en que empieza un día de Madrid. */
function dayStart(day: string) {
  for (const hours of [1, 2]) {
    const t = Date.parse(`${day}T00:00:00Z`) - hours * 3600000;
    if (madridDay(new Date(t)) === day && madridDay(new Date(t - 1)) !== day) return t;
  }
  return Date.parse(`${day}T00:00:00Z`) - 3600000;
}
const dayRange = (day: string) => {
  const start = dayStart(day);
  const next = new Date(start + 26 * 3600000);
  return {
    from: new Date(start).toISOString(),
    to: new Date(dayStart(madridDay(next))).toISOString(),
  };
};

async function loadRun(runId: string, secret: string) {
  const db = await admin();
  const { data: run } = await db
    .from("game_runs")
    .select("*")
    .eq("id", runId)
    .eq("secret", secret)
    .maybeSingle();
  if (!run) throw new Error("Partida no válida. Empieza una nueva.");
  return run;
}

/** Número de intento de una partida (guardado en su evento «inicio»). */
async function attemptOf(runId: string) {
  const db = await admin();
  const { data } = await db
    .from("game_events")
    .select("extra")
    .eq("run_id", runId)
    .eq("tipo", "inicio")
    .eq("extra->>juego", SNAKE_TAG)
    .limit(1);
  const extra = data?.[0]?.extra as { intento?: number } | undefined;
  if (!extra) throw new Error("Partida no válida. Empieza una nueva.");
  return extra.intento ?? ATTEMPTS + 1;
}

export const startGame = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ visitorId: z.string().uuid(), ref: z.string().max(100).nullable() }).parse(input),
  )
  .handler(async ({ data }): Promise<SnakeStart> => {
    const db = await admin();
    const { count } = await db
      .from("game_runs")
      .select("id", { count: "exact", head: true })
      .eq("visitor_id", data.visitorId)
      .gte("started_at", new Date(Date.now() - 3600000).toISOString());
    if ((count ?? 0) >= 30)
      throw new Error("Demasiadas partidas seguidas. Vuelve dentro de un rato.");
    const range = dayRange(madridDay(new Date()));
    const { count: before } = await db
      .from("game_events")
      .select("id", { count: "exact", head: true })
      .eq("visitor_id", data.visitorId)
      .eq("tipo", "inicio")
      .eq("extra->>juego", SNAKE_TAG)
      .gte("fecha", range.from)
      .lt("fecha", range.to);
    const { data: run, error } = await db
      .from("game_runs")
      .insert({ visitor_id: data.visitorId, ref: data.ref?.slice(0, 100) || null })
      .select("*")
      .single();
    if (error || !run) throw new Error("La partida no ha podido empezar. Inténtalo otra vez.");
    const attempt = (before ?? 0) + 1;
    await db.from("game_events").insert({
      run_id: run.id,
      visitor_id: run.visitor_id,
      tipo: "inicio",
      ref: run.ref,
      extra: { juego: SNAKE_TAG, intento: attempt },
    });
    const day = madridDay(new Date(run.started_at));
    return {
      runId: run.id,
      secret: run.secret,
      day,
      dayNumber: dayNumber(day),
      attempt,
      layout: makeLayout(day, seed()),
    };
  });

type FinExtra = {
  juego: string;
  intento: number;
  puntos: number;
  bloques: number;
  tiempo_ms: number;
  puntos_ms: number;
  pasos: number;
  choque: boolean;
};

async function betterThan(day: string, visitorId: string, points: number) {
  const db = await admin();
  const range = dayRange(day);
  const { data } = await db
    .from("game_events")
    .select("visitor_id,puntos:extra->puntos")
    .eq("tipo", "fin")
    .eq("extra->>juego", SNAKE_TAG)
    .gte("fecha", range.from)
    .lt("fecha", range.to)
    .neq("visitor_id", visitorId)
    .limit(5000);
  // El mejor intento de cada persona.
  const best = new Map<string, number>();
  for (const r of (data ?? []) as { visitor_id: string; puntos: unknown }[])
    best.set(r.visitor_id, Math.max(best.get(r.visitor_id) ?? 0, Number(r.puntos) || 0));
  if (best.size < 10) return null;
  const below = [...best.values()].filter((p) => p < points).length;
  return Math.round((below / best.size) * 100);
}

export const submitGame = createServerFn({ method: "POST" })
  .inputValidator((input) => credentialsSchema.extend({ moves: movesSchema }).parse(input))
  .handler(async ({ data }): Promise<SnakeOutcome> => {
    const db = await admin();
    const run = await loadRun(data.runId, data.secret);
    const attempt = await attemptOf(run.id);
    const day = madridDay(new Date(run.started_at));
    const counts = attempt <= ATTEMPTS;
    if (run.completed_at) {
      // Reenvío tras un fallo de red: se devuelve lo que ya se guardó.
      const { data: fin } = await db
        .from("game_events")
        .select("extra")
        .eq("run_id", run.id)
        .eq("tipo", "fin")
        .limit(1);
      const e = fin?.[0]?.extra as FinExtra | undefined;
      if (!e) throw new Error("Esta partida ya ha terminado.");
      return {
        blocks: e.bloques,
        points: e.puntos,
        timeMs: e.tiempo_ms,
        scoreTimeMs: e.puntos_ms,
        ticks: e.pasos,
        crashed: e.choque,
        attempt,
        counts,
        betterThan: await betterThan(day, run.visitor_id, e.puntos),
      };
    }
    let result;
    try {
      result = simulate(makeLayout(day, seed()), data.moves as Move[]);
    } catch {
      throw new Error("Partida no válida. Empieza una nueva.");
    }
    const real = Date.now() - Date.parse(run.started_at);
    if (real < result.timeMs - 2000)
      throw new Error("La partida no cuadra con el tiempo. Empieza una nueva.");
    if (real > 30 * 60000) throw new Error("La partida ha caducado. Empieza una nueva.");
    const { data: closed } = await db
      .from("game_runs")
      .update({
        completed_at: new Date().toISOString(),
        score: result.points,
        total_ms: result.scoreTimeMs,
      })
      .eq("id", run.id)
      .is("completed_at", null)
      .select("id");
    if (closed?.length) {
      const extra: FinExtra & { giros: Move[] } = {
        juego: SNAKE_TAG,
        intento: attempt,
        puntos: result.points,
        bloques: result.blocks,
        tiempo_ms: result.timeMs,
        puntos_ms: result.scoreTimeMs,
        pasos: result.ticks,
        choque: result.crashed,
        giros: data.moves as Move[],
      };
      await db
        .from("game_events")
        .insert({ run_id: run.id, visitor_id: run.visitor_id, tipo: "fin", ref: run.ref, extra });
    }
    return {
      ...result,
      attempt,
      counts,
      betterThan: await betterThan(day, run.visitor_id, result.points),
    };
  });

/** Entrar en el ranking con un alias, sin email. De los 3 primeros intentos del día cuenta el mejor. */
export const enterRanking = createServerFn({ method: "POST" })
  .inputValidator((input) => credentialsSchema.extend({ alias: aliasSchema }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const run = await loadRun(data.runId, data.secret);
    if (!run.completed_at || run.score === null) throw new Error("Termina la partida primero.");
    const attempt = await attemptOf(run.id);
    if (attempt > ATTEMPTS)
      return {
        entered: false,
        message: `En el ranking cuentan tus ${ATTEMPTS} primeros intentos de cada día. Mañana hay cadena nueva.`,
      };
    const day = madridDay(new Date(run.started_at));
    const email = `visitante:${run.visitor_id}`;
    const score = Number(run.score);
    const totalMs = run.total_ms ?? 0;
    const fields = {
      run_id: run.id,
      alias: data.alias,
      week: madridWeek(new Date(run.started_at)),
      score,
      total_ms: totalMs,
      confirmation_hash: SNAKE_TAG,
      confirmed_at: new Date().toISOString(),
    };
    const { data: existing } = await db
      .from("game_entries")
      .select("id,score,total_ms,confirmation_hash")
      .eq("email", email)
      .eq("play_day", day)
      .maybeSingle();
    const fail = { entered: false, message: "No se ha podido guardar. Inténtalo otra vez." };
    if (!existing) {
      const { error } = await db.from("game_entries").insert({ ...fields, email, play_day: day });
      if (error) return fail;
      return {
        entered: true,
        message: `¡Dentro! Cuenta tu mejor intento de hoy: ${score} puntos.`,
      };
    }
    const better =
      existing.confirmation_hash !== SNAKE_TAG ||
      score > Number(existing.score) ||
      (score === Number(existing.score) && totalMs < existing.total_ms);
    const { error } = await db
      .from("game_entries")
      .update(better ? fields : { alias: data.alias })
      .eq("id", existing.id);
    if (error) return fail;
    return better
      ? { entered: true, message: `¡Mejoras! Ahora cuenta este intento: ${score} puntos.` }
      : {
          entered: true,
          message: `Sigue contando tu mejor intento de hoy: ${Number(existing.score)} puntos.`,
        };
  });

export const getRanking = createServerFn({ method: "GET" }).handler(async (): Promise<Ranking> => {
  const db = await admin();
  const now = new Date();
  const day = madridDay(now);
  const { data, error } = await db
    .from("game_entries")
    .select("email,alias,score,total_ms,play_day")
    .eq("week", madridWeek(now))
    .eq("confirmation_hash", SNAKE_TAG)
    .eq("hidden", false)
    .not("confirmed_at", "is", null)
    .limit(5000);
  if (error) throw new Error("No se ha podido cargar el ranking");
  const rows = data ?? [];
  const sort = (a: RankingRow, b: RankingRow) => b.score - a.score || a.total_ms - b.total_ms;
  const today = rows
    .filter((r) => r.play_day === day)
    .map((r) => ({ alias: r.alias, score: Number(r.score), total_ms: r.total_ms }))
    .sort(sort)
    .slice(0, 100);
  const people = new Map<string, RankingRow & { last: string }>();
  for (const r of rows) {
    const p = people.get(r.email) ?? { alias: r.alias, score: 0, total_ms: 0, days: 0, last: "" };
    p.score += Number(r.score);
    p.total_ms += r.total_ms;
    p.days = (p.days ?? 0) + 1;
    if (r.play_day >= p.last) {
      p.alias = r.alias;
      p.last = r.play_day;
    }
    people.set(r.email, p);
  }
  const week = [...people.values()]
    .map(({ alias, score, total_ms, days }) => ({ alias, score, total_ms, days }))
    .sort(sort)
    .slice(0, 100);
  return { day, dayNumber: dayNumber(day), today, week };
});

export const recordGameEvent = createServerFn({ method: "POST" })
  .inputValidator((input) => gameEventSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const run = await loadRun(data.runId, data.secret);
    const { data: existing } = await db
      .from("game_events")
      .select("id")
      .eq("run_id", run.id)
      .eq("tipo", data.type)
      .limit(1);
    if (existing?.length) return { recorded: true };
    const { error } = await db.from("game_events").insert({
      run_id: run.id,
      visitor_id: run.visitor_id,
      tipo: data.type,
      ref: run.ref,
      extra: data.extra ?? {},
    });
    if (error) throw new Error("No se ha podido registrar el evento");
    return { recorded: true };
  });

export const gameAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        entryId: z.string().uuid().optional(),
        action: z.enum(["review", "hide", "show"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !allowed) throw new Error("Esta cuenta no tiene acceso al panel");
    const db = await admin();
    if (data.entryId && data.action) {
      const { error } = await db
        .from("game_entries")
        .update(data.action === "review" ? { reviewed: true } : { hidden: data.action === "hide" })
        .eq("id", data.entryId);
      if (error) throw new Error("No se ha podido guardar el cambio");
    }
    const { data: entries, error } = await db
      .from("game_entries")
      .select("id,alias,score,total_ms,reviewed,hidden,play_day")
      .eq("week", madridWeek(new Date()))
      .eq("confirmation_hash", SNAKE_TAG)
      .not("confirmed_at", "is", null)
      .order("score", { ascending: false })
      .order("total_ms")
      .limit(200);
    if (error) throw new Error("No se ha podido cargar el panel");
    const { data: events, error: eventError } = await db
      .from("game_events")
      .select("run_id,tipo,ref,fecha")
      .gte("fecha", new Date(Date.now() - 14 * 86400000).toISOString())
      .limit(20000);
    if (eventError) throw new Error("No se ha podido cargar el resumen");
    const summarize = (shared: boolean) => {
      const start = (events ?? []).filter(
        (e) =>
          e.tipo === "inicio" &&
          Date.parse(e.fecha) >= Date.now() - 7 * 86400000 &&
          (!shared || e.ref === "compartido"),
      );
      const begun = new Map(start.map((e) => [e.run_id, Date.parse(e.fecha)]));
      const count = (type: string) =>
        new Set(
          (events ?? [])
            .filter(
              (e) =>
                begun.has(e.run_id) &&
                e.tipo === type &&
                Date.parse(e.fecha) - begun.get(e.run_id)! <= 7 * 86400000,
            )
            .map((e) => e.run_id),
        ).size;
      return {
        started: begun.size,
        finished: count("fin"),
        shared: count("compartir"),
        emails: count("email"),
        tests: count("test_fin"),
        purchases: count("compra"),
      };
    };
    return { entries: entries ?? [], summaries: [summarize(false), summarize(true)] };
  });
