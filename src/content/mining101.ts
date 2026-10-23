import { DESDE_EUROS_APROX } from "@/lib/catalogo";
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

const { caducidadMeses } = SERVICIO.corporate;
const potencia = "de 250 TH/s a 1 PH/s";

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
    terminos: ["bitcoin", "bloque", "minero", "blockchain", "recompensa-de-bloque", "transaccion", "consenso", "descentralizacion", "bloque-genesis", "transaccion-coinbase"],
    cierre: "Ya sabes qué hace un minero. Pero, ¿qué lleva exactamente cada una de esas páginas?",
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
    slug: "dentro-de-un-bloque",
    titulo: "Dentro de un bloque",
    pregunta: "Cuando envías bitcoin, ¿dónde espera tu pago hasta quedar registrado?",
    descripcion: "Qué lleva un bloque, qué es el mempool, cómo eligen los mineros qué pagos incluir y qué son las confirmaciones.",
    secciones: [
      {
        titulo: "La sala de espera",
        parrafos: [
          "Cuando alguien envía bitcoin, el pago no se registra al instante. Primero viaja por la red y espera en una especie de sala de espera: el mempool.",
          "Cada nodo de la red guarda su propia copia de esa sala. Allí se acumulan los pagos pendientes hasta que un minero los incluye en un bloque.",
        ],
      },
      {
        titulo: "Qué lleva un bloque",
        parrafos: [
          "Un bloque es una página del registro. Lleva unos pocos miles de pagos y una cabecera con un resumen de todos ellos y la referencia al bloque anterior.",
          "El primer pago de cada bloque es especial: lo crea el propio minero para cobrarse la recompensa. Es la transacción coinbase.",
        ],
      },
      {
        titulo: "Quién entra primero",
        parrafos: [
          "El espacio de cada bloque es limitado. Por eso los mineros eligen primero los pagos que ofrecen más comisión por espacio ocupado, medida en sat/vB.",
          "Si hay mucha demanda, las comisiones suben. Si hay poca, un pago barato entra igual en pocos minutos.",
        ],
      },
      {
        titulo: "Confirmaciones",
        parrafos: [
          "Cuando tu pago entra en un bloque, tiene una confirmación. Cada bloque que se añade encima suma otra.",
          "Cuantas más confirmaciones, más difícil es deshacerlo. Para cantidades grandes se suele esperar a seis, aproximadamente una hora.",
        ],
      },
    ],
    enRealidad:
      "En realidad, no hay un único mempool: cada nodo tiene el suyo y pueden diferir un poco. Y el límite de un bloque no se mide en megas exactos, sino en una unidad llamada peso.",
    terminos: ["mempool", "nodo", "confirmacion", "comision-de-transaccion", "sat-vb", "rbf", "bloque-huerfano", "bifurcacion"],
    cierre: "Ya sabes qué se mete en un bloque. Ahora, ¿en qué consiste exactamente el trabajo de cálculo para sellarlo?",
    quiz: [
      {
        pregunta: "¿Dónde esperan los pagos antes de entrar en un bloque?",
        opciones: ["En el mempool", "En la wallet del minero", "En un banco"],
        correcta: 0,
        explicacion: "Los pagos pendientes esperan en el mempool de los nodos hasta que un minero los incluye en un bloque.",
      },
      {
        pregunta: "¿Qué pagos suelen entrar antes en un bloque?",
        opciones: ["Los más antiguos", "Los que pagan más comisión por espacio ocupado", "Los de mayor importe"],
        correcta: 1,
        explicacion: "El espacio es limitado, así que los mineros priorizan la comisión por espacio (sat/vB), no el importe.",
      },
      {
        pregunta: "¿Qué significa que un pago tenga seis confirmaciones?",
        opciones: ["Que seis personas lo han aprobado", "Que hay seis bloques con el suyo incluido o encima de él", "Que ha pagado seis veces la comisión"],
        correcta: 1,
        explicacion: "Cada bloque añadido encima suma una confirmación. Seis bloques son aproximadamente una hora.",
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
          "Eso es la prueba de trabajo, y es lo que hace a Bitcoin tan difícil de falsificar. Puedes verlo tú mismo en el [simulador](/simulador) de esta web.",
        ],
      },
    ],
    enRealidad:
      "En realidad, la regla no son exactamente \"ceros\": el hash tiene que ser menor que un número objetivo. Los ceros iniciales son la forma visible de eso.",
    terminos: ["hash", "sha-256", "nonce", "prueba-de-trabajo", "cabecera-de-bloque", "raiz-de-merkle", "objetivo-de-dificultad"],
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
      "En realidad, nadie mide el hashrate de la red directamente: se estima a partir de lo rápido que salen los bloques y de la dificultad vigente.",
    terminos: ["hashrate", "unidades-de-hashrate", "dificultad", "ajuste-de-dificultad", "hashrate-de-la-red"],
    cierre: "Ya sabes por qué el ritmo se mantiene. ¿Y qué máquinas hacen todos esos intentos?",
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
    slug: "las-maquinas",
    titulo: "Las máquinas: ASIC",
    pregunta: "¿Por qué ya no se mina Bitcoin con un ordenador normal?",
    descripcion: "Qué es un ASIC, cómo se pasó del ordenador de casa a las granjas de minería y cuánta potencia hay en 1 PH/s.",
    secciones: [
      {
        titulo: "Del portátil a la máquina especializada",
        parrafos: [
          "En 2009 se minaba con el procesador de cualquier ordenador. Después llegaron las tarjetas gráficas, mucho más rápidas para este cálculo.",
          "Desde 2013 se mina con ASIC: máquinas que solo saben hacer una cosa, calcular hashes SHA-256, pero la hacen millones de veces más rápido que un ordenador.",
        ],
      },
      {
        titulo: "Cómo es un ASIC",
        parrafos: [
          "Por fuera parece una caja metálica del tamaño de una tostadora grande, con ventiladores a cada lado. Dentro hay placas llenas de chips diseñados solo para minar.",
          "Uno moderno hace unos 200 TH/s y consume más de 3.000 W, como tener varios hornos encendidos día y noche. Y suena como un secador de pelo a máxima potencia.",
        ],
      },
      {
        titulo: "Dónde viven",
        parrafos: [
          "Por el ruido, el calor y el consumo, no caben en casa. Viven en granjas de minería: naves con miles de máquinas, buena ventilación o refrigeración líquida y electricidad a precio industrial.",
          "Allí trabajan sin descanso. Cada minuto parada es potencia perdida, por eso se vigila el tiempo de actividad de cada una.",
        ],
      },
      {
        titulo: "Cuánto es 1 PH/s",
        parrafos: [
          "1 PH/s son 1.000 TH/s: la potencia de unas cinco máquinas modernas trabajando a la vez.",
          "Es mucho más de lo que nadie puede tener en casa, pero una parte muy pequeña de toda la red, que suma cientos de miles de PH/s.",
        ],
      },
    ],
    enRealidad:
      "En realidad, cada modelo de ASIC tiene su propia potencia y consumo, y los nuevos son más eficientes. Por eso hablamos de \"unas cinco máquinas\": es una referencia, no una cifra exacta.",
    terminos: ["asic", "eficiencia", "granja-de-mineria", "refrigeracion", "firmware", "tiempo-de-actividad"],
    cierre: "Ya conoces las máquinas. Pero con tanta competencia, ¿cómo participa alguien con una sola?",
    quiz: [
      {
        pregunta: "¿Qué es un ASIC?",
        opciones: ["Un ordenador para todo uso", "Una máquina diseñada solo para calcular hashes", "Un tipo de wallet"],
        correcta: 1,
        explicacion: "Un ASIC solo sabe hacer una cosa, calcular hashes SHA-256, pero la hace muchísimo más rápido que cualquier ordenador.",
      },
      {
        pregunta: "¿Por qué los ASIC están en granjas y no en casas?",
        opciones: ["Por el ruido, el calor y el consumo", "Porque es obligatorio por ley", "Porque solo funcionan de noche"],
        correcta: 0,
        explicacion: "Hacen mucho ruido, generan mucho calor y consumen mucha electricidad. Las granjas están preparadas para eso.",
      },
      {
        pregunta: "1 PH/s equivale aproximadamente a…",
        opciones: ["Un ordenador portátil", "Unas cinco máquinas modernas", "Toda la red de Bitcoin"],
        correcta: 1,
        explicacion: "Un ASIC moderno hace unos 200 TH/s, así que 1 PH/s (1.000 TH/s) son unas cinco máquinas.",
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
    terminos: ["pool", "share", "esquemas-de-pago", "stratum", "worker", "share-rechazada", "mineria-en-solitario"],
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
    terminos: ["halving", "recompensa-de-bloque", "satoshi", "suministro-maximo", "altura-de-bloque"],
    cierre: "Ya sabes de qué depende lo que cuesta y lo que se recibe. Queda una pregunta que mucha gente se hace: ¿y la energía?",
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
    slug: "energia-y-mineria",
    titulo: "Energía y minería",
    pregunta: "¿Gasta Bitcoin demasiada electricidad?",
    descripcion: "Por qué la minería consume energía, de dónde sale esa energía y qué tiene de particular como consumidor.",
    secciones: [
      {
        titulo: "Sí, consume mucho",
        parrafos: [
          "No hay que esconderlo: la minería de Bitcoin usa mucha electricidad. Es el precio de su seguridad.",
          "Para cambiar el registro, un tramposo tendría que gastar más energía que todos los mineros honrados juntos. Esa barrera física es la que protege cada pago.",
        ],
      },
      {
        titulo: "Busca la energía más barata",
        parrafos: [
          "Para un minero, la electricidad es el gasto principal. Por eso las granjas se instalan donde la energía sobra y es barata: junto a presas, parques eólicos o solares.",
          "A veces aprovechan energía que se perdería: sobrantes que la red eléctrica no puede absorber o gas que, si no, se quemaría al aire en pozos de petróleo.",
        ],
      },
      {
        titulo: "Un consumidor que se puede apagar",
        parrafos: [
          "A diferencia de una fábrica o un hospital, una granja puede apagarse en segundos y volver a encenderse sin perder nada.",
          "En algunos lugares, las granjas se apagan cuando la red eléctrica va justa y vuelven cuando sobra energía. Así ayudan a equilibrar la red.",
        ],
      },
    ],
    enRealidad:
      "En realidad, cuánta de la energía de la minería es renovable depende de quién lo mida y cómo. Las cifras varían entre estudios, así que desconfía de cualquier número rotundo, a favor o en contra.",
    terminos: ["ataque-del-51"],
    cierre: "Ya sabes de qué depende todo. Antes de recibir nada, falta una pieza: un sitio propio donde llegue.",
    quiz: [
      {
        pregunta: "¿Por qué la minería protege Bitcoin?",
        opciones: [
          "Porque cambiar el registro exigiría más energía que la de todos los mineros honrados",
          "Porque los mineros vigilan a los usuarios",
          "Porque la energía cifra los bitcoins",
        ],
        correcta: 0,
        explicacion: "La energía gastada es una barrera física: hacer trampa costaría más que jugar limpio.",
      },
      {
        pregunta: "¿Dónde suelen instalarse las granjas de minería?",
        opciones: ["En el centro de las ciudades", "Donde la electricidad sobra y es barata", "Donde más frío hace, sin importar el precio"],
        correcta: 1,
        explicacion: "La electricidad es el gasto principal, así que buscan energía barata, a menudo sobrante.",
      },
      {
        pregunta: "¿Qué tiene de particular una granja como consumidor de electricidad?",
        opciones: ["Que no puede apagarse nunca", "Que puede apagarse y encenderse en segundos", "Que solo funciona de día"],
        correcta: 1,
        explicacion: "Puede parar cuando la red eléctrica va justa y volver cuando sobra energía.",
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
        titulo: `Lo que ${SERVICIO.marca} nunca hará`,
        parrafos: [
          `${SERVICIO.marca} nunca te pedirá la frase de recuperación. No crea tu wallet ni custodia tus fondos.`,
          "Solo necesitamos tu dirección. Si alguien te pide la frase, no somos nosotros.",
        ],
      },
    ],
    enRealidad:
      "En realidad, tus bitcoins no están dentro de la app: están registrados en la blockchain. La wallet solo guarda las llaves para moverlos.",
    terminos: ["wallet", "direccion", "clave-privada", "frase-de-recuperacion", "clave-publica", "firma-digital", "utxo", "wallet-sin-custodia", "custodia", "wallet-fria", "wallet-caliente", "hardware-wallet", "copia-de-seguridad", "phishing", "doble-factor", "segwit", "taproot", "lightning"],
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
        pregunta: `¿Qué te pide ${SERVICIO.marca}?`,
        opciones: ["Tu frase de recuperación", "Solo tu dirección", "Tu clave privada"],
        correcta: 1,
        explicacion: `Solo tu dirección. ${SERVICIO.marca} nunca pide la frase ni custodia fondos.`,
      },
    ],
  },
  {
    slug: "alquilar-hashrate",
    titulo: "Alquilar hashrate",
    pregunta: "¿Se puede participar en la minería real sin tener ni una sola máquina?",
    descripcion: `Qué es alquilar hashrate, cómo funciona con ${SERVICIO.marca} y qué puedes esperar, con total transparencia.`,
    secciones: [
      {
        titulo: "Potencia por horas",
        parrafos: [
          "Alquilar hashrate es acceder durante unas horas a potencia de minería industrial: máquinas profesionales, en instalaciones preparadas para ello, sin comprarlas, sin ruido y sin factura de luz.",
          `Con ${SERVICIO.marca} eliges tu potencia, ${potencia}, durante 24 h, desde unos ${DESDE_EUROS_APROX} con IVA.`,
        ],
      },
      {
        titulo: "Cómo funciona",
        parrafos: [
          `Eliges la potencia y nos das la dirección de tu wallet. Nada más: ni pool ni datos técnicos (salvo en modo Avanzado, si quieres elegir tú el pool).`,
          `${SERVICIO.marca} lanza la potencia a un pool. El pool paga de forma proporcional a tu dirección, ${SERVICIO.plazoPago}.`,
          `Ten en cuenta que ${SERVICIO.variacionPotencia}.`,
          ...pagos,
        ],
      },
      {
        titulo: "Lo que pagas y lo que recibes",
        parrafos: [
          "Vamos a ser claros, porque es lo más importante de esta página: lo que pagas es mayor que lo que recibirás en sats.",
          "Mira el [simulador](/simulador): 1 PH/s es mucho frente a un ordenador, pero una parte muy pequeña de la red.",
          "No es una inversión y no hay resultado garantizado. Lo que obtienes es minar Bitcoin de verdad: los sats que genere tu potencia son bitcoin recién creado por la red, sin historial previo, y llegan directamente a tu wallet sin pasar por ningún exchange. La cantidad no es fija: depende de la red y del pool.",
        ],
      },
      {
        titulo: "Para grupos y empresas",
        parrafos: [
          `Para más de 1 PH/s, para ti o para regalar, preparamos un presupuesto a medida. Si son para ti, las lanzamos a la vez con tu wallet. Si son para regalar, cada persona recibe un enlace de activación, pone su wallet y elige cuándo empezar, durante ${caducidadMeses} meses.`,
        ],
      },
    ],
    enRealidad:
      "En realidad, no alquilas una máquina concreta: alquilas una cantidad de potencia durante un tiempo, que puede salir de varias máquinas.",
    terminos: ["hashrate-alquilado", "pool-de-destino", "grupos-y-empresas"],
    cierre: "Has recorrido la minería de principio a fin: ya entiendes algo que la mayoría de la gente nunca llega a ver por dentro. Ahora puedes dar el paso o comprobar lo aprendido con el test.",
    quiz: [
      {
        pregunta: `¿Qué necesitas darle a ${SERVICIO.marca}?`,
        opciones: ["Tu dirección de wallet", "Tu pool y tu stratum", "Tu frase de recuperación"],
        correcta: 0,
        explicacion: `Solo la dirección. ${SERVICIO.marca} se encarga de todo lo técnico.`,
      },
      {
        pregunta: `¿Qué eliges al alquilar potencia con ${SERVICIO.marca}?`,
        opciones: ["Cuánta potencia usar durante 24 h", "La máquina concreta", "La cantidad de bitcoin que recibes"],
        correcta: 0,
        explicacion: `Eliges la potencia, ${potencia} durante 24 h, y nos das tu dirección. Lo técnico corre de nuestra parte.`,
      },
      {
        pregunta: "¿Quién te paga los sats?",
        opciones: [`${SERVICIO.marca}, de su cuenta`, "El pool, de forma proporcional", "Un banco"],
        correcta: 1,
        explicacion: `El pool paga directamente a tu dirección según lo aportado. ${SERVICIO.marca} no recibe ni custodia fondos.`,
      },
    ],
  },
];

