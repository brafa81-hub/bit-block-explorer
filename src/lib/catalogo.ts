/** Precios del catálogo v9.2 derivados de los datos canónicos del servicio (en céntimos). */
import { SERVICIO } from "@/content/servicio";

export type ProductoId = "unidad" | "pack" | "corporate";
export type ModoId = "estable" | "solitario" | "mixto";

function aCentimos(precio: string): number {
  return Math.round(Number(precio.replace("€", "").trim().replace(",", ".")) * 100);
}

const { unidad, pack, corporate } = SERVICIO.catalogo;

export const PRECIO_UNIDAD = aCentimos(unidad.precio);
export const PRECIO_PACK = aCentimos(pack.precio);
export const EXTRA_MIXTO = aCentimos(SERVICIO.modos.extraMixto);
export const MAX_SUELTAS = unidad.maxSueltas;
export const UNIDADES_PACK = pack.unidades;
export const CORPORATE_DESDE_PH = corporate.desdePH;
/** Corporate va al mismo precio por PH/s que el pack. */
export const PRECIO_PH_CORPORATE = PRECIO_PACK;
export const CORPORATE_DESDE_CENTIMOS = PRECIO_PACK * CORPORATE_DESDE_PH;

/** Lo que se ahorra con el pack frente a 4 unidades sueltas, en % redondeado. */
export const AHORRO_PACK_PCT = Math.round(
  100 - (PRECIO_PACK * 100) / (PRECIO_UNIDAD * UNIDADES_PACK),
);

/** Precio de un pedido de unidades sueltas o del pack, según el modo (el mixto suma un extra por pedido). */
export function precioPedido(producto: "unidad" | "pack", cantidad: number, modo: ModoId): number {
  const base = producto === "pack" ? PRECIO_PACK : PRECIO_UNIDAD * cantidad;
  return base + (modo === "mixto" ? EXTRA_MIXTO : 0);
}

/** Unidades de 250 TH/s que tiene un pedido. */
export function unidadesDe(producto: "unidad" | "pack", cantidad: number): number {
  return producto === "pack" ? UNIDADES_PACK : cantidad;
}

/** Potencia del pedido en TH/s. */
export function potenciaTH(unidades: number): number {
  return unidades * unidad.potenciaTH;
}

/** Sats aproximados según modo (solo cuenta la parte en modo estable). */
export function satsAprox(producto: "unidad" | "pack", cantidad: number, modo: ModoId): number {
  const base = producto === "pack" ? pack.satsAprox : unidad.satsAprox * cantidad;
  if (modo === "solitario") return 0;
  if (modo === "mixto") return Math.round(base / 2 / 500) * 500;
  return base;
}

/** "1 entre X" de encontrar un bloque en la parte en solitario. */
export function unoEntreBloque(unidades: number, modo: ModoId): number {
  const horasSolo = modo === "mixto" ? 0.5 : 1;
  const x = SERVICIO.modos.unoEntreBloquePorUnidad / (unidades * horasSolo);
  return Math.round(x / 500) * 500;
}

const formateador = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: "always" as unknown as boolean,
});

const formateadorEntero = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 0,
  useGrouping: "always" as unknown as boolean,
});

/** Formato español: coma decimal, punto de miles y el símbolo detrás. */
export function formatearEuros(centimos: number): string {
  return `${formateador.format(centimos / 100)} €`;
}

/** Número entero con punto de miles: 11.000 */
export function formatearEntero(n: number): string {
  return formateadorEntero.format(n);
}
