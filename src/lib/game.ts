import { z } from "zod";

export type Box = { id: string; size: number; fee: number };
export const credentialsSchema = z.object({ runId: z.string().uuid(), secret: z.string().uuid() });
export const aliasSchema = z
  .string()
  .trim()
  .min(1, "Escribe un alias")
  .max(20, "Máximo 20 caracteres")
  .refine((v) => !v.includes("@") && !/[\r\n<>]/.test(v), "Usa un alias, no un email");
export const gameEventSchema = credentialsSchema.extend({
  type: z.enum(["compartir", "email", "test_inicio", "test_fin", "test_aprobado"]),
  extra: z
    .object({ action: z.enum(["share", "copy", "download", "lista_espera"]).optional() })
    .optional(),
});

export function selectionTotal(boxes: Box[], selected: string[]) {
  return boxes
    .filter((t) => selected.includes(t.id))
    .reduce((a, t) => ({ size: a.size + t.size, fee: a.fee + t.fee }), { size: 0, fee: 0 });
}
export function madridDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function madridWeek(date: Date) {
  const day = new Date(`${madridDay(date)}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day.toISOString().slice(0, 10);
}
export function formatTime(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
/** Día 1 del Bloque del día. */
export const FIRST_DAY = "2026-11-09";
export function dayNumber(day: string) {
  return (
    Math.round((Date.parse(`${day}T12:00:00Z`) - Date.parse(`${FIRST_DAY}T12:00:00Z`)) / 86400000) +
    1
  );
}
export const formatScore = (n: number) => n.toFixed(1).replace(".", ",");
/** Cuadradito para la tarjeta de compartir, según la nota del reto. */
export const scoreSquare = (n: number) => (n >= 10 ? "🟩" : n >= 7 ? "🟨" : n >= 4 ? "🟧" : "⬜");

export type Challenge = {
  runId: string;
  secret: string;
  day: string;
  dayNumber: number;
  round: number;
  capacity: number;
  boxes: Box[];
  timeLimit: number;
  remainingMs: number;
};
export type RoundResult = {
  round: number;
  score: number;
  fee: number;
  best: number;
  perfect: string[];
  elapsedMs: number;
  finalScore: number | null;
  totalMs: number | null;
  complete: boolean;
  betterThan: number | null;
};
export type RankingRow = {
  alias: string;
  score: number;
  total_ms: number;
  days?: number | undefined;
};
export type Ranking = { day: string; dayNumber: number; today: RankingRow[]; week: RankingRow[] };
