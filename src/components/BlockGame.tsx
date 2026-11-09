import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Download, Share2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JUEGO, verdictFor } from "@/content/juego";
import {
  aliasSchema,
  dayNumber,
  formatScore,
  formatTime,
  madridDay,
  scoreSquare,
  selectionTotal,
  type Box,
  type Challenge,
  type RoundResult,
} from "@/lib/game";
import { enterRanking, startGame, submitGame } from "@/lib/game.functions";
import { gameVisitor, saveAlias, saveGameVisit, savedAlias, trackGame } from "@/lib/game-tracking";
import { gameShareImage, gameShareText, gameShareUrl } from "@/lib/game-share";

const sats = (n: number) =>
  n
    .toLocaleString("es-ES", { useGrouping: true, minimumFractionDigits: 0 })
    .replace(/^(\d)(\d{3})$/, "$1.$2");
const control = "min-h-12 rounded-none shadow-none whitespace-normal";
const PLAYED = "bloque170-jugado";

/** Intensidad de color según lo que paga cada caja por hueco, comparada con las demás del reto. */
function tiers(boxes: Box[]) {
  const rates = boxes.map((b) => b.fee / b.size).sort((a, b) => a - b);
  const low = rates[Math.floor(rates.length / 3)] ?? 0,
    high = rates[Math.floor((rates.length * 2) / 3)] ?? 0;
  return (b: Box) => {
    const r = b.fee / b.size;
    return r >= high ? 2 : r >= low ? 1 : 0;
  };
}
const tierClass = ["bg-instrument/10", "bg-instrument/30", "bg-instrument/60"];

function Slots({ size }: { size: number }) {
  return (
    <span className="flex gap-[3px]" aria-hidden="true">
      {Array.from({ length: size }, (_, i) => (
        <span key={i} className="size-[7px] bg-current opacity-70" />
      ))}
    </span>
  );
}

