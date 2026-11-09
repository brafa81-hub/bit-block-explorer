import { describe, test } from "node:test";
import { strictEqual, deepStrictEqual } from "node:assert";
import { enrollmentSchema, madridDay, madridWeek, selectionTotal } from "./game";

describe("Block game rules", () => {
  test("Transaction size and fees are added once", () => {
    deepStrictEqual(selectionTotal([{ id: "a", size: 200, fee: 1500 }, { id: "b", size: 120, fee: 840 }], ["a", "a", "b"]), { size: 320, fee: 2340 });
  });
  const form = { runId: "e11c1d97-c5ab-43aa-97c5-67090a67c61b", secret: "2c0f5965-5ecb-4e76-818a-dedbf3dcb0a1", email: "a@example.com", alias: "Miner", consent: true };
  test("Ranking aliases have a maximum of 20 characters", () => {
    strictEqual(enrollmentSchema.safeParse({ ...form, alias: "a".repeat(20) }).success, true);
    strictEqual(enrollmentSchema.safeParse({ ...form, alias: "a".repeat(21) }).success, false);
  });
  test("Email cannot appear as a public alias", () => strictEqual(enrollmentSchema.safeParse({ ...form, alias: "a@example.com" }).success, false));
  test("Ranking consent must be checked", () => strictEqual(enrollmentSchema.safeParse({ ...form, consent: false }).success, false));
  test("Madrid weeks start Monday at midnight in winter", () => {
    strictEqual(madridWeek(new Date("2026-11-08T22:59:59Z")), "2026-11-02");
    strictEqual(madridWeek(new Date("2026-11-08T23:00:00Z")), "2026-11-09");
  });
  test("Madrid day and week respect daylight saving time", () => {
    strictEqual(madridDay(new Date("2026-07-05T22:00:00Z")), "2026-07-06");
    strictEqual(madridWeek(new Date("2026-07-05T21:59:59Z")), "2026-06-29");
    strictEqual(madridWeek(new Date("2026-07-05T22:00:00Z")), "2026-07-06");
  });
});