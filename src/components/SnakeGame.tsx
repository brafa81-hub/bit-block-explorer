import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Download,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JUEGO, verdictFor } from "@/content/juego";
import {
  ATTEMPTS,
  aliasSchema,
  dayNumber,
  formatPoints,
  formatTime,
  madridDay,
  type SnakeOutcome,
  type SnakeStart,
} from "@/lib/game";
import { enterRanking, startGame, submitGame } from "@/lib/game.functions";
import { gameVisitor, saveAlias, saveGameVisit, savedAlias, trackGame } from "@/lib/game-tracking";
import { gameShareImage, gameShareText } from "@/lib/game-share";
import {
  COLS,
  LIMIT_MS,
  ROWS,
  SnakeGame as Engine,
  START_BODY,
  chainSquares,
  type Dir,
} from "@/lib/snake";

const control = "min-h-12 rounded-none shadow-none whitespace-normal";
const KEYS: Record<string, Dir> = {
  ArrowUp: 0,
  ArrowRight: 1,
  ArrowDown: 2,
  ArrowLeft: 3,
  w: 0,
  d: 1,
  s: 2,
  a: 3,
};
type Hud = { blocks: number; points: number; reward: number; left: number; level: number };
const emptyHud: Hud = { blocks: 0, points: 0, reward: 50, left: LIMIT_MS, level: 0 };

function vibrate(ms: number) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* no todos los móviles vibran */
  }
}

/** Pinta el tablero: muros, bloque a comer y la cadena (la serpiente). */
function draw(canvas: HTMLCanvasElement, engine: Engine | null, layout: SnakeStart["layout"]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = canvas.width / COLS;
  const tokens = getComputedStyle(document.documentElement);
  const color = (name: string) => tokens.getPropertyValue(name).trim();
  ctx.fillStyle = color("--ink");
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color("--on-dark-border");
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++) ctx.fillRect((x + 0.5) * size - 1, (y + 0.5) * size - 1, 2, 2);
  const at = (c: number) => [(c % COLS) * size, Math.floor(c / COLS) * size] as const;
  // Muros
  ctx.fillStyle = color("--on-dark-muted");
  for (const c of layout.obstacles) {
    const [x, y] = at(c);
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  }
  // Bloque a comer
  const food = engine?.food ?? -1;
  if (food >= 0) {
    const [x, y] = at(food);
    ctx.strokeStyle = color("--instrument-dark");
    ctx.lineWidth = Math.max(2, size / 10);
    ctx.strokeRect(x + size * 0.18, y + size * 0.18, size * 0.64, size * 0.64);
    ctx.fillStyle = color("--instrument-dark");
    ctx.fillRect(x + size * 0.38, y + size * 0.38, size * 0.24, size * 0.24);
  }
  // La cadena: eslabones unidos entre sí
  const body = engine?.body ?? START_BODY;
  const gap = Math.max(2, size * 0.14);
  body.forEach((c, i) => {
    const [x, y] = at(c);
    ctx.fillStyle = i === 0 ? color("--on-dark") : color("--instrument-dark");
    ctx.fillRect(x + gap, y + gap, size - gap * 2, size - gap * 2);
    const next = body[i + 1];
    if (next !== undefined) {
      const [nx, ny] = at(next);
      ctx.fillStyle = color("--instrument-dark");
      const w = size * 0.3;
      ctx.fillRect(
        Math.min(x, nx) + (x === nx ? (size - w) / 2 : size / 2),
        Math.min(y, ny) + (y === ny ? (size - w) / 2 : size / 2),
        x === nx ? w : size,
        y === ny ? w : size,
      );
    }
  });
}

