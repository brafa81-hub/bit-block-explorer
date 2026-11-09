/**
 * Snake minero: motor del juego, compartido por el navegador y el servidor.
 *
 * - La serpiente es la cadena: cada bloque que come se engancha y la alarga.
 * - Mapa del día: mismos obstáculos y mismo orden de bloques para todo el mundo. Sin azar.
 * - Cada 10 bloques la serpiente acelera (sube la dificultad).
 * - Cada 21 bloques, los puntos por bloque se reducen a la mitad (halving).
 * - La partida dura como mucho 90 segundos de juego.
 *
 * El navegador solo envía los giros. El servidor repite la partida con este mismo código
 * y calcula él los puntos, así que no se puede enviar una puntuación inventada.
 */

export const COLS = 15;
export const ROWS = 19;
export const LIMIT_MS = 90_000;
/** Milisegundos por paso según el nivel de dificultad (sube cada 10 bloques). */
export const TICKS = [180, 160, 140, 125, 110, 100, 90, 80] as const;
export const BLOCKS_PER_LEVEL = 10;
export const BLOCKS_PER_HALVING = 21;
export const FIRST_REWARD = 50;
/** Arriba, derecha, abajo, izquierda. */
export type Dir = 0 | 1 | 2 | 3;
/** Un giro: en qué paso se aplica y hacia dónde. */
export type Move = [tick: number, dir: Dir];
export type Layout = { obstacles: number[]; foods: number[] };
export type SnakeResult = {
  blocks: number;
  points: number;
  /** Tiempo de juego total. */
  timeMs: number;
  /** Tiempo de juego en el que se consiguió el último punto: sirve para desempatar. */
  scoreTimeMs: number;
  ticks: number;
  crashed: boolean;
};
export type StepEvent = { ate: boolean; dead: boolean; levelUp: boolean; halving: boolean };

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];
export const cell = (x: number, y: number) => y * COLS + x;
export const START_BODY = [cell(7, 15), cell(7, 16), cell(7, 17)];

export const rewardFor = (blocksBefore: number) =>
  Math.max(1, Math.floor(FIRST_REWARD / 2 ** Math.floor(blocksBefore / BLOCKS_PER_HALVING)));
export const levelFor = (blocks: number) =>
  Math.min(Math.floor(blocks / BLOCKS_PER_LEVEL), TICKS.length - 1);

export class SnakeGame {
  body: number[] = [...START_BODY];
  dir: Dir = 0;
  tick = 0;
  timeMs = 0;
  blocks = 0;
  points = 0;
  scoreTimeMs = 0;
  dead = false;
  food: number;
  readonly moves: Move[] = [];
  private foodIndex = 0;
  private readonly blocked: Set<number>;

  constructor(readonly layout: Layout) {
    this.blocked = new Set(layout.obstacles);
    this.food = this.nextFood(0);
  }
  get level() {
    return levelFor(this.blocks);
  }
  get tickMs() {
    return TICKS[this.level]!;
  }
  get reward() {
    return rewardFor(this.blocks);
  }
  get over() {
    return this.dead || this.timeMs + this.tickMs > LIMIT_MS;
  }
  canTurn(d: Dir) {
    return d !== this.dir && d !== (this.dir + 2) % 4;
  }
  /** Avanza un paso. Si `turn` es un giro válido, se aplica y se apunta. */
  step(turn: Dir | null = null): StepEvent {
    if (this.over) throw new Error("La partida ha terminado");
    if (turn !== null && this.canTurn(turn)) {
      this.dir = turn;
      this.moves.push([this.tick, turn]);
    }
    this.tick++;
    this.timeMs += this.tickMs;
    const head = this.body[0]!;
    const x = (head % COLS) + DX[this.dir]!;
    const y = Math.floor(head / COLS) + DY[this.dir]!;
    const next = cell(x, y);
    const ate = next === this.food;
    const hitsSelf = (ate ? this.body : this.body.slice(0, -1)).includes(next);
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS || this.blocked.has(next) || hitsSelf) {
      this.dead = true;
      return { ate: false, dead: true, levelUp: false, halving: false };
    }
    this.body.unshift(next);
    if (!ate) {
      this.body.pop();
      return { ate: false, dead: false, levelUp: false, halving: false };
    }
    this.points += this.reward;
    this.blocks++;
    this.scoreTimeMs = this.timeMs;
    this.food = this.nextFood(this.foodIndex + 1);
    return {
      ate: true,
      dead: false,
      levelUp: this.level > levelFor(this.blocks - 1),
      halving: this.blocks % BLOCKS_PER_HALVING === 0,
    };
  }
  /** El siguiente bloque de la lista del día que no esté debajo de la serpiente. */
  private nextFood(from: number) {
    const { foods } = this.layout;
    for (let i = 0; i < foods.length; i++) {
      const index = (from + i) % foods.length;
      if (!this.body.includes(foods[index]!)) {
        this.foodIndex = index;
        return foods[index]!;
      }
    }
    return -1;
  }
  result(): SnakeResult {
    return {
      blocks: this.blocks,
      points: this.points,
      timeMs: this.timeMs,
      scoreTimeMs: this.scoreTimeMs,
      ticks: this.tick,
      crashed: this.dead,
    };
  }
}

