/**
 * Bloque del día: genera los tres retos de cada día a partir de la fecha.
 * Mismo día = mismos retos para todo el mundo. Solo se usa en el servidor.
 *
 * Cada reto se acepta solo si:
 * - tiene una única combinación perfecta,
 * - elegir solo «lo que más paga» sale caro,
 * - el truco simple («primero lo que más paga por hueco») no siempre basta,
 * - en el reto 3, la caja que más paga no forma parte de la solución perfecta.
 */
import type { Box } from "./game";
export { dayNumber } from "./game";
export type { Box };
export type Puzzle = {
  round: number;
  capacity: number;
  timeLimit: number;
  boxes: Box[];
  best: number;
  base: number;
};

type Level = {
  count: number;
  capacity: number;
  maxSize: number;
  timeLimit: number;
  greedyMin: number;
  greedyMax: number;
  naiveMax: number;
  bigTrap: boolean;
};

export const LEVELS: Level[] = [
  {
    count: 6,
    capacity: 10,
    maxSize: 5,
    timeLimit: 30,
    greedyMin: 7.5,
    greedyMax: 10,
    naiveMax: 6.5,
    bigTrap: false,
  },
  {
    count: 8,
    capacity: 14,
    maxSize: 7,
    timeLimit: 40,
    greedyMin: 5,
    greedyMax: 8.5,
    naiveMax: 6.5,
    bigTrap: false,
  },
  {
    count: 10,
    capacity: 18,
    maxSize: 9,
    timeLimit: 45,
    greedyMin: 3.5,
    greedyMax: 7.5,
    naiveMax: 6,
    bigTrap: true,
  },
];

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mejor comisión posible y cuántas combinaciones la alcanzan. */
export function solve(boxes: Box[], capacity: number) {
  let best = -1,
    ways = 0,
    bestMask = 0;
  for (let mask = 0; mask < 1 << boxes.length; mask++) {
    let size = 0,
      fee = 0;
    boxes.forEach((b, i) => {
      if ((mask >> i) & 1) {
        size += b.size;
        fee += b.fee;
      }
    });
    if (size > capacity) continue;
    if (fee > best) {
      best = fee;
      ways = 1;
      bestMask = mask;
    } else if (fee === best) ways++;
  }
  return { best, ways, ids: boxes.filter((_, i) => (bestMask >> i) & 1).map((b) => b.id) };
}

function fill(order: Box[], capacity: number) {
  let size = 0,
    fee = 0;
  for (const b of order)
    if (size + b.size <= capacity) {
      size += b.size;
      fee += b.fee;
    }
  return fee;
}
export const greedyFee = (boxes: Box[], capacity: number) =>
  fill(
    [...boxes].sort((a, b) => b.fee / b.size - a.fee / a.size || a.size - b.size),
    capacity,
  );

/** «Primero lo que más paga», sin mirar lo que ocupa. */
export const naiveFee = (boxes: Box[], capacity: number) =>
  fill(
    [...boxes].sort((a, b) => b.fee - a.fee || a.size - b.size),
    capacity,
  );

/** Lo que se consigue llenando el bloque sin pensar (media de 64 órdenes al azar). */
function baseline(boxes: Box[], capacity: number, random: () => number) {
  let total = 0;
  for (let k = 0; k < 64; k++) {
    const order = [...boxes];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = order[i]!;
      order[i] = order[j]!;
      order[j] = tmp;
    }
    total += fill(order, capacity);
  }
  return Math.round(total / 64);
}

/** Nota de 0 a 10: 0 = llenar sin pensar, 10 = combinación perfecta. */
export function scoreFor(fee: number, puzzle: Pick<Puzzle, "best" | "base">) {
  if (fee >= puzzle.best) return 10;
  const value = ((fee - puzzle.base) / (puzzle.best - puzzle.base)) * 10;
  return Math.max(0, Math.min(9.9, Math.floor(value * 10) / 10));
}

export function makePuzzle(day: string, round: number, seed = ""): Puzzle {
  const level = LEVELS[round - 1];
  if (!level) throw new Error("Reto no válido");
  const random = rng(hash(`${seed}|${day}|${round}`));
  for (let attempt = 0; attempt < 20000; attempt++) {
    const boxes: Box[] = Array.from({ length: level.count }, (_, i) => {
      const size = 1 + Math.floor(random() * level.maxSize);
      const perSlot = 2 + random() * 10; // entre 2 y 12 (×100 sats) por hueco
      return { id: `c${i + 1}`, size, fee: Math.max(1, Math.round(size * perSlot * 2)) * 50 };
    });
    if (boxes.reduce((a, b) => a + b.size, 0) < level.capacity * 1.5) continue;
    const { best, ways, ids } = solve(boxes, level.capacity);
    if (ways !== 1) continue;
    const base = baseline(boxes, level.capacity, random);
    if (best - base < best * 0.15) continue;
    const greedy = scoreFor(greedyFee(boxes, level.capacity), { best, base });
    if (greedy < level.greedyMin || greedy > level.greedyMax) continue;
    if (scoreFor(naiveFee(boxes, level.capacity), { best, base }) > level.naiveMax) continue;
    if (level.bigTrap) {
      const top = [...boxes].sort((a, b) => b.fee - a.fee)[0];
      if (!top || top.size < 6 || ids.includes(top.id)) continue;
    }
    return { round, capacity: level.capacity, timeLimit: level.timeLimit, boxes, best, base };
  }
  throw new Error("No se ha podido preparar el reto de hoy");
}
