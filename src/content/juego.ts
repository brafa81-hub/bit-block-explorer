/** Textos del juego «Snake minero». Sin sats, sin «premio», «suerte» ni lenguaje de azar. */
export const JUEGO = {
  title: "Snake minero",
  daily: "Cadena del día",
  description:
    "Un minijuego de 90 segundos: tu serpiente es una cadena de bloques. Come bloques, esquiva muros y aguanta el halving. Cadena nueva cada día.",
  hook: "Tu serpiente es una cadena de bloques. ¿Hasta dónde la alargas?",
  howTo: [
    "Desliza el dedo sobre el tablero (o usa las flechas) para girar.",
    "Cada bloque que comes se engancha a tu cadena y suma puntos.",
    "No choques con los bordes, los muros ni con tu propia cadena.",
  ],
  rules: "90 segundos · 3 intentos al día, cuenta el mejor · el mismo mapa para todo el mundo hoy",
  rewards: [
    "50 puntos por bloque.",
    "Cada 21 bloques, halving: los puntos por bloque bajan a la mitad.",
    "Cada 10 bloques sube la dificultad: la serpiente va más rápida.",
  ],
  attemptsLeft: (left: number) =>
    left > 0
      ? `Te ${left === 1 ? "queda 1 intento" : `quedan ${left} intentos`} hoy para el ranking.`
      : "Ya has usado tus 3 intentos de hoy. Puedes seguir jugando, pero ya no cuenta para el ranking.",
  levelUp: "Sube la dificultad",
  halving: "¡Halving! Puntos a la mitad",
  crashed: "Choque",
  timeUp: "Tiempo",
  /** Lo que se aprende al terminar. */
  lessons: [
    "Cadena de bloques: cada bloque se engancha al anterior. Por eso Bitcoin se llama así.",
    "Halving: en Bitcoin, la recompensa por bloque baja a la mitad cada 210.000 bloques, unos 4 años. Aquí, cada 21.",
    "Dificultad: en Bitcoin se ajusta cada 2.016 bloques para que salga uno cada 10 minutos, haya más o menos mineros. Aquí, cada 10 bloques, todo va más rápido.",
  ],
  verdicts: [
    { min: 42, text: "Has pasado dos halvings. Cadena de minero veterano." },
    { min: 21, text: "Has llegado al halving: tus bloques ya valen la mitad, como en Bitcoin." },
    { min: 10, text: "Buena cadena. Ya has notado cómo sube la dificultad." },
    { min: 0, text: "Cadena corta. Con el siguiente intento la alargas." },
  ],
  why170: {
    title: "¿Por qué Bloque170?",
    text: "En el bloque 170, el 12 de enero de 2009, viajó el primer pago de Bitcoin entre dos personas: Satoshi Nakamoto envió 10 BTC a Hal Finney. Desde entonces, cada bloque se ha enganchado al anterior, como tu serpiente.",
  },
  ranking: "El ranking es solo para ver quién alarga más su cadena. No se reparte nada.",
  rankingRules:
    "Cuenta el mejor de tus 3 primeros intentos de cada día. Hoy: la cadena de hoy. Semana: suma de tus puntos de lunes a domingo (hora de Madrid). Si hay empate, gana quien llegó antes a sus puntos.",
  aliasAsk: "Ponte un alias y entra en el ranking",
  aliasHelp:
    "Máximo 20 caracteres. No pedimos email. Lo recordamos en este navegador para los próximos días.",
  next: {
    learnTitle: "¿Quieres entender la minería de verdad?",
    learn: "Haz el test de 15 preguntas →",
    waitTitle: "Con Bloque170 compras potencia de minería real durante 24 horas.",
    wait: "Avísame cuando abra la venta →",
  },
  shareText: "¿Llegas más lejos?",
} as const;

export const verdictFor = (blocks: number) => JUEGO.verdicts.find((v) => blocks >= v.min)!.text;