export function SnakeGame() {
  const start = useServerFn(startGame);
  const submit = useServerFn(submitGame);
  const enter = useServerFn(enterRanking);
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<"intro" | "playing" | "sending" | "result">("intro");
  const [run, setRun] = useState<SnakeStart | null>(null);
  const [outcome, setOutcome] = useState<SnakeOutcome | null>(null);
  const [hud, setHud] = useState<Hud>(emptyHud);
  const [waiting, setWaiting] = useState(true);
  const [flash, setFlash] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [alias, setAlias] = useState("");
  const [rankingMessage, setRankingMessage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardRef = useRef<HTMLElement | null>(null);
  const engine = useRef<Engine | null>(null);
  const queue = useRef<Dir[]>([]);
  const paused = useRef(true);
  const flashTimer = useRef(0);
  const touch = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const today = madridDay(new Date());

  useEffect(() => setAlias(savedAlias()), []);

  const repaint = useCallback(() => {
    if (canvasRef.current && run) draw(canvasRef.current, engine.current, run.layout);
  }, [run]);

  /** Ajusta el tablero al ancho disponible, con nitidez en pantallas de alta densidad. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (phase !== "playing" || !canvas) return;
    const resize = () => {
      const width = canvas.parentElement?.clientWidth ?? 300;
      // Que el marcador, el tablero y las flechas quepan a la vez en la pantalla del móvil.
      const cellSize = Math.max(
        12,
        Math.floor(Math.min(Math.min(width, 440) / COLS, (window.innerHeight - 280) / ROWS)),
      );
      const ratio = window.devicePixelRatio || 1;
      canvas.style.width = `${cellSize * COLS}px`;
      canvas.style.height = `${cellSize * ROWS}px`;
      canvas.width = Math.round(cellSize * COLS * ratio);
      canvas.height = Math.round(cellSize * ROWS * ratio);
      repaint();
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, [phase, repaint]);

  function showFlash(text: string) {
    setFlash(text);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(""), 1400);
  }

  const turn = useCallback((d: Dir) => {
    if (!engine.current || engine.current.over) return;
    if (paused.current) {
      paused.current = false;
      setWaiting(false);
    }
    if (queue.current.length < 2) queue.current.push(d);
  }, []);

  async function joinRanking(name: string, current: SnakeStart) {
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

  async function finish(current: SnakeStart, game: Engine) {
    setPhase("sending");
    setError("");
    try {
      const result = await submit({
        data: { runId: current.runId, secret: current.secret, moves: game.moves },
      });
      setOutcome(result);
      setRankingMessage("");
      setPhase("result");
      const saved = savedAlias();
      if (saved && result.counts) void joinRanking(saved, current);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido enviar la partida");
    }
  }

  async function begin() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const next = await start({ data: gameVisitor() });
      saveGameVisit(next.runId, next.secret);
      engine.current = new Engine(next.layout);
      queue.current = [];
      paused.current = true;
      setWaiting(true);
      setRun(next);
      setOutcome(null);
      setHud(emptyHud);
      setFlash("");
      setPhase("playing");
      window.setTimeout(
        () => boardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "La partida no ha podido empezar. Inténtalo otra vez.",
      );
    } finally {
      setBusy(false);
    }
  }

  /** Bucle del juego: avanza un paso cada vez que toca, según la velocidad del nivel. */
  useEffect(() => {
    if (phase !== "playing" || !run) return;
    /* Un reloj normal (setTimeout) marca los pasos. No depende de las animaciones del navegador,
     * que algunos móviles y vistas previas frenan o detienen. */
    let timer = 0;
    const tick = () => {
      const game = engine.current;
      if (!game) return;
      if (!paused.current && !game.over) {
        let next: Dir | null = null;
        while (queue.current.length) {
          const d = queue.current.shift()!;
          if (game.canTurn(d)) {
            next = d;
            break;
          }
        }
        const event = game.step(next);
        if (event.ate) vibrate(15);
        if (event.halving) showFlash(JUEGO.halving);
        else if (event.levelUp) showFlash(JUEGO.levelUp);
        repaint();
        setHud({
          blocks: game.blocks,
          points: game.points,
          reward: game.reward,
          left: LIMIT_MS - game.timeMs,
          level: game.level,
        });
      }
      if (game.over) {
        if (game.dead) {
          vibrate(120);
          canvasRef.current?.classList.add("game-shake");
        }
        showFlash(game.dead ? JUEGO.crashed : JUEGO.timeUp);
        window.setTimeout(() => void finish(run, game), 900);
        return;
      }
      // En pausa se comprueba a menudo si ya se puede seguir; jugando, al ritmo del nivel.
      timer = window.setTimeout(tick, paused.current ? 50 : game.tickMs);
    };
    timer = window.setTimeout(tick, 50);
    // Al cambiar de pestaña se pausa; se sigue con el siguiente gesto.
    const onHide = () => {
      if (document.hidden && engine.current && !engine.current.over) {
        paused.current = true;
        setWaiting(true);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const d = KEYS[e.key];
      if (d === undefined) return;
      e.preventDefault();
      turn(d);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, run]);

  /* Controles táctiles durante la partida:
   * - Se puede deslizar en cualquier punto de la zona de juego, no solo sobre el tablero.
   * - La página no se desplaza ni hace zoom mientras se juega.
   * - El giro se aplica en cuanto el gesto es claro, sin esperar a levantar el dedo. */
  useEffect(() => {
    const zone = boardRef.current;
    if (phase !== "playing" || !zone) return;
    const html = document.documentElement;
    const previous = { overflow: html.style.overflow, overscroll: html.style.overscrollBehavior };
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) touch.current = { x: t.clientX, y: t.clientY, moved: false };
    };
    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const from = touch.current;
      if (!t || !from) return;
      const dx = t.clientX - from.x;
      const dy = t.clientY - from.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0);
      touch.current = { x: t.clientX, y: t.clientY, moved: true };
    };
    const onEnd = () => {
      // Un toque sin deslizar solo sirve para empezar o seguir tras una pausa.
      if (touch.current && !touch.current.moved && paused.current && engine.current) {
        paused.current = false;
        setWaiting(false);
      }
      touch.current = null;
    };
    zone.addEventListener("touchstart", onStart, { passive: true });
    zone.addEventListener("touchmove", onMove, { passive: false });
    zone.addEventListener("touchend", onEnd);
    zone.addEventListener("touchcancel", onEnd);
    return () => {
      html.style.overflow = previous.overflow;
      html.style.overscrollBehavior = previous.overscroll;
      zone.removeEventListener("touchstart", onStart);
      zone.removeEventListener("touchmove", onMove);
      zone.removeEventListener("touchend", onEnd);
      zone.removeEventListener("touchcancel", onEnd);
    };
  }, [phase, turn]);

  async function share(action: "share" | "copy" | "download") {
    if (!outcome || !run) return;
    const shared = {
      dayNumber: run.dayNumber,
      blocks: outcome.blocks,
      points: outcome.points,
      crashed: outcome.crashed,
    };
    const text = gameShareText(shared);
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
        const blob = await gameShareImage(shared);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bloque170-cadena-${run.dayNumber}.png`;
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

  const pad = (d: Dir, label: string, Icon: typeof ArrowUp, area: string) => (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        turn(d);
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="flex h-16 w-20 touch-manipulation select-none items-center justify-center border border-foreground/40 bg-background [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] active:bg-instrument/30"
      style={{ gridArea: area }}
    >
      <Icon className="size-7" />
    </button>
  );

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
          <ul className="mt-6 grid max-w-2xl gap-1 bg-ink p-4 text-[15px] text-on-dark">
            {JUEGO.rewards.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-sm">{JUEGO.rules}</p>
          <Button className={`${control} mt-7 px-10 text-base`} disabled={busy} onClick={begin}>
            {busy ? "Preparando…" : "Empezar →"}
          </Button>
        </section>
      )}

      {(phase === "playing" || phase === "sending") && run && (
        <section ref={boardRef} className="touch-none select-none scroll-mt-2 pb-10">
          <div className="mx-auto max-w-[440px]">
            <div className="flex items-end justify-between gap-3 font-mono">
              <div>
                <p className="text-xs text-muted-foreground">Bloques</p>
                <p className="text-2xl">{hud.blocks}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Puntos</p>
                <p key={hud.points} className="game-pop text-2xl">
                  {formatPoints(hud.points)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Por bloque</p>
                <p className="text-2xl text-primary">+{hud.reward}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tiempo</p>
                <p className={`text-2xl ${hud.left <= 10000 ? "text-primary" : ""}`}>
                  {formatTime(hud.left)}
                </p>
              </div>
            </div>
            <div className="mt-2 h-1 w-full bg-border" aria-hidden="true">
              <div
                className="h-1 bg-foreground"
                style={{ width: `${(hud.left / LIMIT_MS) * 100}%` }}
              />
            </div>
            <div className="relative mt-3 flex justify-center">
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Tablero del juego. ${hud.blocks} bloques, ${hud.points} puntos.`}
                className="block touch-none select-none"
                onClick={() => {
                  if (paused.current && engine.current && !engine.current.over) {
                    paused.current = false;
                    setWaiting(false);
                  }
                }}
              />
              {(waiting || flash || phase === "sending") && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center">
                  <p className="bg-ink/85 px-4 py-3 text-lg text-on-dark">
                    {phase === "sending"
                      ? "Comprobando tu cadena…"
                      : flash ||
                        (hud.blocks || engine.current?.tick
                          ? "Pausa. Desliza o toca una flecha para seguir."
                          : "Desliza o toca una flecha para empezar.")}
                  </p>
                </div>
              )}
            </div>
            <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
              Dificultad {hud.level + 1} · Intento {run.attempt}
            </p>
            <div
              className="mx-auto mt-3 grid w-fit gap-2"
              style={{ gridTemplateAreas: '". up ." "left down right"' }}
            >
              {pad(0, "Arriba", ArrowUp, "up")}
              {pad(3, "Izquierda", ArrowLeft, "left")}
              {pad(2, "Abajo", ArrowDown, "down")}
              {pad(1, "Derecha", ArrowRight, "right")}
            </div>
          </div>
        </section>
      )}

      {phase === "result" && outcome && run && (
        <section className="pb-12">
          <p className="font-mono text-sm text-primary">
            {JUEGO.daily} #{run.dayNumber} · Intento {outcome.attempt}
          </p>
          <p className="mt-3 font-mono text-7xl" aria-label="Puntos">
            {formatPoints(outcome.points)}{" "}
            <span className="text-2xl text-muted-foreground">puntos</span>
          </p>
          <p className="mt-2 text-xl">
            {outcome.blocks} bloques · {outcome.crashed ? JUEGO.crashed : JUEGO.timeUp} a los{" "}
            {formatTime(outcome.timeMs)}
          </p>
          {outcome.betterThan !== null && outcome.points > 0 && (
            <p className="mt-3 text-2xl">
              Mejor que el {outcome.betterThan} % de los mineros de hoy
            </p>
          )}
          <p className="mt-3 max-w-xl text-[17px]">{verdictFor(outcome.blocks)}</p>
          <p className="mt-4 text-3xl" aria-hidden="true">
            {chainSquares(outcome.blocks)} {outcome.crashed ? "💥" : "⏱️"}
          </p>
          <p className="mt-4 max-w-xl border-l-2 border-primary pl-4 text-sm">
            {JUEGO.attemptsLeft(Math.max(0, ATTEMPTS - outcome.attempt))}
          </p>

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
            <Button variant="outline" className={control} onClick={begin} disabled={busy}>
              <RotateCcw /> Otro intento
            </Button>
          </div>
          {notice && (
            <p role="status" className="mt-3 text-sm">
              {notice}
            </p>
          )}

          {outcome.counts && (
            <div className="mt-8 border border-border p-5">
              <h2 className="text-xl tracking-normal">{JUEGO.aliasAsk}</h2>
              {rankingMessage && (
                <p role="status" className="mt-3 text-[17px]">
                  {rankingMessage}
                </p>
              )}
              {!rankingMessage && (
                <form
                  className="mt-4 flex flex-wrap items-end gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void joinRanking(alias, run);
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
          )}

          <ol className="mt-8 grid max-w-2xl gap-3">
            {JUEGO.lessons.map((t, i) => (
              <li key={i} className="border-l-2 border-primary pl-4 text-[17px]">
                {t}
              </li>
            ))}
          </ol>

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
        </section>
      )}
      {error && (
        <div role="alert" className="mb-6 border border-border p-4">
          <p>{error}</p>
          <div className="mt-3 flex gap-3">
            {phase === "sending" && run && engine.current && (
              <Button className={control} onClick={() => void finish(run, engine.current!)}>
                Reintentar envío
              </Button>
            )}
            <Button variant="outline" className={control} disabled={busy} onClick={begin}>
              Empezar de nuevo
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