export function BlockGame() {
  const start = useServerFn(startGame);
  const submit = useServerFn(submitGame);
  const enter = useServerFn(enterRanking);
  const queryClient = useQueryClient();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const chosen = useRef<string[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [phase, setPhase] = useState<"intro" | "playing" | "between" | "result">("intro");
  const [remaining, setRemaining] = useState(0);
  const deadline = useRef(0);
  const sending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [shake, setShake] = useState<string | null>(null);
  const [alias, setAlias] = useState("");
  const [rankingMessage, setRankingMessage] = useState("");
  const [playedToday, setPlayedToday] = useState(false);
  const final = results.length === 3 ? results[2] : null;
  const total = selectionTotal(challenge?.boxes ?? [], selected);
  const tierOf = tiers(challenge?.boxes ?? [{ id: "x", size: 1, fee: 1 }]);
  const today = madridDay(new Date());

  useEffect(() => {
    setAlias(savedAlias());
    try {
      setPlayedToday(localStorage.getItem(PLAYED) === madridDay(new Date()));
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  async function begin(fresh = false) {
    setError("");
    setNotice("");
    setBusy(true);
    const requested = performance.now();
    try {
      const visitor = gameVisitor();
      const next = await start({
        data: {
          ...visitor,
          ...(!fresh && challenge ? { runId: challenge.runId, secret: challenge.secret } : {}),
        },
      });
      if (fresh) {
        setResults([]);
        setRankingMessage("");
      }
      setChallenge(next);
      setSelected([]);
      chosen.current = [];
      sending.current = false;
      // El servidor manda: aquí solo descontamos el viaje de red para no dar tiempo de más.
      deadline.current =
        performance.now() + Math.max(0, next.remainingMs - (performance.now() - requested));
      setRemaining(Math.max(0, deadline.current - performance.now()));
      saveGameVisit(next.runId, next.secret);
      setPhase("playing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "El reto no ha podido empezar. Inténtalo otra vez.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function joinRanking(name: string, current: Challenge) {
    const parsed = aliasSchema.safeParse(name);
    if (!parsed.success) {
      setRankingMessage(parsed.error.issues[0]?.message ?? "Alias no válido");
      return;
    }
    setBusy(true);
    try {
      const r = await enter({
        data: { runId: current.runId, secret: current.secret, alias: parsed.data },
      });
      if (r.entered) saveAlias(parsed.data);
      setRankingMessage(r.message);
      void queryClient.invalidateQueries({ queryKey: ["game-ranking"] });
    } catch {
      setRankingMessage("No se ha podido guardar. Inténtalo otra vez.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    if (!challenge || sending.current) return;
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await submit({
        data: {
          runId: challenge.runId,
          secret: challenge.secret,
          round: challenge.round,
          selected: chosen.current,
        },
      });
      setResults((prev) => [...prev.slice(0, challenge.round - 1), result]);
      if (result.complete) {
        setPhase("result");
        const wasPlayed = playedToday;
        try {
          localStorage.setItem(PLAYED, challenge.day);
        } catch {
          /* sin almacenamiento */
        }
        setPlayedToday(true);
        const saved = savedAlias();
        if (saved && !wasPlayed) void joinRanking(saved, challenge);
      } else setPhase("between");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido enviar el bloque");
      sending.current = false;
    } finally {
      setBusy(false);
    }
  }
  const finishRef = useRef(finish);
  finishRef.current = finish;
  useEffect(() => {
    if (phase !== "playing") return;
    const tick = () => {
      const ms = Math.max(0, deadline.current - performance.now());
      setRemaining(ms);
      if (ms === 0 && !sending.current) void finishRef.current();
    };
    const timer = window.setInterval(tick, 200);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [phase, challenge]);

  function toggle(id: string) {
    if (!challenge || busy || remaining <= 0) return;
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    if (selectionTotal(challenge.boxes, next).size > challenge.capacity) {
      setNotice(JUEGO.noFit);
      setShake(id);
      window.setTimeout(() => setShake(null), 450);
      return;
    }
    setNotice("");
    setSelected(next);
    chosen.current = next;
  }

  async function share(action: "share" | "copy" | "download") {
    if (!final || final.finalScore === null || !challenge) return;
    const scores = results.map((r) => r.score);
    const text = gameShareText(challenge.dayNumber, scores, final.finalScore);
    setNotice("");
    try {
      if (action === "copy") {
        await navigator.clipboard.writeText(text);
        setNotice("Resultado copiado. Pégalo donde quieras.");
      } else if (action === "share") {
        if (navigator.share) await navigator.share({ text });
        else {
          await navigator.clipboard.writeText(text);
          setNotice("Resultado copiado. Pégalo donde quieras.");
        }
      } else {
        const blob = await gameShareImage(challenge.dayNumber, scores, final.finalScore);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bloque170-${challenge.dayNumber}.png`;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice("Imagen descargada.");
      }
      trackGame("compartir", action);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setNotice("No se ha podido compartir. Prueba a copiar el resultado.");
    }
  }

  const last = results.at(-1);
  const urgent = remaining > 0 && remaining <= 10000;

  return (
    <>
      {phase === "intro" && (
        <section className="pb-10">
          <p className="font-mono text-sm text-primary">
            {JUEGO.daily} #{dayNumber(today)}
          </p>
          <p className="mt-3 max-w-2xl text-2xl leading-snug">{JUEGO.hook}</p>
          <ol className="mt-7 grid max-w-2xl gap-3">
            {JUEGO.howTo.map((t, i) => (
              <li key={i} className="flex gap-4 border-t border-border pt-3 text-[17px]">
                <span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>
                {t}
              </li>
            ))}
          </ol>
          {/* Ejemplo visual: una caja pequeña que paga bien y una grande que paga poco por hueco. */}
          <div className="mt-6 flex max-w-md items-stretch gap-2" aria-hidden="true">
            <div
              className={`flex min-h-16 w-[30%] flex-col justify-between border border-primary p-2 ${tierClass[2]}`}
            >
              <span className="font-mono text-sm">2.400</span>
              <Slots size={2} />
            </div>
            <div
              className={`flex min-h-16 w-[60%] flex-col justify-between border border-border p-2 ${tierClass[0]}`}
            >
              <span className="font-mono text-sm">2.800</span>
              <Slots size={6} />
            </div>
          </div>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            La caja pequeña paga casi lo mismo y deja sitio para otras. {JUEGO.sats}
          </p>
          <p className="mt-6 font-mono text-sm">{JUEGO.rounds}</p>
          {playedToday && (
            <p className="mt-4 max-w-2xl border-l-2 border-primary pl-4 text-sm">
              {JUEGO.playedToday}
            </p>
          )}
          <Button
            className={`${control} mt-7 px-10 text-base`}
            disabled={busy}
            onClick={() => begin(true)}
          >
            {busy ? "Preparando…" : "Empezar →"}
          </Button>
        </section>
      )}

      {phase === "playing" && challenge && (
        <section className="pb-10">
          <div className="sticky top-0 z-10 -mx-5 bg-background px-5 pb-3 pt-3 sm:-mx-8 sm:px-8">
            <div className="flex items-center justify-between gap-3">
              <p className="index-label">Bloque {challenge.round} de 3</p>
              <span
                aria-label="Tiempo restante"
                className={`font-mono text-2xl ${urgent ? "text-primary" : ""}`}
              >
                {formatTime(remaining)}
              </span>
            </div>
            <div className="mt-2 h-1 w-full bg-border" aria-hidden="true">
              <div
                className={`h-1 ${urgent ? "bg-primary" : "bg-foreground"}`}
                style={{
                  width: `${remaining / (challenge.timeLimit * 10)}%`,
                  transition: "width 200ms linear",
                }}
              />
            </div>
            {/* El bloque: cada caja ocupa sus huecos. Tocar una caja del bloque la saca. */}
            <div className="mt-4 bg-ink p-3 text-on-dark">
              <div className="flex items-baseline justify-between text-sm">
                <span>
                  Tu bloque · {total.size} de {challenge.capacity} huecos
                </span>
                <span key={total.fee} className="game-pop font-mono text-xl">
                  {sats(total.fee)} <span className="text-xs">sats</span>
                </span>
              </div>
              <div
                className="mt-2 grid h-14 gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${challenge.capacity}, minmax(0, 1fr))` }}
              >
                {selected.map((id) => {
                  const b = challenge.boxes.find((x) => x.id === id)!;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggle(id)}
                      aria-label={`Sacar caja de ${b.fee} sats`}
                      className="game-drop flex items-center justify-center overflow-hidden bg-instrument-dark font-mono text-[11px] text-ink"
                      style={{ gridColumn: `span ${b.size}` }}
                    >
                      {b.size > 1 ? sats(b.fee) : ""}
                    </button>
                  );
                })}
                {Array.from({ length: challenge.capacity - total.size }, (_, i) => (
                  <span key={`e${i}`} className="border border-dashed border-on-dark-border" />
                ))}
              </div>
            </div>
            {notice && (
              <p role="status" className="mt-2 text-sm text-primary">
                {notice}
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{JUEGO.legend}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {challenge.boxes.map((b) => {
              const inside = selected.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={inside}
                  aria-label={`Caja de ${b.size} huecos que paga ${b.fee} sats${inside ? ", dentro del bloque" : ""}`}
                  disabled={busy || remaining <= 0}
                  onClick={() => toggle(b.id)}
                  className={`flex min-h-[72px] min-w-[64px] flex-col justify-between border p-2 text-left transition-all active:scale-95 ${tierClass[tierOf(b)]} ${inside ? "border-dashed border-border opacity-30" : "border-foreground/40"} ${shake === b.id ? "game-shake" : ""}`}
                  style={{ width: `calc(${(b.size / challenge.capacity) * 100}% - 8px)` }}
                >
                  <span className="font-mono text-base leading-none">{sats(b.fee)}</span>
                  <span className="mt-2">
                    <Slots size={b.size} />
                  </span>
                </button>
              );
            })}
          </div>
          <Button
            disabled={busy}
            onClick={() => finish()}
            className={`${control} mt-6 w-full sm:w-auto sm:px-10`}
          >
            {busy ? "Enviando…" : "Cerrar bloque →"}
          </Button>
        </section>
      )}

      {phase === "between" && challenge && last && (
        <section className="pb-10">
          <p className="index-label">Bloque {last.round} cerrado</p>
          <p className="mt-4 font-mono text-6xl">
            {formatScore(last.score)} <span className="text-xl text-muted-foreground">/ 10</span>
          </p>
          <p className="mt-3 text-[17px]">
            Tu bloque: <span className="font-mono">{sats(last.fee)} sats</span>. El mejor posible:{" "}
            <span className="font-mono">{sats(last.best)} sats</span>.
          </p>
          <PerfectBlock challenge={challenge} perfect={last.perfect} />
          <p className="mt-6 max-w-xl border-l-2 border-primary pl-4 text-[17px]">
            {JUEGO.lessons[last.round - 1]}
          </p>
          <Button className={`${control} mt-7 px-10`} disabled={busy} onClick={() => begin()}>
            Siguiente bloque →
          </Button>
        </section>
      )}

      {phase === "result" && final && challenge && (
        <section className="pb-12">
          <p className="font-mono text-sm text-primary">
            {JUEGO.daily} #{challenge.dayNumber}
          </p>
          <p className="mt-3 font-mono text-7xl" aria-label="Nota final">
            {formatScore(final.finalScore ?? 0)}{" "}
            <span className="text-2xl text-muted-foreground">/ 10</span>
          </p>
          {final.betterThan !== null && (
            <p className="mt-3 text-2xl">Mejor que el {final.betterThan} % de los mineros de hoy</p>
          )}
          <p className="mt-3 max-w-xl text-[17px]">{verdictFor(final.finalScore ?? 0)}</p>
          <p className="mt-4 text-3xl" aria-label="Nota de cada bloque">
            {results.map((r) => scoreSquare(r.score)).join(" ")}
          </p>
          <ol className="mt-3 grid max-w-sm grid-cols-3 gap-3">
            {results.map((r) => (
              <li key={r.round} className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground">Bloque {r.round}</p>
                <p className="font-mono">{formatScore(r.score)}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            Tiempo total: <span className="font-mono">{formatTime(final.totalMs ?? 0)}</span>
          </p>
          <PerfectBlock challenge={challenge} perfect={final.perfect} />
          <p className="mt-4 max-w-xl border-l-2 border-primary pl-4">{JUEGO.lessons[2]}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button className={control} onClick={() => share("share")}>
              <Share2 /> Compartir resultado
            </Button>
            <Button variant="outline" className={control} onClick={() => share("copy")}>
              <Copy /> Copiar
            </Button>
            <Button variant="outline" className={control} onClick={() => share("download")}>
              <Download /> Imagen
            </Button>
          </div>
          {notice && (
            <p role="status" className="mt-3 text-sm">
              {notice}
            </p>
          )}

          <div className="mt-8 border border-border p-5">
            <h2 className="text-xl tracking-normal">{JUEGO.aliasAsk}</h2>
            {rankingMessage && (
              <p role="status" className="mt-3 text-[17px]">
                {rankingMessage}
              </p>
            )}
            {!rankingMessage.startsWith("¡Dentro") && (
              <form
                className="mt-4 flex flex-wrap items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void joinRanking(alias, challenge);
                }}
              >
                <label className="text-sm">
                  Alias
                  <input
                    maxLength={20}
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className="mt-1 block min-h-12 w-56 border border-input bg-background px-3 text-base"
                  />
                </label>
                <Button className={control} disabled={busy || !alias.trim()} type="submit">
                  Entrar en el ranking
                </Button>
              </form>
            )}
            <p className="mt-2 text-xs text-muted-foreground">{JUEGO.aliasHelp}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border-t border-border pt-4">
              <p>{JUEGO.next.waitTitle}</p>
              <Button asChild className={`${control} mt-3`}>
                <Link to="/minar" hash="potencia">
                  {JUEGO.next.wait}
                </Link>
              </Button>
            </div>
            <div className="border-t border-border pt-4">
              <p>{JUEGO.next.learnTitle}</p>
              <Button asChild variant="outline" className={`${control} mt-3`}>
                <Link to="/aprende">{JUEGO.next.learn}</Link>
              </Button>
            </div>
          </div>

          <aside className="mt-10 bg-ink p-6 text-on-dark">
            <p className="index-label text-on-dark-muted">{JUEGO.why170.title}</p>
            <p className="mt-3 max-w-2xl">{JUEGO.why170.text}</p>
          </aside>

          <Button
            variant="ghost"
            className={`${control} mt-6`}
            onClick={() => begin(true)}
            disabled={busy}
          >
            <RotateCcw /> Repetir (no cuenta para el ranking)
          </Button>
        </section>
      )}
      {error && (
        <div role="alert" className="mb-6 border border-border p-4">
          <p>{error}</p>
          <div className="mt-3 flex gap-3">
            {phase === "playing" && remaining > 0 && (
              <Button className={control} onClick={() => finish()}>
                Reintentar envío
              </Button>
            )}
            <Button
              variant="outline"
              className={control}
              disabled={busy}
              onClick={() => begin(true)}
            >
              Empezar de nuevo
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/** Muestra la combinación perfecta del bloque recién cerrado. */
function PerfectBlock({ challenge, perfect }: { challenge: Challenge; perfect: string[] }) {
  const boxes = challenge.boxes.filter((b) => perfect.includes(b.id));
  return (
    <div className="mt-5 max-w-xl">
      <p className="text-sm text-muted-foreground">Así era el bloque perfecto:</p>
      <div
        className="mt-2 grid h-10 gap-[3px] bg-ink p-[3px]"
        style={{ gridTemplateColumns: `repeat(${challenge.capacity}, minmax(0, 1fr))` }}
      >
        {boxes.map((b) => (
          <span
            key={b.id}
            className="flex items-center justify-center overflow-hidden bg-instrument-dark font-mono text-[10px] text-ink"
            style={{ gridColumn: `span ${b.size}` }}
          >
            {b.size > 1 ? sats(b.fee) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
