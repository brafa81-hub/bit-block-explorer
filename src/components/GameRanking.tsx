import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatPoints, formatTime, type Ranking } from "@/lib/game";
import { JUEGO } from "@/content/juego";

export function GameRanking({ ranking, compact = false }: { ranking: Ranking; compact?: boolean }) {
  const [view, setView] = useState<"today" | "week">("today");
  const rows = (view === "today" ? ranking.today : ranking.week).slice(0, compact ? 10 : 100);
  const tab = (id: "today" | "week", label: string) => (
    <button
      type="button"
      aria-pressed={view === id}
      onClick={() => setView(id)}
      className={`min-h-11 border-b-2 px-3 ${view === id ? "border-primary" : "border-transparent text-muted-foreground"}`}
    >
      {label}
    </button>
  );
  return (
    <section className="border-t border-border py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl tracking-normal">Ranking</h2>
        {compact && (
          <Link to="/juego/ranking" className="text-sm underline underline-offset-4">
            Ver ranking completo →
          </Link>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        {tab("today", `Hoy · #${ranking.dayNumber}`)}
        {tab("week", "Esta semana")}
      </div>
      {rows.length ? (
        <ol className="mt-4">
          {rows.map((r, i) => (
            <li
              key={`${i}-${r.alias}`}
              className="grid grid-cols-[32px_minmax(0,1fr)_auto_60px] items-center gap-3 border-t border-border py-3 text-sm"
            >
              <span className="font-mono text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="break-words">
                {r.alias}
                {view === "week" && r.days ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {r.days} {r.days === 1 ? "día" : "días"}
                  </span>
                ) : null}
              </span>
              <span className="font-mono">{formatPoints(r.score)}</span>
              <span className="text-right font-mono text-muted-foreground">
                {formatTime(r.total_ms)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 border-y border-border py-6 text-muted-foreground">
          {view === "today"
            ? "Nadie ha entrado todavía hoy. Puedes ser el primero."
            : "Todavía no hay bloques esta semana."}
        </p>
      )}
      <p className="mt-4 text-sm text-muted-foreground">{JUEGO.rankingRules}</p>
      <p className="mt-2 text-sm">{JUEGO.ranking}</p>
    </section>
  );
}
