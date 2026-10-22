import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { SERVICIO } from "@/content/servicio";
import { IconoMaquina } from "@/components/Maquinas";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  AHORRO_PACK_PCT,
  CORPORATE_DESDE_CENTIMOS,
  CORPORATE_DESDE_PH,
  MAX_SUELTAS,
  PRECIO_PACK,
  PRECIO_PH_CORPORATE,
  PRECIO_UNIDAD,
  UNIDADES_PACK,
  formatearEntero,
  formatearEuros,
  potenciaTH,
  precioPedido,
  satsAprox,
  unidadesDe,
  unoEntreBloque,
  type ModoId,
  type ProductoId,
} from "@/lib/catalogo";
import { origen, registrar } from "@/lib/medicion";

const URL = "https://bit-block-explorer.lovable.app/minar";
const TITULO = "Vive 24 h como minero de Bitcoin | Minar";
const DESC = `250 TH/s de potencia de cálculo durante 24 h por ${SERVICIO.catalogo.unidad.precio}, IVA incluido. Sin comprar la máquina ni pagar la luz. Próximamente.`;

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

const MODOS: { id: ModoId; nombre: string; avanzado: boolean }[] = [
  { id: "estable", nombre: "Estable", avanzado: false },
  { id: "solitario", nombre: "Solitario", avanzado: true },
  { id: "mixto", nombre: "Mixto", avanzado: true },
];

function textoModo(modo: ModoId, unidades: number): string {
  if (modo === "estable")
    return "Cobras cada día por el trabajo entregado, en cantidades pequeñas.";
  if (modo === "solitario")
    return `Toda la potencia mina por su cuenta. Lo normal es no recibir nada; solo si tu potencia encuentra un bloque recibes la recompensa completa. Probabilidad aproximada: 1 entre ${formatearEntero(unoEntreBloque(unidades, "solitario"))}.`;
  return `12 h en modo estable y 12 h en solitario. Probabilidad aproximada de bloque: 1 entre ${formatearEntero(unoEntreBloque(unidades, "mixto"))}. Incluye ${SERVICIO.modos.extraMixto} por el cambio de modo.`;
}

function textoSats(producto: "unidad" | "pack", cantidad: number, modo: ModoId): string {
  const sats = formatearEntero(satsAprox(producto, cantidad, modo));
  if (modo === "estable") return `Unos ${sats} sats aproximados`;
  if (modo === "mixto") return `Unos ${sats} sats aproximados en las 12 h en modo estable`;
  return "Lo normal: 0 sats. Si tu potencia encuentra un bloque: la recompensa completa";
}

