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
  /** Un solo tramo con compra directa; desde `presupuestoDesde` se cotiza a medida. */
  tramosCorporate: [{ min: 5, max: 50, descuentoPct: 10 }],
  corporate: {
    presupuestoDesde: 51,
    caducidadMeses: 12,
    /** Los descuentos (Corporate, certificado...) no se suman entre sí. */
    descuentosAcumulables: false,
  },
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
