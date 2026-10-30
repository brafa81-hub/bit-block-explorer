import { createFileRoute, Link } from "@tanstack/react-router";

import { GLOSARIO } from "@/content/glosario";
import { CAPITULOS } from "@/content/mining101";
import { SERVICIO, urlPublica } from "@/content/servicio";
import { DESDE_EUROS_APROX } from "@/lib/catalogo";

const URL = urlPublica("/");
const TITULO = `${SERVICIO.marca} | Potencia de minería de Bitcoin durante 24 horas`;
const DESC =
  "Elige entre 250 TH/s y 1 PH/s y mina Bitcoin durante 24 horas en la red real. Lo que se genere va directo a tu wallet.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESC },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
    texto: "Eliges tu potencia, de 250 TH/s a 1 PH/s, durante 24 horas.",
  },
  {
    titulo: "Eliges tu modo",
    texto:
      "Compartido, Solitario o Híbrido, según cómo quieras recibir lo que genere tu potencia.",
  },
  {
    titulo: "Indicas tu wallet y mina",
    texto:
      "Solo la dirección donde quieres recibir. Durante 24 horas, tu potencia mina en la red real de Bitcoin.",
  },
];

const CONFIANZA = [
  {
    titulo: "Tu wallet, tus fondos",
    texto:
      "Los pagos van directos a la dirección de tu wallet. No necesitamos tus claves ni tu frase de recuperación, y no guardamos tus bitcoins.",
  },
  {
    titulo: "Sin contratos ni permanencia",
    texto:
      "Son 24 horas sueltas, a precio claro. Sin cuotas, sin renovaciones y sin promesas de rentabilidad.",
  },
  {
    titulo: "Claridad desde el principio",
    texto: "Pagas por 24 horas de potencia de minería, no por una cantidad de bitcoin. Lo que recibes en sats (fracciones de bitcoin: 100 millones de sats son 1 BTC) depende del modo y de la red, y no está garantizado.",
  },
];

function Inicio() {
  return (
    <main>
      {/* 001 / portada */}
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24">
        <div className="index-label">001 / BLOQUE170.COM</div>
        <p className="mt-3 text-[19px] text-primary">{SERVICIO.lema}</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
          Potencia de minería durante 24 horas.
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] text-muted-foreground">
          Eliges la potencia y el modo de minado, indicas tu wallet y durante 24 horas mina en la red real de Bitcoin.
          Lo que se genere va directo a tu wallet, sin pasar por nosotros.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/minar" className={botonPrimario}>
            Ver potencia
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
        <Link to="/minar" hash="potencia" className="mt-6 block border-2 border-primary p-6 hover:border-foreground">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl">Elige tu potencia y tu modo</h3>
            <span className="hash-text border border-border px-2 py-0.5 text-[11px] tracking-[0.06em] text-muted-foreground">
              PRÓXIMAMENTE
            </span>
          </div>
          <p className="hash-text mt-2 text-[13px] text-muted-foreground">De 250 TH/s a 1 PH/s, durante 24 horas · Compartido, Solitario o Híbrido</p>
          <div className="mt-4 h-1 w-full bg-border" aria-hidden="true">
            <div className="h-1 w-3/4 bg-primary" />
          </div>
          <p className="mt-4 text-[17px]">Desde unos {DESDE_EUROS_APROX}, IVA incluido</p>
          <span className={`${botonPrimario} mt-5`}>Ver potencia</span>
        </Link>
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

      {/* 004 / por qué bloque 170 */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        <div className="index-label">004 / el nombre</div>
        <h2 className="mt-3 text-2xl sm:text-3xl">Por qué {SERVICIO.marca}</h2>
        <p className="mt-5 text-[17px] text-muted-foreground">
          El 12 de enero de 2009 se minó el bloque 170 de Bitcoin. Contenía la primera transacción
          entre dos personas: Satoshi Nakamoto envió 10 bitcoins a Hal Finney.
        </p>
        <p className="mt-3 text-[17px] text-muted-foreground">
          Ese día Bitcoin empezó a moverse entre personas. Nosotros llevamos la minería profesional
          a las personas. Tú eliges cómo usar la potencia; el resultado depende del modo y de lo que ocurra en la red.
        </p>
      </section>

      {/* 005 / confianza */}
      <section className="bg-[var(--ink)] text-[var(--on-dark)]">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <div className="hash-text text-[11px] tracking-[0.08em] text-[var(--on-dark-muted)]">
            005 / qué compras y qué recibes
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

      {/* 006 / aprende */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="index-label">006 / antes de empezar</div>
        <h2 className="mt-3 text-2xl sm:text-3xl">Entiende lo que haces</h2>
        <ul className="mt-6">
          <li className="border-t border-border">
            <Link to="/simulador" className="block py-5 hover:opacity-80">
              <span className="block text-xl">Simulador</span>
              <span className="mt-1 block text-[15px] text-muted-foreground">
                Simula en tu navegador cómo se mina un bloque y mira la prueba de trabajo en directo.
              </span>
            </Link>
          </li>
          <li className="border-t border-border">
            <Link to="/aprende" className="block py-5 hover:opacity-80">
              <span className="block text-xl">Aprende</span>
              <span className="mt-1 block text-[15px] text-muted-foreground">
                {CAPITULOS.length} capítulos cortos y un test final. Si lo apruebas, te llevas un
                certificado en PDF.
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

      {/* 007 / regalos */}
      <section className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col gap-4 border border-primary p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl">Regala potencia de minería</p>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Códigos regalo para una persona o para todo tu equipo.
            </p>
          </div>
          <Link to="/minar" hash="regalos" className={`${botonPrimario} shrink-0`}>
            Ver regalos
          </Link>
        </div>
      </section>
    </main>
  );
}
