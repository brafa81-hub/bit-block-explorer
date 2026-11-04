import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { DEMOS } from "@/components/demos";
import { getTermino, idx, indiceDe, pasoDeRuta, RUTA } from "@/content/glosario";
import { capituloDeTermino } from "@/content/mining101";

const BASE = "https://bloque170.com/diccionario";

export const Route = createFileRoute("/diccionario/$slug")({
  loader: ({ params }) => {
    const t = getTermino(params.slug);
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData: t, params }) => {
    if (!t) return { meta: [{ title: "Término no encontrado" }, { name: "robots", content: "noindex" }] };
    const url = `${BASE}/${params.slug}`;
    const title = `${t.plural ? "Qué son" : "Qué es"} ${t.termino} | Diccionario de minería de Bitcoin`;
    return {
      meta: [
        { title },
        { name: "description", content: t.definicion },
        { property: "og:title", content: title },
        { property: "og:description", content: t.definicion },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            name: t.termino,
            description: t.definicion,
            url,
            inDefinedTermSet: { "@type": "DefinedTermSet", name: "Diccionario de minería de Bitcoin", url: BASE },
          }),
        },
      ],
    };
  },
  notFoundComponent: TerminoNoEncontrado,
  component: Ficha,
});

/** Envuelve cifras en IBM Plex Mono. */
function ConCifras({ texto }: { texto: string }) {
  const partes = texto.split(/(\d[\d.,^]*(?:\s?(?:TH\/s|PH\/s|EH\/s|BTC|hashes\/s))?)/g);
  return (
    <>
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-mono text-[0.95em]">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}

function Ficha() {
  const t = Route.useLoaderData();
  const rel = t.relacionados.map(getTermino).filter((x) => !!x);
  const capitulo = capituloDeTermino(t.slug) ?? t.capitulo;
  const DemoFicha = DEMOS[t.slug];

  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <Link to="/diccionario" className="index-label hover:text-foreground">
        ← diccionario
      </Link>
      <div className="index-label mt-6">
        {idx(indiceDe(t.slug))} / {t.categoria.toLowerCase()}
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl">{t.termino}</h1>
      <p className="mt-4 text-[18px] leading-relaxed">{t.definicion}</p>
      {t.alias && t.alias.length > 0 && (
        <p className="mt-3 text-[14px] text-muted-foreground">También se dice: {t.alias.join(", ")}</p>
      )}

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="text-xl">Explicación</h2>
        <div className="mt-3 space-y-4 text-[16px]">
          {t.explicacion.map((p, i) => (
            <p key={i} className={p.startsWith("En realidad") ? "border-l-2 border-primary pl-4" : ""}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {t.ejemplo && (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="text-xl">Ejemplo</h2>
          <p className="mt-3 text-[16px]">
            <ConCifras texto={t.ejemplo} />
          </p>
        </section>
      )}

      {DemoFicha && <DemoFicha />}

      {t.enLaPractica && (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="text-xl">En la práctica</h2>
          <p className="mt-3 text-[16px]">{t.enLaPractica}</p>
          {t.slug === "comprar-potencia-de-mineria" && (
            <Link
              to="/minar"
              hash="potencia"
              className="mt-5 inline-flex min-h-[44px] items-center border border-foreground bg-foreground px-5 text-[15px] text-background hover:opacity-90"
            >
              Ver cómo comprar potencia
            </Link>
          )}
        </section>
      )}

      {t.loVerasEn && (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="text-xl">Lo verás en</h2>
          <p className="mt-3 text-[16px]">{t.loVerasEn.texto}</p>
          <Link
            to={t.loVerasEn.to}
            {...(t.loVerasEn.hash ? { hash: t.loVerasEn.hash } : {})}
            className="mt-4 inline-flex min-h-[44px] items-center text-[15px] underline underline-offset-4"
          >
            {t.loVerasEn.enlace} →
          </Link>
        </section>
      )}

      {pasoDeRuta(t.slug) > 0 && <PasoRuta slug={t.slug} />}

      {rel.length > 0 && (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="text-xl">Relacionados</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {rel.map((r) => (
              <li key={r.slug}>
                <Link
                  to="/diccionario/$slug"
                  params={{ slug: r.slug }}
                  className="inline-flex min-h-[40px] items-center border border-border px-3 text-[14px] hover:border-foreground"
                >
                  {r.termino}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {capitulo && (
        <p className="mt-10 border-t border-border pt-6 text-[15px]">
          Aparece en el capítulo <Link to="/aprende/$slug" params={{ slug: capitulo.slug }} className="underline underline-offset-4">{capitulo.titulo}</Link>.
        </p>
      )}

      <p className="index-label mt-12">Revisado en {t.revisado}</p>
    </main>
  );
}

/** Caja de la ruta «Empezar aquí»: en qué paso estás y cuál viene después. */
function PasoRuta({ slug }: { slug: string }) {
  const paso = pasoDeRuta(slug);
  const siguiente = RUTA[paso] ? getTermino(RUTA[paso]) : undefined;
  return (
    <section className="mt-10 border border-border p-5">
      <p className="index-label">
        empezar aquí · paso {paso} de {RUTA.length}
      </p>
      {siguiente ? (
        <Link
          to="/diccionario/$slug"
          params={{ slug: siguiente.slug }}
          className="mt-3 inline-flex min-h-[44px] items-center border border-foreground px-4 text-[15px] hover:bg-foreground hover:text-background"
        >
          Siguiente: {siguiente.termino} →
        </Link>
      ) : (
        <p className="mt-2 text-[15px]">
          Has terminado la ruta. Si quieres verlo en marcha, prueba el{" "}
          <Link to="/simulador" className="underline underline-offset-4">
            simulador
          </Link>
          .
        </p>
      )}
    </section>
  );
}

function TerminoNoEncontrado() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <h1 className="text-3xl">Este término no está en el diccionario</h1>
      <Link to="/diccionario" className="mt-6 inline-flex min-h-[44px] items-center border border-border px-5 text-[15px]">
        Ver todos los términos
      </Link>
    </main>
  );
}
