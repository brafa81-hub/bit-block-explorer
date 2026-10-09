import { createFileRoute, Link } from "@tanstack/react-router";

import { Quiz } from "@/components/Quiz";
import { QUIZ_FINAL } from "@/content/mining101";

const URL = "https://bit-block-explorer.lovable.app/aprende/quiz";
const TITULO = "Quiz final de minería de Bitcoin | Minería de Bitcoin";
const DESC = "Diez preguntas para comprobar si ya entiendes cómo funciona la minería de Bitcoin, con la explicación de cada respuesta.";

export const Route = createFileRoute("/aprende/quiz")({
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
  component: QuizFinal,
});

function QuizFinal() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <Link to="/aprende" className="index-label hover:text-foreground">← aprende</Link>
      <h1 className="mt-6 text-3xl sm:text-4xl">Quiz final</h1>
      <p className="mt-4 text-[17px]">Diez preguntas, una por idea clave. Sin prisa y sin nota que guardar.</p>
      <div className="mt-10">
        <Quiz preguntas={QUIZ_FINAL} />
      </div>
    </main>
  );
}
