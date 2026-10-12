import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Certificado } from "@/components/Certificado";
import { Quiz } from "@/components/Quiz";
import { SERVICIO } from "@/content/servicio";
import { QUIZ_FINAL } from "@/content/mining101";

const URL = "https://bit-block-explorer.lovable.app/aprende/test";
const TITULO = "Test de minería de Bitcoin | Minería de Bitcoin";
const DESC = "Diez preguntas para comprobar si ya entiendes cómo funciona la minería de Bitcoin, con la explicación de cada respuesta.";

export const Route = createFileRoute("/aprende/test")({
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
  component: TestFinal,
});

function TestFinal() {
  const [intento, setIntento] = useState(0);
  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <Link to="/aprende" className="index-label hover:text-foreground">← aprende</Link>
      <h1 className="mt-6 text-3xl sm:text-4xl">Test</h1>
      <p className="mt-4 text-[17px]">Diez preguntas, una por idea clave. Sin prisa. Con {SERVICIO.certificado.notaMinima} aciertos o más, te llevas un certificado en PDF.</p>
      <div className="mt-10">
        <Quiz
          key={intento}
          preguntas={QUIZ_FINAL}
          alTerminar={(a, t) => (
            <Certificado
              aciertos={a}
              total={t}
              onRepetir={() => {
                setIntento((n) => n + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        />
      </div>
    </main>
  );
}
