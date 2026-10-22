import { createFileRoute, Link } from "@tanstack/react-router";

import { IconoMaquina } from "@/components/Maquinas";
import { GLOSARIO } from "@/content/glosario";
import { CAPITULOS } from "@/content/mining101";
import { SERVICIO } from "@/content/servicio";
import {
  AHORRO_PACK_PCT,
  CORPORATE_DESDE_PH,
  PRECIO_PACK,
  PRECIO_PH_CORPORATE,
  PRECIO_UNIDAD,
  UNIDADES_PACK,
  formatearEuros,
} from "@/lib/catalogo";

const URL = "https://bit-block-explorer.lovable.app/";
const TITULO = `${SERVICIO.marca} | Mina Bitcoin sin tener máquinas`;
const DESC =
  "Vive 24 h como minero de Bitcoin sin comprar la máquina ni pagar la luz. Potencia de cálculo profesional, en euros y en español.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESC },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Inicio,
});

const botonPrimario =
  "inline-flex min-h-[44px] items-center justify-center bg-primary px-5 text-[15px] text-primary-foreground";
const botonSecundario =
  "inline-flex min-h-[44px] items-center justify-center border border-border px-5 text-[15px]";

const PASOS = [
  {
    titulo: "Eliges tu potencia",
    texto: `Una unidad de ${SERVICIO.catalogo.unidad.potenciaTH} TH/s o el pack de 1 PH/s, durante 24 horas.`,
  },
  {
    titulo: "Pones tu wallet",
    texto:
      "Solo la dirección. Ni pool, ni configuración, ni datos técnicos: de eso nos encargamos nosotros.",
  },
  {
    titulo: "Tu potencia mina",
    texto: "Durante la sesión, máquinas profesionales trabajan para ti en la red de Bitcoin real.",
  },
];

const CONFIANZA = [
  {
    titulo: "Tu wallet, tus fondos",
    texto:
      "Nunca te pedimos la frase de recuperación ni guardamos tus bitcoins. Solo necesitas una dirección para recibir.",
  },
  {
    titulo: "Potencia industrial",
    texto:
      "Máquinas profesionales en instalaciones preparadas para ello. Sin ruido en casa, sin factura de luz, sin mantenimiento.",
  },
  {
    titulo: "Claridad desde el principio",
    texto: `${SERVICIO.transparencia} y no está garantizado. Lo que compras es la experiencia de minar Bitcoin de verdad, no un producto financiero.`,
  },
];

