import { z } from "zod";

export const transactionSchema = z.object({ id: z.string(), size: z.number().int().positive(), fee: z.number().int().nonnegative() });
export type Transaction = z.infer<typeof transactionSchema>;
export const credentialsSchema = z.object({ runId: z.string().uuid(), secret: z.string().uuid() });
export const enrollmentSchema = credentialsSchema.extend({ email: z.string().trim().email().max(254).transform(v => v.toLowerCase()), alias: z.string().trim().min(1).max(20).refine(v => !v.includes("@") && !/[\r\n<>]/.test(v), "Usa un alias, no un email"), consent: z.literal(true) });
export const gameEventSchema = credentialsSchema.extend({ type: z.enum(["compartir", "test_inicio", "test_fin", "test_aprobado"]), extra: z.object({ action: z.enum(["share", "copy", "download"]).optional() }).optional() });
export function selectionTotal(transactions: Transaction[], selected: string[]) {
  return transactions.filter(t => selected.includes(t.id)).reduce((a, t) => ({ size: a.size + t.size, fee: a.fee + t.fee }), { size: 0, fee: 0 });
}
export function madridDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function madridWeek(date: Date) {
  const day = new Date(`${madridDay(date)}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}
export function formatTime(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
export type Challenge = { runId: string; secret: string; challengeId: number; name: string; capacity: number; transactions: Transaction[]; timeLimit: number; remainingMs: number };
export type RoundResult = { score: number; elapsedMs: number; finalScore: number | null; totalMs: number | null; complete: boolean };
export type RankingRow = { alias: string | null; score: number | null; total_ms: number | null; week: string | null };