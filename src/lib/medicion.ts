/**
 * Medición anónima de la prueba de demanda en /minar.
 * Sin cookies ni identificadores: solo se guarda qué pasó (visita, clic, cambio de modo)
 * y de dónde venía la visita (parámetros utm y web de procedencia).
 */
import { supabase } from "@/integrations/supabase/client";
import type { ModoId, ProductoId } from "@/lib/catalogo";

export interface Origen {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
}

const VACIO: Origen = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  referrer: null,
};

/** Origen de la primera página que abrió el visitante (se conserva al navegar por la web). */
let origenInicial: Origen | null = null;

function recortar(v: string | null, max: number): string | null {
  const t = v?.trim();
  return t ? t.slice(0, max) : null;
}

/** Guarda el origen la primera vez que se llama en el navegador. Llamarlo al arrancar la web. */
export function capturarOrigen(): Origen {
  if (origenInicial) return origenInicial;
  if (typeof window === "undefined") return VACIO;
  const p = new URLSearchParams(window.location.search);
  let referrer: string | null = null;
  try {
    const r = document.referrer ? new URL(document.referrer) : null;
    // Solo el dominio de procedencia y nunca la propia web.
    referrer = r && r.host !== window.location.host ? r.host : null;
  } catch {
    referrer = null;
  }
  origenInicial = {
    utm_source: recortar(p.get("utm_source"), 200)?.toLowerCase() ?? null,
    utm_medium: recortar(p.get("utm_medium"), 200)?.toLowerCase() ?? null,
    utm_campaign: recortar(p.get("utm_campaign"), 200)?.toLowerCase() ?? null,
    utm_content: recortar(p.get("utm_content"), 200),
    utm_term: recortar(p.get("utm_term"), 200),
    referrer: recortar(referrer, 500),
  };
  return origenInicial;
}

export function origen(): Origen {
  return origenInicial ?? capturarOrigen();
}

type Evento =
  | { tipo: "visita" }
  | { tipo: "clic_comprar"; producto: ProductoId; modo: ModoId | null; cantidad: number }
  | { tipo: "cambio_modo"; producto: ProductoId; modo: ModoId };

let ultimaVisita = 0;

/** Registra un evento sin bloquear la página; si falla, no pasa nada. */
export function registrar(evento: Evento): void {
  if (typeof window === "undefined") return;
  // Evita contar dos veces la misma visita (React puede montar la página dos veces seguidas).
  if (evento.tipo === "visita") {
    const ahora = Date.now();
    if (ahora - ultimaVisita < 2000) return;
    ultimaVisita = ahora;
  }
  const fila = {
    tipo: evento.tipo,
    producto: "producto" in evento ? evento.producto : null,
    modo: "modo" in evento ? evento.modo : null,
    cantidad: "cantidad" in evento ? evento.cantidad : null,
    ...origen(),
  };
  void supabase
    .from("eventos")
    .insert(fila)
    .then(
      () => undefined,
      () => undefined,
    );
}
