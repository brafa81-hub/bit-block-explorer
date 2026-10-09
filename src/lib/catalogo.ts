/** Precios y tramos derivados de los datos canónicos del servicio. */
import { SERVICIO } from "@/content/servicio";

export type ProductoId = "jornada" | "dia";

export interface Producto {
  id: ProductoId;
  nombre: string;
  horas: number;
  potencia: string;
  precioCentimos: number;
  nota: string;
}

function aCentimos(precio: string): number {
  return Math.round(Number(precio.replace("€", "").trim().replace(",", ".")) * 100);
}

export const PRODUCTOS: Producto[] = (
  Object.entries(SERVICIO.productos) as [ProductoId, (typeof SERVICIO.productos)[ProductoId]][]
).map(([id, datos]) => ({
  id,
  nombre: datos.nombre,
  horas: datos.horas,
  potencia: datos.potencia,
  precioCentimos: aCentimos(datos.precio),
  nota: id === "jornada" ? "Una jornada completa con potencia industrial. La forma más directa de ver la minería real desde dentro." : "Un día entero, de principio a fin. Pensado también como regalo para quien quiere entender Bitcoin.",
}));

export interface Tramo {
  min: number;
  max: number | null;
  unidades: string;
  descuento: string;
  jornadaCentimos: number;
  diaCentimos: number;
}

export const TRAMOS: Tramo[] = SERVICIO.tramosCorporate.map(({ min, max, descuentoPct }) => ({
  min,
  max,
  unidades: max === null ? `${min}+` : `${min}-${max}`,
  descuento: `−${descuentoPct} %`,
  jornadaCentimos: Math.round(getProducto("jornada").precioCentimos * (100 - descuentoPct) / 100),
  diaCentimos: Math.round(getProducto("dia").precioCentimos * (100 - descuentoPct) / 100),
}));

export const MINIMO_VOLUMEN = SERVICIO.tramosCorporate[0].min;

export function getProducto(id: ProductoId): Producto {
  const p = PRODUCTOS.find((x) => x.id === id);
  if (!p) throw new Error("Producto desconocido");
  return p;
}

export function tramoPara(cantidad: number): Tramo | null {
  for (const t of TRAMOS) {
    if (cantidad >= t.min && (t.max === null || cantidad <= t.max)) return t;
  }
  return null;
}

export function precioUnitarioCentimos(producto: ProductoId, cantidad: number): number {
  const tramo = tramoPara(cantidad);
  if (!tramo) return getProducto(producto).precioCentimos;
  return producto === "jornada" ? tramo.jornadaCentimos : tramo.diaCentimos;
}

export function totalCentimos(producto: ProductoId, cantidad: number): number {
  return precioUnitarioCentimos(producto, cantidad) * cantidad;
}

const formateador = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: "always" as unknown as boolean,
});

/** Formato español: coma decimal, punto de miles y el símbolo detrás. */
export function formatearEuros(centimos: number): string {
  return `${formateador.format(centimos / 100)} €`;
}
