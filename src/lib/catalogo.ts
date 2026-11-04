/** Precios del catálogo v9.3 derivados de los datos canónicos del servicio (en céntimos). */
import { SERVICIO } from "@/content/servicio";

export type ProductoId = "potencia" | "regalos";
/** Ids internos: "estable" = Compartido, "solitario" = Solitario, "mixto" = Híbrido. */
export type ModoId = "estable" | "solitario" | "mixto";

const c = SERVICIO.catalogo;

export const MIN_TH = c.minTH;
export const MAX_TH = c.maxTH;
export const PASO_TH = c.pasoTH;
export const BLOQUE_TH = c.bloqueTH;
export const EXTRA_MIXTO = SERVICIO.modos.extraMixtoCentimos;

/** Precio base (sin modo) para una potencia en TH/s, en céntimos. */
export function precioBase(th: number): number {
  // Se opera en centésimas de céntimo para evitar errores de coma flotante.
  const centesimas = Math.round(c.precioBaseCentimos * 100) + Math.round(c.precioPorTHCentimos * 100) * th;
  const centimos = Math.round(centesimas / 100);
  return Math.ceil(centimos / c.redondeoCentimos) * c.redondeoCentimos;
}

/** Precio de un pedido según la potencia y el modo (el mixto suma un extra por pedido). */
export function precioPedido(th: number, modo: ModoId): number {
  return precioBase(th) + (modo === "mixto" ? EXTRA_MIXTO : 0);
}

/** Sats aproximados según modo; en Solitario no hay estimación (null). */
export function satsAprox(th: number, modo: ModoId): number | null {
  if (modo === "solitario") return null;
  const base = c.satsPorTH * th;
  const parte = modo === "mixto" ? base / 2 : base;
  return Math.round(parte / c.redondeoSats) * c.redondeoSats;
}

/** Probabilidad aproximada de encontrar un bloque en solitario en `horas`, como "1 entre N" (N con 2 cifras significativas). */
export function unoEntreBloque(th: number, horas: number): number {
  const bloques = horas * 6;
  const n = c.redHashrateTH / (bloques * th);
  const magnitud = 10 ** (Math.floor(Math.log10(n)) - 1);
  return Math.round(n / magnitud) * magnitud;
}

/** Iconos de máquina: uno por cada 250 TH/s, mínimo 1. */
export function maquinasDe(th: number): number {
  return Math.max(1, Math.floor(th / BLOQUE_TH));
}

/** Ahorro frente a varios pedidos de 250 TH/s, solo si la potencia es múltiplo de 250 y mayor. */
export function ahorroFrenteABloques(
  th: number,
  modo: ModoId,
): { pedidos: number; separado: number; junto: number; ahorro: number } | null {
  if (th <= BLOQUE_TH || th % BLOQUE_TH !== 0) return null;
  const pedidos = th / BLOQUE_TH;
  const junto = precioPedido(th, modo);
  const separado = precioPedido(BLOQUE_TH, modo) * pedidos;
  return { pedidos, separado, junto, ahorro: separado - junto };
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

/** "Desde unos 20 €": precio mínimo redondeado a euros. */
export const DESDE_EUROS_APROX = `${Math.round(precioBase(MIN_TH) / 100)} €`;
