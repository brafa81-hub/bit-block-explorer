import { z } from "zod";
import type { Layout, SnakeResult } from "./snake";

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
/** Giros de la partida: [paso, dirección]. 90 s al paso más rápido son 1.125 pasos. */
export const movesSchema = z
  .array(z.tuple([z.number().int().min(0).max(1200), z.number().int().min(0).max(3)]))
  .max(1200);

/** Marca de las partidas y entradas del Snake, para no mezclarlas con el juego anterior. */
export const SNAKE_TAG = "snake";
/** Intentos de cada día que cuentan para el ranking (cuenta el mejor). */
export const ATTEMPTS = 3;

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
/** Día 1 de la Cadena del día (Snake minero). */
export const FIRST_DAY = "2026-11-10";
export function dayNumber(day: string) {
  return (
    Math.round((Date.parse(`${day}T12:00:00Z`) - Date.parse(`${FIRST_DAY}T12:00:00Z`)) / 86400000) +
    1
  );
}
/** 1275 → «1.275». */
export const formatPoints = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export type SnakeStart = {
  runId: string;
  secret: string;
  day: string;
  dayNumber: number;
  attempt: number;
  layout: Layout;
};
export type SnakeOutcome = SnakeResult & {
  attempt: number;
  /** Si este intento está entre los que cuentan para el ranking. */
  counts: boolean;
  betterThan: number | null;
};
export type RankingRow = {
  alias: string;
  score: number;
  total_ms: number;
  days?: number | undefined;
};
export type Ranking = { day: string; dayNumber: number; today: RankingRow[]; week: RankingRow[] };
