/** Textos del juego «Construye tu bloque». Sin «premio», «suerte» ni lenguaje de azar. */
export const JUEGO = {
  title: "Construye tu bloque",
  daily: "Bloque del día",
  description:
    "Un minijuego de 2 minutos: llena tu bloque de Bitcoin con las transacciones que más pagan. Bloque nuevo cada día.",
  hook: "Hoy eres el minero. ¿Cuántos sats sacas de tu bloque?",
  howTo: [
    "Tu bloque tiene huecos limitados.",
    "Cada caja es una transacción: ocupa huecos y paga sats al minero.",
    "Toca las cajas para meterlas. Llénalo con las que más te den.",
  ],
  rounds: "3 bloques · menos de 2 minutos · el mismo reto para todo el mundo hoy",
  legend: "Color más intenso = paga más por cada hueco que ocupa.",
  sats: "Los sats son las monedas más pequeñas de Bitcoin, como los céntimos de un euro.",
  noFit: "No cabe. Saca otra caja primero.",
  playedToday:
    "Ya has jugado el bloque de hoy. Puedes repetir, pero en el ranking solo cuenta tu primera partida.",
  /** Lo que se aprende tras cada bloque. */
  lessons: [
    "Lo que cuenta no es lo que paga cada caja, sino lo que paga por cada hueco que ocupa.",
    "Ese truco no siempre basta: a veces conviene cambiar una caja para no dejar huecos vacíos.",
    "Una caja enorme que paga mucho puede salir cara si te quita sitio para otras mejores.",
  ],
  verdicts: [
    { min: 9.5, text: "Bloque perfecto. Así trabaja un minero de verdad." },
    { min: 7, text: "Muy buen bloque. Casi nadie lo deja mejor." },
    { min: 4, text: "Buen bloque. Mañana hay uno nuevo para afinar." },
    { min: 0, text: "Tu bloque ha dejado sats sobre la mesa. ¿Pruebas mañana?" },
  ],
  why170: {
    title: "¿Por qué Bloque170?",
    text: "En el bloque 170, el 12 de enero de 2009, viajó el primer pago de Bitcoin entre dos personas: Satoshi Nakamoto envió 10 BTC a Hal Finney. Sin comisión: entonces los bloques iban casi vacíos. Hoy los mineros eligen, como acabas de hacer tú.",
  },
  ranking: "El ranking es solo para ver quién construye mejores bloques. No se reparte nada.",
  rankingRules:
    "Cuenta tu primera partida de cada día. Hoy: el bloque de hoy. Semana: suma de tus notas de lunes a domingo (hora de Madrid). Si hay empate, gana el menor tiempo.",
  aliasAsk: "Ponte un alias y entra en el ranking",
  aliasHelp:
    "Máximo 20 caracteres. No pedimos email. Lo recordamos en este navegador para los próximos días.",
  next: {
    learnTitle: "¿Quieres entender la minería de verdad?",
    learn: "Haz el test de 15 preguntas →",
    waitTitle: "Con Bloque170 compras potencia de minería real durante 24 horas.",
    wait: "Avísame cuando abra la venta →",
  },
  shareText: "¿Lo haces mejor?",
} as const;

export const verdictFor = (score: number) => JUEGO.verdicts.find((v) => score >= v.min)!.text;
