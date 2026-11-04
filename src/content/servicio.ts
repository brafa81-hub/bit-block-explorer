/**
 * Datos canónicos del servicio.
 * Única fuente de precios, fórmula del catálogo y condiciones.
 * Los textos leen de aquí; no se repiten estos datos a mano.
 */

export const SERVICIO = {
  /** Nombre de marca: se cambia solo aquí. */
  marca: "Bloque 170",
  /** Dominio público de la web (canonical, og:url, PDF). */
  dominio: "bloque170.com",
  /** Lema de marca. */
  lema: "Democratizamos el acceso a la minería de Bitcoin",
  /**
   * Catálogo vigente (modelo de negocio v9.3). Potencia a elegir, siempre 24 h.
   * Precio con IVA en céntimos = base + porTH × TH/s, redondeado y luego hacia arriba al múltiplo de `redondeo`.
   * Los sats son una estimación orientativa, no garantizada.
   */
  catalogo: {
    horas: 24,
    minTH: 250,
    maxTH: 1000,
    pasoTH: 50,
    /** Potencia de referencia de un pedido pequeño (una máquina profesional). */
    bloqueTH: 250,
    precioBaseCentimos: 257,
    /** Céntimos por TH/s (7,11). */
    precioPorTHCentimos: 7.11,
    redondeoCentimos: 5,
    /** Sats aproximados por TH/s en modo estable (unos 11.500 por cada 250 TH/s). */
    satsPorTH: 46,
    redondeoSats: 500,
    /** Subsidio por bloque desde el halving de abril de 2024 (3,125 BTC), sin contar comisiones. */
    recompensaBloqueSats: 312_500_000,
    /** Potencia total de la red en TH/s (unos 1.057 EH/s). Actualizar junto a fechaEstimacion. */
    redHashrateTH: 1_057_000_000,
    /** Fecha a la que se calcularon los sats. */
    fechaEstimacion: "oct. 2026",
  },
  /** Modos de minado en prueba de demanda. */
  modos: {
    /** Recargo por pedido del modo mixto, en céntimos. */
    extraMixtoCentimos: 95,
  },
  regalos: {
    caducidadDias: 30,
    /** Los descuentos (certificado...) no se suman entre sí. */
    descuentosAcumulables: false,
  },
  /** Equivalencia de 1 PH/s en máquinas profesionales (unos 200 TH/s cada una). */
  maquinasEquivalentes: 5,
  plazoPago: "en los días siguientes",
  /** Recomendación de wallet: sin definir por ahora. */
  walletRecomendada: null,
  /** Página pública de pagos: todavía no existe. */
  webPublicaPagos: false,
  variacionPotencia: "la potencia puede variar algo durante la sesión",
  transparencia: "Lo que recibirás en sats es menor que lo que pagas",
  resultado: "No es una inversión ni garantiza un resultado.",
  /** Certificado del test final: nota mínima y descuento de lanzamiento. */
  certificado: {
    notaMinima: 12,
    descuentoPct: 10,
    /** Fecha de caducidad del descuento: sin decidir (null = "se comunicará"). */
    caducidad: null as string | null,
  },
} as const;

/** URL pública absoluta de una ruta ("/minar" → "https://bloque170.com/minar"). */
export function urlPublica(ruta: string): string {
  return `https://${SERVICIO.dominio}${ruta}`;
}
