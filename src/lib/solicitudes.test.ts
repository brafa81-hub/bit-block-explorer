import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { interesRegalos, solicitudPotenciaSchema } from "./solicitudes";

describe("Solicitudes de minar", () => {
  test("El interés de regalos se registra como regalos", () => {
    deepStrictEqual(interesRegalos(1), { producto: "regalos", para_quien: "regalo", cantidad: 1, modo: null });
  });
  test("El pedido especial acepta un mensaje libre y un email", () => {
    strictEqual(solicitudPotenciaSchema.safeParse({ email: "test@example.com", mensaje: "Necesito 3 días seguidos" }).success, true);
  });
  test("El mensaje no puede estar vacío ni pasar de 2000 caracteres", () => {
    const email = "test@example.com";
    strictEqual(solicitudPotenciaSchema.safeParse({ email, mensaje: "   " }).success, false);
    strictEqual(solicitudPotenciaSchema.safeParse({ email, mensaje: "a".repeat(2001) }).success, false);
  });
  test("El email debe ser válido", () => {
    strictEqual(solicitudPotenciaSchema.safeParse({ email: "no-email", mensaje: "Hola" }).success, false);
  });
});