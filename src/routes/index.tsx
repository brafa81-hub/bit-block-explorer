import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

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
const LOTE = 300;
const PINTURA_MS = 66;

/** Redondea a dos cifras significativas y lo expresa con palabras de escala. */
function vecesEnPalabras(x: number): string {
  if (!isFinite(x) || x <= 0) return "—";
  const escalas: [number, string][] = [
    [1e12, "billones"],
    [1e9, "mil millones"],
    [1e6, "millones"],
  ];
  for (const [v, nombre] of escalas) {
    if (x >= v) {
      const n = x / v;
      const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(n)) - 1));
      return `${formatInt(Math.round(n / mag) * mag)} ${nombre}`;
    }
  }
  const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1));
  return formatInt(Math.round(x / mag) * mag);
}

const MERKLE = "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b";

function generarTexturaHex(filas: number, cols: number): string {
  const chars = "0123456789abcdef";
  const bytes = new Uint8Array(filas * cols);
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const lineas: string[] = [];
  for (let r = 0; r < filas; r++) {
    let linea = "";
    for (let c = 0; c < cols; c++) {
      linea += chars[(bytes[r * cols + c] ?? 0) % 16];
    }
    lineas.push(linea);
  }
  return lineas.join("\n");
}

function Campo({
  etiqueta,
  ayuda,
  htmlFor,
  children,
}: {
  etiqueta: string;
  ayuda: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4">
      <label htmlFor={htmlFor} className="block text-[15px]">{etiqueta}</label>
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
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 py-3 text-[15px] marker:hidden [&::-webkit-details-marker]:hidden">
        <span>{titulo}</span>
        <span className="etiqueta">abrir / cerrar</span>
      </summary>
      <div className="border-t border-border px-4 pb-5 pt-4">{children}</div>
    </details>
  );
}

