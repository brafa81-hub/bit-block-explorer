import { recordGameEvent } from "./game.functions";

const KEY = "bloque170-game-visit";
export function gameVisitor() {
  let visitorId: string | null = null;
  let ref: string | null = null;
  try {
    visitorId = localStorage.getItem("bloque170-visitor");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("bloque170-visitor", visitorId);
    }
    ref = sessionStorage.getItem("bloque170-game-ref");
    if (ref === null) {
      ref = new URLSearchParams(location.search).get("ref")?.slice(0, 100) ?? "";
      sessionStorage.setItem("bloque170-game-ref", ref);
    }
  } catch {
    visitorId ??= crypto.randomUUID();
    ref ??= new URLSearchParams(location.search).get("ref");
  }
  return { visitorId, ref: ref || null };
}
export function saveGameVisit(runId: string, secret: string) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ runId, secret }));
  } catch {
    /* la medición nunca debe romper el juego */
  }
}
/** Alias del ranking guardado en este navegador, para entrar solo en los días siguientes. */
export function savedAlias() {
  try {
    return localStorage.getItem("bloque170-alias") ?? "";
  } catch {
    return "";
  }
}
export function saveAlias(alias: string) {
  try {
    localStorage.setItem("bloque170-alias", alias);
  } catch {
    /* sin almacenamiento, se pedirá otra vez */
  }
}
export function trackGame(
  type: "compartir" | "email" | "test_inicio" | "test_fin" | "test_aprobado",
  action?: "share" | "copy" | "download" | "lista_espera",
) {
  if (typeof window === "undefined") return;
  try {
    const value = sessionStorage.getItem(KEY);
    if (!value) return;
    const credentials: { runId: string; secret: string } = JSON.parse(value);
    void recordGameEvent({ data: { ...credentials, type, extra: action ? { action } : {} } }).catch(
      () => undefined,
    );
  } catch {
    /* Tracking must never interrupt navigation. */
  }
}
