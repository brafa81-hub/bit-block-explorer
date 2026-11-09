import { Link } from "@tanstack/react-router";
import { formatTime, type RankingRow } from "@/lib/game";
import { JUEGO } from "@/content/juego";

export function GameRanking({ rows, compact = false }: { rows: RankingRow[]; compact?: boolean }) {
  return <section className="border-t border-border py-10">
    <div className="index-label">003 / ranking semanal</div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-2xl tracking-normal">Bloques de esta semana</h2>
      {compact && <Link to="/juego/ranking" className="text-sm underline underline-offset-4">Ver ranking completo →</Link>}
    </div>
    <p className="mt-3 text-sm text-muted-foreground">{JUEGO.week}</p>
    <p className="mt-2 text-sm">{JUEGO.ranking}</p>
    {rows.length ? <ol className="mt-6">{rows.slice(0, compact ? 10 : 100).map((r, i) => <li key={`${i}-${r.alias}`} className="grid grid-cols-[32px_minmax(0,1fr)_55px_65px] items-center gap-2 border-t border-border py-3 text-sm">
      <span className="font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</span><span className="break-words">{r.alias}</span><span className="font-mono">{Number(r.score).toFixed(1)}</span><span className="text-right font-mono">{formatTime(r.total_ms ?? 0)}</span>
    </li>)}</ol> : <p className="mt-6 border-y border-border py-6 text-muted-foreground">Todavía no hay bloques confirmados esta semana.</p>}
  </section>;
}