import { describe, test } from "node:test";
import { strictEqual, ok } from "node:assert";
import { aliasSchema, dayNumber, madridDay, madridWeek, selectionTotal } from "./game";
import { greedyFee, makePuzzle, naiveFee, scoreFor, solve } from "./game-puzzle";

describe("Bloque del día", () => {
  test("Las cajas se suman una sola vez", () => {
    const t = selectionTotal(
      [
        { id: "a", size: 2, fee: 1500 },
        { id: "b", size: 1, fee: 840 },
      ],
      ["a", "a", "b"],
    );
    strictEqual(t.size, 3);
    strictEqual(t.fee, 2340);
  });
  test("El mismo día da los mismos retos y otro día, otros", () => {
    strictEqual(
      JSON.stringify(makePuzzle("2026-11-10", 2)),
      JSON.stringify(makePuzzle("2026-11-10", 2)),
    );
    ok(JSON.stringify(makePuzzle("2026-11-10", 2)) !== JSON.stringify(makePuzzle("2026-11-11", 2)));
  });
  test("Durante un año, cada reto tiene una sola solución perfecta y los atajos no bastan", { timeout: 60000 }, () => {
    for (let d = 0; d < 365; d++) {
      const day = new Date(Date.UTC(2026, 10, 9 + d)).toISOString().slice(0, 10);
      for (let round = 1; round <= 3; round++) {
        const p = makePuzzle(day, round);
        strictEqual(solve(p.boxes, p.capacity).ways, 1);
        strictEqual(scoreFor(p.best, p), 10);
        ok(scoreFor(naiveFee(p.boxes, p.capacity), p) <= 6.5);
        if (round > 1) ok(scoreFor(greedyFee(p.boxes, p.capacity), p) < 10);
      }
    }
  });
  test("Llenar sin pensar da 0 y casi perfecto no llega a 10", () => {
    const p = { best: 10000, base: 8000 };
    strictEqual(scoreFor(8000, p), 0);
    strictEqual(scoreFor(7000, p), 0);
    strictEqual(scoreFor(9999, p), 9.9);
  });
  test("Alias de 1 a 20 caracteres y nunca un email", () => {
    strictEqual(aliasSchema.safeParse("a".repeat(20)).success, true);
    strictEqual(aliasSchema.safeParse("a".repeat(21)).success, false);
    strictEqual(aliasSchema.safeParse("a@b.com").success, false);
  });
  test("Número del día y semanas de lunes a domingo en Madrid", () => {
    strictEqual(dayNumber("2026-11-09"), 1);
    strictEqual(dayNumber("2027-03-29"), 141);
    strictEqual(madridWeek(new Date("2026-11-08T22:59:59Z")), "2026-11-02");
    strictEqual(madridWeek(new Date("2026-11-08T23:00:00Z")), "2026-11-09");
    strictEqual(madridDay(new Date("2026-07-05T22:00:00Z")), "2026-07-06");
  });
});
