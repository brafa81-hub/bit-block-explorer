import { recordGameEvent } from "./game.functions";

const KEY = "bloque170-game-visit";
export function gameVisitor() {
  let visitorId = localStorage.getItem("bloque170-visitor");
  if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem("bloque170-visitor", visitorId); }
  let ref = sessionStorage.getItem("bloque170-game-ref");
  if (ref === null) { ref = new URLSearchParams(location.search).get("ref")?.slice(0, 100) ?? ""; sessionStorage.setItem("bloque170-game-ref", ref); }
  return { visitorId, ref: ref || null };
}
export function saveGameVisit(runId: string, secret: string) {
  sessionStorage.setItem(KEY, JSON.stringify({ runId, secret }));
}
export function trackGame(type: "compartir" | "test_inicio" | "test_fin" | "test_aprobado", action?: "share" | "copy" | "download") {
  if (typeof window === "undefined") return;
  try {
    const value = sessionStorage.getItem(KEY);
    if (!value) return;
    const credentials: { runId: string; secret: string } = JSON.parse(value);
    void recordGameEvent({ data: { ...credentials, type, extra: action ? { action } : {} } }).catch(() => undefined);
  } catch { /* Tracking must never interrupt navigation. */ }
}