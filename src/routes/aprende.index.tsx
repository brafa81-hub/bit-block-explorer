import { createFileRoute, Link } from "@tanstack/react-router";

import { CAPITULOS, minutosLectura } from "@/content/mining101";
import { idx } from "@/content/glosario";
import { RETO } from "@/content/reto";

const URL = "https://bloque170.com/aprende";
const TITULO = "Aprende minería de Bitcoin desde cero";
const DESC =
  "Diez capítulos cortos para entender qué es minar Bitcoin: bloques, hash, dificultad, máquinas, pools, costes, energía, tu primera wallet y cómo comprar potencia de minería.";

export const Route = createFileRoute("/aprende/")({
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
  component: Indice,
});

function Indice() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <div className="index-label">aprende</div>
      <h1 className="mt-2 text-3xl sm:text-4xl">Entiende la minería de Bitcoin en diez pasos</h1>
      <p className="mt-4 text-[17px]">Bitcoin funciona gracias a miles de máquinas que trabajan sin descanso en todo el mundo. Aquí descubres cómo, sin saber nada de antemano: cada capítulo se lee en pocos minutos y acaba con un test de tres preguntas.</p>
      <ol className="mt-10">
        {CAPITULOS.map((c, i) => (
          <li key={c.slug} className="border-t border-border">
            <Link to="/aprende/$slug" params={{ slug: c.slug }} className="block py-5 hover:opacity-80">
              <span className="index-label">{idx(i + 1)} / · {minutosLectura(c)} min</span>
              <span className="mt-1 block text-xl">{c.titulo}</span>
              <span className="mt-1 block text-[15px] text-muted-foreground">{c.pregunta}</span>
            </Link>
          </li>
        ))}
      </ol>
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-xl">Pon a prueba lo aprendido</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Link
            to="/aprende/reto-10-minutos"
            className="group flex flex-col border border-border p-5 transition-colors hover:border-primary"
          >
            <span className="index-label">reto · 1 min</span>
            <span className="mt-2 block text-xl">{RETO.enlaceIndice.titulo}</span>
            <span className="mt-2 block flex-1 text-[15px] text-muted-foreground">{RETO.enlaceIndice.texto}</span>
            <span className="mt-5 text-[15px] text-primary">Empezar el reto <span className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
          </Link>
          <Link
            to="/aprende/test"
            className="group flex flex-col border border-border p-5 transition-colors hover:border-primary"
          >
            <span className="index-label">test · 15 preguntas</span>
            <span className="mt-2 block text-xl">Test final</span>
            <span className="mt-2 block flex-1 text-[15px] text-muted-foreground">Comprueba lo que sabes de Bitcoin y la minería. Si apruebas, te llevas un certificado en PDF.</span>
            <span className="mt-5 text-[15px] text-primary">Hacer el test <span className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
          </Link>
        </div>
      </section>
    </main>
  );
}
