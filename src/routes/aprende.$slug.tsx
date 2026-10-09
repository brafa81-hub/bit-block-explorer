import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Quiz } from "@/components/Quiz";
import { CAPITULOS, getCapitulo, indiceCapitulo } from "@/content/mining101";
import { getTermino, idx } from "@/content/glosario";

const BASE = "https://bit-block-explorer.lovable.app/aprende";

export const Route = createFileRoute("/aprende/$slug")({
  loader: ({ params }) => {
    const c = getCapitulo(params.slug);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData: c, params }) => {
    if (!c) return { meta: [{ title: "Capítulo no encontrado" }, { name: "robots", content: "noindex" }] };
    const url = `${BASE}/${params.slug}`;
    const title = `${c.titulo} | Aprende minería`;
    return {
      meta: [
        { title },
        { name: "description", content: c.descripcion },
        { property: "og:title", content: title },
        { property: "og:description", content: c.descripcion },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: CapituloNoEncontrado,
  component: CapituloPagina,
});

/** Párrafo con enlaces internos escritos como [texto](/ruta). */
function Parrafo({ texto }: { texto: string }) {
  const partes = texto.split(/(\[[^\]]+\]\(\/[^)]*\))/g);
  return (
    <p>
      {partes.map((parte, k) => {
        const m = /^\[([^\]]+)\]\((\/[^)]*)\)$/.exec(parte);
        if (!m) return parte;
        return (
          <Link key={k} to={m[2] as "/" | "/minar"} className="underline underline-offset-4">
            {m[1]}
          </Link>
        );
      })}
    </p>
  );
}

function CapituloPagina() {
  const c = Route.useLoaderData();
  const i = indiceCapitulo(c.slug);
  const siguiente = CAPITULOS[i + 1];

  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <Link to="/aprende" className="index-label hover:text-foreground">← aprende</Link>
      <div className="index-label mt-6">{idx(i + 1)} /</div>
      <h1 className="mt-2 text-3xl sm:text-4xl">{c.titulo}</h1>
      <p className="mt-4 text-[19px] leading-relaxed">{c.pregunta}</p>

      {c.secciones.map((s) => (
        <section key={s.titulo} className="mt-10 border-t border-border pt-6">
          <h2 className="text-xl">{s.titulo}</h2>
          <div className="mt-3 space-y-4 text-[16px]">
            {s.parrafos.map((p, k) => <Parrafo key={k} texto={p} />)}
          </div>
        </section>
      ))}

      <p className="mt-10 border-l-2 border-primary pl-4 text-[16px]">{c.enRealidad}</p>

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="text-xl">En el diccionario</h2>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
          {c.terminos.map((t) => (
            <li key={t}><Link to="/diccionario/$slug" params={{ slug: t }} className="underline underline-offset-4">{getTermino(t)?.termino ?? t}</Link></li>
          ))}
        </ul>
      </section>

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="text-xl">Comprueba lo que sabes</h2>
        <div className="mt-4">
          <Quiz key={c.slug} preguntas={c.quiz} />
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-6">
        <p className="text-[17px]">{c.cierre}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {siguiente ? (
            <Link to="/aprende/$slug" params={{ slug: siguiente.slug }} className="inline-flex min-h-[44px] items-center border border-border px-5 text-[15px] hover:border-foreground">
              Siguiente: {idx(i + 2)} / {siguiente.titulo}
            </Link>
          ) : (
            <>
              <Link to="/minar" className="inline-flex min-h-[44px] items-center border border-foreground px-5 text-[15px] hover:opacity-80">
                Mina con HashFlow
              </Link>
              <Link to="/aprende/quiz" className="inline-flex min-h-[44px] items-center border border-border px-5 text-[15px] hover:border-foreground">
                Ir al quiz final
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function CapituloNoEncontrado() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <h1 className="text-3xl">Este capítulo no existe</h1>
      <Link to="/aprende" className="mt-6 inline-flex min-h-[44px] items-center border border-border px-5 text-[15px]">
        Ver todos los capítulos
      </Link>
    </main>
  );
}
