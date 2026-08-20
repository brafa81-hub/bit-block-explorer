import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  doubleSha256,
  formatDecimal,
  formatInt,
  formatSeconds,
  leadingZeros,
} from "@/lib/mining";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulador de minería de Bitcoin | Pruébalo en tu navegador" },
      {
        name: "description",
        content:
          "Mina Bitcoin de mentira en tu propio navegador: cambia el nonce, sube la dificultad y ve cuántos intentos hacen falta para encontrar un hash válido.",
      },
      { property: "og:title", content: "Simulador de minería de Bitcoin" },
      {
        property: "og:description",
        content:
          "Una simulación real de prueba de trabajo con SHA-256 doble, ejecutada en tu navegador. Sin jerga y sin instalar nada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SimuladorMineria,
});

const DIFICULTAD_AVISO: Record<number, string> = {
  1: "Fácil. Lo encontrarás casi al instante.",
  2: "Fácil. Lo encontrarás casi al instante.",
  3: "Equilibrado. Unos segundos.",
  4: "Difícil. Puede tardar bastante.",
  5: "Muy difícil. Puede tardar mucho, o no encontrarlo. Así se siente la minería real.",
};

const HASH_ANTERIOR = "00000000000000000002a7c4c1e48d76c5a37902165a270156b7a8d72728a054";
const MERKLE = "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b";

function ascii(rows: number, cols: number) {
  const chars = "0123456789abcdef";
  const out: string[] = [];
  let seed = 987654321;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      line += chars[Math.floor(rand() * 16)];
    }
    out.push(line);
  }
  return out.join("\n");
}

function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4">
      <label className="block text-[15px]">{etiqueta}</label>
      <p className="text-[13px] leading-relaxed text-muted-foreground">{ayuda}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}


function Desplegable({
  titulo,
  children,
  abiertoPorDefecto = false,
}: {
  titulo: string;
  children: React.ReactNode;
  abiertoPorDefecto?: boolean;
}) {
  return (
    <details open={abiertoPorDefecto} className="border border-border">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 py-3 text-[15px] marker:hidden">
        <span>{titulo}</span>
        <span className="index-label">abrir / cerrar</span>
      </summary>
      <div className="border-t border-border px-4 pb-5 pt-4">{children}</div>
    </details>
  );
}

