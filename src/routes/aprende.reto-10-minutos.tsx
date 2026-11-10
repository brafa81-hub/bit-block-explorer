import { createFileRoute, Link } from "@tanstack/react-router";

import { RetoRitmo } from "@/components/RetoRitmo";
import { RETO } from "@/content/reto";
import { SERVICIO } from "@/content/servicio";

const TITULO = `${RETO.titulo} | ${SERVICIO.marca}`;

export const Route = createFileRoute("/aprende/reto-10-minutos")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: RETO.descripcionMeta },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: RETO.descripcionMeta },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reto,
});

function Reto() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <Link to="/aprende" className="index-label hover:text-foreground">← aprende</Link>
      <h1 className="mt-6 text-3xl sm:text-4xl">{RETO.titulo}</h1>
      <p className="mt-4 text-[17px]">{RETO.intro}</p>
      <div className="mt-8">
        <RetoRitmo />
      </div>
      <p className="mt-4 text-[13px] text-muted-foreground">{RETO.aviso}</p>
    </main>
  );
}
