import { describe, test } from "node:test";
import { deepStrictEqual, ok, strictEqual, throws } from "node:assert";
import {
  COLS,
  ROWS,
  START_BODY,
  SnakeGame,
  chainSquares,
  makeLayout,
  rewardFor,
  simulate,
  type Dir,
  type Layout,
} from "./snake";

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

/** Jugador automático sencillo: busca el camino más corto al bloque. */
function botTurn(game: SnakeGame): Dir | null {
  const blocked = new Set([...game.layout.obstacles, ...game.body.slice(0, -1)]);
  const start = game.body[0]!;
  const prev = new Map<number, [number, Dir]>();
  const queue = [start];
  const seen = new Set([start]);
  while (queue.length) {
    const c = queue.shift()!;
    if (c === game.food) {
      let at = c;
      let dir: Dir = game.dir;
      while (at !== start) {
        const [p, d] = prev.get(at)!;
        dir = d;
        at = p;
      }
      return dir === game.dir ? null : dir;
    }
    for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
      const x = (c % COLS) + DX[d]!;
      const y = Math.floor(c / COLS) + DY[d]!;
      const n = y * COLS + x;
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS || blocked.has(n) || seen.has(n)) continue;
      if (c === start && !game.canTurn(d) && d !== game.dir) continue;
      seen.add(n);
      prev.set(n, [c, d]);
      queue.push(n);
    }
  }
  return null;
}
function play(layout: Layout) {
  const game = new SnakeGame(layout);
  while (!game.over) game.step(botTurn(game));
  return game;
}

describe("Snake minero", () => {
  test("El mismo día da el mismo mapa y otro día, otro", () => {
    deepStrictEqual(makeLayout("2026-11-10"), makeLayout("2026-11-10"));
    ok(JSON.stringify(makeLayout("2026-11-10")) !== JSON.stringify(makeLayout("2026-11-11")));
    ok(JSON.stringify(makeLayout("2026-11-10", "x")) !== JSON.stringify(makeLayout("2026-11-10")));
  });
  test("Durante un año la salida está libre y el primer bloque no está pegado", () => {
    for (let d = 0; d < 365; d++) {
      const day = new Date(Date.UTC(2026, 10, 10 + d)).toISOString().slice(0, 10);
      const l = makeLayout(day);
      ok(l.obstacles.length >= 6);
      ok(START_BODY.every((c) => !l.obstacles.includes(c)));
      ok(l.foods.every((c) => !l.obstacles.includes(c)));
      const g = new SnakeGame(l);
      for (let i = 0; i < 4; i++) g.step();
      strictEqual(g.dead, false);
    }
  });
  test("Halving: 50 puntos por bloque, 25 desde el 22, 12 desde el 43", () => {
    strictEqual(rewardFor(0), 50);
    strictEqual(rewardFor(20), 50);
    strictEqual(rewardFor(21), 25);
    strictEqual(rewardFor(42), 12);
    strictEqual(rewardFor(500), 1);
  });
  test("Sin girar, choca contra el borde y no pasa de 90 segundos", () => {
    const r = simulate(makeLayout("2026-11-10"), []);
    strictEqual(r.crashed, true);
    ok(r.timeMs <= 90000);
  });
  test(
    "El servidor repite la partida y obtiene lo mismo; un año de mapas jugables",
    { timeout: 120000 },
    () => {
      let min = Infinity;
      let max = 0;
      for (let d = 0; d < 365; d++) {
        const day = new Date(Date.UTC(2026, 10, 10 + d)).toISOString().slice(0, 10);
        const layout = makeLayout(day);
        const game = play(layout);
        deepStrictEqual(simulate(layout, game.moves), game.result());
        ok(game.timeMs <= 90000);
        if (!game.dead) {
          min = Math.min(min, game.blocks);
          max = Math.max(max, game.blocks);
        }
      }
      // Un jugador perfecto que aguanta los 90 s pasa el primer halving (21) y ronda el segundo (42).
      ok(min >= 25, `mínimo ${min}`);
      ok(max <= 60, `máximo ${max}`);
    },
  );
  test("Giros trucados se rechazan", () => {
    const layout = makeLayout("2026-11-10");
    throws(() => simulate(layout, [[0, 2]])); // marcha atrás
    throws(() =>
      simulate(layout, [
        [3, 1],
        [2, 0],
      ]),
    ); // desordenados
    throws(() =>
      simulate(layout, [
        [0, 1],
        [0, 0],
      ]),
    ); // mismo paso
    throws(() => simulate(layout, [[100000, 1]])); // después del final
  });
  test("Tarjeta: un cuadrado cada 3 bloques, color por halving", () => {
    strictEqual(chainSquares(0), "⬜");
    strictEqual(chainSquares(6), "🟩🟩");
    strictEqual(chainSquares(24), "🟩🟩🟩🟩🟩🟩🟩🟨");
  });
});
