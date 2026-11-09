import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { confirmGame } from "@/lib/game.functions";
import { Button } from "@/components/ui/button";
import { urlPublica } from "@/content/servicio";

export const Route = createFileRoute("/juego/confirmar")({ validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === "string" ? search.token : "" }), head: () => ({ meta: [{ title: "Confirma tu bloque | BLOQUE170.COM" }, { name: "description", content: "Confirma tu email para que tu bloque aparezca en el ranking semanal." }, { property: "og:title", content: "Confirma tu bloque | BLOQUE170.COM" }, { property: "og:description", content: "Confirmación de email del ranking de bloques." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }], links: [{ rel: "canonical", href: urlPublica("/juego/confirmar") }] }), component: ConfirmPage });
function ConfirmPage() {
  const { token } = Route.useSearch(); const confirm = useServerFn(confirmGame); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  return <main className="mx-auto max-w-2xl px-5 py-16"><h1 className="text-3xl tracking-normal">Confirma tu bloque</h1><Button className="mt-6 min-h-11 rounded-none shadow-none" disabled={busy || !token} onClick={async () => { setBusy(true); try { await confirm({ data: { token } }); setMessage("Email confirmado. Tu bloque ya puede aparecer en el ranking."); } catch { setMessage("Este enlace no es válido o ya no está disponible."); } finally { setBusy(false); } }}>Confirmar email</Button>{message && <p role="status" className="mt-4">{message}</p>}<Link to="/juego/ranking" className="mt-6 block underline">Ver ranking</Link></main>;
}