function SelectorModo({
  modo,
  onCambio,
  unidades,
}: {
  modo: ModoId;
  onCambio: (m: ModoId) => void;
  unidades: number;
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
            {m.avanzado && (
              <span
                className={`block text-[10px] ${modo === m.id ? "opacity-70" : "text-muted-foreground"}`}
              >
                avanzado
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-3 min-h-[3lh] text-[14px] leading-relaxed text-muted-foreground">
        {textoModo(modo, unidades)}
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

function Mineros({ n }: { n: number }) {
  return (
    <div className="mt-4" aria-hidden="true">
      <div className="flex flex-wrap gap-2 text-primary">
        {Array.from({ length: n }, (_, i) => (
          <IconoMaquina key={i} indice={i} />
        ))}
      </div>
    </div>
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
  /** Unidades (unidad/pack) o PH/s (corporate). */
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
  if (s.producto === "corporate") return `Corporate · ${s.cantidad} PH/s`;
  if (s.producto === "pack")
    return `Pack 1 PH/s · 24 h${modo} · ${formatearEuros(precioPedido("pack", 1, s.modo ?? "estable"))}`;
  const th = formatearEntero(potenciaTH(s.cantidad));
  const n = s.cantidad === 1 ? "1 unidad" : `${s.cantidad} unidades`;
  return `${n} (${th} TH/s) · 24 h${modo} · ${formatearEuros(precioPedido("unidad", s.cantidad, s.modo ?? "estable"))}`;
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
  const [ph, setPh] = useState<number>(CORPORATE_DESDE_PH);
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
      setPh(CORPORATE_DESDE_PH);
    }
  }, [seleccion]);

  const empresa = seleccion?.producto === "corporate";
  const tipo = empresa ? "empresa" : "particular";
  const valido =
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) &&
    acepta &&
    paraQuien !== null &&
    cuando !== null &&
    (!empresa || (modoCorp !== null && ph >= CORPORATE_DESDE_PH));

  async function enviar() {
    if (!seleccion || !valido || estado === "enviando") return;
    setEstado("enviando");
    setError(null);
    const { error: err } = await supabase.from("lista_espera").insert({
      email: email.trim().toLowerCase(),
      tipo,
      producto: seleccion.producto,
      cantidad: empresa ? ph : seleccion.cantidad,
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
              Te avisaremos el primero en cuanto abramos.
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
                Déjanos tu email y te avisamos el primero.
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
                    min={CORPORATE_DESDE_PH}
                    step={1}
                    value={ph}
                    onChange={(e) => setPh(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
                    className="hash-text mt-2 min-h-[44px] w-full border border-border bg-transparent px-3 text-[15px] outline-none focus:border-foreground"
                  />
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Desde {CORPORATE_DESDE_PH} PH/s. Referencia:{" "}
                    {formatearEuros(PRECIO_PH_CORPORATE * Math.max(ph, CORPORATE_DESDE_PH))}, IVA
                    incluido.
                  </p>
                </div>
                <Opciones
                  nombre="modo-corp"
                  etiqueta="Modo de minado"
                  opciones={[
                    { id: "estable", texto: "Estable" },
                    { id: "solitario", texto: "Solitario" },
                    { id: "mixto", texto: "Mixto" },
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
  const [modoUnidad, setModoUnidad] = useState<ModoId>("estable");
  const [cantidad, setCantidad] = useState(1);
  const [modoPack, setModoPack] = useState<ModoId>("estable");
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);

  useEffect(() => {
    registrar({ tipo: "visita" });
  }, []);

  function cambiarModo(producto: "unidad" | "pack", m: ModoId) {
    if (producto === "unidad") setModoUnidad(m);
    else setModoPack(m);
    registrar({ tipo: "cambio_modo", producto, modo: m });
  }

  function comprar(s: Seleccion) {
    registrar({ tipo: "clic_comprar", producto: s.producto, modo: s.modo, cantidad: s.cantidad });
    setSeleccion(s);
  }

  const precioUnidad = precioPedido("unidad", cantidad, modoUnidad);
  const diferenciaPack = PRECIO_PACK - PRECIO_UNIDAD * MAX_SUELTAS;

  return (
    <main>
      {/* 001 / minar */}
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-12 sm:px-8">
        <div className="index-label">001 / minar</div>
        <h1 className="mt-3 text-3xl sm:text-4xl">Vive 24 h como minero de Bitcoin</h1>
        <p className="mt-4 text-[17px] text-muted-foreground">
          Sin comprar la máquina ni pagar la luz. Eliges la potencia y durante 24 horas minas en la
          red real de Bitcoin. De lo técnico nos encargamos nosotros.
        </p>
        <p className="mt-6 border-l-2 border-primary pl-4 text-[15px]">
          Estamos preparando la apertura. Todavía no se puede comprar: pulsa «Comprar», déjanos tu
          email y te avisamos el primero.
        </p>
      </section>

      {/* 002 / potencia */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        <div className="index-label">002 / elige tu potencia</div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Unidad */}
          <article className="flex flex-col border border-border p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl">{catalogo.unidad.nombre}</h2>
              <Proximamente />
            </div>
            <p className="mt-2 text-[16px]">
              {formatearEntero(potenciaTH(cantidad))} TH/s de potencia de cálculo durante 24 h
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {cantidad === 1
                ? "Potencia equivalente a un minero profesional"
                : `Potencia equivalente a ${cantidad} mineros profesionales`}
            </p>
            <Mineros n={cantidad} />

            <fieldset className="mt-5">
              <legend className="text-[13px] text-muted-foreground">Unidades de 250 TH/s</legend>
              <div className="mt-2 inline-grid grid-cols-3 border border-border">
                {Array.from({ length: MAX_SUELTAS }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={cantidad === n}
                    onClick={() => setCantidad(n)}
                    className={`hash-text min-h-[44px] min-w-[52px] text-[15px] ${n > 1 ? "border-l border-border" : ""} ${
                      cantidad === n ? "bg-foreground text-background" : ""
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>

            <SelectorModo
              modo={modoUnidad}
              onCambio={(m) => cambiarModo("unidad", m)}
              unidades={cantidad}
            />

            <div className="mt-auto pt-4">
              <p className="hash-text text-2xl">{formatearEuros(precioUnidad)}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                IVA incluido, sin cuotas aparte
              </p>
              <p className="hash-text mt-4 text-[14px]">
                {textoSats("unidad", cantidad, modoUnidad)}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Estimación a {catalogo.fechaEstimacion}, no garantizada.
              </p>

              {cantidad === MAX_SUELTAS && (
                <a
                  href="#pack"
                  className="mt-4 block border border-primary p-3 text-[14px] text-primary"
                >
                  Mina con 1 PH/s = 1.000 TH/s por {formatearEuros(diferenciaPack)} más →
                </a>
              )}

              <button
                type="button"
                onClick={() => comprar({ producto: "unidad", modo: modoUnidad, cantidad })}
                className="mt-5 min-h-[44px] w-full border border-foreground px-5 text-[15px]"
              >
                Comprar
              </button>
            </div>
          </article>

          {/* Pack 1 PH/s (destacado) */}
          <article
            id="pack"
            className="relative flex scroll-mt-4 flex-col border-2 border-primary p-6"
          >
            <span className="hash-text absolute -top-3 left-5 bg-primary px-2 py-0.5 text-[11px] tracking-[0.06em] text-primary-foreground">
              RECOMENDADO
            </span>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl">{catalogo.pack.nombre}</h2>
              <Proximamente />
            </div>
            <p className="mt-2 text-[16px]">
              1 PH/s = 1.000 TH/s de potencia de cálculo durante 24 h
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {UNIDADES_PACK} unidades · potencia equivalente a {UNIDADES_PACK} mineros
              profesionales
            </p>
            <Mineros n={UNIDADES_PACK} />
            <p className="mt-5 text-[14px] text-primary">
              Un {AHORRO_PACK_PCT} % más barato que {UNIDADES_PACK} unidades sueltas (
              <span className="hash-text line-through">
                {formatearEuros(PRECIO_UNIDAD * UNIDADES_PACK)}
              </span>
              )
            </p>

            <SelectorModo
              modo={modoPack}
              onCambio={(m) => cambiarModo("pack", m)}
              unidades={UNIDADES_PACK}
            />

            <div className="mt-auto pt-4">
              <p className="hash-text text-2xl">
                {formatearEuros(precioPedido("pack", 1, modoPack))}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                IVA incluido, sin cuotas aparte
              </p>
              <p className="hash-text mt-4 text-[14px]">{textoSats("pack", 1, modoPack)}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Estimación a {catalogo.fechaEstimacion}, no garantizada.
              </p>
              <button
                type="button"
                onClick={() =>
                  comprar({ producto: "pack", modo: modoPack, cantidad: UNIDADES_PACK })
                }
                className="mt-5 min-h-[44px] w-full bg-primary px-5 text-[15px] text-primary-foreground"
              >
                Comprar
              </button>
            </div>
          </article>
        </div>

        <p className="mt-8 text-[14px] leading-relaxed text-muted-foreground">
          Es una experiencia, no un producto financiero. {SERVICIO.transparencia} y no está
          garantizado. Si en algún momento llega algo menos de potencia, la sesión se alarga un poco
          hasta completar el trabajo.{" "}
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
          <p className="hash-text mt-4 text-[17px]">
            Desde {CORPORATE_DESDE_PH} PH/s · {formatearEuros(PRECIO_PH_CORPORATE)} por PH/s
          </p>
          <p className="mt-1 text-[13px] text-[var(--on-dark-muted)]">
            Desde {formatearEuros(CORPORATE_DESDE_CENTIMOS)}, IVA incluido. Mismo precio por PH/s
            que el pack.
          </p>
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
              comprar({ producto: "corporate", modo: null, cantidad: CORPORATE_DESDE_PH })
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
            250 billones de intentos por segundo: la potencia de un minero profesional actual. El
            pack de 1 PH/s son 1.000 TH/s, cuatro veces más.
          </Pregunta>
          <Pregunta titulo="¿Qué modo elijo?">
            Estable, si quieres recibir sats cada día por el trabajo entregado. Solitario, si
            prefieres que toda la potencia busque un bloque por su cuenta: lo normal es no recibir
            nada, y muy de vez en cuando se encuentra uno. Mixto reparte las 24 horas entre los dos.
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
            Estamos preparando la apertura. Déjanos tu email y te avisamos el primero.
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
