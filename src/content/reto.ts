/** Textos y guion del reto «Un bloque cada 10 minutos» de /aprende. */

export const RETO = {
  slug: "reto-10-minutos",
  titulo: "Reto: un bloque cada 10 minutos",
  descripcionMeta:
    "Controla la dificultad de una red de Bitcoin simulada y mantén el ritmo de un bloque cada 10 minutos mientras entran y salen mineros.",
  intro:
    "Bitcoin está pensado para sacar un bloque cada 10 minutos de media, haya muchas máquinas minando o pocas. ¿Serías capaz de mantener tú ese ritmo?",
  instrucciones: [
    "Durante 60 segundos, tú controlas la dificultad de la red.",
    "Irán entrando y saliendo mineros, pero no sabrás cuánta potencia hay: solo verás salir los bloques.",
    "Si salen demasiado rápido, sube la dificultad. Si tardan demasiado, bájala.",
  ],
  empezar: "Empezar el reto",
  dificultad: "Dificultad",
  bajar: "Bajar dificultad",
  subir: "Subir dificultad",
  ahora: "Ahora",
  cadena: "Tu cadena",
  ritmo: "Minutos entre bloques",
  objetivo: "objetivo: 10 min",
  esperando: "Esperando el primer bloque…",
  rapido: "demasiado rápido",
  bien: "a buen ritmo",
  lento: "demasiado lento",
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
    bloques: "Bloques",
    media: "Media entre bloques",
    precision: "Precisión",
    valoracion: [
      { desde: 85, texto: "Ritmo de reloj. Así de estable funciona la red real." },
      { desde: 60, texto: "Buen pulso, aunque algún cambio de potencia te ha pillado por sorpresa." },
      { desde: 0, texto: "Los bloques se te han desbocado. Prueba otra vez y adelántate a los cambios." },
    ],
    grafico: "Lo que pasó por dentro",
    potencia: "Potencia de la red",
    tuDificultad: "Tu dificultad",
    explicacion:
      "En la red real nadie mueve este control. Cada 2.016 bloques, unas dos semanas, la red mira cuánto ha tardado y ajusta la dificultad ella sola. Por eso, entre o salga potencia, Bitcoin sigue sacando un bloque cada 10 minutos de media.",
    repetir: "Repetir el reto",
    compartir: "Compartir resultado",
    copiado: "Copiado",
    textoCompartir: (p: number) => `He mantenido el ritmo de Bitcoin con un ${p} % de precisión. ¿Lo mejoras?`,
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
