import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { gameAdmin } from "@/lib/game.functions";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/game";
import { urlPublica } from "@/content/servicio";
import { Check, EyeOff, Eye } from "lucide-react";

export const Route = createFileRoute("/juego/admin")({
  head: () => ({
    meta: [
      { title: "Administración del juego | BLOQUE170.COM" },
      { name: "description", content: "Revisión de bloques y resumen del recorrido del juego." },
      { property: "og:title", content: "Administración del juego | BLOQUE170.COM" },
      { property: "og:description", content: "Panel privado de revisión de bloques." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: urlPublica("/juego/admin") }],
  }),
  component: AdminPage,
});
function AdminPage() {
  const fetchAdmin = useServerFn(gameAdmin);
  const [data, setData] = useState<Awaited<ReturnType<typeof gameAdmin>> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load(entryId?: string, action?: "review" | "hide" | "show") {
    setBusy(true);
    setError("");
    try {
      setData(await fetchAdmin({ data: { entryId, action } }));
    } catch {
      setError(
        "Acceso restringido a tu cuenta admin. Todavía no hay una cuenta admin configurada.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <p className="index-label">Administración</p>
      <h1 className="mt-3 text-3xl tracking-normal">Revisión de bloques</h1>
      <Button
        className="mt-6 min-h-11 rounded-none shadow-none"
        onClick={() => load()}
        disabled={busy}
      >
        Abrir panel privado
      </Button>
      {error && (
        <p role="alert" className="mt-5">
          {error}
        </p>
      )}
      {data && (
        <>
          <h2 className="mt-10 text-xl tracking-normal">Los tres primeros de la semana</h2>
          <ol className="mt-4">
            {data.entries
              .filter((e) => !e.hidden)
              .slice(0, 3)
              .map((e) => (
                <li className="border-t border-border py-3" key={e.id}>
                  <span>{e.alias}</span>
                  <span className="ml-4 font-mono">
                    {e.score} · {formatTime(e.total_ms)}
                  </span>
                </li>
              ))}
          </ol>
          <h2 className="mt-8 text-xl tracking-normal">Revisar partidas</h2>
          {data.entries.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center gap-3 border-b border-border py-3"
            >
              <span className="mr-auto">
                {e.alias} {e.reviewed ? "· revisada" : ""} {e.hidden ? "· oculta" : ""}
              </span>
              <Button
                variant="outline"
                title="Marcar revisada"
                className="rounded-none shadow-none"
                onClick={() => load(e.id, "review")}
                disabled={busy}
              >
                <Check /> Revisada
              </Button>
              <Button
                variant="outline"
                className="rounded-none shadow-none"
                onClick={() => load(e.id, e.hidden ? "show" : "hide")}
                disabled={busy}
              >
                {e.hidden ? <Eye /> : <EyeOff />}
                {e.hidden ? "Mostrar" : "Ocultar"}
              </Button>
            </div>
          ))}
          {data.summaries.map((s, i) => (
            <section key={i} className="mt-10 border-t border-border pt-5">
              <h2 className="text-xl tracking-normal">
                {i ? "Desde enlaces compartidos" : "Todo el recorrido"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Partidas iniciadas en los últimos 7 días. Compras solo cuando se confirme un pago
                real.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3">
                {[
                  ["Empezadas", s.started],
                  ["Terminadas", s.finished],
                  ["Compartidas", s.shared],
                  ["Lista de espera", s.emails],
                  ["Tests hechos", s.tests],
                  ["Compras en 7 días", s.purchases],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm">{label}</dt>
                    <dd className="font-mono text-xl">
                      {value}{" "}
                      <span className="text-xs text-muted-foreground">
                        {label !== "Empezadas"
                          ? `(${s.started ? ((Number(value) / s.started) * 100).toFixed(1) : "0"} %)`
                          : ""}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </>
      )}
    </main>
  );
}
