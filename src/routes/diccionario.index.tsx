import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  BLOQUES,
  CATEGORIAS,
  GLOSARIO_ALFABETICO,
  getTermino,
  idx,
  indiceDe,
  RUTA,
  type CategoriaGlosario,
} from "@/content/glosario";

const URL = "https://bloque170.com/diccionario";
const TITULO = "Diccionario de minería de Bitcoin explicado fácil";
const DESC = `Hash, bloque, dificultad, halving, pool… ${GLOSARIO_ALFABETICO.length} términos de Bitcoin y minería explicados desde cero, con ejemplos del día a día.`;

export const Route = createFileRoute("/diccionario/")({
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
  component: GlosarioIndice,
});

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function chip(activo: boolean) {
  return `min-h-[44px] border px-3 text-[14px] ${
    activo ? "border-foreground bg-foreground text-background" : "border-border text-foreground"
  }`;
}

function fila({
  t,
  n,
  paso,
}: {
  t: (typeof GLOSARIO_ALFABETICO)[number];
  n: number;
  paso?: number;
}) {
  return (
    <li key={t.slug} className="border-t border-border">
      <Link
        to="/diccionario/$slug"
        params={{ slug: t.slug }}
        className="grid grid-cols-[3.5rem_1fr] gap-x-2 py-4 hover:bg-foreground/[0.03]"
      >
        <span className="index-label pt-1">{paso ? `paso ${paso}` : idx(n)}</span>
        <span>
          <span className="block text-[17px] font-medium">{t.termino}</span>
          <span className="mt-1 block text-[14px] text-muted-foreground">{t.definicion}</span>
        </span>
      </Link>
    </li>
  );
}

function GlosarioIndice() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoriaGlosario | null>(null);
  const [verRuta, setVerRuta] = useState(false);

  const lista = useMemo(() => {
    const n = normalizar(q.trim());
    return GLOSARIO_ALFABETICO.map((t) => ({ t, n: indiceDe(t.slug) }))
      .filter(
        ({ t }) =>
          (!cat || t.categoria === cat) &&
          (!n || normalizar([t.termino, t.definicion, ...(t.alias ?? [])].join(" ")).includes(n)),
      )
      .sort((a, b) => a.n - b.n);
  }, [q, cat]);

  const ruta = RUTA.map(getTermino)
    .filter((t) => !!t)
    .map((t, i) => ({ t, n: indiceDe(t.slug), paso: i + 1 }));

  // Con «Todos» y sin búsqueda, la lista larga se agrupa por bloque y categoría.
  const agrupar = !q.trim() && !cat;

  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <Link to="/simulador" className="index-label hover:text-foreground">
        ← simulador
      </Link>
      <h1 className="mt-4 text-3xl sm:text-4xl">Diccionario</h1>
      <p className="mt-3 max-w-xl text-[16px] text-muted-foreground">
        ¿Te has cruzado con una palabra rara? Aquí la tienes explicada desde cero, con un ejemplo
        cotidiano y sin tecnicismos de más. Detrás de cada término hay una pieza de cómo funciona
        Bitcoin.
      </p>

      <div className="mt-8 space-y-4">
        <div role="group" aria-label="Qué términos mostrar" className="flex gap-2">
          <button
            type="button"
            aria-pressed={verRuta}
            onClick={() => setVerRuta(true)}
            className={chip(verRuta)}
          >
            Empezar aquí
          </button>
          <button
            type="button"
            aria-pressed={!verRuta}
            onClick={() => setVerRuta(false)}
            className={chip(!verRuta)}
          >
            Todos
          </button>
        </div>
      </div>

      {verRuta ? (
        <section className="mt-8">
          <h2 className="text-xl">Entiende tus 24 horas de potencia</h2>
          <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
            {ruta.length} términos, en orden. Con ellos entiendes qué hace la potencia que compras y
            qué puedes esperar. Cada ficha te lleva a la siguiente.
          </p>
          <ol className="mt-4">{ruta.map(fila)}</ol>
        </section>
      ) : (
        <>
          <div className="mt-6 space-y-4">
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

            <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={cat === null}
                onClick={() => setCat(null)}
                className={chip(cat === null)}
              >
                Todas las categorías
              </button>
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={cat === c}
                  onClick={() => setCat(c)}
                  className={chip(cat === c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <p className="index-label mt-8" aria-live="polite">
            {lista.length} {lista.length === 1 ? "término" : "términos"}
          </p>

          {agrupar ? (
            BLOQUES.map((b) => (
              <section key={b.titulo} className="mt-12">
                <h2 className="text-2xl">{b.titulo}</h2>
                {b.categorias.map((c) => {
                  const grupo = lista.filter(({ t }) => t.categoria === c);
                  if (grupo.length === 0) return null;
                  return (
                    <section key={c} className="mt-6">
                      <h3 className="index-label uppercase">{c}</h3>
                      <ul className="mt-2">{grupo.map(fila)}</ul>
                    </section>
                  );
                })}
              </section>
            ))
          ) : (
            <ul className="mt-2">{lista.map(fila)}</ul>
          )}
          {lista.length === 0 && (
            <p className="mt-4 text-[15px] text-muted-foreground">
              No hay ningún término con esa búsqueda. Prueba con «Todas las categorías» o con otra
              palabra.
            </p>
          )}
        </>
      )}
    </main>
  );
}
