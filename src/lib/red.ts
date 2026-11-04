/**
 * Datos de la red de Bitcoin: única fuente para el simulador y las demos del Diccionario.
 * Orden: dato en directo (mempool.space, leído por nuestro servidor) → caché → respaldo de servicio.ts.
 * /minar y los sats estimados NO usan esto: siguen con el dato fijo de servicio.ts y su fecha.
 */
import { SERVICIO } from "@/content/servicio";

const c = SERVICIO.catalogo;

/** Segundos de media entre bloques. */
export const SEGUNDOS_POR_BLOQUE = 600;
/** La dificultad equivale a hashes de media por bloque entre 2^32. */
const DOS_A_LA_32 = 2 ** 32;

export type AjusteDificultad = {
  /** Cambio estimado en %, p. ej. 2,3 o −1,5. */
  cambioPct: number;
  /** Milisegundos que faltan, estimados. */
  restanteMs: number;
};

export type DatosRed = {
  /** Potencia total de la red en TH/s. */
  hashrateTH: number;
  /** Dificultad actual. */
  dificultad: number;
  /** Próximo ajuste de dificultad (solo con dato en directo). */
  ajuste: AjusteDificultad | null;
  /** Número del último bloque (solo con dato en directo). */
  altura: number | null;
  /** "directo" = leído de mempool.space; "respaldo" = cifra fija de servicio.ts. */
  origen: "directo" | "respaldo";
  /** Momento de la lectura en ms (solo directo). */
  actualizado: number | null;
  /** Fecha legible del respaldo («oct. 2026»). */
  fechaRespaldo: string;
};

/** Respaldo: cifra de servicio.ts. La dificultad se deduce de la potencia, sin añadir otra cifra a mano. */
export const RED_RESPALDO: DatosRed = {
  hashrateTH: c.redHashrateTH,
  dificultad: (c.redHashrateTH * 1e12 * SEGUNDOS_POR_BLOQUE) / DOS_A_LA_32,
  ajuste: null,
  altura: null,
  origen: "respaldo",
  actualizado: null,
  fechaRespaldo: c.fechaEstimacion,
};

const entre = (x: unknown, min: number, max: number): x is number =>
  typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;

/** Rangos razonables: si un dato sale de aquí, se descarta (mejor el respaldo que una cifra absurda). */
const RANGO = {
  hashrateTH: [1e8, 1e11] as const, // 100 EH/s – 100.000 EH/s
  dificultad: [1e13, 1e17] as const,
  cambioPct: [-75, 300] as const,
  restanteMs: [0, 60 * 86_400_000] as const,
  altura: [800_000, 5_000_000] as const,
};

/**
 * Comprueba un objeto (p. ej. JSON de /api/red) y lo convierte en DatosRed.
 * Devuelve null si la potencia o la dificultad no son válidas.
 */
export function validarDatosRed(x: unknown): DatosRed | null {
  if (!x || typeof x !== "object") return null;
  const d = x as { [K in keyof DatosRed]?: unknown };
  const { hashrateTH, dificultad, altura, actualizado } = d;
  if (!entre(hashrateTH, ...RANGO.hashrateTH) || !entre(dificultad, ...RANGO.dificultad)) return null;
  const a = (d.ajuste ?? null) as { [K in keyof AjusteDificultad]?: unknown } | null;
  const ajuste =
    a && entre(a.cambioPct, ...RANGO.cambioPct) && entre(a.restanteMs, ...RANGO.restanteMs)
      ? { cambioPct: a.cambioPct, restanteMs: a.restanteMs }
      : null;
  const directo = d.origen === "directo" && entre(actualizado, 1.6e12, 1e13);
  return {
    hashrateTH,
    dificultad,
    ajuste: directo ? ajuste : null,
    altura: directo && entre(altura, ...RANGO.altura) ? Math.round(altura) : null,
    origen: directo ? "directo" : "respaldo",
    actualizado: directo ? actualizado : null,
    fechaRespaldo: c.fechaEstimacion,
  };
}

/* ----------------------------- Solo servidor ----------------------------- */

const MEMPOOL = "https://mempool.space/api";
/** Tiempo máximo por petición a mempool.space. */
const TIMEOUT_MS = 4000;
/** Duración de la caché del servidor. */
export const CACHE_MS = 10 * 60_000;
/** Si mempool.space falla, se sigue sirviendo el último dato bueno hasta este límite. */
const CACHE_MAX_MS = 6 * 60 * 60_000;

let cache: DatosRed | null = null;
let enCurso: Promise<DatosRed> | null = null;

async function pedir<T>(ruta: string, como: "json" | "text"): Promise<T> {
  const r = await fetch(`${MEMPOOL}${ruta}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { accept: como === "json" ? "application/json" : "text/plain" },
  });
  if (!r.ok) throw new Error(`${ruta}: ${r.status}`);
  return (como === "json" ? r.json() : r.text()) as Promise<T>;
}

async function leerMempool(): Promise<DatosRed | null> {
  const [hr, aj, alt] = await Promise.allSettled([
    pedir<{ currentHashrate?: number; currentDifficulty?: number }>("/v1/mining/hashrate/3d", "json"),
    pedir<{ difficultyChange?: number; remainingTime?: number }>("/v1/difficulty-adjustment", "json"),
    pedir<string>("/blocks/tip/height", "text"),
  ]);
  if (hr.status !== "fulfilled") return null;
  return validarDatosRed({
    hashrateTH: (hr.value.currentHashrate ?? 0) / 1e12,
    dificultad: hr.value.currentDifficulty,
    ajuste:
      aj.status === "fulfilled"
        ? { cambioPct: aj.value.difficultyChange, restanteMs: aj.value.remainingTime }
        : null,
    altura: alt.status === "fulfilled" ? Number(alt.value.trim()) : null,
    origen: "directo",
    actualizado: Date.now(),
  });
}

/** Dato en directo → caché → respaldo. Nunca lanza error. */
export async function obtenerDatosRed(): Promise<DatosRed> {
  const ahora = Date.now();
  if (cache?.actualizado && ahora - cache.actualizado < CACHE_MS) return cache;
  if (!enCurso) {
    enCurso = leerMempool()
      .catch(() => null)
      .then((nuevo) => {
        if (nuevo) cache = nuevo;
        if (cache?.actualizado && Date.now() - cache.actualizado < CACHE_MAX_MS) return cache;
        return RED_RESPALDO;
      })
      .finally(() => {
        enCurso = null;
      });
  }
  return enCurso;
}
