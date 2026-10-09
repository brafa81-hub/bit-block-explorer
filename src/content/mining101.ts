import { SERVICIO } from "./servicio";

export interface PreguntaQuiz {
  pregunta: string;
  opciones: string[];
  /** Índice de la opción correcta. */
  correcta: number;
  explicacion: string;
}

export interface Capitulo {
  slug: string;
  titulo: string;
  /** Pregunta con la que arranca el capítulo. */
  pregunta: string;
  descripcion: string;
  secciones: { titulo: string; parrafos: string[] }[];
  /** Línea "En realidad..." que corrige la simplificación. */
  enRealidad: string;
  /** Slugs del glosario. */
  terminos: string[];
  cierre: string;
  quiz: PreguntaQuiz[];
}

const { jornada, dia } = SERVICIO.productos;
const [tramoA, tramoB] = SERVICIO.tramosCorporate;

const wallet: string[] = SERVICIO.walletRecomendada
  ? [
      `Si no tienes ninguna, te recomendamos ${SERVICIO.walletRecomendada}. Te guiamos en la instalación paso a paso.`,
    ]
  : [
      "Para elegir una, fíjate en tres cosas. Que sea sin custodia: solo tú tienes la frase. Que tenga años de uso y buena reputación. Y que se instale desde su web o tienda oficial.",
    ];

const pagos: string[] = SERVICIO.webPublicaPagos
  ? ["Además, puedes ver la potencia y los pagos en una web pública, sin tener que fiarte de nuestra palabra."]
  : [];

