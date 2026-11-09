import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  aliasSchema,
  credentialsSchema,
  gameEventSchema,
  madridDay,
  madridWeek,
  type Challenge,
  type Ranking,
  type RankingRow,
  type RoundResult,
} from "./game";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* El juego vive en estas funciones de servidor: el navegador solo recibe las cajas del reto,
 * nunca la mejor combinación, y la nota y el tiempo se calculan aquí. */

const ROUNDS = 3;
const seed = () => process.env["GAME_SEED"] ?? "";
const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const puzzles = () => import("./game-puzzle");

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

export const startGame = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        visitorId: z.string().uuid(),
        ref: z.string().max(100).nullable(),
        runId: z.string().uuid().optional(),
        secret: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<Challenge> => {
    const db = await admin();
    const { makePuzzle, dayNumber } = await puzzles();
    let run;
    if (data.runId && data.secret) {
      run = await loadRun(data.runId, data.secret);
    } else {
      const { count } = await db
        .from("game_runs")
        .select("id", { count: "exact", head: true })
        .eq("visitor_id", data.visitorId)
        .gte("started_at", new Date(Date.now() - 3600000).toISOString());
      if ((count ?? 0) >= 30)
        throw new Error("Demasiadas partidas seguidas. Vuelve dentro de un rato.");
      const { data: created, error } = await db
        .from("game_runs")
        .insert({ visitor_id: data.visitorId, ref: data.ref?.slice(0, 100) || null })
        .select("*")
        .single();
      if (error || !created) throw new Error("El reto no ha podido empezar. Inténtalo otra vez.");
      run = created;
      await db
        .from("game_events")
        .insert({ run_id: run.id, visitor_id: run.visitor_id, tipo: "inicio", ref: run.ref });
    }
    if (run.completed_at) throw new Error("Esta partida ya ha terminado.");
    const { count: done } = await db
      .from("game_rounds")
      .select("run_id", { count: "exact", head: true })
      .eq("run_id", run.id)
      .not("submitted_at", "is", null);
    const round = (done ?? 0) + 1;
    await db
      .from("game_rounds")
      .upsert(
        { run_id: run.id, challenge_id: round },
        { onConflict: "run_id,challenge_id", ignoreDuplicates: true },
      );
    const { data: row } = await db
      .from("game_rounds")
      .select("started_at")
      .eq("run_id", run.id)
      .eq("challenge_id", round)
      .single();
    const day = madridDay(new Date(run.started_at));
    const puzzle = makePuzzle(day, round, seed());
    const elapsed = Date.now() - Date.parse(row?.started_at ?? new Date().toISOString());
    return {
      runId: run.id,
      secret: run.secret,
      day,
      dayNumber: dayNumber(day),
      round,
      capacity: puzzle.capacity,
      boxes: puzzle.boxes,
      timeLimit: puzzle.timeLimit,
      remainingMs: Math.max(0, puzzle.timeLimit * 1000 - elapsed),
    };
  });

