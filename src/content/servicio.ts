/**
 * Datos canónicos del servicio HashFlow.
 * Única fuente de precios, tramos Corporate y condiciones.
 * Los textos leen de aquí; no se repiten estos datos a mano.
 */

export const SERVICIO = {
  productos: {
    jornada: { nombre: "Jornada", horas: 8, potencia: "1 PH/s", precio: "29,95 €" },
    dia: { nombre: "Día", horas: 24, potencia: "1 PH/s", precio: "74,95 €" },
  },
  tramosCorporate: [
    { min: 10, max: 49, descuentoPct: 10 },
    { min: 50, max: null, descuentoPct: 15 },
  ],
  plazoPago: "en los días siguientes",
  /** Recomendación de wallet: sin definir por ahora. */
  walletRecomendada: null,
  /** Página pública de pagos: todavía no existe. */
  webPublicaPagos: false,
  variacionPotencia: "la potencia puede variar algo durante la sesión",
  transparencia: "Lo que recibirás en sats es menor que lo que pagas",
  resultado: "No es una inversión ni garantiza un resultado.",
} as const;
