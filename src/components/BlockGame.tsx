import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, Share2, Plus, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JUEGO } from "@/content/juego";
import { formatTime, selectionTotal, type Challenge, type RoundResult } from "@/lib/game";
import { enrollGame, startGame, submitGame } from "@/lib/game.functions";
import { gameVisitor, saveGameVisit, trackGame } from "@/lib/game-tracking";
import { gameShareImage, gameShareUrl } from "@/lib/game-share";

const number = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });
const control = "min-h-11 rounded-none shadow-none whitespace-normal";

export function BlockGame() {
  const start = useServerFn(startGame);
  const submit = useServerFn(submitGame);
  const enroll = useServerFn(enrollGame);
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
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [consent, setConsent] = useState(false);
  const total = selectionTotal(challenge?.transactions ?? [], selected);
  const final = results[2];

  async function begin(fresh = false) {
    setError(""); setNotice(""); setBusy(true);
    const requested = performance.now();
    try {
      const visitor = gameVisitor();
      const next = await start({ data: { ...visitor, ...(!fresh && challenge ? { runId: challenge.runId, secret: challenge.secret } : {}) } });
      if (fresh) setResults([]);
      setChallenge(next); setSelected([]); chosen.current = []; sending.current = false;
      // Account for the network trip conservatively; server time remains authoritative.
      deadline.current = performance.now() + Math.max(0, next.remainingMs - (performance.now() - requested));
      setRemaining(Math.max(0, deadline.current - performance.now()));
      saveGameVisit(next.runId, next.secret); setPhase("playing");
    } catch (e) { setError(e instanceof Error ? e.message : "Le reto no ha podido empezar"); }
    finally { setBusy(false); }
  }
  async function finish() {
    if (!challenge || sending.current) return;
    sending.current = true; setBusy(true); setError("");
    try {
      const result = await submit({ data: { runId: challenge.runId, secret: challenge.secret, challengeId: challenge.challengeId, selected: chosen.current } });
      setResults(prev => [...prev.slice(0, challenge.challengeId - 1), result]);
      setPhase(result.complete ? "result" : "between");
    } catch (e) { setError(e instanceof Error ? e.message : "No se ha podido enviar el bloque"); sending.current = false; }
    finally { setBusy(false); }
  }
  const finishRef = useRef(finish);
  finishRef.current = finish;
  useEffect(() => {
    if (phase !== "playing") return;
    const tick = () => {
      const ms = Math.max(0, deadline.current - performance.now()); setRemaining(ms);
      if (ms === 0 && !sending.current) void finishRef.current();
    };
    const timer = window.setInterval(tick, 200);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", tick); };
  }, [phase, challenge]);

  function toggle(id: string) {
    if (busy || remaining <= 0) return;
    const tx = challenge?.transactions.find(t => t.id === id);
    if (!tx) return;
    const next = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id];
    if (selectionTotal(challenge?.transactions ?? [], next).size > (challenge?.capacity ?? 0)) { setNotice("Esta transacción no cabe. Saca otra del bloque primero."); return; }
    setNotice(""); setSelected(next); chosen.current = next;
  }
  async function share(action: "share" | "copy" | "download") {
    if (!final || final.finalScore === null) return;
    setNotice("");
    try {
      if (action === "copy") { await navigator.clipboard.writeText(gameShareUrl()); setNotice("Enlace copiado."); }
      else {
        const blob = await gameShareImage(final.finalScore);
        const file = new File([blob], "mi-bloque170.png", { type: "image/png" });
        if (action === "share" && navigator.share) {
          if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: JUEGO.title, text: `${JUEGO.shareText} ${gameShareUrl()}`, url: gameShareUrl() });
          else await navigator.share({ title: JUEGO.title, text: JUEGO.shareText, url: gameShareUrl() });
        } else if (action === "share") { await navigator.clipboard.writeText(gameShareUrl()); setNotice("Enlace copiado para compartir."); }
        else {
          const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "mi-bloque170.png"; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("Imagen descargada.");
        }
      }
      trackGame("compartir", action);
    } catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) setNotice("No se ha podido compartir. Prueba a copiar el enlace."); }
  }
  return <>
    {phase === "intro" && <section className="pb-10">
      <p className="max-w-2xl text-[17px]">{JUEGO.introduction}</p>
      <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{JUEGO.analogy} {JUEGO.reality}</p>
      <ol className="mt-8 grid gap-5 sm:grid-cols-3">{JUEGO.challenges.map((c, i) => <li key={c.name} className="border-t border-border pt-4">
        <p className="index-label">{String(i + 1).padStart(3, "0")} / reto</p><h2 className="mt-2 text-xl tracking-normal">{c.name}</h2><p className="mt-2 font-mono text-sm">{c.count} transacciones · {c.seconds} s</p>
      </li>)}</ol>
      <Button className={`${control} mt-8 px-8`} disabled={busy} onClick={() => begin(true)}>Empezar a construir →</Button>
    </section>}

    {phase === "playing" && challenge && <section className="pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><p className="index-label">{String(challenge.challengeId).padStart(3, "0")} / reto {challenge.name}</p><span aria-label="Tiempo restante" className="font-mono text-2xl">{formatTime(remaining)}</span></div>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="order-2 lg:order-1">
          <h2 className="text-xl tracking-normal">Transacciones pendientes</h2><p className="mt-2 text-sm text-muted-foreground">{JUEGO.sats}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{challenge.transactions.map(t => <Button key={t.id} variant="outline" aria-label={`Transacción ${t.id}: ${t.size} unidades, ${t.fee} sats`} aria-pressed={selected.includes(t.id)} disabled={busy || remaining <= 0} onClick={() => toggle(t.id)} className={`h-auto min-h-[132px] flex-col items-stretch gap-1 rounded-none px-3 py-3 shadow-none hover:bg-background hover:text-foreground ${selected.includes(t.id) ? "border-primary bg-primary/5" : "border-border"}`}>
            <span className="flex items-center justify-between text-xs text-muted-foreground"><span className="font-mono">{t.id.toUpperCase()}</span>{selected.includes(t.id) ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}</span>
            <span className="mt-2 text-left font-mono text-lg">{number(t.fee)} <span className="text-xs">sats</span></span>
            <span className="text-left font-mono text-xs text-muted-foreground">{t.size} unidades</span>
            <span className="text-left font-mono text-xs text-muted-foreground">{(t.fee / t.size).toFixed(1).replace(".", ",")} sats/u</span>
          </Button>)}</div>
        </div>
        <div className="order-1 border border-border bg-ink p-5 text-on-dark lg:order-2 lg:sticky lg:top-5">
          <h2 className="text-xl tracking-normal">Tu bloque</h2>
          <div className="mt-4 grid grid-cols-10 gap-1" role="img" aria-label={`Bloque ocupado al ${Math.round(total.size / challenge.capacity * 100)} por ciento`}>{Array.from({ length: 50 }, (_, i) => <span key={i} className={`aspect-square border border-on-dark-border ${i < Math.round(total.size / challenge.capacity * 50) ? "bg-instrument-dark" : "bg-transparent"}`} />)}</div>
          <progress aria-label="Espacio usado" value={total.size} max={challenge.capacity} className="mt-4 h-2 w-full accent-instrument-dark" />
          <div className="mt-2 flex justify-between text-xs"><span>Espacio usado</span><span className="font-mono" data-testid="space-used">{total.size} / {challenge.capacity}</span></div>
          <p className="mt-5 text-sm text-on-dark-muted">Comisión total</p><p className="font-mono text-3xl" data-testid="fee-total">{number(total.fee)} <span className="text-sm">sats</span></p>
          <p className="mt-2 text-xs text-on-dark-muted">{selected.length} transacciones dentro</p>
          <Button disabled={busy} onClick={() => finish()} className={`${control} mt-5 w-full bg-instrument-dark text-ink hover:bg-instrument-dark/90`}>{busy ? "Enviando…" : "Cerrar bloque →"}</Button>
        </div>
      </div>
    </section>}

    {phase === "between" && challenge && <section className="border-t border-border py-10">
      <p className="index-label">Reto {challenge.challengeId} terminado</p><h2 className="mt-4 text-3xl tracking-normal">Tu bloque está cerrado</h2>
      <p className="mt-5 font-mono text-5xl">{results.at(-1)?.score.toFixed(1).replace(".", ",")} <span className="text-xl text-muted-foreground">/ 10</span></p>
      <p className="mt-3 text-sm text-muted-foreground">Tiempo: {formatTime(results.at(-1)?.elapsedMs ?? 0)}</p>
      <Button className={`${control} mt-7`} disabled={busy} onClick={() => begin()}>Construir el siguiente bloque →</Button>
    </section>}

    {phase === "result" && final && <section className="pb-12">
      <div className="border-y border-border py-8">
        <p className="index-label">002 / tus tres bloques</p><p className="mt-5 font-mono text-7xl" aria-label="Nota final">{final.finalScore?.toFixed(1).replace(".", ",")} <span className="text-2xl text-muted-foreground">/ 10</span></p>
        <h2 className="mt-4 max-w-xl text-2xl tracking-normal">{JUEGO.results[(final.finalScore ?? 0) >= 8 ? 2 : (final.finalScore ?? 0) >= 5 ? 1 : 0]}</h2>
        <ol className="mt-6 grid grid-cols-3 gap-4">{results.map((r, i) => <li key={i} className="border-t border-border pt-3"><p className="index-label">Reto {i + 1}</p><p className="mt-2 font-mono text-xl">{r.score.toFixed(1).replace(".", ",")}</p><p className="font-mono text-xs text-muted-foreground">{formatTime(r.elapsedMs)}</p></li>)}</ol>
        <p className="mt-5 text-sm">Tiempo total: <span className="font-mono">{formatTime(final.totalMs ?? 0)}</span></p>
        <p className="mt-6 max-w-2xl text-sm">{JUEGO.strategy}</p><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{JUEGO.strategyReality}</p>
      </div>
      <div className="mt-8 border border-border p-6" aria-label="Tarjeta para compartir">
        <p className="text-sm font-medium">BLOQUE170.COM</p><p className="mt-3 text-xl">{JUEGO.title}</p><p className="mt-3 font-mono text-4xl">{final.finalScore?.toFixed(1).replace(".", ",")} / 10</p><p className="mt-4 break-words text-sm">{JUEGO.shareText}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button className={control} onClick={() => share("share")}><Share2 /> Compartir</Button>
        <Button variant="outline" className={control} onClick={() => share("copy")}><Copy /> Copiar enlace</Button>
        <Button variant="outline" className={control} onClick={() => share("download")}><Download /> Descargar imagen</Button>
      </div>
      <form className="mt-10 border-t border-border pt-8" onSubmit={async e => { e.preventDefault(); if (!challenge || !consent) return; setBusy(true); try { const result = await enroll({ data: { runId: challenge.runId, secret: challenge.secret, email, alias, consent: true } }); setNotice(result.message); } catch { setNotice("No se ha podido registrar tu bloque."); } finally { setBusy(false); } }}>
        <h2 className="text-xl tracking-normal">Entra en el ranking semanal <span className="text-sm text-muted-foreground">· opcional</span></h2>
        <p className="mt-3 text-sm text-muted-foreground">{JUEGO.first}</p><p className="mt-2 text-sm">{JUEGO.emailUnavailable}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm">Email<input type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className="mt-1 min-h-11 w-full border border-input bg-background px-3" autoComplete="email" /></label><label className="text-sm">Alias público<input required maxLength={20} value={alias} onChange={e => setAlias(e.target.value)} className="mt-1 min-h-11 w-full border border-input bg-background px-3" /><span className="mt-1 block text-xs text-muted-foreground">Máximo 20 caracteres. Nunca tu email.</span></label></div>
        <label className="mt-5 flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 size-4 shrink-0 accent-primary" />{JUEGO.consent}</label>
        <Link to="/privacidad" className="mt-2 inline-block text-sm underline underline-offset-4">Política de privacidad</Link>
        <div><Button className={`${control} mt-4`} disabled={!consent || busy} type="submit">Solicitar entrada al ranking</Button></div>
      </form>
      <div className="mt-8 flex flex-col items-start gap-3 border-t border-border pt-6">
        <Button asChild variant="outline" className={control}><Link to="/aprende">Haz el test de 15 preguntas →</Link></Button>
        <Button asChild className={control}><Link to="/minar" hash="potencia">Apúntate a la lista de espera →</Link></Button>
        <Button variant="ghost" className={`${control} mt-2`} onClick={() => begin(true)} disabled={busy}><RotateCcw /> Volver a construir</Button>
      </div>
    </section>}
    {notice && <p role="status" className="mb-6 border-l-2 border-primary pl-4 text-sm">{notice}</p>}
    {error && <div role="alert" className="mb-6 border border-border p-4"><p>{error}</p><div className="mt-3 flex gap-3">{phase === "playing" && remaining > 0 && <Button className={control} onClick={() => finish()}>Reintentar envío</Button>}<Button variant="outline" className={control} disabled={busy} onClick={() => begin(true)}>Empezar de nuevo</Button></div></div>}
  </>;
}