/** Repite una partida a partir de sus giros. Lanza un error si los giros no encajan. */
export function simulate(layout: Layout, moves: Move[]): SnakeResult {
  const game = new SnakeGame(layout);
  let i = 0;
  let last = -1;
  for (const m of moves) {
    if (
      !Array.isArray(m) ||
      !Number.isInteger(m[0]) ||
      m[0] <= last ||
      ![0, 1, 2, 3].includes(m[1])
    )
      throw new Error("Giros no válidos");
    last = m[0];
  }
  while (!game.over) {
    let turn: Dir | null = null;
    const m = moves[i];
    if (m && m[0] === game.tick) {
      if (!game.canTurn(m[1])) throw new Error("Giros no válidos");
      turn = m[1];
      i++;
    }
    game.step(turn);
  }
  if (i !== moves.length) throw new Error("Giros no válidos");
  return game.result();
}

/* ---------- Mapa del día ---------- */

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
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Zona de salida: siempre libre para no chocar nada más empezar. */
const inStartZone = (x: number, y: number) => x >= 5 && x <= 9 && y >= 11;

/** Todas las casillas libres se pueden alcanzar desde la salida. */
function connected(blocked: Set<number>) {
  const seen = new Set([START_BODY[0]!]);
  const queue = [START_BODY[0]!];
  while (queue.length) {
    const c = queue.pop()!;
    for (let d = 0; d < 4; d++) {
      const x = (c % COLS) + DX[d]!;
      const y = Math.floor(c / COLS) + DY[d]!;
      const n = cell(x, y);
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS || blocked.has(n) || seen.has(n)) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return seen.size === COLS * ROWS - blocked.size;
}

/** Mapa del día: obstáculos simétricos y orden fijo de bloques. Mismo día = mismo mapa. */
export function makeLayout(day: string, seed = ""): Layout {
  const random = rng(hash(`snake|${seed}|${day}`));
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  let blocked = new Set<number>();
  for (let attempt = 0; attempt < 200; attempt++) {
    blocked = new Set();
    const segments = int(2, 3);
    for (let s = 0; s < segments; s++) {
      const length = int(2, 4);
      const vertical = random() < 0.5;
      const x0 = int(1, vertical ? 5 : 6 - length);
      const y0 = int(2, vertical ? 14 - length : 14);
      for (let k = 0; k < length; k++) {
        const x = vertical ? x0 : x0 + k;
        const y = vertical ? y0 + k : y0;
        for (const mx of [x, COLS - 1 - x]) if (!inStartZone(mx, y)) blocked.add(cell(mx, y));
      }
    }
    if (blocked.size >= 6 && connected(blocked)) break;
  }
  const free: number[] = [];
  for (let c = 0; c < COLS * ROWS; c++)
    if (!blocked.has(c) && !START_BODY.includes(c)) free.push(c);
  const foods: number[] = [];
  while (foods.length < 240) {
    const c = free[int(0, free.length - 1)]!;
    const prev = foods.at(-1);
    // Cada bloque nuevo aparece a cierta distancia del anterior.
    if (
      prev !== undefined &&
      Math.abs((c % COLS) - (prev % COLS)) +
        Math.abs(Math.floor(c / COLS) - Math.floor(prev / COLS)) <
        5
    )
      continue;
    foods.push(c);
  }
  return { obstacles: [...blocked].sort((a, b) => a - b), foods };
}

/* ---------- Compartir ---------- */

/** Un cuadrado cada 3 bloques; el color cambia con cada halving. */
export function chainSquares(blocks: number) {
  const colors = ["🟩", "🟨", "🟧", "🟥"];
  const squares: string[] = [];
  for (let b = 3; b <= blocks; b += 3)
    squares.push(colors[Math.min(Math.floor((b - 1) / BLOCKS_PER_HALVING), colors.length - 1)]!);
  return squares.join("") || "⬜";
}
