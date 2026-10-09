import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { CATEGORIAS, GLOSARIO_ALFABETICO, idx, type CategoriaGlosario } from "@/content/glosario";

const URL = "https://bit-block-explorer.lovable.app/diccionario";
const TITULO = "Diccionario de minería de Bitcoin explicado fácil";
const DESC =
  "Hash, bloque, dificultad, halving, pool… 35 términos de Bitcoin y minería explicados desde cero, con ejemplos del día a día.";

export const Route = createFileRoute("/diccionario/")({
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
  component: GlosarioIndice,
});

const normalizar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function chip(activo: boolean) {
  return `min-h-[40px] border px-3 text-[14px] ${
    activo ? "border-foreground bg-foreground text-background" : "border-border text-foreground"
  }`;
}

function GlosarioIndice() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoriaGlosario | null>(null);
  const [soloEsenciales, setSoloEsenciales] = useState(false);

  const lista = useMemo(() => {
    const n = normalizar(q.trim());
    return GLOSARIO_ALFABETICO.map((t, i) => ({ t, n: i + 1 })).filter(
      ({ t }) =>
        (!soloEsenciales || t.esencial) &&
        (!cat || t.categoria === cat) &&
        (!n || normalizar(t.termino + " " + t.definicion).includes(n)),
    );
  }, [q, cat, soloEsenciales]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <Link to="/" className="index-label hover:text-foreground">
        ← simulador
      </Link>
      <h1 className="mt-4 text-3xl sm:text-4xl">Diccionario</h1>
      <p className="mt-3 max-w-xl text-[16px] text-muted-foreground">
        ¿Te has cruzado con una palabra rara? Aquí la tienes explicada desde cero, con un
        ejemplo cotidiano y sin tecnicismos de más. Detrás de cada término hay una pieza
        de cómo funciona Bitcoin.
      </p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="etiqueta">Buscar</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Por ejemplo, halving"
            className="mt-1 block min-h-[44px] w-full border border-input bg-transparent px-3 text-[16px] outline-none focus:border-ring"
          />
        </label>

        <div role="group" aria-label="Qué términos mostrar" className="flex gap-2">
          <button type="button" aria-pressed={soloEsenciales} onClick={() => setSoloEsenciales(true)} className={chip(soloEsenciales)}>
            Empezar aquí
          </button>
          <button type="button" aria-pressed={!soloEsenciales} onClick={() => setSoloEsenciales(false)} className={chip(!soloEsenciales)}>
            Todos
          </button>
        </div>

        <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={cat === null} onClick={() => setCat(null)} className={chip(cat === null)}>
            Todas las categorías
          </button>
          {CATEGORIAS.map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={chip(cat === c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="index-label mt-8" aria-live="polite">
        {lista.length} {lista.length === 1 ? "término" : "términos"}
      </p>

      <ul className="mt-2">
        {lista.map(({ t, n }) => (
          <li key={t.slug} className="border-t border-border">
            <Link
              to="/diccionario/$slug"
              params={{ slug: t.slug }}
              className="grid grid-cols-[3rem_1fr] gap-x-2 py-4 hover:bg-foreground/[0.03]"
            >
              <span className="index-label pt-1">{idx(n)}</span>
              <span>
                <span className="block text-[17px] font-medium">{t.termino}</span>
                <span className="mt-1 block text-[14px] text-muted-foreground">{t.definicion}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {lista.length === 0 && (
        <p className="mt-4 text-[15px] text-muted-foreground">
          No hay ningún término con esa búsqueda. Prueba con «Todos» o con otra palabra.
        </p>
      )}
    </main>
  );
}
