import { createFileRoute, Link } from "@tanstack/react-router";

import { CAPITULOS } from "@/content/mining101";
import { idx } from "@/content/glosario";

const URL = "https://bit-block-explorer.lovable.app/aprende";
const TITULO = "Aprende minería de Bitcoin desde cero";
const DESC =
  "Siete capítulos cortos para entender qué es minar Bitcoin: hash, dificultad, pools, costes, tu primera wallet y el alquiler de hashrate.";

export const Route = createFileRoute("/aprende/")({
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
      <div className="index-label">aprende</div>
      <h1 className="mt-2 text-3xl sm:text-4xl">Entiende la minería de Bitcoin en siete pasos</h1>
      <p className="mt-4 text-[17px]">Bitcoin funciona gracias a miles de máquinas que trabajan sin descanso en todo el mundo. Aquí descubres cómo, sin saber nada de antemano: cada capítulo se lee en pocos minutos y acaba con un test de tres preguntas.</p>
      <ol className="mt-10">
        {CAPITULOS.map((c, i) => (
          <li key={c.slug} className="border-t border-border">
            <Link to="/aprende/$slug" params={{ slug: c.slug }} className="block py-5 hover:opacity-80">
              <span className="index-label">{idx(i + 1)} /</span>
              <span className="mt-1 block text-xl">{c.titulo}</span>
              <span className="mt-1 block text-[15px] text-muted-foreground">{c.pregunta}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link to="/aprende/quiz" className="mt-8 inline-flex min-h-[44px] items-center border border-border px-5 text-[15px] hover:border-foreground">
        Test (opcional)
      </Link>
    </main>
  );
}
