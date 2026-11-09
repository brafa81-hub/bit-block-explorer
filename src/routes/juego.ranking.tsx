import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getRanking } from "@/lib/game.functions";
import { urlPublica, SERVICIO } from "@/content/servicio";
import { GameRanking } from "@/components/GameRanking";

const options = queryOptions({ queryKey: ["game-ranking"], queryFn: () => getRanking(), staleTime: 30000 });
const title = `Ranking de Construye tu bloque | ${SERVICIO.marca}`;
const description = "Ranking semanal de bloques: alias, nota y tiempo. Sin premios. De lunes a domingo, hora de Madrid.";
export const Route = createFileRoute("/juego/ranking")({ loader: ({ context }) => context.queryClient.ensureQueryData(options), head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: urlPublica("/juego/ranking") }] }), component: RankingPage });
function RankingPage() {
  const { data } = useSuspenseQuery(options);
  return <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8"><Link to="/juego" className="text-sm underline underline-offset-4">← Construye tu bloque</Link><h1 className="mt-7 text-4xl tracking-normal">Ranking semanal</h1><div className="mt-8"><GameRanking rows={data} /></div></main>;
}