/**
 * Test final: 15 preguntas (4 Bitcoin · 5 minería · 6 servicio).
 * Sin preguntas que dependan del modelo de pool, todavía sin decidir.
 */
export const QUIZ_FINAL: PreguntaQuiz[] = [
  // Bitcoin
  {
    pregunta: "¿Quién valida los pagos de Bitcoin?",
    opciones: ["Un banco central", "La red de nodos y mineros, con reglas comunes", "La empresa que creó Bitcoin"],
    correcta: 1,
    explicacion: "Nadie manda en Bitcoin: miles de ordenadores aplican las mismas reglas y comprueban cada pago.",
  },
  {
    pregunta: "¿Qué es un satoshi (sat)?",
    opciones: ["Una moneda distinta de Bitcoin", "La unidad más pequeña de bitcoin: 0,00000001 BTC", "Una comisión de la red"],
    correcta: 1,
    explicacion: "Un bitcoin se divide en 100 millones de sats. Es la unidad en la que se suele medir lo que genera la minería.",
  },
  {
    pregunta: "¿Qué es un bloque?",
    opciones: ["Un paquete de transacciones que se añade a la cadena", "Una cuenta bloqueada", "Un tipo de máquina de minería"],
    correcta: 0,
    explicacion: "Cada bloque agrupa pagos y se encadena al anterior. Se añade uno cada 10 minutos de media.",
  },
  {
    pregunta: "¿Qué no debes compartir nunca con nadie?",
    opciones: ["Tu dirección de wallet", "El nombre de tu wallet", "Tu frase de recuperación"],
    correcta: 2,
    explicacion: "La frase de recuperación da control total de tus fondos. La dirección, en cambio, es para recibir y puedes compartirla.",
  },
  // Minería
  {
    pregunta: "¿Qué hace un minero?",
    opciones: [
      "Hace muchísimos cálculos por segundo para cerrar el siguiente bloque",
      "Compra bitcoin barato para venderlo caro",
      "Guarda los bitcoin de otras personas",
    ],
    correcta: 0,
    explicacion: "Minar es probar combinaciones hasta dar con una válida. Quien la encuentra añade el bloque y recibe la recompensa.",
  },
  {
    pregunta: "¿Qué mide el hashrate?",
    opciones: ["Cuántos bitcoin tienes", "La potencia de cálculo: intentos por segundo", "El precio de Bitcoin"],
    correcta: 1,
    explicacion: "Es la velocidad a la que una máquina o una red hace intentos. Se mide en TH/s, PH/s o EH/s.",
  },
  {
    pregunta: "¿Cuántos TH/s hay en 1 PH/s?",
    opciones: ["100", "1.000", "1.000.000"],
    correcta: 1,
    explicacion: "1 PH/s son 1.000 TH/s: la potencia de varias decenas de máquinas profesionales.",
  },
  {
    pregunta: "Si entran muchas máquinas nuevas en la red, la dificultad…",
    opciones: ["Sube, para mantener unos 10 minutos por bloque", "Baja", "No cambia nunca"],
    correcta: 0,
    explicacion: "La red ajusta la dificultad cada 2.016 bloques. Más potencia en la red significa más competencia para todos.",
  },
  {
    pregunta: "¿Por qué no se puede saber de antemano cuánto generará una potencia concreta?",
    opciones: [
      "Porque depende de la dificultad, de la potencia total de la red y de cuándo se encuentran los bloques",
      "Porque lo decide la empresa que vende la potencia",
      "Sí se puede: siempre es la misma cantidad",
    ],
    correcta: 0,
    explicacion: "Es una competencia de cálculo con toda la red. La cantidad varía y nadie puede fijarla por adelantado.",
  },
  // Servicio
  {
    pregunta: `¿Qué compras con ${SERVICIO.marca}?`,
    opciones: ["Una cantidad fija de bitcoin", "Tiempo de potencia de minería", "Una máquina de minería"],
    correcta: 1,
    explicacion: `Compras potencia, ${potencia}, durante 24 h. No compras bitcoin ni equipos.`,
  },
  {
    pregunta: "¿Qué significa 1 PH/s en tu sesión?",
    opciones: ["La potencia de cálculo que trabaja para ti", "Los sats que recibirás", "Un bitcoin por hora"],
    correcta: 0,
    explicacion: "Es potencia, no una cantidad de bitcoin. Lo que genera esa potencia no es fijo.",
  },
  {
    pregunta: "Durante la sesión, la potencia…",
    opciones: ["Es exactamente igual cada segundo", `Es la contratada, aunque ${SERVICIO.variacionPotencia.replace(/^la potencia /, "")}`, "Va aumentando sola"],
    correcta: 1,
    explicacion: `Trabajas con la potencia contratada, pero ${SERVICIO.variacionPotencia}.`,
  },
  {
    pregunta: "Comparado con lo que pagas, lo que recibes en sats es…",
    opciones: ["Mayor", "Igual", "Menor"],
    correcta: 2,
    explicacion: `${SERVICIO.transparencia}. Lo que obtienes es la experiencia de minar Bitcoin de verdad, no un rendimiento.`,
  },
  {
    pregunta: "¿Es una inversión?",
    opciones: [
      "Sí, con rentabilidad asegurada",
      "No: es un servicio de potencia de minería sin resultado garantizado",
      "Solo si eliges la sesión más larga",
    ],
    correcta: 1,
    explicacion: SERVICIO.resultado,
  },
  {
    pregunta: "¿Quién guarda los bitcoin que genera tu sesión?",
    opciones: [`${SERVICIO.marca}, en una cuenta interna`, "Tú, en tu propia wallet", "Nadie hasta que los reclames"],
    correcta: 1,
    explicacion: `Solo nos das tu dirección. ${SERVICIO.marca} nunca pide tu frase de recuperación ni guarda tus fondos.`,
  },
];

export const getCapitulo = (slug: string) => CAPITULOS.find((c) => c.slug === slug);
export const indiceCapitulo = (slug: string) => CAPITULOS.findIndex((c) => c.slug === slug);
export const capituloDeTermino = (slug: string) => CAPITULOS.find((c) => c.terminos.includes(slug));
