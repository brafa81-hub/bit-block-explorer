import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { JUEGO } from "@/content/juego";
import { urlPublica, SERVICIO } from "@/content/servicio";
import { getRanking } from "@/lib/game.functions";
import { BlockGame } from "@/components/BlockGame";
import { GameRanking } from "@/components/GameRanking";

export const rankingOptions = queryOptions({
  queryKey: ["game-ranking"],
  queryFn: () => getRanking(),
  staleTime: 30000,
});
export const Route = createFileRoute("/juego/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(rankingOptions),
  head: () => ({
    meta: [
      { title: `${JUEGO.title} | ${SERVICIO.marca}` },
      { name: "description", content: JUEGO.description },
      { property: "og:title", content: `${JUEGO.title} · ${JUEGO.daily}` },
      { property: "og:description", content: JUEGO.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: urlPublica("/juego") },
    ],
    links: [{ rel: "canonical", href: urlPublica("/juego") }],
  }),
  component: GamePage,
});
function GamePage() {
  const { data } = useSuspenseQuery(rankingOptions);
  return (
    <main className="mx-auto max-w-4xl px-5 pt-10 sm:px-8 sm:pt-14">
      <header className="mb-6">
        <h1 className="text-4xl tracking-normal sm:text-5xl">{JUEGO.title}</h1>
      </header>
      <BlockGame />
      <GameRanking ranking={data} compact />
    </main>
  );
}