export const CAPITULOS: Capitulo[] = [
  {
    slug: "que-es-minar",
    titulo: "Qué es minar",
    pregunta: "¿Quién decide qué pagos de Bitcoin son válidos si no hay ningún banco?",
    descripcion: "Qué hacen los mineros, por qué existen y qué reciben a cambio, explicado desde cero.",
    secciones: [
      {
        titulo: "Un cuaderno que nadie controla",
        parrafos: [
          "Piensa en un cuaderno de cuentas compartido por millones de personas. Cada una tiene una copia idéntica.",
          "El problema es decidir quién escribe la siguiente página. Si cualquiera pudiera hacerlo gratis, habría trampas.",
        ],
      },
      {
        titulo: "Escribir cuesta trabajo",
        parrafos: [
          "Bitcoin lo resuelve así: para añadir una página hay que demostrar que has hecho mucho trabajo de cálculo.",
          "Esas páginas se llaman bloques. Quien hace ese trabajo es un minero, y se encuentra un bloque cada 10 minutos de media.",
        ],
      },
      {
        titulo: "Por qué alguien lo hace",
        parrafos: [
          "Quien añade un bloque recibe bitcoins nuevos más las comisiones de los pagos incluidos. Es la recompensa de bloque.",
          "Así la red se mantiene segura sin jefe: el incentivo empuja a actuar con honradez. Lleva funcionando así, sin parar, desde 2009.",
        ],
      },
    ],
    enRealidad:
      "En realidad, no se \"extrae\" nada. Minar es verificar pagos y sellarlos con cálculo; los bitcoins nuevos son la compensación por ese trabajo.",
    terminos: ["bitcoin", "bloque", "minero", "blockchain", "recompensa-de-bloque"],
    cierre: "Ya sabes qué hace un minero. Ahora, ¿en qué consiste exactamente ese trabajo de cálculo?",
    quiz: [
      {
        pregunta: "¿Qué hace un minero de Bitcoin?",
        opciones: ["Guarda los bitcoins de la gente", "Añade bloques de pagos haciendo trabajo de cálculo", "Fija el precio de Bitcoin"],
        correcta: 1,
        explicacion: "El minero agrupa pagos en un bloque y demuestra trabajo de cálculo para poder añadirlo al registro.",
      },
      {
        pregunta: "¿Cada cuánto se añade un bloque, de media?",
        opciones: ["Cada segundo", "Cada 10 minutos", "Cada día"],
        correcta: 1,
        explicacion: "La red está diseñada para que salga un bloque cada 10 minutos de media.",
      },
      {
        pregunta: "¿De qué está hecha la recompensa de bloque?",
        opciones: ["Solo de comisiones", "De bitcoins nuevos más comisiones", "De un pago del banco central"],
        correcta: 1,
        explicacion: "Recompensa = subsidio (bitcoins nuevos) + comisiones de las transacciones incluidas.",
      },
    ],
  },
  {
    slug: "hash-y-prueba-de-trabajo",
    titulo: "Hash y prueba de trabajo",
    pregunta: "¿Cómo demuestras que has trabajado sin que nadie tenga que vigilarte?",
    descripcion: "Qué es un hash, qué es el nonce y cómo funciona la prueba de trabajo de Bitcoin.",
    secciones: [
      {
        titulo: "La huella dactilar de los datos",
        parrafos: [
          "Un hash es como una huella dactilar: metes cualquier texto y sale una cadena fija de letras y números.",
          "Si cambias una sola coma, la huella cambia por completo. Y no hay forma de adivinarla sin calcularla. Bitcoin usa SHA-256, dos veces seguidas.",
        ],
      },
      {
        titulo: "Buscar una huella especial",
        parrafos: [
          "La regla es: el hash del bloque tiene que empezar por cierto número de ceros.",
          "Como no se puede predecir, el minero cambia un número del bloque, el nonce, y vuelve a probar. Una y otra vez.",
        ],
      },
      {
        titulo: "Difícil de hacer, fácil de comprobar",
        parrafos: [
          "Aquí viene lo bueno. Encontrar ese hash exige millones de intentos, pero comprobarlo cuesta uno solo.",
          "Eso es la prueba de trabajo, y es lo que hace a Bitcoin tan difícil de falsificar. Puedes verlo tú mismo en el simulador de esta web.",
        ],
      },
    ],
    enRealidad:
      "En realidad, la regla no son exactamente \"ceros\": el hash tiene que ser menor que un número objetivo. Los ceros iniciales son la forma visible de eso.",
    terminos: ["hash", "sha-256", "nonce", "prueba-de-trabajo"],
    cierre: "Ya entiendes la prueba de trabajo. ¿Y qué pasa cuando miles de máquinas prueban a la vez?",
    quiz: [
      {
        pregunta: "Si cambias una letra de un texto, su hash…",
        opciones: ["Cambia un poco", "Cambia por completo", "No cambia"],
        correcta: 1,
        explicacion: "Un cambio mínimo produce un hash totalmente distinto. Por eso no se puede adivinar.",
      },
      {
        pregunta: "¿Qué cambia el minero en cada intento?",
        opciones: ["El nonce", "Los pagos del bloque anterior", "La recompensa"],
        correcta: 0,
        explicacion: "El nonce es un número que el minero va cambiando para obtener un hash distinto en cada intento.",
      },
      {
        pregunta: "¿Por qué la prueba de trabajo es útil?",
        opciones: ["Porque es fácil de hacer", "Porque es difícil de hacer y fácil de comprobar", "Porque la decide un árbitro"],
        correcta: 1,
        explicacion: "Encontrar el hash cuesta mucho cálculo; comprobarlo, un solo cálculo. Cualquiera puede verificarlo.",
      },
    ],
  },
  {
    slug: "hashrate-y-dificultad",
    titulo: "Hashrate y dificultad",
    pregunta: "Si cada vez hay más máquinas, ¿por qué los bloques no salen cada vez más rápido?",
    descripcion: "Qué es el hashrate, qué son TH/s, PH/s y EH/s, y cómo se ajusta la dificultad.",
    secciones: [
      {
        titulo: "Intentos por segundo",
        parrafos: [
          "El hashrate es la velocidad a la que una máquina prueba hashes. Como los intentos por segundo de un cerrajero.",
          "Un ASIC moderno ronda los 100-300 TH/s. 1 TH/s son un billón de hashes por segundo. 1 PH/s son 1.000 TH/s, y 1 EH/s son 1.000 PH/s.",
        ],
      },
      {
        titulo: "El termostato de Bitcoin",
        parrafos: [
          "La dificultad es el número de ceros que se exige. Cada 2016 bloques, unas dos semanas, la red la ajusta.",
          "Si los bloques salieron rápido, sube. Si salieron lento, baja. Así el ritmo vuelve a unos 10 minutos.",
        ],
      },
      {
        titulo: "Probabilidad, no turnos",
        parrafos: [
          "Nadie tiene turno fijo. Cada intento tiene una probabilidad pequeñísima de valer.",
          "Con más hashrate haces más intentos, así que tu parte del trabajo crece en proporción a tu parte de la red.",
        ],
      },
    ],
    enRealidad:
      "En realidad, la dificultad no se sube de ceros en ceros: se ajusta con mucha precisión. El simulador usa ceros para que lo veas a simple vista.",
    terminos: ["hashrate", "unidades-de-hashrate", "dificultad", "ajuste-de-dificultad", "asic"],
    cierre: "Ya sabes por qué el ritmo se mantiene. Pero con tanta competencia, ¿cómo participa alguien con una sola máquina?",
    quiz: [
      {
        pregunta: "¿Cuántos TH/s hay en 1 PH/s?",
        opciones: ["100", "1.000", "1.000.000"],
        correcta: 1,
        explicacion: "1 PH/s = 1.000 TH/s, y 1 EH/s = 1.000 PH/s.",
      },
      {
        pregunta: "¿Cada cuánto se ajusta la dificultad?",
        opciones: ["Cada bloque", "Cada 2016 bloques", "Cada 210.000 bloques"],
        correcta: 1,
        explicacion: "Cada 2016 bloques, unas dos semanas. 210.000 bloques es el intervalo del halving.",
      },
      {
        pregunta: "Si entran muchas máquinas nuevas, la dificultad…",
        opciones: ["Sube", "Baja", "Se queda igual siempre"],
        correcta: 0,
        explicacion: "Con más hashrate los bloques salen antes, así que en el siguiente ajuste la dificultad sube.",
      },
    ],
  },
  {
    slug: "pools-y-pagos-proporcionales",
    titulo: "Pools y pagos proporcionales",
    pregunta: "¿Qué harías si tu probabilidad de encontrar un bloque fuera de una entre millones?",
    descripcion: "Cómo funcionan los pools de minería, qué son las shares y por qué se paga en proporción.",
    secciones: [
      {
        titulo: "Juntar fuerzas",
        parrafos: [
          "Una sola máquina podría pasar décadas sin encontrar un bloque. Por eso los mineros se unen en un pool.",
          "Es como una cooperativa: cada socio aporta trabajo y lo que se obtiene se reparte según lo aportado. Hoy casi toda la minería del mundo funciona así.",
        ],
      },
      {
        titulo: "Contar el trabajo de cada uno",
        parrafos: [
          "El pool pide a cada máquina hashes más fáciles que los del bloque. Se llaman shares.",
          "No valen para cerrar un bloque, pero demuestran cuánto trabajo aporta cada uno.",
        ],
      },
      {
        titulo: "Pagos proporcionales",
        parrafos: [
          "El pool paga según lo aportado: si pones el 1 % del trabajo, recibes cerca del 1 % de lo que entra.",
          "Así los pagos llegan de forma regular y pequeña, en vez de rara vez y de golpe.",
        ],
      },
    ],
    enRealidad:
      "En realidad, hay varios esquemas de pago, como FPPS o PPLNS. Cambian cómo se calcula el reparto, pero siempre en proporción al trabajo.",
    terminos: ["pool", "share", "esquemas-de-pago", "stratum"],
    cierre: "Ya entiendes cómo se reparte. Ahora toca la pregunta práctica: ¿cuánto cuesta minar y cuánto se recibe?",
    quiz: [
      {
        pregunta: "¿Para qué sirve un pool?",
        opciones: ["Para juntar hashrate y repartir en proporción", "Para guardar bitcoins", "Para saltarse la dificultad"],
        correcta: 0,
        explicacion: "El pool suma el trabajo de muchos y reparte lo obtenido según lo que aporta cada uno.",
      },
      {
        pregunta: "¿Qué es una share?",
        opciones: ["Un bloque completo", "Una prueba de trabajo más fácil que mide tu aportación", "Una comisión"],
        correcta: 1,
        explicacion: "Las shares son hashes más fáciles que el del bloque. Sirven para medir cuánto trabaja cada máquina.",
      },
      {
        pregunta: "Si aportas el 2 % del trabajo de un pool, recibes aproximadamente…",
        opciones: ["El 2 % de lo que entra", "Todo el bloque", "Nada hasta encontrar un bloque tú solo"],
        correcta: 0,
        explicacion: "El reparto es proporcional a lo aportado, descontada la comisión del pool.",
      },
    ],
  },
  {
    slug: "lo-que-cuesta-y-lo-que-se-recibe",
    titulo: "Lo que cuesta y lo que se recibe",
    pregunta: "¿Qué hay que poner sobre la mesa para minar y de qué depende lo que llega?",
    descripcion: "Costes de máquinas y electricidad, efecto de la dificultad y del halving, sin promesas.",
    secciones: [
      {
        titulo: "Lo que cuesta",
        parrafos: [
          "Minar necesita máquinas especializadas, los ASIC. Cuestan miles de euros y se quedan anticuadas en pocos años.",
          "Y consumen mucha electricidad, día y noche. Se mide en julios por terahash (J/TH): cuanto menos, más eficiente.",
        ],
      },
      {
        titulo: "Lo que se recibe",
        parrafos: [
          "Lo que llega depende de tu parte del hashrate total, de la recompensa y de las comisiones del momento.",
          "Si la dificultad sube, la misma máquina recibe menos. Nada de esto está garantizado.",
        ],
      },
      {
        titulo: "El halving",
        parrafos: [
          "Cada 210.000 bloques, unos 4 años, los bitcoins nuevos por bloque se reducen a la mitad.",
          "Desde abril de 2024 son 3,125 BTC. En el próximo, previsto hacia 2028, pasarán a 1,5625 BTC.",
        ],
      },
    ],
    enRealidad:
      "En realidad, las cuentas de la minería cambian cada día: precio, dificultad y comisiones se mueven. Por eso aquí hablamos de órdenes de magnitud, no de cifras fijas.",
    terminos: ["eficiencia", "halving", "recompensa-de-bloque", "comision-de-transaccion", "satoshi"],
    cierre: "Ya sabes de qué depende todo. Antes de recibir nada, falta una pieza: un sitio propio donde llegue.",
    quiz: [
      {
        pregunta: "¿Qué dos costes principales tiene minar?",
        opciones: ["Máquinas y electricidad", "Solo la wallet", "Licencias y seguros"],
        correcta: 0,
        explicacion: "Los ASIC y la electricidad que consumen son los grandes costes de la minería.",
      },
      {
        pregunta: "¿Qué ocurre en un halving?",
        opciones: ["Se duplica la recompensa", "Los bitcoins nuevos por bloque se reducen a la mitad", "Se ajusta la dificultad"],
        correcta: 1,
        explicacion: "Cada 210.000 bloques el subsidio se reduce a la mitad: de 3,125 BTC pasará a 1,5625 BTC.",
      },
      {
        pregunta: "Si la dificultad sube y todo lo demás sigue igual, la misma máquina recibe…",
        opciones: ["Más", "Menos", "Lo mismo"],
        correcta: 1,
        explicacion: "Su parte del hashrate total baja, así que lo que recibe también baja.",
      },
    ],
  },
  {
    slug: "tu-primera-wallet",
    titulo: "Tu primera wallet",
    pregunta: "¿Dónde guardas algo que solo existe en internet?",
    descripcion: "Qué es una wallet sin custodia, la diferencia entre dirección, clave privada y frase de recuperación.",
    secciones: [
      {
        titulo: "Tu propia caja fuerte",
        parrafos: [
          "Una wallet sin custodia es como una caja fuerte que solo tú sabes abrir. Nadie más, ni siquiera quien fabricó la caja.",
          "Es una aplicación en tu móvil u ordenador. Lo importante no es la app, sino las llaves.",
        ],
      },
      {
        titulo: "Tres piezas distintas",
        parrafos: [
          "La dirección es como tu número de cuenta. La puedes compartir: sirve para que te envíen bitcoins.",
          "La clave privada y la frase de recuperación son la llave. Nunca se comparten: quien las tiene controla los fondos.",
        ],
      },
      {
        titulo: "Pasos generales",
        parrafos: [
          "Instala la wallet solo desde la tienda oficial o la web oficial. Al crearla te dará una frase de palabras: apúntala en papel y guárdala bien.",
          "Luego copia tu dirección. Al pegarla en cualquier sitio, comprueba que el principio y el final coinciden.",
          ...wallet,
        ],
      },
      {
        titulo: "Lo que HashFlow nunca hará",
        parrafos: [
          "HashFlow nunca te pedirá la frase de recuperación. No crea tu wallet ni custodia tus fondos.",
          "Solo necesitamos tu dirección. Si alguien te pide la frase, no somos nosotros.",
        ],
      },
    ],
    enRealidad:
      "En realidad, tus bitcoins no están dentro de la app: están registrados en la blockchain. La wallet solo guarda las llaves para moverlos.",
    terminos: ["wallet", "direccion", "clave-privada", "frase-de-recuperacion"],
    cierre: "Ya tienes dónde recibir. Solo queda ver cómo participar sin comprar ninguna máquina.",
    quiz: [
      {
        pregunta: "¿Qué puedes compartir sin problema?",
        opciones: ["La frase de recuperación", "La dirección", "La clave privada"],
        correcta: 1,
        explicacion: "La dirección sirve para recibir. La frase y la clave privada dan control total y nunca se comparten.",
      },
      {
        pregunta: "¿Dónde conviene apuntar la frase de recuperación?",
        opciones: ["En papel", "En un correo a ti mismo", "En un mensaje a soporte"],
        correcta: 0,
        explicacion: "En papel, guardado en un lugar seguro y lejos de internet.",
      },
      {
        pregunta: "¿Qué te pide HashFlow?",
        opciones: ["Tu frase de recuperación", "Solo tu dirección", "Tu clave privada"],
        correcta: 1,
        explicacion: "Solo tu dirección. HashFlow nunca pide la frase ni custodia fondos.",
      },
    ],
  },
  {
    slug: "alquilar-hashrate",
    titulo: "Alquilar hashrate",
    pregunta: "¿Se puede participar en la minería real sin tener ni una sola máquina?",
    descripcion: "Qué es alquilar hashrate, cómo funciona con HashFlow y qué puedes esperar, con total transparencia.",
    secciones: [
      {
        titulo: "Potencia por horas",
        parrafos: [
          "Alquilar hashrate es acceder durante unas horas a potencia de minería industrial: máquinas profesionales, en instalaciones preparadas para ello, sin comprarlas, sin ruido y sin factura de luz.",
          `Con HashFlow eliges ${jornada.potencia} durante ${jornada.horas} h (${jornada.nombre}, ${jornada.precio}) o durante ${dia.horas} h (${dia.nombre}, ${dia.precio}).`,
        ],
      },
      {
        titulo: "Cómo funciona",
        parrafos: [
          `Eliges ${jornada.nombre} o ${dia.nombre}. Nos das la dirección de tu wallet. Nada más: ni pool ni datos técnicos.`,
          `HashFlow lanza la potencia a un pool. El pool paga de forma proporcional a tu dirección, ${SERVICIO.plazoPago}.`,
          `Ten en cuenta que ${SERVICIO.variacionPotencia}.`,
          ...pagos,
        ],
      },
      {
        titulo: "Lo que pagas y lo que recibes",
        parrafos: [
          "Vamos a ser claros, porque es lo más importante de esta página: lo que pagas es mayor que lo que recibirás en sats. Normalmente, bastante mayor.",
          "Mira el simulador: 1 PH/s es mucho frente a un ordenador, pero una parte muy pequeña de la red. Lo que llega es, como orden de magnitud, una fracción de lo pagado.",
          "No es una inversión y no hay resultado garantizado. Lo que obtienes es minar Bitcoin de verdad: los sats que genere tu potencia son bitcoin recién creado por la red, sin historial previo, y llegan directamente a tu wallet sin pasar por ningún exchange. La cantidad no es fija: depende de la red y del pool, y será menor de lo que pagas.",
        ],
      },
      {
        titulo: "Para empresas",
        parrafos: [
          `Con Corporate compras códigos regalo: de ${tramoA.min} a ${tramoA.max} uds. con −${tramoA.descuentoPct} % y desde ${tramoB.min} uds. con −${tramoB.descuentoPct} %. Cada persona canjea el suyo con su propia wallet.`,
        ],
      },
    ],
    enRealidad:
      "En realidad, no alquilas una máquina concreta: alquilas una cantidad de potencia durante un tiempo, que puede salir de varias máquinas.",
    terminos: ["hashrate-alquilado", "pool-de-destino", "orden", "corporate"],
    cierre: "Has recorrido la minería de principio a fin: ya entiendes algo que la mayoría de la gente nunca llega a ver por dentro. ¿Lo compruebas con el quiz final?",
    quiz: [
      {
        pregunta: "¿Qué necesitas darle a HashFlow?",
        opciones: ["Tu dirección de wallet", "Tu pool y tu stratum", "Tu frase de recuperación"],
        correcta: 0,
        explicacion: "Solo la dirección. HashFlow se encarga de todo lo técnico.",
      },
      {
        pregunta: "Comparado con lo que pagas, lo que recibes en sats es…",
        opciones: ["Mayor", "Menor", "Exactamente igual"],
        correcta: 1,
        explicacion: "Lo que pagas es mayor que lo que recibes. No es una inversión ni garantiza resultado.",
      },
      {
        pregunta: "¿Quién te paga los sats?",
        opciones: ["HashFlow, de su cuenta", "El pool, de forma proporcional", "Un banco"],
        correcta: 1,
        explicacion: "El pool paga directamente a tu dirección según lo aportado. HashFlow no recibe ni custodia fondos.",
      },
    ],
  },
];

export const QUIZ_FINAL: PreguntaQuiz[] = [
  ...CAPITULOS.map((c) => c.quiz[0]!),
  CAPITULOS[1]!.quiz[2]!,
  CAPITULOS[4]!.quiz[1]!,
  CAPITULOS[6]!.quiz[1]!,
];

export const getCapitulo = (slug: string) => CAPITULOS.find((c) => c.slug === slug);
export const indiceCapitulo = (slug: string) => CAPITULOS.findIndex((c) => c.slug === slug);
export const capituloDeTermino = (slug: string) => CAPITULOS.find((c) => c.terminos.includes(slug));
