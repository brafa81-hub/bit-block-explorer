import { describe, test } from "node:test";
import { strictEqual } from "node:assert";
import { aliasSchema, dayNumber, formatPoints, madridDay, madridWeek, movesSchema } from "./game";

describe("Juego: utilidades", () => {
  test("Alias de 1 a 20 caracteres y nunca un email", () => {
    strictEqual(aliasSchema.safeParse("a".repeat(20)).success, true);
    strictEqual(aliasSchema.safeParse("a".repeat(21)).success, false);
    strictEqual(aliasSchema.safeParse("a@b.com").success, false);
  });
  test("Número del día y semanas de lunes a domingo en Madrid", () => {
    strictEqual(dayNumber("2026-11-10"), 1);
    strictEqual(dayNumber("2027-03-29"), 140);
    strictEqual(madridWeek(new Date("2026-11-08T22:59:59Z")), "2026-11-02");
    strictEqual(madridWeek(new Date("2026-11-08T23:00:00Z")), "2026-11-09");
    strictEqual(madridDay(new Date("2026-07-05T22:00:00Z")), "2026-07-06");
  });
  test("Puntos con punto de miles", () => {
    strictEqual(formatPoints(950), "950");
    strictEqual(formatPoints(1275), "1.275");
  });
  test("Los giros tienen un formato fijo", () => {
    strictEqual(
      movesSchema.safeParse([
        [0, 1],
        [5, 2],
      ]).success,
      true,
    );
    strictEqual(movesSchema.safeParse([[0, 4]]).success, false);
    strictEqual(movesSchema.safeParse([["a", 1]]).success, false);
  });
});