function Inicio() {
  return (
    <main>
      {/* 001 / portada */}
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24">
        <div className="index-label">001 / {SERVICIO.marca.toLowerCase()}</div>
        <p className="mt-3 text-[15px] text-primary">{SERVICIO.lema}</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
          Mina Bitcoin de verdad, sin tener ni una máquina
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] text-muted-foreground">
          Hasta ahora, minar exigía comprar equipos de miles de euros, aguantar el ruido y pagar la
          luz. Con {SERVICIO.marca} accedes a potencia de minería profesional durante 24 horas, en
          euros y desde cualquier móvil.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/minar" className={botonPrimario}>
            Ver la potencia
          </Link>
          <Link to="/simulador" className={botonSecundario}>
            Prueba el simulador
          </Link>
        </div>
      </section>

      {/* 002 / potencia */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        <div className="index-label">002 / potencia</div>
        <h2 className="mt-3 text-2xl sm:text-3xl">
          Potencia profesional, al alcance de cualquiera
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[
            {
              nombre: SERVICIO.catalogo.unidad.nombre,
              linea: `${SERVICIO.catalogo.unidad.potenciaTH} TH/s · 24 horas`,
              apoyo: "Potencia equivalente a un minero profesional",
              n: 1,
              precio: PRECIO_UNIDAD,
              destacado: false,
            },
            {
              nombre: SERVICIO.catalogo.pack.nombre,
              linea: "1.000 TH/s · 24 horas",
              apoyo: `Un ${AHORRO_PACK_PCT} % más barato que ${UNIDADES_PACK} unidades`,
              n: UNIDADES_PACK,
              precio: PRECIO_PACK,
              destacado: true,
            },
          ].map((p) => (
            <Link
              key={p.nombre}
              to="/minar"
              hash={p.destacado ? "pack" : "minar"}
              className={`block p-6 hover:border-foreground ${p.destacado ? "border-2 border-primary" : "border border-border"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl">{p.nombre}</h3>
                <span className="hash-text border border-border px-2 py-0.5 text-[11px] tracking-[0.06em] text-muted-foreground">
                  PRÓXIMAMENTE
                </span>
              </div>
              <p className="hash-text mt-2 text-[13px] text-muted-foreground">{p.linea}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-primary" aria-hidden="true">
                {Array.from({ length: p.n }, (_, i) => (
                  <IconoMaquina key={i} indice={i} />
                ))}
              </div>
              <p className="mt-3 text-[13px] text-muted-foreground">{p.apoyo}</p>
              <p className="hash-text mt-4 text-2xl">{formatearEuros(p.precio)}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">IVA incluido</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 003 / cómo funciona */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        <div className="index-label">003 / cómo funciona</div>
        <ol className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="border-t border-border pt-4">
              <span className="hash-text text-[13px] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-1 text-[17px]">{p.titulo}</p>
              <p className="mt-2 text-[15px] text-muted-foreground">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 004 / confianza */}
      <section className="bg-[var(--ink)] text-[var(--on-dark)]">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <div className="hash-text text-[11px] tracking-[0.08em] text-[var(--on-dark-muted)]">
            004 / por qué fiarte
          </div>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {CONFIANZA.map((c) => (
              <div key={c.titulo}>
                <p className="text-[17px]">{c.titulo}</p>
                <p className="mt-2 text-[15px] text-[var(--on-dark-muted)]">{c.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 005 / aprende */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="index-label">005 / antes de empezar</div>
        <h2 className="mt-3 text-2xl sm:text-3xl">Entiende lo que haces</h2>
        <ul className="mt-6">
          <li className="border-t border-border">
            <Link to="/simulador" className="block py-5 hover:opacity-80">
              <span className="block text-xl">Simulador</span>
              <span className="mt-1 block text-[15px] text-muted-foreground">
                Mina un bloque en tu navegador y mira la prueba de trabajo en directo.
              </span>
            </Link>
          </li>
          <li className="border-t border-border">
            <Link to="/aprende" className="block py-5 hover:opacity-80">
              <span className="block text-xl">Aprende</span>
              <span className="mt-1 block text-[15px] text-muted-foreground">
                {CAPITULOS.length} capítulos cortos y un test final. Si lo apruebas, te llevas un
                certificado con un {SERVICIO.certificado.descuentoPct} % de descuento de
                lanzamiento.
              </span>
            </Link>
          </li>
          <li className="border-y border-border">
            <Link to="/diccionario" className="block py-5 hover:opacity-80">
              <span className="block text-xl">Diccionario</span>
              <span className="mt-1 block text-[15px] text-muted-foreground">
                {GLOSARIO.length} términos de Bitcoin y minería explicados desde cero.
              </span>
            </Link>
          </li>
        </ul>
      </section>

      {/* 006 / grupos y empresas */}
      <section className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col gap-4 border border-primary p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl">Grupos, empresas y regalos</p>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Desde {CORPORATE_DESDE_PH} PH/s, a {formatearEuros(PRECIO_PH_CORPORATE)} por PH/s.
              Para tu equipo, tus clientes o para regalar.
            </p>
          </div>
          <Link to="/minar" hash="corporate" className={`${botonPrimario} shrink-0`}>
            Pedir presupuesto
          </Link>
        </div>
      </section>
    </main>
  );
}