export const submitGame = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    credentialsSchema
      .extend({
        round: z.number().int().min(1).max(ROUNDS),
        selected: z.array(z.string().max(5)).max(12),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<RoundResult> => {
    const db = await admin();
    const { makePuzzle, scoreFor, solve } = await puzzles();
    const run = await loadRun(data.runId, data.secret);
    const day = madridDay(new Date(run.started_at));
    const puzzle = makePuzzle(day, data.round, seed());
    const perfect = solve(puzzle.boxes, puzzle.capacity).ids;
    const { data: row } = await db
      .from("game_rounds")
      .select("*")
      .eq("run_id", run.id)
      .eq("challenge_id", data.round)
      .maybeSingle();
    if (!row) throw new Error("Este reto no ha empezado.");
    let score: number, elapsedMs: number, fee: number;
    if (row.submitted_at) {
      score = Number(row.score);
      elapsedMs = row.elapsed_ms ?? 0;
      fee = puzzle.boxes
        .filter((b) => ((row.selected as string[] | null) ?? []).includes(b.id))
        .reduce((a, b) => a + b.fee, 0);
    } else {
      const now = Date.now();
      elapsedMs = Math.max(0, now - Date.parse(row.started_at));
      if (elapsedMs > (puzzle.timeLimit + 5) * 1000)
        throw new Error("Se ha agotado el tiempo. Empieza una nueva partida.");
      const ids = [...new Set(data.selected)];
      if (
        ids.length !== data.selected.length ||
        ids.some((id) => !puzzle.boxes.some((b) => b.id === id))
      )
        throw new Error("Cajas no válidas.");
      const chosen = puzzle.boxes.filter((b) => ids.includes(b.id));
      const size = chosen.reduce((a, b) => a + b.size, 0);
      fee = chosen.reduce((a, b) => a + b.fee, 0);
      score = size > puzzle.capacity ? 0 : scoreFor(fee, puzzle);
      elapsedMs = Math.min(elapsedMs, puzzle.timeLimit * 1000);
      const { data: updated } = await db
        .from("game_rounds")
        .update({
          submitted_at: new Date(now).toISOString(),
          selected: ids,
          score,
          elapsed_ms: elapsedMs,
        })
        .eq("run_id", run.id)
        .eq("challenge_id", data.round)
        .is("submitted_at", null)
        .select("run_id");
      if (!updated?.length) throw new Error("Este reto ya se había enviado. Recarga la página.");
    }
    let finalScore: number | null = run.score === null ? null : Number(run.score);
    let totalMs: number | null = run.total_ms;
    let betterThan: number | null = null;
    const { data: rounds } = await db
      .from("game_rounds")
      .select("score,elapsed_ms,submitted_at")
      .eq("run_id", run.id);
    const submitted = (rounds ?? []).filter((r) => r.submitted_at);
    if (submitted.length === ROUNDS) {
      if (!run.completed_at) {
        finalScore =
          Math.round((submitted.reduce((a, r) => a + Number(r.score), 0) / ROUNDS) * 10) / 10;
        totalMs = submitted.reduce((a, r) => a + (r.elapsed_ms ?? 0), 0);
        const { data: closed } = await db
          .from("game_runs")
          .update({ completed_at: new Date().toISOString(), score: finalScore, total_ms: totalMs })
          .eq("id", run.id)
          .is("completed_at", null)
          .select("id");
        if (closed?.length)
          await db
            .from("game_events")
            .insert({ run_id: run.id, visitor_id: run.visitor_id, tipo: "fin", ref: run.ref });
      }
      const range = dayRange(day);
      const { data: others } = await db
        .from("game_runs")
        .select("score")
        .gte("started_at", range.from)
        .lt("started_at", range.to)
        .not("completed_at", "is", null)
        .neq("id", run.id)
        .limit(5000);
      if ((others?.length ?? 0) >= 10 && finalScore !== null) {
        const below = others!.filter((o) => Number(o.score) < finalScore!).length;
        betterThan = Math.round((below / others!.length) * 100);
      }
    }
    return {
      round: data.round,
      score,
      fee,
      best: puzzle.best,
      perfect,
      elapsedMs,
      finalScore,
      totalMs,
      complete: submitted.length === ROUNDS,
      betterThan,
    };
  });

/** Entrar en el ranking con un alias: sin email. Solo cuenta la primera partida terminada del día. */
export const enterRanking = createServerFn({ method: "POST" })
  .inputValidator((input) => credentialsSchema.extend({ alias: aliasSchema }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const run = await loadRun(data.runId, data.secret);
    if (!run.completed_at || run.score === null) throw new Error("Termina los tres retos primero.");
    const day = madridDay(new Date(run.started_at));
    const range = dayRange(day);
    const { data: first } = await db
      .from("game_runs")
      .select("id")
      .eq("visitor_id", run.visitor_id)
      .gte("started_at", range.from)
      .lt("started_at", range.to)
      .not("completed_at", "is", null)
      .order("completed_at")
      .limit(1);
    if (first?.[0]?.id !== run.id)
      return {
        entered: false,
        message:
          "En el ranking solo cuenta tu primera partida de cada día. Mañana hay bloque nuevo.",
      };
    const { error } = await db.from("game_entries").insert({
      run_id: run.id,
      email: `visitante:${run.visitor_id}`,
      alias: data.alias,
      play_day: day,
      week: madridWeek(new Date(run.started_at)),
      score: Number(run.score),
      total_ms: run.total_ms ?? 0,
      confirmation_hash: "sin-email",
      confirmed_at: new Date().toISOString(),
    });
    if (error)
      return {
        entered: false,
        message:
          error.code === "23505"
            ? "Tu bloque de hoy ya está en el ranking."
            : "No se ha podido guardar. Inténtalo otra vez.",
      };
    return { entered: true, message: "¡Dentro! Tu bloque de hoy ya está en el ranking." };
  });

export const getRanking = createServerFn({ method: "GET" }).handler(async (): Promise<Ranking> => {
  const db = await admin();
  const { dayNumber } = await puzzles();
  const now = new Date();
  const day = madridDay(now);
  const { data, error } = await db
    .from("game_entries")
    .select("email,alias,score,total_ms,play_day")
    .eq("week", madridWeek(now))
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
    p.score = Math.round((p.score + Number(r.score)) * 10) / 10;
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
    const { error } = await db
      .from("game_events")
      .insert({
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