function SimuladorMineria() {
  const [dificultad, setDificultad] = useState(3);
  const [difRonda, setDifRonda] = useState(3);

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
  const [textura, setTextura] = useState("");

  const corriendo = useRef(false);
  const pausado = useRef(false);
  const runId = useRef(0);
  const acumulado = useRef(0);
  const tramoInicio = useRef(0);
  const total = useRef(0);
  const nonceRef = useRef(0);
  const mejorRef = useRef<{ hash: string; ceros: number } | null>(null);
  const historialRef = useRef<string[]>([]);
  const ultimaPintura = useRef(0);
  const encontradoRef = useRef(false);
  const cicloRef = useRef<(id: number) => void>(() => {});

  useEffect(() => {
    setMarca(
      new Intl.DateTimeFormat("es-ES", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date()),
    );
    setTextura(generarTexturaHex(150, 200));
  }, []);

  const hps = ms > 0 ? intentos / (ms / 1000) : 0;

  const tiempo = () =>
    acumulado.current + (pausado.current ? 0 : performance.now() - tramoInicio.current);

  const reiniciar = useCallback(() => {
    runId.current++;
    corriendo.current = false;
    pausado.current = false;
    encontradoRef.current = false;
    total.current = 0;
    nonceRef.current = 0;
    acumulado.current = 0;
    mejorRef.current = null;
    historialRef.current = [];
    setMinando(false);
    setNonce(0);
    setHash("");
    setHistorial([]);
    setIntentos(0);
    setMs(0);
    setEncontrado(null);
    setMejor(null);
  }, []);

  const parar = useCallback(() => {
    if (corriendo.current && !pausado.current) {
      acumulado.current += performance.now() - tramoInicio.current;
    }
    runId.current++;
    corriendo.current = false;
    pausado.current = false;
    setMinando(false);
    setMs(acumulado.current);
    setIntentos(total.current);
    setMejor(mejorRef.current);
  }, []);

  const minar = useCallback(() => {
    if (corriendo.current) return;
    if (encontradoRef.current) reiniciar();
    const id = ++runId.current;
    const objetivo = "0".repeat(dificultad);
    const cabecera = `${prev}${merkle}${marca}`;
    setDifRonda(dificultad);
    corriendo.current = true;
    pausado.current = typeof document !== "undefined" && document.hidden;
    tramoInicio.current = performance.now();
    setMinando(true);

    const ciclo = async (rid: number) => {
      if (rid !== runId.current || !corriendo.current || pausado.current) return;
      const base = nonceRef.current;
      nonceRef.current += LOTE;
      const promesas: Promise<string>[] = [];
      for (let i = 0; i < LOTE; i++) promesas.push(doubleSha256(`${cabecera}${base + i}`));
      const hashes = await Promise.all(promesas);

      let ultimo = "";
      let ultimoNonce = base;
      for (let i = 0; i < hashes.length; i++) {
        if (rid !== runId.current || !corriendo.current) return;
        const h = hashes[i] ?? "";
        const n = base + i;
        total.current++;
        ultimo = h;
        ultimoNonce = n;
        const z = leadingZeros(h);
        if (!mejorRef.current || z > mejorRef.current.ceros) {
          mejorRef.current = { hash: h, ceros: z };
        }
        if (h.startsWith(objetivo)) {
          const t = tiempo();
          acumulado.current = t;
          corriendo.current = false;
          encontradoRef.current = true;
          runId.current++;
          setMinando(false);
          setHash(h);
          setNonce(n);
          setIntentos(total.current);
          setMs(t);
          setMejor(mejorRef.current);
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
      if (ahora - ultimaPintura.current >= PINTURA_MS) {
        ultimaPintura.current = ahora;
        historialRef.current = [ultimo, ...historialRef.current].slice(0, 6);
        setHash(ultimo);
        setNonce(ultimoNonce);
        setIntentos(total.current);
        setMs(tiempo());
        setHistorial(historialRef.current);
        setMejor(mejorRef.current);
      }
      requestAnimationFrame(() => void ciclo(rid));
    };

    cicloRef.current = (rid) => void ciclo(rid);
    if (!pausado.current) void ciclo(id);
  }, [dificultad, prev, merkle, marca, reiniciar]);

  // Pausa en segundo plano y reanuda al volver.
  useEffect(() => {
    const onVis = () => {
      if (!corriendo.current) return;
      if (document.hidden) {
        if (!pausado.current) {
          acumulado.current += performance.now() - tramoInicio.current;
          pausado.current = true;
        }
      } else if (pausado.current) {
        pausado.current = false;
        tramoInicio.current = performance.now();
        cicloRef.current(runId.current);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(
    () => () => {
      runId.current++;
      corriendo.current = false;
    },
    [],
  );

  const inputClase =
    "hash-text w-full border border-border bg-transparent px-3 py-3 text-[13px] outline-none focus:border-primary disabled:opacity-60";

  const camposProps = {
    prev,
    setPrev,
    merkle,
    setMerkle,
    marca,
    nonce,
    inputClase,
    bloqueado: minando,
  };

  const veces = hps > 0 ? 200e12 / hps : 0;
  const anios = hps > 0 ? 1e15 / hps / 31_536_000 : 0;
  const medicionValida = hps > 0 && intentos >= 1000;

  return (
    <main
      className={`mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16 ${minando ? "pb-32 sm:pb-10" : ""}`}
    >
      {/* Cabecera */}
      <header className="max-w-2xl">
        <div className="index-label">001 / simulador</div>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">Simulador de minería</h1>
        <p className="mt-4 text-[16px] text-muted-foreground sm:text-[17px]">
          Minar Bitcoin consiste en probar combinaciones hasta dar con la correcta. Aquí lo
          vas a ver en directo, en tu propio navegador. No se envía nada a ningún servidor.
        </p>
      </header>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 sm:grid-rows-[auto_1fr] sm:[grid-template-areas:'bloque_sim''dif_sim'] lg:mt-14 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-x-12 lg:[grid-template-areas:'bloque_dif''bloque_sim']">
        {/* Bloque */}
        <section className="min-w-0 sm:[grid-area:bloque]">
          <div className="index-label">002 / el bloque</div>
          <div className="mt-3 border border-border lg:hidden">
            <details>
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 py-3 text-[15px] marker:hidden [&::-webkit-details-marker]:hidden">
                <span>Ver el contenido del bloque</span>
                <span className="etiqueta">abrir / cerrar</span>
              </summary>
              <div className="border-t border-border px-4 pb-5 pt-4">
                <CamposBloque {...camposProps} sufijo="m" />
              </div>
            </details>
          </div>
          <div className="mt-3 hidden lg:block">
            <CamposBloque {...camposProps} sufijo="d" />
          </div>
        </section>

        {/* Dificultad */}
        <div className="min-w-0 sm:[grid-area:dif]">
          <div className="index-label">003 / dificultad</div>
          <label htmlFor="dif" className="mt-2 block text-[17px]">
            Dificultad
          </label>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Cuantos más ceros exijas al principio del resultado, más difícil es acertar.
            Empieza en 3 y prueba a subirlo para ver cómo cambia el tiempo.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <input
              id="dif"
              type="range"
              min={1}
              max={5}
              step={1}
              value={dificultad}
              disabled={minando}
              onChange={(e) => setDificultad(Number(e.target.value))}
              className="h-11 w-full accent-[var(--instrument)] disabled:opacity-50"
            />
            <span className="hash-text text-lg text-foreground">{dificultad}</span>
          </div>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {DIFICULTAD_AVISO[dificultad]}
          </p>
        </div>

        {/* Simulación */}
        <section className="min-w-0 sm:[grid-area:sim]">
          <div className="index-label">004 / simulación</div>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={minar}
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
            <div className="etiqueta">Hash actual</div>
            <p
              className={`hash-text hash-break mt-2 min-h-[3.4em] text-[13px] sm:text-[15px] ${
                encontrado ? "text-primary" : "text-foreground"
              }`}
            >
              {hash || "—"}
            </p>
          </div>

          {/* Métricas */}
          <div className="mt-4 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
            <Metrica etiqueta="Nonce" valor={formatInt(nonce)} />
            <Metrica etiqueta="Intentos" valor={formatInt(intentos)} />
            <Metrica etiqueta="Tiempo" valor={formatSeconds(ms)} />
            <Metrica etiqueta="Velocidad" valor={`${formatInt(Math.round(hps))} intentos/s`} />
          </div>

          {/* Historial */}
          <div className="mt-4 border border-border p-4">
            <div className="etiqueta">Últimos intentos</div>
            <ul className="mt-2 space-y-1">
              {historial.length === 0 && (
                <li className="text-[14px] text-muted-foreground">
                  Todavía no has probado ninguna combinación.
                </li>
              )}
              {historial.map((h, i) => (
                <li
                  key={`${h}-${i}`}
                  className="hash-text hash-break text-[11px] text-muted-foreground sm:text-[12px]"
                  style={{ opacity: 1 - i * 0.12 }}
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Éxito */}
          {encontrado && (
            <div className="mt-4 border border-stone p-4">
              <div className="etiqueta">Hash válido</div>
              <p className="hash-text hash-break mt-2 text-[13px] text-primary sm:text-[15px]">
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
              <p className="mt-3 text-[15px]">
                Acabas de encontrar un resultado válido con la dificultad que tú has elegido.
                En la red real la exigencia es incomparablemente mayor: cada diez minutos,
                todas las máquinas del mundo compiten por dar con uno solo. Un ordenador
                doméstico, en la práctica, no encontraría ninguno nunca: haría falta
                muchísimo más que una vida.
              </p>
              <a
                href="#escala-real"
                className="mt-3 inline-flex min-h-[44px] items-center text-[14px] text-muted-foreground underline"
              >
                Ver la diferencia de escala
              </a>
            </div>
          )}

          {/* Mejor resultado al parar */}
          {!encontrado && !minando && mejor && intentos > 0 && (
            <div className="mt-4 border border-border p-4">
              <div className="etiqueta">Mejor resultado hasta ahora</div>
              <p className="hash-text hash-break mt-2 text-[13px] text-muted-foreground sm:text-[15px]">
                {mejor.hash}
              </p>
              <p className="mt-3 text-[15px] text-muted-foreground">
                Has parado antes de encontrarlo. Lo más cerca que has estado son{" "}
                {formatInt(mejor.ceros)} ceros al principio. Necesitas {difRonda}. Fallar
                es lo normal: así funciona la minería.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Barra fija en móvil mientras se mina */}
      {minando && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone bg-background px-5 py-3 sm:hidden">
          <div className="flex gap-6 text-[13px]">
            <span>
              <span className="text-muted-foreground">Nonce </span>
              <span className="hash-text">{formatInt(nonce)}</span>
            </span>
            <span>
              <span className="text-muted-foreground">Intentos </span>
              <span className="hash-text">{formatInt(intentos)}</span>
            </span>
          </div>
          <p className="hash-text mt-1 truncate text-[12px]">{hash || "—"}</p>
        </div>
      )}

      {/* Cómo funciona */}
      <section className="mt-12 lg:mt-16">
        <div className="index-label">005 / cómo funciona</div>
        <div className="mt-3">
          <Desplegable titulo="Cómo funciona">

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
              <Explica titulo="Qué es un ASIC">
                Es un ordenador construido con un único propósito: calcular hashes SHA-256
                lo más rápido posible. A diferencia de tu ordenador, no sirve para nada más
                — y por eso es miles de veces más rápido en esta tarea concreta.
              </Explica>
              <Explica titulo="Qué es un pool de minería">
                Muchos participantes prueban a la vez y reparten el resultado entre todos.
                En solitario las probabilidades de acertar son mínimas, y podrías no encontrar
                nada nunca.
              </Explica>
            </div>
          </Desplegable>
        </div>
      </section>

      {/* Cierre bitono */}
      <section
        id="escala-real"
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
            color: "rgba(240,237,228,0.07)",
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
            Tu navegador prueba unos cuantos miles de combinaciones por segundo.{" "}
            {hps > 0
              ? `Un Antminer S21 es unas ${vecesEnPalabras(veces)} de veces más rápido que lo que acabas de medir.`
              : "Una máquina dedicada es muchísimas veces más rápida."}{" "}
            La diferencia no es de grado, es de escala.
          </p>
          <p className="mt-4 max-w-2xl text-[16px]" style={{ color: "var(--on-dark)" }}>
            {medicionValida
              ? `Lo que 1 PH/s hace en un segundo, a tu navegador le llevaría unos ${formatInt(anios)} años.`
              : "Ejecuta la simulación un rato y te diremos cuántos años tardaría tu navegador en hacer lo que 1 PH/s hace en un segundo."}
          </p>

          <dl className="mt-10 grid gap-px sm:grid-cols-3" style={{ backgroundColor: "var(--on-dark-border)" }}>
            <Comparativa
              etiqueta="Tu navegador"
              valor={hps > 0 ? `${formatInt(Math.round(hps))} intentos/s` : "—"}
              cifraCompleta={
                hps > 0 ? `${formatInt(Math.round(hps))} hashes por segundo` : undefined
              }
              nota={
                hps > 0
                  ? "Lo que acabas de medir aquí mismo."
                  : "Ejecuta la simulación para medirlo."
              }
            />

            <Comparativa
              etiqueta="Antminer S21"
              valor="200 TH/s"
              cifraCompleta="Doscientos billones de hashes por segundo"
              nota="Un ASIC profesional habitual en la minería real."
            />
            <Comparativa
              etiqueta="1 PH/s"
              valor="1.000 TH/s"
              cifraCompleta="Mil billones de hashes por segundo"
              nota="Lo que hacen 5 equipos como este trabajando a la vez, sin parar."
            />
          </dl>

          <p
            className="mt-8 max-w-2xl text-[15px]"
            style={{ color: "var(--on-dark-muted)" }}
          >
            Por eso nadie mina en solitario desde un ordenador. La minería seria se hace con
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
  bloqueado,
  sufijo,
}: {
  prev: string;
  setPrev: (v: string) => void;
  merkle: string;
  setMerkle: (v: string) => void;
  marca: string;
  nonce: number;
  inputClase: string;
  bloqueado: boolean;
  sufijo: string;
}) {
  return (
    <div className="space-y-4">
      <Campo
        etiqueta="Bloque anterior"
        ayuda="Cada bloque apunta al anterior. Así se forma la cadena."
        htmlFor={`prev-${sufijo}`}
      >
        <input
          id={`prev-${sufijo}`}
          disabled={bloqueado}
          className={inputClase}
          value={prev}
          onChange={(e) => setPrev(e.target.value)}
          spellCheck={false}
        />
      </Campo>
      <Campo
        etiqueta="Raíz de transacciones (Merkle root)"
        ayuda="Un resumen de todas las transacciones que contiene el bloque."
        htmlFor={`merkle-${sufijo}`}
      >
        <input
          id={`merkle-${sufijo}`}
          disabled={bloqueado}
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
        <p className="hash-text cursor-default text-[15px] text-foreground">{formatInt(nonce)}</p>
      </Campo>
    </div>

  );
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="bg-background p-4">
      <div className="etiqueta">{etiqueta}</div>
      <p className="hash-text mt-1 text-[15px]">{valor}</p>
    </div>
  );
}

function Comparativa({
  etiqueta,
  valor,
  cifraCompleta,
  nota,
}: {
  etiqueta: string;
  valor: string;
  cifraCompleta?: string | undefined;
  nota: string;
}) {
  return (
    <div className="p-5" style={{ backgroundColor: "var(--ink)" }}>
      <dt className="text-[13px]" style={{ color: "var(--on-dark-muted)" }}>
        {etiqueta}
      </dt>
      <dd
        className="hash-text mt-2 text-xl"
        style={{ color: "var(--on-dark)" }}
      >
        {valor}
      </dd>
      {cifraCompleta && (
        <dd
          className="mt-1 text-[13px]"
          style={{ color: "var(--on-dark-muted)" }}
        >
          {cifraCompleta}
        </dd>
      )}
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
