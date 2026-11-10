/** Textos y guion del reto «Un bloque cada 10 minutos» de /aprende. */

export const RETO = {
  slug: "reto-10-minutos",
  titulo: "Reto: un bloque cada 10 minutos",
  descripcionMeta:
    "Controla la dificultad de una red de Bitcoin simulada y mantén el ritmo de un bloque cada 10 minutos mientras entran y salen mineros.",
  intro:
    "Bitcoin está pensado para sacar un bloque cada 10 minutos de media, haya muchas máquinas minando o pocas. ¿Serías capaz de mantener tú ese ritmo?",
  objetivo: "Mantén los bloques en verde.",
  instrucciones: [
    "Entrarán y saldrán mineros durante 60 segundos, y los bloques irán más rápido o más lento.",
    "Tú solo mueves la dificultad: súbela si van rápido y bájala si van lento.",
  ],
  empezar: "Empezar el reto",
  dificultad: "Dificultad",
  facil: "Más fácil",
  dificil: "Más difícil",
  bajar: "Bajar dificultad",
  subir: "Subir dificultad",
  ahora: "Ahora",
  esperando: "Esperando el primer bloque…",
  indicador: {
    rapido: { simbolo: "▲", titulo: "Demasiado rápido", accion: "Sube la dificultad" },
    bien: { simbolo: "●", titulo: "A buen ritmo", accion: "Sigue así" },
    lento: { simbolo: "▼", titulo: "Demasiado lento", accion: "Baja la dificultad" },
  },
  /** Guion igual para todos: segundo real en que ocurre y potencia relativa de la red. */
  eventos: [
    { seg: 0, potencia: 100, texto: "La red arranca con calma." },
    { seg: 8, potencia: 150, texto: "Se conectan nuevos mineros." },
    { seg: 20, potencia: 230, texto: "Arranca una gran granja de minería." },
    { seg: 32, potencia: 130, texto: "Muchos mineros se desconectan." },
    { seg: 44, potencia: 180, texto: "Vuelven algunos mineros." },
  ],
  fin: {
    etiqueta: "resultado",
    aBuenRitmo: (verdes: number, total: number) => `${verdes} de ${total} bloques a buen ritmo`,
    media: (min: string) => `Media entre bloques: ${min} minutos.`,
    valoracion: [
      { desde: 0.75, texto: "Ritmo de reloj. Así de estable funciona la red real." },
      { desde: 0.5, texto: "Buen pulso, aunque algún cambio de mineros te ha pillado por sorpresa." },
      { desde: 0, texto: "Los bloques se te han desbocado. Prueba otra vez y reacciona antes a los avisos." },
    ],
    ritmo: "Minutos de cada bloque",
    objetivoLinea: "objetivo: 10 min",
    grafico: "Lo que no veías",
    potencia: "Potencia de la red",
    tuDificultad: "Tu dificultad",
    graficoTexto: "Cuanto más pegada va tu línea a la de la potencia, más bloques salen a buen ritmo.",
    explicacion:
      "En la red real nadie mueve este control. Cada 2.016 bloques, unas dos semanas, la red mira cuánto ha tardado y ajusta la dificultad ella sola. Por eso, entre o salga potencia, Bitcoin sigue sacando un bloque cada 10 minutos de media.",
    repetir: "Repetir el reto",
    compartir: "Compartir resultado",
    copiado: "Copiado",
    textoCompartir: (verdes: number, total: number) =>
      `He sacado ${verdes} de ${total} bloques a buen ritmo en el reto de Bitcoin. ¿Lo mejoras?`,
    capitulo: "Lee el capítulo sobre hashrate y dificultad",
  },
  aviso:
    "Simplificado: aquí el tiempo va acelerado (1 segundo son 5 minutos), la potencia cambia de golpe y la suerte de cada bloque está acotada.",
  enlaceIndice: {
    etiqueta: "reto",
    titulo: "Un bloque cada 10 minutos",
    texto: "Controla la dificultad de la red durante 60 segundos y mantén el ritmo de Bitcoin.",
  },
} as const;