function SimuladorMineria() {
  const [dificultad, setDificultad] = useState(3);
  const [prev, setPrev] = useState(HASH_ANTERIOR);
  const [merkle, setMerkle] = useState(MERKLE);
  const [marca, setMarca] = useState("");

  const [minando, setMinando] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [hash, setHash] = useState("");
  const [historial, setHistorial] = useState<string[]>([]);
  const [intentos, setIntentos] = useState(0);
  const [ms, setMs] = useState(0);
  const [encontrado, setEncontrado] = useState<null | {
    hash: string;
    nonce: number;
    intentos: number;
    ms: number;
    hps: number;
  }>(null);
  const [mejor, setMejor] = useState<{ hash: string; ceros: number } | null>(null);

  const corriendo = useRef(false);
  const inicio = useRef(0);
  const total = useRef(0);
  const nonceRef = useRef(0);
  const ultimaPintura = useRef(0);

  useEffect(() => {
    setMarca(
      new Intl.DateTimeFormat("es-ES", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date()),
    );
  }, []);

  const hps = ms > 0 ? intentos / (ms / 1000) : 0;

  const reiniciar = useCallback(() => {
    corriendo.current = false;
    setMinando(false);
    total.current = 0;
    nonceRef.current = 0;
    setNonce(0);
    setHash("");
    setHistorial([]);
    setIntentos(0);
    setMs(0);
    setEncontrado(null);
    setMejor(null);
  }, []);

  const parar = useCallback(() => {
    corriendo.current = false;
    setMinando(false);
  }, []);

  const minar = useCallback(async () => {
    if (corriendo.current) return;
    setEncontrado(null);
    corriendo.current = true;
    setMinando(true);
    inicio.current = performance.now() - ms;
    const objetivo = "0".repeat(dificultad);
    const cabecera = `${prev}${merkle}${marca}`;

    const lote = async () => {
      if (!corriendo.current) return;
      let ultimo = "";
      for (let i = 0; i < 250; i++) {
        const n = nonceRef.current++;
        const h = await doubleSha256(`${cabecera}${n}`);
        total.current++;
        ultimo = h;
        const z = leadingZeros(h);
        setMejor((m) => (!m || z > m.ceros ? { hash: h, ceros: z } : m));
        if (h.startsWith(objetivo)) {
          const t = performance.now() - inicio.current;
          corriendo.current = false;
          setMinando(false);
          setHash(h);
          setNonce(n);
          setIntentos(total.current);
          setMs(t);
          setEncontrado({
            hash: h,
            nonce: n,
            intentos: total.current,
            ms: t,
            hps: total.current / (t / 1000),
          });
          return;
        }
      }
      const ahora = performance.now();
      setIntentos(total.current);
      setMs(ahora - inicio.current);
      if (ahora - ultimaPintura.current > 60) {
        ultimaPintura.current = ahora;
        setHash(ultimo);
        setNonce(nonceRef.current - 1);
        setHistorial((h) => [ultimo, ...h].slice(0, 6));
      }
      requestAnimationFrame(() => {
        void lote();
      });
    };

    void lote();
  }, [dificultad, prev, merkle, marca, ms]);

  useEffect(() => () => void (corriendo.current = false), []);

  const textura = useMemo(() => ascii(40, 220), []);

  const inputClase =
    "hash-text w-full border border-border bg-transparent px-3 py-3 text-[13px] outline-none focus:border-primary";

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
      {/* Cabecera */}
      <header className="max-w-2xl">
        <div className="index-label">001 / simulador</div>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">Simulador de minería</h1>
        <p className="mt-4 text-[16px] text-muted-foreground sm:text-[17px]">
          Minar Bitcoin consiste en probar combinaciones hasta dar con la correcta. Aquí lo
          vas a ver en directo, en tu propio navegador. No se envía nada a ningún servidor.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-12">
        {/* Configuración */}
        <div className="space-y-8">
          {/* Bloque */}
          <section>
            <div className="index-label">002 / el bloque</div>
            <div className="mt-3 border border-border lg:border-0">
              <details open className="lg:open">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 py-3 text-[15px] marker:hidden lg:hidden">
                  <span>Ver el contenido del bloque</span>
                  <span className="index-label">abrir / cerrar</span>
                </summary>
                <div className="border-t border-border px-4 pb-5 pt-4 lg:border-0 lg:p-0">
                  <CamposBloque
                    prev={prev}
                    setPrev={setPrev}
                    merkle={merkle}
                    setMerkle={setMerkle}
                    marca={marca}
                    nonce={nonce}
                    inputClase={inputClase}
                  />
                </div>
              </details>
            </div>
          </section>
        </div>

        {/* Simulación */}
        <section className="space-y-8">
          {/* Dificultad */}
          <div>
            <div className="index-label">003 / dificultad</div>
            <label htmlFor="dif" className="mt-2 block text-[17px]">
              Dificultad
            </label>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Cuantos más ceros exijas al principio del resultado, más difícil es
              acertar. Empieza en 3 y prueba a subirlo para ver cómo cambia el tiempo.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <input
                id="dif"
                type="range"
                min={1}
                max={5}
                step={1}
                value={dificultad}
                onChange={(e) => setDificultad(Number(e.target.value))}
                className="h-11 w-full accent-[var(--instrument)]"
              />
              <span className="hash-text text-lg text-primary">{dificultad}</span>
            </div>
            <p className="mt-1 text-[14px] text-muted-foreground">
              {DIFICULTAD_AVISO[dificultad]}
            </p>
          </div>

          <div>
          <div className="index-label">004 / simulación</div>


          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={() => void minar()}
              disabled={minando}
              className="min-h-[44px] bg-primary px-5 text-[15px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Empezar a minar
            </button>
            <button
              onClick={parar}
              disabled={!minando}
              className="min-h-[44px] border border-border bg-transparent px-5 text-[15px] disabled:opacity-40"
            >
              Parar
            </button>
            <button
              onClick={reiniciar}
              className="min-h-[44px] border border-border bg-transparent px-5 text-[15px]"
            >
              Reiniciar
            </button>
          </div>

          {/* Hash actual */}
          <div className="mt-6 border border-border p-4">
            <div className="index-label">hash actual</div>
            <p
              className={`hash-text mt-2 min-h-[3.4em] text-[13px] sm:text-[15px] ${
                encontrado ? "text-primary" : "text-foreground"
              }`}
            >
              {hash || "—"}
            </p>
          </div>

          {/* Métricas */}
          <div className="mt-4 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
            <Metrica etiqueta="Nonce" valor={formatInt(nonce)} />
            <Metrica etiqueta="Intentos" valor={formatInt(intentos)} />
            <Metrica etiqueta="Tiempo" valor={formatSeconds(ms)} />
            <Metrica
              etiqueta="Velocidad"
              valor={`${formatInt(Math.round(hps))} h/s`}
            />
          </div>

          {/* Historial */}
          <div className="mt-4 border border-border p-4">
            <div className="index-label">últimos intentos</div>
            <ul className="mt-2 space-y-1">
              {historial.length === 0 && (
                <li className="text-[14px] text-muted-foreground">
                  Todavía no has probado ninguna combinación.
                </li>
              )}
              {historial.map((h, i) => (
                <li
                  key={`${h}-${i}`}
                  className="hash-text text-[11px] text-muted-foreground sm:text-[12px]"
                  style={{ opacity: 1 - i * 0.12 }}
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Éxito */}
          {encontrado && (
            <div className="mt-4 border border-primary p-4">
              <div className="index-label" style={{ color: "var(--instrument)" }}>
                hash válido
              </div>
              <p className="hash-text mt-2 text-[13px] text-primary sm:text-[15px]">
                {encontrado.hash}
              </p>
              <p className="mt-3 text-[15px]">
                Lo has encontrado. Tu navegador ha probado{" "}
                {formatInt(encontrado.intentos)} combinaciones en{" "}
                {formatSeconds(encontrado.ms)}, a una media de{" "}
                {formatInt(Math.round(encontrado.hps))} intentos por segundo. El nonce que
                ha valido es el {formatInt(encontrado.nonce)}. Ninguna de las anteriores
                servía.
              </p>
            </div>
          )}

          {/* Mejor resultado al parar */}
          {!encontrado && !minando && mejor && intentos > 0 && (
            <div className="mt-4 border border-border p-4">
              <div className="index-label">mejor resultado hasta ahora</div>
              <p className="hash-text mt-2 text-[13px] text-muted-foreground sm:text-[15px]">
                {mejor.hash}
              </p>
              <p className="mt-3 text-[15px] text-muted-foreground">
                Has parado antes de encontrarlo. Lo más cerca que has estado son{" "}
                {formatInt(mejor.ceros)} ceros al principio. Necesitas {dificultad}. Fallar
                es lo normal: así funciona la minería.
              </p>
            </div>
          )}
          </div>
        </section>

      </div>

      {/* Qué está pasando */}
      <section className="mt-12 lg:mt-16">
        <div className="index-label">005 / ¿qué está pasando?</div>
        <div className="mt-3">
          <Desplegable titulo="¿Qué está pasando?">
            <div className="max-w-3xl space-y-6">
              <Explica titulo="Qué es un hash">
                Es una función que convierte cualquier dato en un código de longitud fija.
                Cambia una coma del dato y el código cambia por completo. No se parece en
                nada al anterior.
              </Explica>
              <Explica titulo="Por qué no se puede calcular el resultado">
                No hay forma de deducir qué número da un hash concreto. Solo se puede
                probar, uno detrás de otro. Por eso se llama prueba de trabajo: el trabajo
                es la prueba.
              </Explica>
              <Explica titulo="Qué es el nonce">
                Es un número dentro del bloque que el minero puede cambiar libremente. Todo
                lo demás está fijado. Cambiar el nonce cambia el hash entero, y eso es lo
                que se repite una y otra vez.
              </Explica>
              <Explica titulo="Qué es la dificultad">
                Es cuántos ceros se exigen al principio del hash. Cada cero adicional hace
                el acierto unas dieciséis veces más raro, así que hacen falta muchos más
                intentos de media.
              </Explica>
              <Explica titulo="Qué es un pool de minería">
                Muchos participantes prueban a la vez y reparten el resultado entre todos.
                En solitario las probabilidades de acertar son mínimas, y podrías estar años
                sin encontrar nada.
              </Explica>
            </div>
          </Desplegable>
        </div>
      </section>

      {/* Cierre bitono */}
      <section
        className="relative mt-12 overflow-hidden lg:mt-20"
        style={{ backgroundColor: "var(--ink)" }}
      >
        <pre
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 select-none whitespace-pre"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            lineHeight: "14px",
            color: "rgba(240,237,228,0.05)",
          }}
        >
          {textura}
        </pre>

        <div className="relative px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div
            className="index-label"
            style={{ color: "var(--instrument-dark)" }}
          >
            006 / escala real
          </div>

          <h2
            className="mt-3 max-w-2xl text-2xl sm:text-3xl"
            style={{ color: "var(--on-dark)" }}
          >
            Lo que acabas de hacer, comparado con una máquina de verdad
          </h2>
          <p
            className="mt-4 max-w-2xl text-[16px]"
            style={{ color: "var(--on-dark-muted)" }}
          >
            Tu navegador prueba unos cuantos miles de combinaciones por segundo. Una
            máquina dedicada prueba esa misma cantidad millones de veces en el mismo
            segundo. La diferencia no es de grado, es de escala.
          </p>

          <dl className="mt-10 grid gap-px sm:grid-cols-3" style={{ backgroundColor: "var(--on-dark-border)" }}>
            <Comparativa
              etiqueta="Tu navegador"
              valor={hps > 0 ? `${formatInt(Math.round(hps))} h/s` : "—"}
              nota={
                hps > 0
                  ? "Lo que acabas de medir aquí mismo."
                  : "Ejecuta la simulación para medirlo."
              }
            />

            <Comparativa
              etiqueta="Un equipo ASIC moderno"
              valor="100 TH/s"
              nota="Cien billones por segundo. Un solo equipo hace en un segundo lo que tu navegador tardaría años."
            />
            <Comparativa
              etiqueta="1 PH/s"
              valor="1.000 TH/s"
              nota="Mil veces ese equipo trabajando a la vez, sin parar."
            />
          </dl>

          <p
            className="mt-8 max-w-2xl text-[15px]"
            style={{ color: "var(--on-dark-muted)" }}
          >
            Por eso nadie mina en solitario desde un portátil. La minería seria se hace con
            máquinas dedicadas, en instalaciones con energía y refrigeración pensadas para
            ello.
          </p>

          <div className="mt-8">
            <Link
              to="/catalogo"
              className="inline-flex min-h-[44px] items-center px-5 text-[15px]"
              style={{
                backgroundColor: "var(--instrument-dark)",
                color: "var(--ink)",
              }}
            >
              Ver cómo alquilar 1 PH/s
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function CamposBloque({
  prev,
  setPrev,
  merkle,
  setMerkle,
  marca,
  nonce,
  inputClase,
}: {
  prev: string;
  setPrev: (v: string) => void;
  merkle: string;
  setMerkle: (v: string) => void;
  marca: string;
  nonce: number;
  inputClase: string;
}) {
  return (
    <div className="space-y-4">
      <Campo
        etiqueta="Bloque anterior"
        ayuda="Cada bloque apunta al anterior. Así se forma la cadena."
      >
        <input
          className={inputClase}
          value={prev}
          onChange={(e) => setPrev(e.target.value)}
          spellCheck={false}
        />
      </Campo>
      <Campo
        etiqueta="Raíz de transacciones (Merkle root)"
        ayuda="Un resumen de todas las transacciones que contiene el bloque."
      >
        <input
          className={inputClase}
          value={merkle}
          onChange={(e) => setMerkle(e.target.value)}
          spellCheck={false}
        />
      </Campo>
      <Campo etiqueta="Marca de tiempo" ayuda="Cuándo se creó el bloque.">
        <p className="hash-text text-[13px] text-muted-foreground">{marca || "—"}</p>
      </Campo>
      <Campo
        etiqueta="Nonce"
        ayuda="El único campo que el minero puede cambiar libremente. Es lo que se prueba una y otra vez."
      >
        <p className="hash-text text-[15px] text-primary">{formatInt(nonce)}</p>
      </Campo>
    </div>

  );
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="bg-background p-4">
      <div className="index-label">{etiqueta}</div>
      <p className="hash-text mt-1 text-[15px]">{valor}</p>
    </div>
  );
}

function Comparativa({
  etiqueta,
  valor,
  nota,
}: {
  etiqueta: string;
  valor: string;
  nota: string;
}) {
  return (
    <div className="p-5" style={{ backgroundColor: "var(--ink)" }}>
      <dt className="index-label" style={{ color: "var(--on-dark-muted)" }}>
        {etiqueta}
      </dt>
      <dd
        className="hash-text mt-2 text-xl"
        style={{ color: "var(--on-dark)" }}
      >
        {valor}
      </dd>
      <p className="mt-2 text-[14px]" style={{ color: "var(--on-dark-muted)" }}>
        {nota}
      </p>
    </div>
  );
}

function Explica({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[17px]">{titulo}</h3>
      <p className="mt-1 text-[15px] text-muted-foreground">{children}</p>
    </div>
  );
}
