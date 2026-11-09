/**
 * Datos canónicos del servicio.
 * Única fuente de precios, fórmula del catálogo y condiciones.
 * Los textos leen de aquí; no se repiten estos datos a mano.
 */

const MENOS_VALOR = "casi siempre por menos valor del que pagas";

/** Pone la primera letra en mayúscula (las frases de aviso se guardan en minúscula para encajar en una oración). */
export const conMayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export const SERVICIO = {
  /**
   * Frases de aviso (sin mayúscula inicial ni punto final). Se cambian solo aquí.
   * Dos sitios las llevan a mano y no leen de aquí: el Aviso legal (lo revisa el abogado)
   * y el texto dibujado dentro de Dibujos.tsx.
   */
  frases: {
    menosValor: MENOS_VALOR,
    compartido: `recibirás sats, pero ${MENOS_VALOR}`,
    solitario: "si no encuentras un bloque, no recibes nada, y es lo más habitual",
  },
  /** Nombre de marca: se cambia solo aquí. */
  marca: "BLOQUE170.COM",
  /** Dominio público de la web (canonical, og:url, PDF). */
  dominio: "bloque170.com",
  /** Lema de marca. */
  lema: "Democratizamos el acceso a la minería de Bitcoin",
  /**
   * Catálogo vigente (modelo de negocio v9.4.1). Potencia a elegir, siempre 24 h.
   * Precio con IVA en céntimos = base + porTH × TH/s, redondeado y luego hacia arriba al múltiplo de `redondeo`.
   * Los sats son una estimación orientativa, no garantizada.
   */
  catalogo: {
    horas: 24,
    minTH: 200,
    maxTH: 1000,
    pasoTH: 50,
    /** Potencia de referencia del pedido mínimo (similar a un Antminer S21). */
    bloqueTH: 200,
    precioBaseCentimos: 257,
    /** Céntimos por TH/s (7,11). */
    precioPorTHCentimos: 7.11,
    redondeoCentimos: 5,
    /** Sats aproximados por TH/s en modo estable (unos 9.200 por cada 200 TH/s). */
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
    /** Suplemento Híbrido por pedido, en céntimos. */
    extraMixtoCentimos: 200,
  },
  regalos: {
    caducidadDias: 30,
  },
  /** Equivalencia de 1 PH/s en máquinas profesionales (unos 200 TH/s cada una). */
  maquinasEquivalentes: 5,
  plazoPago: "en los días siguientes",
  /** Recomendación de wallet: sin definir por ahora. */
  walletRecomendada: null,
  /** Página pública de pagos: todavía no existe. */
  webPublicaPagos: false,
  variacionPotencia: "la potencia puede variar algo durante las 24 horas",
  transparencia: "Lo que recibirás en sats es menor que lo que pagas",
  resultado: "No es una inversión ni garantiza un resultado.",
  /**
   * Certificado del test final. Sin descuento de precio; las primeras plazas
   * que aprueban y dejan su email reciben más potencia en cada compra.
   * Las plazas se asignan al abrir la venta, por orden de llegada en lista_espera
   * (filas del test: producto "potencia" y para_quien vacío), un código por email.
   */
  certificado: {
    notaMinima: 12,
    plazasPotenciaExtra: 170,
    /** TH/s extra en cada pedido, mientras exista el servicio (21 como los 21 millones de bitcoin). */
    potenciaExtraTH: 21,
  },
} as const;

/** URL pública absoluta de una ruta ("/minar" → "https://bloque170.com/minar"). */
export function urlPublica(ruta: string): string {
  return `https://${SERVICIO.dominio}${ruta}`;
}
