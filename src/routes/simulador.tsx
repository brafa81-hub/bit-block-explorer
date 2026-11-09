import { SERVICIO } from "@/content/servicio";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { LaRedAhora } from "@/components/LaRedAhora";
import { useRed } from "@/hooks/useRed";
import { cifraEnPalabras, doubleSha256, formatInt, formatSeconds } from "@/lib/mining";

export const Route = createFileRoute("/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador de minería de Bitcoin | Pruébalo en tu navegador" },
      {
        name: "description",
        content:
          "Mina un bloque de Bitcoin en directo desde tu navegador: mira cómo se prueban combinaciones hasta encontrar un hash válido. Gratis y sin instalar nada.",
      },
      { property: "og:title", content: "Simulador de minería de Bitcoin" },
      {
        property: "og:description",
        content:
          "Mira en tu navegador cómo se mina un bloque de Bitcoin, paso a paso. Gratis y sin instalar nada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SimuladorMineria,
});

const HASH_ANTERIOR = "00000000000000000002a7c4c1e48d76c5a37902165a270156b7a8d72728a054";
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

/** Bloque de ejemplo fijo: su primer hash con tres ceros aparece en el nonce 4.801. */
const MARCA = "09/10/2026, 14:12:00";
const CABECERA = `${HASH_ANTERIOR}${MERKLE}${MARCA}`;
const NONCE_VALIDO = 4801;
const TOTAL_INTENTOS = NONCE_VALIDO + 1;
const OBJETIVO = "000";
const OBJETIVO_SHARE = "00";
const DURACION_MS = 10_000;

type Fase = "inicio" | "minando" | "hecho";
type Intento = { hash: string; share: boolean; valido?: boolean };

