import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { SERVICIO, urlPublica } from "@/content/servicio";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  CORPORATE_MIN_PH,
  DESDE_EUROS_APROX,
  MAX_TH,
  MIN_TH,
  PASO_TH,
  ahorroFrenteABloques,
  formatearEntero,
  formatearEuros,
  maquinasDe,
  precioPedido,
  satsAprox,
  type ModoId,
  type ProductoId,
} from "@/lib/catalogo";
import { origen, registrar } from "@/lib/medicion";

const URL = urlPublica("/minar");
const TITULO = "Vive 24 h como minero de Bitcoin | Minar";
const DESC = `De 250 TH/s a 1 PH/s de potencia de cálculo durante 24 h, desde unos ${DESDE_EUROS_APROX}, IVA incluido. Próximamente.`;

export const Route = createFileRoute("/minar")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESC },
      { property: "og:title", content: "Vive 24 h como minero de Bitcoin" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Minar,
});

const { catalogo } = SERVICIO;

/* ───────────── Modos de minado ───────────── */

const MODOS: { id: ModoId; nombre: string }[] = [
  { id: "estable", nombre: "Estable" },
  { id: "mixto", nombre: "Mixto" },
  { id: "solitario", nombre: "Avanzado" },
];

function textoModo(modo: ModoId): string {
  if (modo === "estable")
    return "Cobras cada día por el trabajo entregado, en cantidades pequeñas.";
  if (modo === "solitario")
    return "Para quien ya sabe de minería: tú pones el pool donde quieres que trabaje la potencia. Mismo precio que el Estable. Lo que recibas depende del pool que elijas, así que no damos estimación.";
  return `12 h en modo estable y 12 h en solitario. Incluye ${formatearEuros(SERVICIO.modos.extraMixtoCentimos)} por el cambio de modo.`;
}

function textoSats(th: number, modo: ModoId): string | null {
  const s = satsAprox(th, modo);
  if (s === null) return null;
  const sats = formatearEntero(s);
  if (modo === "mixto")
    return `Unos ${sats} sats aproximados en las 12 h en modo estable. En las 12 h en solitario, lo normal es nada; si tu potencia encuentra un bloque, unos ${formatearEntero(SERVICIO.catalogo.recompensaBloqueSats)} sats (3,125 BTC más comisiones)`;
  return `Unos ${sats} sats aproximados`;
}

function SelectorModo({
  modo,
  onCambio,
}: {
  modo: ModoId;
  onCambio: (m: ModoId) => void;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="text-[13px] text-muted-foreground">Modo de minado</legend>
      <div className="mt-2 grid grid-cols-3 border border-border">
        {MODOS.map((m, i) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={modo === m.id}
            onClick={() => onCambio(m.id)}
            className={`min-h-[44px] px-2 text-[14px] ${i > 0 ? "border-l border-border" : ""} ${
              modo === m.id ? "bg-foreground text-background" : ""
            }`}
          >
            {m.nombre}
          </button>
        ))}
      </div>
      <p className="mt-3 min-h-[3lh] text-[14px] leading-relaxed text-muted-foreground">
        {textoModo(modo)}
      </p>
    </fieldset>
  );
}

/* ───────────── Piezas comunes ───────────── */

function Proximamente({ oscuro = false }: { oscuro?: boolean }) {
  return (
    <span
      className={`hash-text inline-block border px-2 py-0.5 text-[11px] tracking-[0.06em] ${
        oscuro
          ? "border-[var(--on-dark-border)] text-[var(--on-dark-muted)]"
          : "border-border text-muted-foreground"
      }`}
    >
      PRÓXIMAMENTE
    </span>
  );
}

function Pregunta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <details className="border-t border-border py-4">
      <summary className="cursor-pointer list-none text-[16px]">{titulo}</summary>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{children}</p>
    </details>
  );
}

/* ───────────── Aviso "Comprar" con lista de espera ───────────── */

