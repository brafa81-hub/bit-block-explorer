import { createFileRoute, Link } from "@tanstack/react-router";

import { CAPITULOS } from "@/content/mining101";
import { idx } from "@/content/glosario";

const URL = "https://bit-block-explorer.lovable.app/mining-101";
const TITULO = "Mining 101: la minería de Bitcoin explicada desde cero";
const DESC =
  "Siete capítulos cortos para entender qué es minar Bitcoin: hash, dificultad, pools, costes, tu primera wallet y el alquiler de hashrate.";

export const Route = createFileRoute("/mining-101/")({
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
  component: Indice,
});

function Indice() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <div className="index-label">mining 101</div>
      <h1 className="mt-2 text-3xl sm:text-4xl">Entiende la minería de Bitcoin en siete pasos</h1>
      <p className="mt-4 text-[17px]">Sin saber nada de antemano. Cada capítulo se lee en pocos minutos y acaba con un quiz de tres preguntas.</p>
      <ol className="mt-10">
        {CAPITULOS.map((c, i) => (
          <li key={c.slug} className="border-t border-border">
            <Link to="/mining-101/$slug" params={{ slug: c.slug }} className="block py-5 hover:opacity-80">
              <span className="index-label">{idx(i + 1)} /</span>
              <span className="mt-1 block text-xl">{c.titulo}</span>
              <span className="mt-1 block text-[15px] text-muted-foreground">{c.pregunta}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link to="/mining-101/quiz" className="mt-8 inline-flex min-h-[44px] items-center border border-border px-5 text-[15px] hover:border-foreground">
        Quiz final (opcional)
      </Link>
    </main>
  );
}
