/**
 * Única fuente de precios del catálogo. Todo en céntimos enteros.
 * Los totales se calculan siempre como precio unitario × cantidad.
 * Todos los precios incluyen IVA.
 */

export type ProductoId = "jornada" | "dia";

export interface Producto {
  id: ProductoId;
  nombre: string;
  horas: number;
  potencia: string;
  precioCentimos: number;
  nota: string;
}

export const PRODUCTOS: Producto[] = [
  {
    id: "jornada",
    nombre: "Jornada",
    horas: 8,
    potencia: "1 PH/s",
    precioCentimos: 2995,
    nota: "La opción recomendada.",
  },
  {
    id: "dia",
    nombre: "Día de minería",
    horas: 24,
    potencia: "1 PH/s",
    precioCentimos: 7995,
    nota: "Pensado para regalar.",
  },
];

export interface Tramo {
  id: string;
  min: number;
  max: number | null;
  unidades: string;
  descuento: string;
  jornadaCentimos: number;
  diaCentimos: number;
}

export const TRAMOS: Tramo[] = [
  {
    id: "S",
    min: 10,
    max: 24,
    unidades: "10-24",
    descuento: "5 %",
    jornadaCentimos: 2845,
    diaCentimos: 7595,
  },
  {
    id: "M",
    min: 25,
    max: 49,
    unidades: "25-49",
    descuento: "10 %",
    jornadaCentimos: 2696,
    diaCentimos: 7196,
  },
  {
    id: "L",
    min: 50,
    max: 99,
    unidades: "50-99",
    descuento: "15 %",
    jornadaCentimos: 2546,
    diaCentimos: 6796,
  },
  {
    id: "XL",
    min: 100,
    max: null,
    unidades: "100 o más",
    descuento: "20 %",
    jornadaCentimos: 2396,
    diaCentimos: 6396,
  },
];

export const MINIMO_VOLUMEN = 10;

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
});

/** Formato español: coma decimal, punto de miles y el símbolo detrás. */
export function formatearEuros(centimos: number): string {
  return `${formateador.format(centimos / 100)} €`;
}
