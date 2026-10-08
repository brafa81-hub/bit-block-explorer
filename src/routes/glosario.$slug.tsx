import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { getTermino, idx, indiceDe } from "@/content/glosario";
import { capituloDeTermino } from "@/content/mining101";

const BASE = "https://bit-block-explorer.lovable.app/glosario";

export const Route = createFileRoute("/glosario/$slug")({
  loader: ({ params }) => {
    const t = getTermino(params.slug);
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData: t, params }) => {
    if (!t) return { meta: [{ title: "Término no encontrado" }, { name: "robots", content: "noindex" }] };
    const url = `${BASE}/${params.slug}`;
    const title = `${t.plural ? "Qué son" : "Qué es"} ${t.termino} | Glosario de minería de Bitcoin`;
    return {
      meta: [
        { title },
        { name: "description", content: t.definicion },
        { property: "og:title", content: title },
        { property: "og:description", content: t.definicion },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            name: t.termino,
            description: t.definicion,
            url,
            inDefinedTermSet: { "@type": "DefinedTermSet", name: "Glosario de minería de Bitcoin", url: BASE },
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

  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <Link to="/glosario" className="index-label hover:text-foreground">
        ← glosario
      </Link>
      <div className="index-label mt-6">
        {idx(indiceDe(t.slug))} / {t.categoria.toLowerCase()}
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl">{t.termino}</h1>
      <p className="mt-4 text-[18px] leading-relaxed">{t.definicion}</p>

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

      {t.enLaPractica && (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="text-xl">En la práctica</h2>
          <p className="mt-3 text-[16px]">{t.enLaPractica}</p>
        </section>
      )}

      {rel.length > 0 && (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="text-xl">Relacionados</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {rel.map((r) => (
              <li key={r.slug}>
                <Link
                  to="/glosario/$slug"
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
          Aparece en el capítulo <Link to="/mining-101/$slug" params={{ slug: capitulo.slug }} className="underline underline-offset-4">{capitulo.titulo}</Link>.
        </p>
      )}

      <p className="index-label mt-12">Revisado en {t.revisado}</p>
    </main>
  );
}

function TerminoNoEncontrado() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <h1 className="text-3xl">Este término no está en el glosario</h1>
      <Link to="/glosario" className="mt-6 inline-flex min-h-[44px] items-center border border-border px-5 text-[15px]">
        Ver todos los términos
      </Link>
    </main>
  );
}
