import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { interesRegalos, solicitudPotenciaSchema } from "./solicitudes";

describe("Solicitudes de minar", () => {
  test("El interés de regalos se registra como regalos", () => {
    deepStrictEqual(interesRegalos(1), { producto: "regalos", para_quien: "regalo", cantidad: 1, modo: null });
  });
  test("Las solicitudes de más de 1 PH/s excluyen 1 PH/s", () => {
    const datos = { email: "test@example.com", fecha: "2026-11-15" };
    strictEqual(solicitudPotenciaSchema.safeParse({ ...datos, potencia_ph: 1 }).success, false);
    strictEqual(solicitudPotenciaSchema.safeParse({ ...datos, potencia_ph: 1.5 }).success, true);
  });
  test("La fecha y el email deben ser válidos", () => {
    strictEqual(solicitudPotenciaSchema.safeParse({ email: "no-email", fecha: "2026-02-30", potencia_ph: 2 }).success, false);
  });
});