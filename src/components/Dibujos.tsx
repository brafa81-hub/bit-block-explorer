import type { ComponentType, ReactNode } from "react";

/**
 * Dibujos de la sección Aprende. SVG en línea, 320 de ancho (columna de texto a 360 px).
 * Colores del tema: líneas y texto en currentColor, acento en var(--primary).
 * Son un añadido: el texto del capítulo se entiende sin ellos.
 */

const MONO = "var(--font-mono)";
const ACENTO = "var(--primary)";
const SUAVE = "var(--muted-foreground)";

function Lienzo({ id, alto, titulo, desc, children }: { id: string; alto: number; titulo: string; desc: string; children: ReactNode }) {
  return (
    <figure className="my-6 text-foreground">
      <svg
        viewBox={`0 0 320 ${alto}`}
        className="block h-auto w-full max-w-[420px]"
        role="img"
        aria-labelledby={`${id}-t ${id}-d`}
        fill="currentColor"
        stroke="none"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <title id={`${id}-t`}>{titulo}</title>
        <desc id={`${id}-d`}>{desc}</desc>
        {children}
      </svg>
    </figure>
  );
}

const linea = { stroke: "currentColor", strokeWidth: 1, fill: "none" } as const;

function Flecha({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  // Flecha horizontal (y1 === y2) o vertical (x1 === x2), punta en (x2, y2).
  const h = y1 === y2;
  const s = h ? Math.sign(x2 - x1) : Math.sign(y2 - y1);
  const punta = h
    ? `M${x2 - 4 * s} ${y2 - 4} L${x2} ${y2} L${x2 - 4 * s} ${y2 + 4}`
    : `M${x2 - 4} ${y2 - 4 * s} L${x2} ${y2} L${x2 + 4} ${y2 - 4 * s}`;
  return (
    <g {...linea}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path d={punta} />
    </g>
  );
}

/** 1 · Dentro de un bloque */
export function DibujoBloque() {
  const pagos = [148, 173, 198];
  return (
    <Lienzo
      id="dib-bloque"
      alto={236}
      titulo="Un bloque por dentro"
      desc="Un bloque es como una página. Arriba, la cabecera con la referencia al bloque anterior y un resumen de los pagos. La primera línea es la recompensa del minero; después vienen los pagos, unos miles."
    >
      <rect x="16" y="12" width="288" height="212" rx="3" {...linea} />
      <text x="29" y="31" fontFamily={MONO} fontSize="10.5" letterSpacing="0.8" fill={SUAVE}>CABECERA</text>
      <line x1="29" y1="40" x2="291" y2="40" {...linea} />
      <text x="29" y="60" fontSize="12">bloque anterior</text>
      <text x="29" y="78" fontFamily={MONO} fontSize="11" fill={SUAVE}>referencia</text>
      <text x="164" y="60" fontSize="12">resumen de pagos</text>
      <g {...linea} strokeOpacity={0.6}>
        <line x1="164" y1="69" x2="282" y2="69" />
        <line x1="164" y1="75" x2="260" y2="75" />
        <line x1="164" y1="81" x2="273" y2="81" />
      </g>
      <line x1="29" y1="91" x2="291" y2="91" {...linea} />
      <line x1="30" y1="102" x2="30" y2="124" stroke={ACENTO} strokeWidth="1.2" />
      <text x="44" y="118" fontSize="13" fontWeight="500" fill={ACENTO}>recompensa del minero</text>
      <text x="287" y="118" textAnchor="end" fontFamily={MONO} fontSize="11.5" fill={ACENTO}>01</text>
      {pagos.map((y, k) => (
        <g key={y}>
          <text x="37" y={y} fontFamily={MONO} fontSize="11" fill={SUAVE}>{`0${k + 2}`}</text>
          <text x="62" y={y} fontSize="12">pago</text>
          <line x1="100" y1={y - 4} x2="285" y2={y - 4} {...linea} strokeOpacity={0.5} />
        </g>
      ))}
      <text x="62" y="218" fontSize="11.5" fill={SUAVE}>… unos miles más</text>
    </Lienzo>
  );
}

/** 2 · Hash y prueba de trabajo */
export function DibujoHash() {
  const fila = (y: number, entrada: ReactNode, h1: string, h2: string) => (
    <g>
      <text x="19" y={y} fontFamily={MONO} fontSize="10.5" fill={SUAVE}>ENTRADA</text>
      <rect x="18" y={y + 9} width="54" height="39" rx="3" {...linea} />
      <text x="45" y={y + 34} textAnchor="middle" fontSize="14">{entrada}</text>
      <Flecha x1={73} y1={y + 28} x2={83} y2={y + 28} />
      <rect x="86" y={y - 4} width="96" height="64" rx="3" {...linea} />
      <text x="134" y={y + 12} textAnchor="middle" fontSize="12.5" fontWeight="500">huella</text>
      <text x="134" y={y + 26} textAnchor="middle" fontFamily={MONO} fontSize="10.5">(SHA-256)</text>
      <text x="134" y={y + 40} textAnchor="middle" fontSize="10.5" fill={SUAVE}>convierte texto</text>
      <text x="134" y={y + 53} textAnchor="middle" fontSize="10.5" fill={SUAVE}>en un código</text>
      <Flecha x1={186} y1={y + 28} x2={196} y2={y + 28} />
      <text x="200" y={y} fontFamily={MONO} fontSize="10.5" fill={SUAVE}>SALIDA</text>
      <text x="200" y={y + 26} fontFamily={MONO} fontSize="10.5">{h1}</text>
      <text x="200" y={y + 42} fontFamily={MONO} fontSize="10.5">{h2}</text>
    </g>
  );
  return (
    <Lienzo
      id="dib-hash"
      alto={244}
      titulo="Un cambio mínimo, otro código"
      desc="Dos textos pasan por la huella SHA-256, que convierte un texto en un código. «Hola» da un código; «Hola.», con solo un punto más, da otro completamente distinto."
    >
      <text x="160" y="20" textAnchor="middle" fontFamily={MONO} fontSize="10.5" letterSpacing="0.5" fill={SUAVE}>MISMA REGLA, DISTINTA HUELLA</text>
      {fila(48, "Hola", "e633f4fc79bade…", "…5d76b0e88f")}
      <line x1="18" y1="122" x2="302" y2="122" {...linea} strokeOpacity={0.4} strokeDasharray="2 3" />
      {fila(145, <>Hola<tspan fill={ACENTO} fontWeight="500">.</tspan></>, "ee6494f54a3e6a…", "…b71335e659f")}
      <text x="160" y="232" textAnchor="middle" fontSize="12">Un punto cambia por completo la huella.</text>
    </Lienzo>
  );
}

/** 4 · Pools y pagos proporcionales (proporción 6:3:1, sin cifras) */
export function DibujoPool() {
  const mineros = [
    { nombre: "MINERO A", nota: "mucho", cx: 60, n: 6 },
    { nombre: "MINERO B", nota: "algo", cx: 160, n: 3 },
    { nombre: "MINERO C", nota: "poco", cx: 260, n: 1 },
  ];
  const cuadro = (cx: number, n: number) =>
    Array.from({ length: n }, (_, k) => {
      const ancho = n * 12 - 4;
      return <rect key={k} x={cx - ancho / 2 + k * 12} y={58} width="8" height="8" {...linea} />;
    });
  return (
    <Lienzo
      id="dib-pool"
      alto={268}
      titulo="Se reparte según lo aportado"
      desc="Tres mineros aportan distinta cantidad de trabajo a un pool, que es un grupo de mineros. Lo que recibe el pool se reparte en partes proporcionales al trabajo de cada uno: más trabajo, más parte."
    >
      <rect x="112" y="8" width="9" height="9" {...linea} />
      <text x="127" y="17" fontFamily={MONO} fontSize="10.5">= trabajo aportado</text>
      {mineros.map((m) => (
        <g key={m.nombre}>
          <text x={m.cx} y="48" textAnchor="middle" fontSize="11.5" fontWeight="500">{m.nombre}</text>
          {cuadro(m.cx, m.n)}
          <text x={m.cx} y="82" textAnchor="middle" fontSize="11" fill={SUAVE}>{m.nota}</text>
        </g>
      ))}
      <g {...linea}>
        <line x1="60" y1="90" x2="122" y2="108" />
        <line x1="160" y1="90" x2="160" y2="108" />
        <line x1="260" y1="90" x2="198" y2="108" />
      </g>
      <rect x="84" y="108" width="152" height="45" rx="3" {...linea} />
      <text x="160" y="128" textAnchor="middle" fontSize="13" fontWeight="500">pool</text>
      <text x="160" y="144" textAnchor="middle" fontSize="11.5" fill={SUAVE}>(grupo de mineros)</text>
      <Flecha x1={160} y1={153} x2={160} y2={170} />
      <text x="160" y="187" textAnchor="middle" fontSize="11.5">Lo que recibe el pool se reparte así</text>
      <rect x="24" y="196" width="163.2" height="22" fill="none" stroke={ACENTO} strokeWidth="1.2" />
      <rect x="187.2" y="196" width="81.6" height="22" {...linea} />
      <rect x="268.8" y="196" width="27.2" height="22" {...linea} />
      <text x="105.6" y="211" textAnchor="middle" fontSize="11" fill={ACENTO}>A</text>
      <text x="228" y="211" textAnchor="middle" fontSize="11">B</text>
      <text x="282.4" y="211" textAnchor="middle" fontSize="11">C</text>
      <text x="160" y="248" textAnchor="middle" fontSize="12">Más trabajo aportado, más parte.</text>
    </Lienzo>
  );
}

/** 10 · Comprar potencia de minería (modo Compartido, sin cifras) */
export function DibujoCompra({ marca, solitario = false }: { marca: string; solitario?: boolean }) {
  const pasos: { y: number; alto: number; lineas: string[] }[] = [
    { y: 26, alto: 56, lineas: ["Tú eliges la potencia", "y das tu wallet (cartera digital)."] },
    { y: 96, alto: 72, lineas: [`${marca} compra la potencia`, "durante 24 horas y la envía", "a un pool (grupo de mineros)."] },
    { y: 182, alto: 72, lineas: ["El pool paga en sats a tu wallet.", "sats = fracciones de bitcoin"] },
  ];
  return (
    <Lienzo
      id="dib-compra"
      alto={solitario ? 410 : 350}
      titulo="Quién hace qué en tus 24 horas"
      desc={`En modo Compartido: tú eliges la potencia y das tu wallet; ${marca} compra esa potencia durante 24 horas y la envía a un pool; el pool paga en sats directamente a tu wallet. Los sats no pasan por ${marca}. Recibirás sats, pero casi siempre por menos valor del que pagas.${solitario ? " En Solitario no hay reparto: si no encuentras un bloque, no recibes nada, y es lo más habitual." : ""}`}
    >
      <text x="160" y="17" textAnchor="middle" fontFamily={MONO} fontSize="10.5" letterSpacing="0.6" fill={SUAVE}>MODO COMPARTIDO</text>
      {pasos.map((p, k) => {
        const centro = p.y + p.alto / 2;
        const inicio = centro - ((p.lineas.length - 1) * 17) / 2 + 4;
        return (
          <g key={k}>
            <rect x="18" y={p.y} width="284" height={p.alto} rx="3" {...linea} />
            <text x="34" y={centro + 5} fontFamily={MONO} fontSize="13" fill={ACENTO}>{`0${k + 1}`}</text>
            {p.lineas.map((t, j) => (
              <text key={j} x="64" y={inicio + j * 17} fontSize={j === 0 ? 12.5 : 11.5} fill={k === 2 && j === 1 ? SUAVE : undefined}>{t}</text>
            ))}
          </g>
        );
      })}
      <text x="160" y="284" textAnchor="middle" fontSize="12.5" fontWeight="500">Los sats no pasan por nosotros:</text>
      <text x="160" y="301" textAnchor="middle" fontSize="12.5" fontWeight="500">van directos a ti.</text>
      <text x="160" y="326" textAnchor="middle" fontSize="11.5" fill={SUAVE}>Recibirás sats, pero casi siempre</text>
      <text x="160" y="342" textAnchor="middle" fontSize="11.5" fill={SUAVE}>por menos valor del que pagas.</text>
      {solitario && (
        <>
          <line x1="18" y1="358" x2="302" y2="358" {...linea} strokeOpacity={0.4} strokeDasharray="2 3" />
          <text x="160" y="381" textAnchor="middle" fontSize="11.5">En Solitario no hay reparto: si no encuentras</text>
          <text x="160" y="398" textAnchor="middle" fontSize="11.5">un bloque, no recibes nada, y es lo más habitual.</text>
        </>
      )}
    </Lienzo>
  );
}

/** 1 · Cada bloque apunta al anterior */
export function DibujoCadena() {
  const xs = [16, 92, 168, 244];
  const fila = (y: number, cambiado: boolean) =>
    xs.map((x, k) => {
      const roto = cambiado && k >= 2;
      const acento = cambiado && k === 1;
      const etiqueta = !cambiado || k === 0 ? "bloque" : acento ? "cambiado" : "rehacer";
      return (
        <g key={k}>
          <rect
            x={x} y={y} width="56" height="44" rx="3" fill="none"
            stroke={acento ? ACENTO : "currentColor"} strokeWidth={acento ? 1.4 : 1}
            strokeDasharray={roto ? "3 3" : undefined} strokeOpacity={roto ? 0.7 : 1}
          />
          <text x={x + 28} y={y + 18} textAnchor="middle" fontSize={acento ? 10.5 : 11} fill={acento ? ACENTO : SUAVE}>{etiqueta}</text>
          <text x={x + 28} y={y + 35} textAnchor="middle" fontFamily={MONO} fontSize="13" fill={acento ? ACENTO : undefined}>{k + 1}</text>
          {k > 0 &&
            (roto ? (
              <line x1={x} y1={y + 22} x2={x - 20} y2={y + 22} {...linea} strokeDasharray="2 3" strokeOpacity={0.7} />
            ) : (
              <Flecha x1={x} y1={y + 22} x2={x - 20} y2={y + 22} />
            ))}
        </g>
      );
    });
  return (
    <Lienzo
      id="dib-cadena"
      alto={262}
      titulo="Cada bloque apunta al anterior"
      desc="Cuatro bloques en fila; cada uno apunta al anterior y juntos forman una cadena. Si alguien cambia el bloque 2, el 3 y el 4 dejan de encajar: para cambiar uno habría que rehacer todos los siguientes."
    >
      <text x="160" y="17" textAnchor="middle" fontFamily={MONO} fontSize="10.5" letterSpacing="0.6" fill={SUAVE}>CADA BLOQUE APUNTA AL ANTERIOR</text>
      {fila(32, false)}
      <text x="160" y="96" textAnchor="middle" fontSize="11.5">Juntos forman una cadena.</text>
      <line x1="16" y1="114" x2="304" y2="114" {...linea} strokeOpacity={0.4} strokeDasharray="2 3" />
      <text x="160" y="136" textAnchor="middle" fontFamily={MONO} fontSize="10.5" letterSpacing="0.6" fill={SUAVE}>SI ALGUIEN CAMBIA EL BLOQUE 2</text>
      {fila(150, true)}
      <text x="160" y="226" textAnchor="middle" fontSize="12.5" fontWeight="500">Para cambiar uno, habría que rehacer</text>
      <text x="160" y="243" textAnchor="middle" fontSize="12.5" fontWeight="500">todos los siguientes.</text>
    </Lienzo>
  );
}

/** 3 · El termostato: la dificultad devuelve el ritmo a unos 10 minutos (sin ceros ni hashes) */
export function DibujoTermostato() {
  return (
    <Lienzo
      id="dib-termostato"
      alto={236}
      titulo="El termostato de Bitcoin"
      desc="Una barra del tiempo entre bloques, con unos 10 minutos en el centro. Si los bloques salen más rápido, la dificultad sube; si salen más lento, baja. En los dos casos el ritmo vuelve a unos 10 minutos. La red lo revisa cada 2016 bloques, unas dos semanas."
    >
      <text x="160" y="17" textAnchor="middle" fontFamily={MONO} fontSize="10.5" letterSpacing="0.6" fill={SUAVE}>TIEMPO ENTRE BLOQUES</text>
      <text x="160" y="46" textAnchor="middle" fontFamily={MONO} fontSize="12" fill={ACENTO}>≈ 10 min</text>
      <g {...linea}>
        <line x1="24" y1="66" x2="296" y2="66" />
        <line x1="24" y1="60" x2="24" y2="72" />
        <line x1="296" y1="60" x2="296" y2="72" />
      </g>
      <line x1="160" y1="54" x2="160" y2="78" stroke={ACENTO} strokeWidth="1.4" />
      <text x="24" y="92" fontSize="11.5">más rápido</text>
      <text x="296" y="92" textAnchor="end" fontSize="11.5">más lento</text>
      <Flecha x1={40} y1={112} x2={148} y2={112} />
      <Flecha x1={280} y1={112} x2={172} y2={112} />
      <text x="88" y="136" textAnchor="middle" fontSize="11.5" fill={SUAVE}>Si van más rápido,</text>
      <text x="88" y="153" textAnchor="middle" fontSize="12.5" fontWeight="500">sube la dificultad</text>
      <text x="232" y="136" textAnchor="middle" fontSize="11.5" fill={SUAVE}>Si van más lento,</text>
      <text x="232" y="153" textAnchor="middle" fontSize="12.5" fontWeight="500">baja la dificultad</text>
      <text x="160" y="186" textAnchor="middle" fontSize="12.5" fontWeight="500">El ritmo vuelve a unos 10 minutos.</text>
      <text x="160" y="210" textAnchor="middle" fontSize="11" fill={SUAVE}>
        La red lo revisa cada <tspan fontFamily={MONO}>2016</tspan> bloques,
      </text>
      <text x="160" y="225" textAnchor="middle" fontSize="11" fill={SUAVE}>unas dos semanas.</text>
    </Lienzo>
  );
}

/** 9 · Qué compartes y qué nunca */
export function DibujoWallet() {
  const huecos = [0, 1, 2, 3, 4, 5];
  return (
    <Lienzo
      id="dib-wallet"
      alto={300}
      titulo="Qué compartes y qué nunca"
      desc="La dirección se puede compartir: es como tu número de cuenta y sirve para que te envíen bitcoins. La frase de recuperación y la clave privada nunca se comparten: quien las tiene controla tus fondos. Nadie legítimo te las pedirá."
    >
      <rect x="18" y="12" width="284" height="92" rx="3" fill="none" stroke={ACENTO} strokeWidth="1.2" />
      <text x="34" y="34" fontFamily={MONO} fontSize="10.5" letterSpacing="0.6" fill={ACENTO}>PUEDES COMPARTIR</text>
      <text x="34" y="56" fontSize="13" fontWeight="500">Tu dirección</text>
      <text x="34" y="74" fontSize="11.5">Como tu número de cuenta:</text>
      <text x="34" y="90" fontSize="11.5">sirve para que te envíen bitcoins.</text>
      <rect x="18" y="118" width="284" height="140" rx="3" {...linea} />
      <text x="34" y="140" fontFamily={MONO} fontSize="10.5" letterSpacing="0.6" fill={SUAVE}>NUNCA COMPARTES</text>
      <text x="34" y="162" fontSize="13" fontWeight="500">Frase de recuperación y clave privada</text>
      {huecos.map((k) => {
        const x = 34 + (k % 3) * 88;
        const y = 186 + Math.floor(k / 3) * 20;
        return (
          <g key={k}>
            <text x={x} y={y} fontFamily={MONO} fontSize="10.5" fill={SUAVE}>{k + 1}</text>
            <line x1={x + 12} y1={y} x2={x + 72} y2={y} {...linea} strokeOpacity={0.5} />
          </g>
        );
      })}
      <text x="34" y="222" fontSize="11" fill={SUAVE}>… y el resto de palabras</text>
      <text x="34" y="244" fontSize="11.5">Quien las tiene controla tus fondos.</text>
      <text x="160" y="284" textAnchor="middle" fontSize="12.5" fontWeight="500">Nadie legítimo te las pedirá.</text>
    </Lienzo>
  );
}

/** Dónde va cada dibujo: slug del capítulo → título de la sección tras la que aparece. */
export const DIBUJOS: Record<string, { trasSeccion: string; Dibujo: ComponentType<{ marca: string }> }> = {
  "que-es-minar": { trasSeccion: "Escribir cuesta trabajo", Dibujo: DibujoCadena },
  "dentro-de-un-bloque": { trasSeccion: "Qué lleva un bloque", Dibujo: DibujoBloque },
  "hash-y-prueba-de-trabajo": { trasSeccion: "La huella dactilar de los datos", Dibujo: DibujoHash },
  "hashrate-y-dificultad": { trasSeccion: "El termostato de Bitcoin", Dibujo: DibujoTermostato },
  "pools-y-pagos-proporcionales": { trasSeccion: "Pagos proporcionales", Dibujo: DibujoPool },
  "tu-primera-wallet": { trasSeccion: "Pasos generales", Dibujo: DibujoWallet },
  "comprar-potencia-de-mineria": { trasSeccion: "Cómo funciona", Dibujo: DibujoCompra },
};
