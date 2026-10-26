/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { interesRegalos, solicitudPotenciaSchema } from "./solicitudes";

describe("Solicitudes de minar", () => {
  test("El interés de regalos se registra como regalos", () => {
    expect(interesRegalos(1)).toEqual({ producto: "regalos", para_quien: "regalo", cantidad: 1, modo: null });
  });
  test("Las solicitudes de más de 1 PH/s excluyen 1 PH/s", () => {
    const datos = { email: "test@example.com", fecha: "2026-11-15" };
    expect(solicitudPotenciaSchema.safeParse({ ...datos, potencia_ph: 1 }).success).toBe(false);
    expect(solicitudPotenciaSchema.safeParse({ ...datos, potencia_ph: 1.5 }).success).toBe(true);
  });
  test("La fecha y el email deben ser válidos", () => {
    expect(solicitudPotenciaSchema.safeParse({ email: "no-email", fecha: "2026-02-30", potencia_ph: 2 }).success).toBe(false);
  });
});