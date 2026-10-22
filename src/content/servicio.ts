/**
 * Datos canónicos del servicio.
 * Única fuente de precios, tramos Corporate y condiciones.
 * Los textos leen de aquí; no se repiten estos datos a mano.
 */

export const SERVICIO = {
  /** Nombre de marca: se cambia solo aquí. */
  marca: "HashFlow",
  /** Lema de marca. */
  lema: "Democratizamos el acceso a la minería de Bitcoin",
  /**
   * Catálogo vigente (modelo de negocio v9.2, 21 oct 2026). Lo usan /minar y la portada.
   * Precios cerrados con IVA incluido. Los sats son una estimación orientativa, no garantizada.
   */
  catalogo: {
    unidad: {
      nombre: "Unidad",
      potenciaTH: 250,
      horas: 24,
      precio: "24,95 €",
      /** Sats aproximados en modo estable (parte baja del rango de la v9.2, BTC a 72.840 €). */
      satsAprox: 11000,
      /** Unidades sueltas que se pueden pedir; desde 4 se ofrece el pack. */
      maxSueltas: 3,
    },
    pack: {
      nombre: "Pack 1 PH/s",
      unidades: 4,
      horas: 24,
      precio: "79,95 €",
      satsAprox: 45000,
    },
    corporate: {
      nombre: "Corporate",
      /** Mínimo en PH/s; cada PH/s va a precio de pack. */
      desdePH: 5,
    },
    /** Fecha a la que se calcularon los sats y las probabilidades. */
    fechaEstimacion: "oct. 2026",
  },
  /** Modos de minado en prueba de demanda (no están en la v9.2; se mide el interés). */
  modos: {
    /** Recargo por pedido del modo mixto (cubre el segundo pedido al cambiar de pool). */
    extraMixto: "2,00 €",
    /**
     * Probabilidad aproximada de encontrar un bloque con una unidad (250 TH/s · 24 h)
     * con la red a unos 1.000 EH/s: 1 entre ~28.000. Con n unidades, 1 entre 28.000 / n.
     */
    unoEntreBloquePorUnidad: 28000,
  },
  /** Catálogo anterior (Jornada/Día): lo usan aún Aprende y el Diccionario hasta que se actualicen. */
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