function SimuladorMineria() {
  const [fase, setFase] = useState<Fase>("inicio");
  const [intentos, setIntentos] = useState(0);
  const [shares, setShares] = useState(0);
  const [ms, setMs] = useState(0);
  const [hash, setHash] = useState("");
  const [historial, setHistorial] = useState<Intento[]>([]);
  const [textura, setTextura] = useState("");
  const runId = useRef(0);

  useEffect(() => {
    setTextura(generarTexturaHex(150, 420));
    return () => {
      runId.current++;
    };
  }, []);

  /** Hashrate de la red: fuente única (/api/red → caché → respaldo de servicio.ts). */
  const red = useRed();
  const redEhs = Math.round(red.hashrateTH / 1e6);

  const minar = useCallback(() => {
    const id = ++runId.current;
    const inicio = performance.now();
    let hechos = 0;
    let nShares = 0;
    let lista: Intento[] = [];
    setFase("minando");
    setIntentos(0);
    setShares(0);
    setMs(0);
    setHash("");
    setHistorial([]);

    const ciclo = async () => {
      if (id !== runId.current) return;
      const t = performance.now() - inicio;
      // Ritmo fijo: el mismo en cualquier dispositivo (cámara lenta).
      const meta = Math.min(TOTAL_INTENTOS, Math.ceil((t / DURACION_MS) * TOTAL_INTENTOS));
      const nonces: number[] = [];
      for (let n = hechos; n < meta; n++) nonces.push(n);
      const hashes = await Promise.all(nonces.map((n) => doubleSha256(`${CABECERA}${n}`)));
      if (id !== runId.current) return;

      let destacado: Intento | null = null;
      let encontrado: string | null = null;
      for (const h of hashes) {
        const esShare = h.startsWith(OBJETIVO_SHARE);
        if (esShare) {
          nShares++;
          destacado = { hash: h, share: true };
        }
        if (h.startsWith(OBJETIVO)) {
          encontrado = h;
          destacado = { hash: h, share: true, valido: true };
        }
      }
      hechos = meta;
      const ultimo = hashes[hashes.length - 1];
      if (destacado || ultimo) {
        lista = [destacado ?? { hash: ultimo ?? "", share: false }, ...lista].slice(0, 6);
      }

      setIntentos(hechos);
      setShares(nShares);
      setMs(performance.now() - inicio);
      if (ultimo) setHash(ultimo);
      setHistorial(lista);

      if (encontrado) {
        setHash(encontrado);
        setFase("hecho");
        return;
      }
      requestAnimationFrame(() => void ciclo());
    };
    requestAnimationFrame(() => void ciclo());
  }, []);

  const minando = fase === "minando";
  const hecho = fase === "hecho";

  return (
    <main>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
        {/* Cabecera */}
        <header className="max-w-2xl">
          <div className="index-label">001 / simulador</div>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">Simulador de minería</h1>
          <p className="mt-4 text-[16px] text-muted-foreground sm:text-[17px]">
            Minar Bitcoin consiste en probar combinaciones hasta dar con la correcta. Es el mismo
            cálculo que protege la red; aquí lo vas a ver en directo, en tu propio navegador: tu
            simulación no sale de tu dispositivo.
          </p>
        </header>

        {/* Demostración */}
        <section className="mt-10 max-w-3xl lg:mt-14">
          <div className="index-label">002 / demostración</div>
          <p className="mt-3 text-[16px]">
            Pulsa el botón y mira cómo se mina un bloque. Buscamos un resultado que empiece por tres
            ceros. Va a cámara lenta para que puedas verlo: dura unos 10 segundos.
          </p>

          <button
            onClick={minar}
            disabled={minando}
            className={`mt-5 min-h-[48px] px-6 text-[16px] transition-opacity hover:opacity-90 ${
              minando
                ? "border border-border bg-transparent text-muted-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {minando ? "Minando…" : hecho ? "Repetir" : "Ver cómo se mina un bloque"}
          </button>

          {/* Hash actual */}
          <div className="mt-6 border border-border p-4">
            <div className="etiqueta">{hecho ? "Hash válido" : "Hash actual"}</div>
            <p
              className={`hash-text hash-break mt-2 min-h-[3.4em] text-[13px] sm:text-[15px] ${
                hecho ? "text-primary" : "text-foreground"
              }`}
            >
              {hash || "—"}
            </p>
          </div>

          {/* Métricas */}
          <div className="mt-4 grid grid-cols-3 gap-px border border-border bg-border">
            <Metrica etiqueta="Intentos" valor={formatInt(intentos)} />
            <Metrica etiqueta="Tiempo" valor={formatSeconds(ms)} />
            <Metrica etiqueta="Shares para el pool" valor={formatInt(shares)} />
          </div>

          {/* Últimos intentos */}
          {fase !== "inicio" && (
            <div className="mt-4 border border-border p-4">
              <div className="etiqueta">Últimos intentos</div>
              <ul className="mt-2 space-y-1">
                {historial.map((it, i) => (
                  <li
                    key={`${it.hash}-${i}`}
                    className={`hash-text hash-break text-[11px] sm:text-[12px] ${
                      it.share ? "text-primary" : "text-muted-foreground"
                    }`}
                    style={{ opacity: 1 - i * 0.12 }}
                  >
                    {it.share && (
                      <span className="mr-2 font-sans text-[11px] uppercase tracking-wide">
                        {it.valido ? "válido" : "share"}
                      </span>
                    )}
                    {it.hash}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Una share empieza por dos ceros: no cierra el bloque, pero demuestra trabajo real
                ante el pool.
              </p>
            </div>
          )}

          {/* Resultado */}
          {hecho && (
            <div className="mt-4 border border-stone p-4">
              <div className="etiqueta">Bloque encontrado</div>
              <p className="mt-2 text-[15px]">
                Tras {formatInt(intentos)} intentos, este resultado empieza por tres ceros: es
                válido. Ninguno de los anteriores servía, aunque {formatInt(shares)} sí contaban
                como shares para el pool.
              </p>

              <dl className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-3">
                <Metrica etiqueta="Esta demostración" valor={`${formatInt(intentos)} intentos`} />
                <Metrica etiqueta="Antminer S21, en 10 s" valor="2.000 billones" />
                <Metrica etiqueta="1 PH/s, en 10 s" valor="10.000 billones" />
              </dl>

              <p className="mt-4 text-[15px]">
                En la red real se exigen muchísimos más ceros, y todas las máquinas del mundo
                compiten por el mismo bloque. Se puede minar en solitario, pero encontrar un bloque
                así es muy poco probable. Por eso la mayoría de mineros se une a un pool, que cuenta
                sus shares y les paga en proporción. Así trabaja la potencia en modo Compartido. En
                Solitario, tu potencia busca el bloque entero por su cuenta, y en Híbrido hace las
                dos cosas: 12 horas de cada.
              </p>
              <a
                href="#escala-real"
                className="mt-3 inline-flex min-h-[44px] items-center text-[14px] text-muted-foreground underline"
              >
                Ver la diferencia de escala
              </a>
            </div>
          )}
        </section>

        {/* Cómo funciona */}
        <section className="mt-12 lg:mt-16">
          <div className="index-label">003 / términos del simulador</div>
          <div className="mt-3">
            <Desplegable titulo="Explicación de términos">
              <div className="max-w-3xl space-y-6">
                <Explica titulo="Qué es un hash">
                  Es una función que convierte cualquier dato en un código de longitud fija. Cambia
                  una coma del dato y el código cambia por completo. No se parece en nada al
                  anterior.
                </Explica>
                <Explica titulo="Por qué no se puede calcular el resultado">
                  No hay forma de deducir qué número da un hash concreto. Solo se puede probar, uno
                  detrás de otro. Por eso se llama prueba de trabajo: el trabajo es la prueba.
                </Explica>
                <Explica titulo="Qué es el nonce">
                  Es un número dentro del bloque que el minero puede cambiar libremente. Todo lo
                  demás está fijado. Cambiar el nonce cambia el hash entero, y eso es lo que se
                  repite una y otra vez.
                </Explica>
                <Explica titulo="Qué es una share">
                  Es un resultado que no llega a cerrar el bloque, pero cumple una exigencia más
                  baja que pone el pool. Sirve para demostrar cuánto trabajas: el pool cuenta las
                  shares de cada minero y reparte lo que obtiene en proporción.
                </Explica>
                <Explica titulo="Qué es la dificultad">
                  Es cuántos ceros se exigen al principio del hash. Cada cero adicional hace el
                  acierto unas dieciséis veces más raro, así que hacen falta muchos más intentos de
                  media.
                </Explica>
                <Explica titulo="Qué es un ASIC">
                  Es un ordenador construido con un único propósito: calcular hashes SHA-256 lo más
                  rápido posible. A diferencia de tu ordenador, no sirve para nada más — y por eso
                  es miles de veces más rápido en esta tarea concreta.
                </Explica>
                <Explica titulo="Qué es un pool de minería">
                  Muchos participantes prueban a la vez y reparten el resultado entre todos. En
                  solitario las probabilidades de acertar son mínimas, y podrías no encontrar nada
                  nunca.
                </Explica>
                <Link to="/diccionario" className="inline-flex min-h-[44px] items-center text-[15px] underline underline-offset-4">
                  Ver en el Diccionario
                </Link>
              </div>
            </Desplegable>
          </div>
        </section>

        <LaRedAhora indice="004" />
      </div>

      {/* Cierre bitono: ancho completo */}
      <section
        id="escala-real"
        className="relative mt-2 overflow-hidden lg:mt-6"
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

        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
          <div className="index-label" style={{ color: "var(--instrument-dark)" }}>
            005 / escala real
          </div>

          <h2 className="mt-3 max-w-2xl text-2xl sm:text-3xl" style={{ color: "var(--on-dark)" }}>
            Lo que acabas de ver, comparado con una máquina de verdad
          </h2>
          <p className="mt-4 max-w-2xl text-[16px]" style={{ color: "var(--on-dark-muted)" }}>
            Un ordenador normal, desde el navegador, prueba unas decenas de miles de combinaciones
            por segundo.
          </p>
          <p className="mt-4 max-w-2xl text-[16px]" style={{ color: "var(--on-dark)" }}>
            Lo que 1 PH/s hace en un segundo, a un ordenador normal le llevaría más de 1.500 años.
          </p>

          <dl
            className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4"
            style={{ backgroundColor: "var(--on-dark-border)" }}
          >
            <Comparativa
              etiqueta="Un ordenador"
              valor="≈ 20.000 intentos/s"
              cifraCompleta="Unas veinte mil combinaciones por segundo"
              nota="Lo que suele hacer un ordenador normal desde el navegador."
            />

            <Comparativa
              etiqueta="Antminer S21"
              valor="200 TH/s"
              cifraCompleta="Doscientos billones de hashes por segundo"
              nota="Un ASIC profesional habitual en la minería real."
            />
            <Comparativa
              etiqueta="Tu potencia"
              valor="200 TH/s – 1 PH/s"
              cifraCompleta="De 200 TH/s a 1 PH/s"
              nota="Lo que hacen de 1 a 5 máquinas similares en potencia a un Antminer S21, trabajando 24 h."
            />
            <Comparativa
              etiqueta="La red de Bitcoin"
              valor={`≈ ${formatInt(redEhs)} EH/s`}
              cifraCompleta={`Unos ${formatInt(redEhs)} trillones de hashes por segundo`}
              nota={
                red.origen === "directo"
                  ? "Todas las máquinas del mundo sumadas (el dato de arriba, en directo)."
                  : `Todas las máquinas del mundo sumadas (el dato de arriba, aproximado, ${red.fechaRespaldo}).`
              }
            />
          </dl>

          <p className="mt-8 max-w-2xl text-[15px]" style={{ color: "var(--on-dark-muted)" }}>
            Frente a la red entera, 1 PH/s es más o menos una millonésima. Le pasa lo mismo a
            cualquier minero, incluso a granjas con cientos de máquinas. Por eso la mayoría se une
            a pools: cada participante recibe en proporción a lo que aporta, sea grande o pequeño.
            En Solitario no hay reparto: o tu potencia encuentra un bloque entero, o no encuentra ninguno.
          </p>
          <p className="mt-4 max-w-2xl text-[15px]" style={{ color: "var(--on-dark-muted)" }}>
            Y tener esa potencia en casa no es realista: cinco máquinas similares en potencia a un
            Antminer S21 cuestan miles de euros cada una, consumen tanta electricidad como unas 40
            viviendas, hacen ruido día y noche y se quedan anticuadas en pocos años. Con{" "}
            {SERVICIO.marca} usas durante 24 horas la potencia de una a cinco máquinas similares en
            potencia a un Antminer S21, sin montar tu propio equipo.
          </p>
          <p className="mt-4 max-w-2xl text-[15px]" style={{ color: "var(--on-dark)" }}>
            Con 200 TH/s durante 24 h recibes unos 9.000 sats. Es una estimación, no está garantizada.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/minar"
              hash="potencia"
              className="inline-flex min-h-[44px] items-center px-5 text-[15px]"
              style={{
                backgroundColor: "var(--instrument-dark)",
                color: "var(--ink)",
              }}
            >
              Ver potencia
            </Link>
            <Link
              to="/aprende"
              className="inline-flex min-h-[44px] items-center border px-5 text-[15px]"
              style={{
                borderColor: "var(--instrument-dark)",
                color: "var(--instrument-dark)",
              }}
            >
              Sigue aprendiendo sobre minería
            </Link>
          </div>
        </div>
      </section>
    </main>
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
      <dd className="hash-text mt-2 text-xl" style={{ color: "var(--on-dark)" }}>
        {valor}
      </dd>
      {cifraCompleta && (
        <dd className="mt-1 text-[13px]" style={{ color: "var(--on-dark-muted)" }}>
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
