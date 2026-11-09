import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { credentialsSchema, enrollmentSchema, gameEventSchema, madridWeek, type Challenge, type RoundResult } from "./game";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getRanking = createServerFn({ method: "GET" }).handler(async () => {
  const { publicGameClient } = await import("./game.server");
  const { data, error } = await publicGameClient().from("game_ranking").select("alias,score,total_ms,week").eq("week", madridWeek(new Date())).order("score", { ascending: false }).order("total_ms", { ascending: true }).limit(100);
  if (error) throw new Error("No se ha podido cargar el ranking");
  return data ?? [];
});

export const startGame = createServerFn({ method: "POST" })
  .inputValidator(input => z.object({ visitorId: z.string().uuid(), ref: z.string().max(100).nullable(), runId: z.string().uuid().optional(), secret: z.string().uuid().optional() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: challenge, error } = await supabaseAdmin.rpc("game_start", { _visitor: data.visitorId, _ref: data.ref ?? "", ...(data.runId && data.secret ? { _run: data.runId, _secret: data.secret } : {}) });
    if (error) throw new Error(error.message);
    return challenge as unknown as Challenge;
  });

export const submitGame = createServerFn({ method: "POST" })
  .inputValidator(input => credentialsSchema.extend({ challengeId: z.number().int().min(1).max(3), selected: z.array(z.string().max(10)).max(16) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("submit_game", { _run: data.runId, _secret: data.secret, _challenge: data.challengeId, _selected: data.selected });
    if (error) throw new Error(error.message);
    return result as unknown as RoundResult;
  });

export const enrollGame = createServerFn({ method: "POST" }).inputValidator(input => enrollmentSchema.parse(input)).handler(async () => {
  // Do not collect contact data until managed confirmation email sending is configured.
  return { available: false, message: "La confirmación por email todavía no está disponible. No hemos guardado tu email." };
});

export const confirmGame = createServerFn({ method: "POST" }).inputValidator(input => z.object({ token: z.string().uuid() }).parse(input)).handler(async ({ data }) => {
  const { sha256 } = await import("./game.server");
  const hash = await sha256(data.token);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: entry, error } = await supabaseAdmin.from("game_entries").update({ confirmed_at: new Date().toISOString() }).eq("confirmation_hash", hash).select("id").maybeSingle();
  if (error || !entry) throw new Error("Este enlace de confirmación no es válido");
  return { confirmed: true };
});

export const recordGameEvent = createServerFn({ method: "POST" }).inputValidator(input => gameEventSchema.parse(input)).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: run } = await supabaseAdmin.from("game_runs").select("id,visitor_id,ref").eq("id", data.runId).eq("secret", data.secret).maybeSingle();
  if (!run) throw new Error("Partida no válida");
  const { data: existing } = await supabaseAdmin.from("game_events").select("id").eq("run_id", run.id).eq("tipo", data.type).limit(1);
  if (existing?.length) return { recorded: true };
  const { error } = await supabaseAdmin.from("game_events").insert({ run_id: run.id, visitor_id: run.visitor_id, tipo: data.type, ref: run.ref, extra: data.extra ?? {} });
  if (error) throw new Error("No se ha podido registrar el evento");
  return { recorded: true };
});

export const gameAdmin = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ entryId: z.string().uuid().optional(), action: z.enum(["review", "hide", "show"]).optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !allowed) throw new Error("Esta cuenta no tiene acceso al panel");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.entryId && data.action) {
      const { error } = await supabaseAdmin.from("game_entries").update(data.action === "review" ? { reviewed: true } : { hidden: data.action === "hide" }).eq("id", data.entryId);
      if (error) throw new Error("No se ha podido guardar el cambio");
    }
    const { data: entries, error } = await supabaseAdmin.from("game_entries").select("id,alias,score,total_ms,reviewed,hidden").eq("week", madridWeek(new Date())).not("confirmed_at", "is", null).order("score", { ascending: false }).order("total_ms").limit(100);
    if (error) throw new Error("No se ha podido cargar el panel");
    const { data: events, error: eventError } = await supabaseAdmin.from("game_events").select("run_id,tipo,ref,fecha").gte("fecha", new Date(Date.now() - 14 * 86400000).toISOString()).limit(10000);
    if (eventError) throw new Error("No se ha podido cargar el resumen");
    const summarize = (shared: boolean) => {
      const start = (events ?? []).filter(e => e.tipo === "inicio" && Date.parse(e.fecha) >= Date.now() - 7 * 86400000 && (!shared || e.ref === "compartido"));
      const ids = new Set(start.map(e => e.run_id));
      const count = (type: string) => new Set((events ?? []).filter(e => ids.has(e.run_id) && e.tipo === type && Date.parse(e.fecha) - Date.parse(start.find(s => s.run_id === e.run_id)?.fecha ?? "") <= 7 * 86400000).map(e => e.run_id)).size;
      return { started: ids.size, finished: count("fin"), shared: count("compartir"), emails: count("email"), tests: count("test_fin"), purchases: count("compra") };
    };
    return { entries: entries ?? [], summaries: [summarize(false), summarize(true)] };
  });