interface Seleccion {
  producto: ProductoId;
  modo: ModoId | null;
  /** TH/s elegidos (en corporate, PH/s × 1.000). */
  cantidad: number;
}

const PARA_QUIEN = {
  particular: [
    { id: "para_mi", texto: "Para mí" },
    { id: "regalo", texto: "Para regalar" },
  ],
  empresa: [
    { id: "para_mi", texto: "Para la empresa" },
    { id: "regalo", texto: "Para regalar (equipo, clientes…)" },
  ],
} as const;

const CUANDO = [
  { id: "ya", texto: "Lo antes posible" },
  { id: "este_mes", texto: "Este mes" },
  { id: "navidad", texto: "Para Navidad" },
  { id: "sin_prisa", texto: "Sin prisa" },
] as const;

function Opciones<T extends string>({
  nombre,
  etiqueta,
  opciones,
  valor,
  onCambio,
}: {
  nombre: string;
  etiqueta: string;
  opciones: readonly { id: T; texto: string }[];
  valor: T | null;
  onCambio: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[13px]">{etiqueta}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map((o) => (
          <label
            key={o.id}
            className={`inline-flex min-h-[40px] cursor-pointer items-center border px-3 text-[14px] ${
              valor === o.id ? "border-foreground bg-foreground text-background" : "border-border"
            }`}
          >
            <input
              type="radio"
              name={nombre}
              value={o.id}
              checked={valor === o.id}
              onChange={() => onCambio(o.id)}
              className="sr-only"
            />
            {o.texto}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function resumenSeleccion(s: Seleccion): string {
  const modo = s.modo ? ` · modo ${MODOS.find((m) => m.id === s.modo)?.nombre.toLowerCase()}` : "";
  if (s.producto === "corporate") return `Corporate · ${s.cantidad / 1000} PH/s`;
  return `${formatearEntero(s.cantidad)} TH/s · 24 h${modo} · ${formatearEuros(precioPedido(s.cantidad, s.modo ?? "estable"))}`;
}

function AvisoComprar({
  seleccion,
  onCerrar,
}: {
  seleccion: Seleccion | null;
  onCerrar: () => void;
}) {
  const [email, setEmail] = useState("");
  const [paraQuien, setParaQuien] = useState<"para_mi" | "regalo" | null>(null);
  const [cuando, setCuando] = useState<(typeof CUANDO)[number]["id"] | null>(null);
  const [ph, setPh] = useState<number>(CORPORATE_MIN_PH);
  const [modoCorp, setModoCorp] = useState<ModoId | "no_se" | null>(null);
  const [acepta, setAcepta] = useState(false);
  const [estado, setEstado] = useState<"listo" | "enviando" | "hecho">("listo");
  const [error, setError] = useState<string | null>(null);

  // Al abrir con otro producto, el formulario empieza de cero.
  useEffect(() => {
    if (seleccion) {
      setEstado("listo");
      setError(null);
      setParaQuien(null);
      setCuando(null);
      setModoCorp(null);
      setPh(CORPORATE_MIN_PH);
    }
  }, [seleccion]);

  const empresa = seleccion?.producto === "corporate";
  const tipo = empresa ? "empresa" : "particular";
  const valido =
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) &&
    acepta &&
    paraQuien !== null &&
    cuando !== null &&
    (!empresa || (modoCorp !== null && Number.isInteger(ph) && ph >= CORPORATE_MIN_PH));

  async function enviar() {
    if (!seleccion || !valido || estado === "enviando") return;
    setEstado("enviando");
    setError(null);
    const { error: err } = await supabase.from("lista_espera").insert({
      email: email.trim().toLowerCase(),
      tipo,
      producto: seleccion.producto,
      cantidad: empresa ? ph * 1000 : seleccion.cantidad,
      modo: empresa ? modoCorp : seleccion.modo,
      para_quien: paraQuien,
      cuando,
      ...origen(),
    });
    if (err) {
      setError("No hemos podido guardar tu email. Inténtalo otra vez en un momento.");
      setEstado("listo");
      return;
    }
    setEstado("hecho");
  }

  return (
    <Dialog open={seleccion !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-32px)] overflow-y-auto rounded-none border-border p-6">
        {estado === "hecho" ? (
          <div>
            <DialogTitle className="text-xl font-normal">Hecho</DialogTitle>
            <DialogDescription className="mt-2 text-[15px]">
              Te avisaremos en cuanto abramos.
            </DialogDescription>
            <button
              type="button"
              onClick={onCerrar}
              className="mt-6 min-h-[44px] border border-border px-5 text-[15px]"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="pr-6">
              <DialogTitle className="text-xl font-normal">Disponible muy pronto</DialogTitle>
              <DialogDescription className="mt-2 text-[15px] text-muted-foreground">
                Déjanos tu email y te avisamos en cuanto abramos.
              </DialogDescription>
              {seleccion && !empresa && (
                <p className="hash-text mt-3 text-[13px]">{resumenSeleccion(seleccion)}</p>
              )}
            </div>

            <div>
              <label htmlFor="email-aviso" className="block text-[13px]">
                {empresa ? "Email de contacto" : "Tu email"}
              </label>
              <input
                id="email-aviso"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
                className="mt-2 min-h-[44px] w-full border border-border bg-transparent px-3 text-[15px] outline-none focus:border-foreground"
              />
            </div>

            {empresa && (
              <>
                <div>
                  <label htmlFor="ph-corporate" className="block text-[13px]">
                    Potencia aproximada (PH/s)
                  </label>
                  <input
                    id="ph-corporate"
                    type="number"
                    min={CORPORATE_MIN_PH}
                    step={1}
                    value={ph}
                    onChange={(e) => setPh(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
                    className="hash-text mt-2 min-h-[44px] w-full border border-border bg-transparent px-3 text-[15px] outline-none focus:border-foreground"
                  />
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Mínimo {CORPORATE_MIN_PH} PH/s. Presupuesto a medida, confirmado el día del
                    pedido.
                  </p>
                </div>
                <Opciones
                  nombre="modo-corp"
                  etiqueta="Modo de minado"
                  opciones={[
                    { id: "estable", texto: "Estable" },
                    { id: "mixto", texto: "Mixto" },
                    { id: "solitario", texto: "Avanzado" },
                    { id: "no_se", texto: "No lo sé" },
                  ]}
                  valor={modoCorp}
                  onCambio={setModoCorp}
                />
              </>
            )}

            <Opciones
              nombre="para-quien"
              etiqueta={empresa ? "¿Para quién es?" : "¿Es para ti o para regalar?"}
              opciones={PARA_QUIEN[tipo]}
              valor={paraQuien}
              onCambio={setParaQuien}
            />

            <Opciones
              nombre="cuando"
              etiqueta="¿Para cuándo lo querrías?"
              opciones={CUANDO}
              valor={cuando}
              onCambio={setCuando}
            />

            <label className="flex items-start gap-3 text-[13px] leading-relaxed">
              <input
                type="checkbox"
                checked={acepta}
                onChange={(e) => setAcepta(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-current"
              />
              <span>
                Acepto que guardéis mi email y mis respuestas para avisarme de la apertura.{" "}
                <Link to="/privacidad" className="text-primary underline underline-offset-4">
                  Privacidad
                </Link>
              </span>
            </label>

            {error && <p className="text-[13px]">{error}</p>}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={enviar}
                disabled={!valido || estado === "enviando"}
                className="min-h-[44px] bg-primary px-5 text-[15px] text-primary-foreground disabled:opacity-40"
              >
                {estado === "enviando" ? "Enviando" : "Avisadme"}
              </button>
              <p className="text-[12px] text-muted-foreground">Sin pagos ni datos de tarjeta.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ───────────── Página ───────────── */

function Minar() {
  const [th, setTh] = useState<number>(MIN_TH);
  const [modo, setModo] = useState<ModoId>("estable");
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);

  useEffect(() => {
    registrar({ tipo: "visita" });
  }, []);

  function cambiarModo(m: ModoId) {
    setModo(m);
    registrar({ tipo: "cambio_modo", producto: "potencia", modo: m });
  }

  function comprar(s: Seleccion) {
    registrar({ tipo: "clic_comprar", producto: s.producto, modo: s.modo, cantidad: s.cantidad });
    setSeleccion(s);
  }

  const sats = textoSats(th, modo);
  const ahorro = ahorroFrenteABloques(th, modo);

  return (
    <main>
      {/* 001 / minar */}
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-12 sm:px-8">
        <div className="index-label">001 / minar</div>
        <h1 className="mt-3 text-3xl sm:text-4xl">Potencia verificable</h1>
        <p className="mt-4 text-[17px] text-muted-foreground">
          Eliges la potencia y durante 24 horas mina en la red real de Bitcoin. Sin contratos, sin
          permanencia y sin promesas de rentabilidad. De lo técnico nos encargamos nosotros.
        </p>
        <p className="mt-6 border-l-2 border-primary pl-4 text-[15px]">
          Todavía no se puede comprar: déjanos tu email y te avisamos en cuanto abramos.
        </p>
      </section>

      {/* 002 / potencia */}
      <section id="potencia" className="mx-auto max-w-3xl scroll-mt-4 px-5 pb-16 sm:px-8">
        <div className="index-label">002 / elige tu potencia</div>
        <article className="mt-6 flex flex-col border-2 border-primary p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl">Elige tu potencia</h2>
            <Proximamente />
          </div>
          <p className="mt-2 text-[16px]">
            <span className="hash-text">{formatearEntero(th)} TH/s</span> de potencia de cálculo
            durante 24 h
          </p>
          <div className="mt-4 h-1 w-full bg-border" aria-hidden="true">
            <div className="h-1 bg-primary" style={{ width: `${Math.round((th / 1000) * 100)}%` }} />
          </div>

          <div className="mt-5">
            <label htmlFor="potencia-th" className="text-[13px] text-muted-foreground">
              Potencia (TH/s)
            </label>
            <input
              id="potencia-th"
              type="range"
              min={MIN_TH}
              max={MAX_TH}
              step={PASO_TH}
              value={th}
              onChange={(e) => setTh(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--primary)]"
            />
            <div className="hash-text mt-1 flex justify-between text-[12px] text-muted-foreground">
              <span>{formatearEntero(MIN_TH)} TH/s</span>
              <span>1 PH/s</span>
            </div>
          </div>

          <SelectorModo modo={modo} onCambio={cambiarModo} />

          <div className="pt-4">
            <p className="hash-text text-2xl">{formatearEuros(precioPedido(th, modo))}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">IVA incluido, sin cuotas aparte</p>
            {sats && (
              <>
                <p className="hash-text mt-4 text-[14px]">{sats}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Estimación a {SERVICIO.catalogo.fechaEstimacion}, no garantizada.
                </p>
              </>
            )}

            <p className="mt-4 border border-primary p-3 text-[14px] text-primary">
              {ahorro
                ? `Comprar en un solo pedido sale más barato: ${formatearEuros(ahorro.junto)} frente a ${formatearEuros(ahorro.separado)} en ${ahorro.pedidos} pedidos de ${formatearEntero(MIN_TH)} TH/s (${formatearEuros(ahorro.ahorro)} menos).`
                : "Más potencia en un solo pedido sale más barato por TH/s."}
            </p>

            <button
              type="button"
              onClick={() => comprar({ producto: "potencia", modo, cantidad: th })}
              className="mt-5 min-h-[44px] w-full bg-primary px-5 text-[15px] text-primary-foreground"
            >
              Apuntarme a la lista de espera
            </button>
          </div>
        </article>

        <p className="mt-8 text-[14px] leading-relaxed text-muted-foreground">
          No es un producto financiero ni una inversión: compras potencia de minería real durante
          24 horas. En modo estable, lo normal es recibir en sats menos de lo que pagas. En las
          horas en solitario, lo normal es no recibir nada; solo si tu potencia encuentra un bloque
          recibirías la recompensa completa, y la probabilidad es muy baja. En Avanzado depende de
          tu pool. Ningún resultado está garantizado. Si en algún momento llega menos potencia, la
          sesión se alarga hasta entregar toda la contratada.{" "}
          <Link to="/simulador" className="underline underline-offset-4">
            Pruébalo antes en el simulador
          </Link>
          .
        </p>
      </section>

      {/* 003 / corporate */}
      <section id="corporate" className="scroll-mt-4 bg-[var(--ink)] text-[var(--on-dark)]">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <div className="hash-text text-[11px] tracking-[0.08em] text-[var(--on-dark-muted)]">
            003 / empresas y regalos
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <h2 className="text-2xl sm:text-3xl">{catalogo.corporate.nombre}</h2>
            <Proximamente oscuro />
          </div>
          <p className="hash-text mt-4 text-[17px]">Más de 1 PH/s, con presupuesto a medida</p>
          <ul className="mt-6 space-y-3 text-[15px]">
            <li className="border-t border-[var(--on-dark-border)] pt-3">
              Para regalar a tu equipo, a tus clientes o en eventos: un código de regalo por
              persona, que cada uno activa con su cuenta.
            </li>
            <li className="border-t border-[var(--on-dark-border)] pt-3">
              Factura a nombre de la empresa.
            </li>
            <li className="border-y border-[var(--on-dark-border)] py-3">
              Presupuesto confirmado el día del pedido.
            </li>
          </ul>
          <button
            type="button"
            onClick={() =>
              comprar({ producto: "corporate", modo: null, cantidad: CORPORATE_MIN_PH * 1000 })
            }
            className="mt-8 min-h-[44px] w-full border border-[var(--instrument-dark)] px-5 text-[15px] text-[var(--instrument-dark)] sm:w-auto"
          >
            Pedir presupuesto
          </button>
        </div>
      </section>

      {/* 004 / preguntas */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="index-label">004 / preguntas</div>
        <div className="mt-6">
          <Pregunta titulo="¿Qué es 250 TH/s?">
            250 billones de intentos por segundo: la potencia de un minero profesional actual.
            Puedes elegir desde 250 TH/s hasta 1 PH/s (1.000 TH/s).
          </Pregunta>
          <Pregunta titulo="¿Qué modo elijo?">
            Estable, si quieres recibir sats cada día por el trabajo entregado. Mixto reparte las 24
            horas entre el modo estable y el solitario. Avanzado, si ya sabes de minería y quieres
            elegir tú el pool donde trabaja la potencia.
          </Pregunta>
          <Pregunta titulo="¿Qué necesito?">
            Una wallet de Bitcoin para recibir. Te guiamos paso a paso para configurarla; del resto
            nos encargamos nosotros.
          </Pregunta>
          <Pregunta titulo="¿Se puede regalar?">
            Sí. Cuando te apuntes, indica que es para regalar y te avisaremos de cómo hacerlo al
            abrir.
          </Pregunta>
          <Pregunta titulo="¿Cuándo se puede comprar?">
            Estamos preparando la apertura. Déjanos tu email y te avisamos en cuanto abramos.
          </Pregunta>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <Link to="/simulador" className="text-[15px] text-primary underline underline-offset-4">
            Volver al simulador
          </Link>
        </div>
      </section>

      <AvisoComprar seleccion={seleccion} onCerrar={() => setSeleccion(null)} />
    </main>
  );
}
