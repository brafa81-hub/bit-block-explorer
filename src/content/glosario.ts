import { SERVICIO } from "./servicio";

export type CategoriaGlosario =
  | "Fundamentos"
  | "Prueba de trabajo"
  | "Potencia y red"
  | "Pools y wallets"
  | "Compra de hashrate";

export const CATEGORIAS: CategoriaGlosario[] = [
  "Fundamentos",
  "Prueba de trabajo",
  "Potencia y red",
  "Pools y wallets",
  "Compra de hashrate",
];

export interface TerminoGlosario {
  slug: string;
  termino: string;
  categoria: CategoriaGlosario;
  esencial: boolean;
  /** Máximo 25 palabras. */
  definicion: string;
  /** 2-4 párrafos cortos. Uno de ellos empieza por "En realidad...". */
  explicacion: string[];
  ejemplo?: string;
  enLaPractica?: string;
  relacionados: string[];
  capitulo?: { slug: string; titulo: string };
  revisado: string;
}

const R = "septiembre 2026";

export const GLOSARIO: TerminoGlosario[] = [
  // Fundamentos
  {
    slug: "bitcoin",
    termino: "Bitcoin",
    categoria: "Fundamentos",
    esencial: true,
    definicion:
      "Dinero digital que funciona sin banco central: miles de ordenadores de todo el mundo llevan juntos la cuenta de quién tiene qué.",
    explicacion: [
      "Imagina un cuaderno de cuentas compartido por todo un pueblo. Nadie lo guarda en su casa: cada vecino tiene una copia idéntica y todos comprueban cada apunte nuevo.",
      "Bitcoin es ese cuaderno, pero a escala mundial y en internet. Sirve para enviar valor de una persona a otra sin pedir permiso a nadie.",
      "En realidad, no hay monedas guardadas en ningún sitio. Lo que existe es un registro público de movimientos, protegido con criptografía y con el trabajo de los mineros.",
    ],
    ejemplo: "Nunca existirán más de 21.000.000 BTC. Ese límite está escrito en las reglas desde el principio.",
    relacionados: ["satoshi", "blockchain", "minero"],
    revisado: R,
  },
  {
    slug: "satoshi",
    termino: "Satoshi",
    categoria: "Fundamentos",
    esencial: false,
    definicion: "La unidad más pequeña de Bitcoin. Un bitcoin se divide en cien millones de satoshis.",
    explicacion: [
      "Igual que un euro se parte en céntimos, un bitcoin se parte en satoshis. La diferencia es que aquí las partes son muchísimo más pequeñas.",
      "Gracias a eso puedes manejar cantidades diminutas sin necesidad de tener un bitcoin entero.",
      "En realidad, el sistema cuenta todo en satoshis por dentro. Hablar de «bitcoins» es solo una forma cómoda de agruparlos.",
    ],
    ejemplo: "1 BTC = 100.000.000 satoshis.",
    relacionados: ["bitcoin", "recompensa-de-bloque"],
    revisado: R,
  },
  {
    slug: "bloque",
    termino: "Bloque",
    categoria: "Fundamentos",
    esencial: true,
    definicion: "Un paquete de transacciones que se añade de golpe al registro de Bitcoin, más o menos cada diez minutos.",
    explicacion: [
      "Piensa en una página del cuaderno de cuentas. Se van anotando pagos y, cuando la página está lista, se cierra y se pega al final del libro.",
      "Cada bloque lleva una cabecera con datos técnicos, entre ellos una referencia al bloque anterior. Así quedan encadenados.",
      "En realidad, cerrar la página no es gratis: un minero tiene que encontrar un hash válido para ese bloque. Ese es el trabajo que simulas en el simulador.",
    ],
    ejemplo: "De media se encuentra un bloque cada 10 minutos.",
    relacionados: ["blockchain", "hash", "tiempo-de-bloque"],
    revisado: R,
  },
  {
    slug: "blockchain",
    termino: "Blockchain",
    categoria: "Fundamentos",
    esencial: false,
    definicion: "La cadena de todos los bloques desde el primero. Es el registro completo e histórico de Bitcoin.",
    explicacion: [
      "Si cada bloque es una página, la blockchain es el libro entero, cosido página a página.",
      "Cada página incluye la huella de la anterior. Si alguien cambiara una página antigua, su huella dejaría de encajar con todas las siguientes.",
      "En realidad, para reescribir el pasado habría que rehacer el trabajo de todos los bloques posteriores más rápido que el resto de la red. Por eso se considera tan difícil de alterar.",
    ],
    relacionados: ["bloque", "nodo", "confirmacion"],
    revisado: R,
  },
  {
    slug: "nodo",
    termino: "Nodo",
    categoria: "Fundamentos",
    esencial: false,
    definicion: "Un ordenador que guarda una copia del registro de Bitcoin y comprueba que cada bloque y transacción cumple las reglas.",
    explicacion: [
      "Es como un vecino que revisa el cuaderno del pueblo. No apunta pagos nuevos, pero rechaza cualquier página que tenga trampas.",
      "Cualquiera puede montar un nodo en su casa. Cuantos más hay, más difícil es que alguien imponga reglas falsas.",
      "En realidad, nodo y minero no son lo mismo. El nodo verifica; el minero, además, compite por crear bloques nuevos.",
    ],
    relacionados: ["minero", "blockchain", "mempool"],
    revisado: R,
  },
  {
    slug: "minero",
    termino: "Minero",
    categoria: "Fundamentos",
    esencial: true,
    definicion: "Quien pone máquinas a calcular hashes para crear el siguiente bloque y, a cambio, puede recibir la recompensa.",
    explicacion: [
      "Imagina buscar una llave que abra un candado probando combinaciones muy rápido: no hay atajo, solo probar.",
      "Los mineros hacen justo eso. Quien encuentra un hash válido añade el bloque y cobra la recompensa en bitcoin.",
      "En realidad, no se «extrae» nada de ningún sitio. Minar es ofrecer cálculo para proteger la red, y los bitcoins nuevos son la compensación por ese servicio.",
    ],
    relacionados: ["prueba-de-trabajo", "asic", "pool"],
    revisado: R,
  },
  {
    slug: "confirmacion",
    termino: "Confirmación",
    categoria: "Fundamentos",
    esencial: false,
    definicion: "Cada bloque que se añade encima del bloque donde está tu transacción. Más confirmaciones, más difícil deshacerla.",
    explicacion: [
      "Es como el cemento que se va secando. Recién puesto aún se podría mover; con cada capa encima queda más fijo.",
      "Cuando tu pago entra en un bloque tiene una confirmación. Con el siguiente bloque, dos, y así sucesivamente.",
      "En realidad, no hay un número mágico. Cada servicio decide cuántas confirmaciones espera según el importe.",
    ],
    ejemplo: "Con 6 confirmaciones han pasado, de media, unos 60 minutos.",
    relacionados: ["bloque", "mempool", "blockchain"],
    revisado: R,
  },
  {
    slug: "mempool",
    termino: "Mempool",
    categoria: "Fundamentos",
    esencial: false,
    definicion: "La sala de espera de las transacciones que ya se han enviado pero todavía no han entrado en ningún bloque.",
    explicacion: [
      "Piensa en la cola de una ventanilla. Las cartas llegan y esperan su turno hasta que alguien las sella.",
      "Los mineros eligen de esa cola qué transacciones meten en su bloque. Suelen preferir las que pagan más comisión.",
      "En realidad, no existe una única mempool. Cada nodo tiene la suya y pueden diferir un poco entre sí.",
    ],
    relacionados: ["comision-de-transaccion", "confirmacion", "nodo"],
    revisado: R,
  },

  // Prueba de trabajo
  {
    slug: "hash",
    termino: "Hash",
    categoria: "Prueba de trabajo",
    esencial: true,
    definicion: "Una huella digital de tamaño fijo que se calcula a partir de unos datos. Si cambias una coma, la huella cambia por completo.",
    explicacion: [
      "Es como meter ingredientes en una batidora: siempre sale un batido, pero es imposible reconstruir la receta a partir de él.",
      "Los mismos datos dan siempre el mismo hash. Datos casi iguales dan hashes totalmente distintos.",
      "En realidad, no se puede predecir el resultado. Por eso los mineros solo pueden probar combinaciones hasta dar con un hash que empiece por suficientes ceros.",
    ],
    ejemplo: "Un hash de Bitcoin tiene 64 caracteres hexadecimales, es decir, 256 bits.",
    relacionados: ["sha-256", "nonce", "prueba-de-trabajo"],
    revisado: R,
  },
  {
    slug: "sha-256",
    termino: "SHA-256",
    categoria: "Prueba de trabajo",
    esencial: false,
    definicion: "La fórmula concreta que usa Bitcoin para calcular hashes. Produce siempre una huella de 256 bits.",
    explicacion: [
      "Si el hash es el batido, SHA-256 es el modelo exacto de batidora. Todo el mundo usa la misma para que los resultados se puedan comparar.",
      "Bitcoin la aplica dos veces seguidas sobre la cabecera del bloque. A eso se le llama SHA-256 doble.",
      "En realidad, SHA-256 no es exclusiva de Bitcoin. Se usa en muchos sistemas de seguridad de internet.",
    ],
    relacionados: ["hash", "asic", "prueba-de-trabajo"],
    revisado: R,
  },
  {
    slug: "nonce",
    termino: "Nonce",
    categoria: "Prueba de trabajo",
    esencial: false,
    definicion: "Un número dentro del bloque que el minero va cambiando para obtener un hash distinto en cada intento.",
    explicacion: [
      "Es como la ruedecita de un candado de combinación. Giras un número, pruebas; no abre, giras otro.",
      "Cada vez que cambia el nonce, el hash del bloque sale completamente diferente. Así el minero genera intentos nuevos sin tocar las transacciones.",
      "En realidad, el nonce se queda corto para las máquinas actuales. Los mineros también varían otros datos del bloque para tener más combinaciones.",
    ],
    ejemplo: "El nonce ocupa 32 bits: unos 4.300 millones de valores posibles.",
    relacionados: ["hash", "bloque", "prueba-de-trabajo"],
    revisado: R,
  },
  {
    slug: "prueba-de-trabajo",
    termino: "Prueba de trabajo",
    categoria: "Prueba de trabajo",
    esencial: true,
    definicion: "El sistema que obliga a gastar cálculo real para crear un bloque, de forma que cualquiera puede comprobarlo al instante.",
    explicacion: [
      "Imagina un sudoku enorme: resolverlo cuesta horas, pero comprobar la solución lleva segundos.",
      "En Bitcoin, el reto es encontrar un hash por debajo de un objetivo. Encontrarlo cuesta muchísimos intentos; verificarlo, uno solo.",
      "En realidad, lo valioso no es el cálculo en sí. Es que ese coste hace carísimo hacer trampas y protege el registro.",
    ],
    relacionados: ["hash", "dificultad", "minero"],
    revisado: R,
  },
  {
    slug: "recompensa-de-bloque",
    termino: "Recompensa de bloque",
    categoria: "Prueba de trabajo",
    esencial: false,
    definicion: "Lo que recibe el minero que encuentra un bloque: bitcoins nuevos (subsidio) más las comisiones de las transacciones incluidas.",
    explicacion: [
      "Es la compensación por el trabajo. Tiene dos partes: bitcoins nuevos que crea el propio sistema y las comisiones que pagan los usuarios.",
      "La parte de bitcoins nuevos se llama subsidio y se reduce a la mitad en cada halving.",
      "En realidad, así es como entran en circulación todos los bitcoins nuevos. No hay otra forma de emitirlos.",
    ],
    ejemplo: "Subsidio actual: 3,125 BTC por bloque, desde abril de 2024.",
    relacionados: ["halving", "comision-de-transaccion", "minero"],
    revisado: R,
  },
  {
    slug: "comision-de-transaccion",
    termino: "Comisión de transacción",
    categoria: "Prueba de trabajo",
    esencial: false,
    definicion: "Lo que paga quien envía bitcoin para que un minero incluya su transacción en un bloque.",
    explicacion: [
      "Es como el sello de una carta. Si hay muchas cartas esperando, las que llevan mejor sello salen antes.",
      "La comisión no depende de cuánto envías, sino de cuánto espacio ocupa tu transacción y de lo llena que esté la cola.",
      "En realidad, las comisiones se vuelven cada vez más importantes para los mineros, porque el subsidio baja con cada halving.",
    ],
    relacionados: ["mempool", "recompensa-de-bloque"],
    revisado: R,
  },

  // Potencia y red
  {
    slug: "hashrate",
    termino: "Hashrate",
    categoria: "Potencia y red",
    esencial: true,
    definicion: "Cuántos hashes por segundo calcula una máquina o la red entera. Es la medida de la potencia de minería.",
    explicacion: [
      "Es como los kilómetros por hora de un coche, pero contando intentos por segundo.",
      "Más hashrate significa más intentos, y por tanto más probabilidad de encontrar un bloque en un tiempo dado.",
      "En realidad, no garantiza nada en un bloque concreto. Es una cuestión de probabilidad que se nota cuando pasan muchos bloques.",
    ],
    ejemplo: "Un ASIC moderno ronda los 100-300 TH/s.",
    relacionados: ["unidades-de-hashrate", "asic", "dificultad"],
    revisado: R,
  },
  {
    slug: "unidades-de-hashrate",
    termino: "Unidades TH/s, PH/s y EH/s",
    categoria: "Potencia y red",
    esencial: false,
    definicion: "Escalas para medir el hashrate. Cada una es mil veces la anterior: terahash, petahash y exahash por segundo.",
    explicacion: [
      "Igual que decimos gramos, kilos y toneladas, aquí se habla de TH, PH y EH para no escribir números con muchísimos ceros.",
      "Una máquina se mide en TH/s. Una granja grande, en PH/s. La red entera de Bitcoin, en EH/s.",
      "En realidad, el orden de magnitud importa más que la cifra exacta. La red mueve cantidades que un ordenador doméstico no alcanzaría nunca.",
    ],
    ejemplo: "1 TH/s = 10^12 hashes/s · 1 PH/s = 1.000 TH/s · 1 EH/s = 1.000 PH/s.",
    relacionados: ["hashrate", "asic"],
    revisado: R,
  },
  {
    slug: "dificultad",
    termino: "Dificultad",
    categoria: "Potencia y red",
    esencial: true,
    definicion: "Lo complicado que es encontrar un hash válido en este momento. Marca cuántos intentos hacen falta de media.",
    explicacion: [
      "Es como el tamaño de la diana. Cuanto más pequeña, más dardos necesitas para acertar.",
      "En el simulador lo ves como el número de ceros al principio del hash. En la red real, la diana es muchísimo más pequeña.",
      "En realidad, no se mide en ceros sino con un número objetivo: el hash tiene que quedar por debajo de él.",
    ],
    relacionados: ["ajuste-de-dificultad", "prueba-de-trabajo", "hashrate"],
    revisado: R,
  },
  {
    slug: "ajuste-de-dificultad",
    termino: "Ajuste de dificultad",
    categoria: "Potencia y red",
    esencial: false,
    definicion: "La revisión automática de la dificultad cada 2016 bloques, para que los bloques sigan saliendo cada diez minutos de media.",
    explicacion: [
      "Es como un termostato. Si entra mucha gente a minar, sube la dificultad; si se van, baja.",
      "La red mira cuánto tardaron los últimos 2016 bloques. Si fueron más rápidos de lo previsto, pone la diana más pequeña.",
      "En realidad, el ajuste tiene límites por ronda. Por eso puede tardar algunas semanas en adaptarse a cambios muy bruscos.",
    ],
    ejemplo: "2016 bloques × 10 minutos ≈ 2 semanas.",
    relacionados: ["dificultad", "tiempo-de-bloque"],
    revisado: R,
  },
  {
    slug: "halving",
    termino: "Halving",
    categoria: "Potencia y red",
    esencial: true,
    definicion: "El momento, cada 210.000 bloques, en que el subsidio por bloque se reduce a la mitad.",
    explicacion: [
      "Imagina un grifo que cada cuatro años suelta la mitad de agua. Nunca se cierra de golpe, pero cada vez gotea menos.",
      "Así Bitcoin emite cada vez menos monedas nuevas, hasta acercarse al límite de 21 millones.",
      "En realidad, no va por fechas sino por número de bloques. Los cuatro años son una aproximación.",
    ],
    ejemplo: "Desde abril de 2024: 3,125 BTC. Próximo halving previsto hacia 2028: 1,5625 BTC.",
    relacionados: ["recompensa-de-bloque", "bitcoin"],
    revisado: R,
  },
  {
    slug: "tiempo-de-bloque",
    termino: "Tiempo de bloque",
    categoria: "Potencia y red",
    esencial: false,
    definicion: "Lo que se tarda de media en encontrar un bloque nuevo. En Bitcoin, unos diez minutos.",
    explicacion: [
      "Es como el autobús que pasa «cada diez minutos». A veces llegan dos seguidos y a veces tardan más.",
      "El ajuste de dificultad mantiene esa media a largo plazo, entre más o menos mineros.",
      "En realidad, cada bloque es independiente del anterior. Un bloque puede salir en un minuto o en más de media hora.",
    ],
    ejemplo: "Unos 6 bloques por hora, unos 144 al día.",
    relacionados: ["ajuste-de-dificultad", "bloque"],
    revisado: R,
  },
  {
    slug: "asic",
    termino: "ASIC",
    categoria: "Potencia y red",
    esencial: true,
    definicion: "Una máquina diseñada solo para calcular hashes SHA-256 lo más rápido posible. Es el equipo de minería profesional.",
    explicacion: [
      "Un ordenador es una navaja suiza: hace de todo. Un ASIC es un martillo neumático: solo sirve para una cosa, pero la hace brutalmente bien.",
      "Por eso hoy la minería de Bitcoin se hace con ASIC y no con ordenadores o tarjetas gráficas.",
      "En realidad, ASIC es el nombre del chip (circuito integrado de aplicación específica). La máquina completa lleva muchos de ellos.",
    ],
    ejemplo: "Un ASIC moderno ronda los 100-300 TH/s.",
    relacionados: ["hashrate", "sha-256", "eficiencia"],
    revisado: R,
  },

  // Pools y wallets
  {
    slug: "pool",
    termino: "Pool",
    categoria: "Pools y wallets",
    esencial: true,
    definicion: "Un grupo de mineros que suman su potencia y se reparten las recompensas según lo que aporta cada uno.",
    explicacion: [
      "Es como una cooperativa: cada socio aporta trabajo y lo que se obtiene se reparte según lo aportado.",
      "Un minero pequeño en solitario podría pasar muchísimo tiempo sin encontrar un bloque. En un pool recibe pagos pequeños y frecuentes.",
      "En realidad, el pool no cambia la probabilidad total. Solo reduce la variabilidad para que los pagos sean más regulares.",
    ],
    relacionados: ["share", "esquemas-de-pago", "stratum"],
    revisado: R,
  },
  {
    slug: "share",
    termino: "Share",
    categoria: "Pools y wallets",
    esencial: false,
    definicion: "Un hash que no vale para la red pero sí cumple una dificultad más baja. Sirve para demostrar al pool cuánto trabajas.",
    explicacion: [
      "Es como fichar en el trabajo. No demuestra que hayas terminado el proyecto, pero sí que has estado trabajando.",
      "El pool pide hashes más fáciles que el de la red. Contando cuántos le envías, calcula tu potencia real.",
      "En realidad, de vez en cuando una share también cumple la dificultad de la red. Ese es el bloque que el pool gana.",
    ],
    relacionados: ["pool", "dificultad"],
    revisado: R,
  },
  {
    slug: "stratum",
    termino: "Stratum",
    categoria: "Pools y wallets",
    esencial: false,
    definicion: "El protocolo con el que las máquinas de minería reciben trabajo del pool y le devuelven sus shares.",
    explicacion: [
      "Es el idioma que hablan la máquina y el pool. El pool dice «prueba con esto» y la máquina responde «aquí tienes lo que encontré».",
      "Para conectar potencia a un pool se usa una dirección stratum, un usuario y, a veces, una contraseña.",
      "En realidad, hay dos versiones: la primera, muy extendida, y Stratum V2, más reciente y con más seguridad.",
    ],
    relacionados: ["pool", "share", "pool-de-destino"],
    revisado: R,
  },
  {
    slug: "wallet",
    termino: "Wallet",
    categoria: "Pools y wallets",
    esencial: true,
    definicion: "Una aplicación o dispositivo que guarda tus claves y te permite recibir y enviar bitcoin.",
    explicacion: [
      "Se traduce como «monedero», pero se parece más a un llavero: lo que guarda son las llaves de tu dinero.",
      "Desde la wallet generas direcciones para recibir y firmas los envíos.",
      "En realidad, los bitcoins no están dentro de la wallet. Están en la blockchain; la wallet solo guarda las claves para moverlos.",
    ],
    relacionados: ["direccion", "clave-privada", "frase-de-recuperacion"],
    revisado: R,
  },
  {
    slug: "direccion",
    termino: "Dirección",
    categoria: "Pools y wallets",
    esencial: false,
    definicion: "Una cadena de letras y números que compartes para que te envíen bitcoin. Es pública, como un número de cuenta.",
    explicacion: [
      "Es como tu buzón: cualquiera puede echar cartas, pero solo tú tienes la llave para abrirlo.",
      "Tu wallet puede generar muchas direcciones distintas. Es buena costumbre usar una nueva para cada cobro.",
      "En realidad, un envío a una dirección equivocada no se puede deshacer. Por eso conviene copiarla y revisarla siempre.",
    ],
    relacionados: ["wallet", "clave-privada"],
    revisado: R,
  },
  {
    slug: "clave-privada",
    termino: "Clave privada",
    categoria: "Pools y wallets",
    esencial: false,
    definicion: "El número secreto que permite gastar los bitcoins de una dirección. Quien la tiene, controla los fondos.",
    explicacion: [
      "Es la llave del buzón. La dirección se puede enseñar; la llave, jamás.",
      "Con ella tu wallet firma cada envío y la red comprueba que la firma es correcta sin ver la clave.",
      "En realidad, casi nunca verás la clave privada directamente. Tu wallet la deriva de la frase de recuperación.",
    ],
    relacionados: ["frase-de-recuperacion", "wallet", "direccion"],
    revisado: R,
  },
  {
    slug: "frase-de-recuperacion",
    termino: "Frase de recuperación",
    categoria: "Pools y wallets",
    esencial: false,
    definicion: "Una lista de palabras que sirve para recuperar tu wallet entera si pierdes el móvil o el dispositivo.",
    explicacion: [
      "Es la copia maestra de todas tus llaves, escrita en palabras normales para que puedas apuntarla en papel.",
      "Si alguien la consigue, puede llevarse tus fondos. Si la pierdes y se estropea el dispositivo, no hay forma de recuperarlos.",
      "En realidad, ningún servicio serio te la pedirá nunca. Quien la pide, casi seguro que intenta engañarte.",
    ],
    ejemplo: "Lo habitual son 12 o 24 palabras.",
    relacionados: ["clave-privada", "wallet"],
    revisado: R,
  },
  {
    slug: "esquemas-de-pago",
    termino: "Esquemas de pago (FPPS/PPLNS)",
    categoria: "Pools y wallets",
    esencial: false,
    definicion: "Las reglas con las que un pool reparte lo que gana entre sus mineros. Los más comunes son FPPS y PPLNS.",
    explicacion: [
      "Hay pools que pagan una cantidad fija por cada parte de trabajo aportada y otros que reparten cuando encuentran un bloque.",
      "En FPPS el pool te paga por cada share según lo que se espera ganar, incluidas comisiones, y asume él la mala racha.",
      "En PPLNS cobras cuando el pool encuentra un bloque, según tus shares de las últimas rondas. Hay más altibajos.",
      "En realidad, a largo plazo ambos tienden a parecerse. Lo que cambia es quién soporta la variabilidad.",
    ],
    relacionados: ["pool", "share"],
    revisado: R,
  },

  // Compra de hashrate
  {
    slug: "hashrate-alquilado",
    termino: "Hashrate alquilado",
    categoria: "Compra de hashrate",
    esencial: true,
    definicion: "Potencia de minería que usas durante un tiempo sin tener la máquina. Otro pone el equipo y el pool se encarga de pagar.",
    explicacion: [
      "Es como alquilar una pista de pádel por horas. No compras el club ni te ocupas del mantenimiento: llegas y juegas.",
      "Durante ese tiempo, la potencia trabaja en un pool como la de cualquier minero.",
      "En realidad, alquilas cálculo, no bloques. Lo que llega depende de la dificultad, de las comisiones de la red y de las reglas del pool.",
    ],
    enLaPractica: `En HashFlow eliges un bloque de ${SERVICIO.productos.jornada.potencia} durante ${SERVICIO.productos.jornada.horas} o ${SERVICIO.productos.dia.horas} horas y solo aportas la dirección de tu wallet: ni pool, ni stratum, ni datos técnicos; de eso se encarga HashFlow. No es una inversión y ningún resultado está garantizado.`,
    relacionados: ["mercado-de-hashrate", "pool-de-destino", "orden"],
    revisado: R,
  },
  {
    slug: "mercado-de-hashrate",
    termino: "Mercado de hashrate",
    categoria: "Compra de hashrate",
    esencial: false,
    definicion: "Un lugar donde quien tiene máquinas ofrece su potencia y quien la quiere usar la alquila por tiempo.",
    explicacion: [
      "Es como una plataforma de alquiler de coches entre particulares, pero con potencia de cálculo.",
      "El vendedor redirige sus máquinas al pool que indique el comprador durante el tiempo acordado.",
      "En realidad, el precio cambia con la dificultad y la demanda. Por eso aquí no damos cifras concretas.",
    ],
    relacionados: ["hashrate-alquilado", "orden"],
    capitulo: { slug: "alquilar-hashrate", titulo: "Alquilar hashrate" },
    revisado: R,
  },
  {
    slug: "orden",
    termino: "Orden",
    categoria: "Compra de hashrate",
    esencial: false,
    definicion: "La petición concreta de alquiler: cuánta potencia, durante cuánto tiempo y hacia dónde se dirige.",
    explicacion: [
      "Es la reserva de la pista: qué pista, a qué hora y durante cuánto rato.",
      "Una orden define la potencia, la duración y los datos del pool de destino (en HashFlow los pone HashFlow, no tú).",
      "En realidad, la potencia entregada puede oscilar un poco durante la orden. Lo normal es medirla como media del periodo.",
    ],
    enLaPractica: `En HashFlow la orden es sencilla: eliges la duración y dejas la dirección de tu wallet; del resto se encarga HashFlow, y el pago se realiza ${SERVICIO.plazoPago}. Recuerda que ${SERVICIO.variacionPotencia} y que no es una inversión ni garantiza un resultado.`,
    relacionados: ["hashrate-alquilado", "pool-de-destino"],
    revisado: R,
  },
  {
    slug: "pool-de-destino",
    termino: "Pool de destino",
    categoria: "Compra de hashrate",
    esencial: false,
    definicion: "El pool al que se envía la potencia que has alquilado. Allí se registran tus shares y tus pagos.",
    explicacion: [
      "Es el pool al que se dirige la potencia alquilada. En general, configurarlo requiere datos técnicos (dirección stratum y usuario); con HashFlow no tienes que hacerlo tú.",
      "En realidad, las recompensas no las pagamos nosotros: las paga el pool según su esquema de pago.",
    ],
    enLaPractica: `Con HashFlow no configuras ningún pool: eliges la duración, dejas la dirección de tu wallet y HashFlow dirige la potencia por ti, de modo que los pagos llegan a tu wallet. No es una inversión y ningún resultado está garantizado.`,
    relacionados: ["pool", "stratum", "esquemas-de-pago"],
    revisado: R,
  },
  {
    slug: "eficiencia",
    termino: "Eficiencia (J/TH)",
    categoria: "Potencia y red",
    esencial: false,
    definicion: "La energía que gasta una máquina por cada terahash que calcula. Menos julios por terahash, máquina más eficiente.",
    explicacion: [
      "Es como el consumo de un coche en litros cada cien kilómetros. Dos coches pueden correr igual, pero uno gasta menos.",
      "En minería, la electricidad es el gran coste. Por eso la eficiencia importa tanto como la velocidad.",
      "En realidad, cada generación nueva de ASIC mejora esta cifra. Los equipos antiguos acaban retirándose porque gastan demasiado.",
    ],
    enLaPractica:
      "Cuando alquilas potencia no pagas tú la luz ni eliges la máquina. La eficiencia es cosa de quien opera los equipos.",
    relacionados: ["asic", "hashrate"],
    revisado: R,
  },
  {
    slug: "corporate",
    termino: "Corporate (compra por volumen)",
    categoria: "Compra de hashrate",
    esencial: false,
    definicion: "La modalidad para empresas que necesitan muchas unidades de potencia a la vez, con precio por tramos.",
    explicacion: [
      "Es como reservar un bloque de habitaciones de hotel para un congreso en lugar de una sola noche.",
      "Pensada para empresas, formación o proyectos que quieren muchas unidades de potencia (Jornada o Día) a la vez.",
      "En realidad, funciona igual que el alquiler individual. Solo cambia la cantidad.",
    ],
    enLaPractica: `Para empresas, HashFlow vende códigos regalo: desde ${SERVICIO.tramosCorporate[0].min} unidades con un ${SERVICIO.tramosCorporate[0].descuentoPct} % de descuento y a partir de ${SERVICIO.tramosCorporate[1].min} con un ${SERVICIO.tramosCorporate[1].descuentoPct} %. Cada empleado canjea su código con su propia wallet. No es una inversión y ningún resultado está garantizado.`,
    relacionados: ["hashrate-alquilado", "orden"],
    revisado: R,
  },
];

export function getTermino(slug: string) {
  return GLOSARIO.find((t) => t.slug === slug);
}

export const GLOSARIO_ALFABETICO = [...GLOSARIO].sort((a, b) =>
  a.termino.localeCompare(b.termino, "es", { sensitivity: "base" }),
);

export function indiceDe(slug: string) {
  return GLOSARIO_ALFABETICO.findIndex((t) => t.slug === slug) + 1;
}

export const idx = (n: number) => String(n).padStart(3, "0");
