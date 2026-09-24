import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  MINIMO_VOLUMEN,
  PRODUCTOS,
  TRAMOS,
  formatearEuros,
  getProducto,
  precioUnitarioCentimos,
  totalCentimos,
  tramoPara,
  type ProductoId,
} from "@/lib/catalogo";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Alquila 1 PH/s de potencia de minería por horas | Catálogo" },
      {
        name: "description",
        content:
          "Alquila 1 PH/s de potencia de minería durante 8 o 24 horas. Precios con IVA para particulares y tramos por volumen para empresas.",
      },
      {
        property: "og:title",
        content: "Alquila 1 PH/s de potencia de minería por horas",
      },
      {
        property: "og:description",
        content:
          "1 PH/s minando para ti durante 8 o 24 horas. Precios con IVA y tramos por volumen para empresas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalogo,
});

type Estado = "cerrado" | "abierto" | "enviando" | "hecho";

function Formulario({
  tipo,
  producto,
  cantidad,
  oscuro = false,
  onCerrar,
}: {
  tipo: "particular" | "empresa";
  producto: ProductoId;
  cantidad: number;
  oscuro?: boolean;
  onCerrar: () => void;
}) {
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [estado, setEstado] = useState<"listo" | "enviando" | "hecho">("listo");
  const [error, setError] = useState<string | null>(null);

  const borde = oscuro ? "border-[var(--on-dark-border)]" : "border-border";
  const apagado = oscuro ? "text-[var(--on-dark-muted)]" : "text-muted-foreground";
  const enlace = oscuro ? "text-[var(--instrument-dark)]" : "text-primary";

  const valido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) && acepta;

  async function enviar() {
    if (!valido || estado === "enviando") return;
    setEstado("enviando");
    setError(null);
    const { error: err } = await supabase.from("lista_espera").insert({
      email: email.trim().toLowerCase(),
      tipo,
      producto,
      cantidad,
    });
    if (err) {
      setError("No hemos podido guardar tu email. Inténtalo otra vez en un momento.");
      setEstado("listo");
      return;
    }
    setEstado("hecho");
  }

  if (estado === "hecho") {
    return (
      <div className={`mt-4 border-t ${borde} pt-4 text-[15px]`}>
        <p>Hecho. Te escribiremos cuando abramos.</p>
        <button
          type="button"
          onClick={onCerrar}
          className={`mt-3 text-[13px] underline underline-offset-4 ${apagado}`}
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className={`mt-4 border-t ${borde} space-y-4 pt-4`}>
      <div>
        <label htmlFor={`email-${tipo}`} className="block text-[13px]">
          Tu email
        </label>
        <input
          id={`email-${tipo}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@ejemplo.com"
          className={`mt-2 min-h-[44px] w-full border ${borde} bg-transparent px-3 text-[15px] outline-none focus:border-current`}
        />
      </div>

      {tipo === "empresa" && (
        <p className={`text-[13px] ${apagado}`}>
          Producto: {getProducto(producto).nombre} · Cantidad: {cantidad}
        </p>
      )}

      <label className="flex items-start gap-3 text-[13px] leading-relaxed">
        <input
          type="checkbox"
          checked={acepta}
          onChange={(e) => setAcepta(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-current"
        />
        <span>
          Acepto que guardéis mi email para avisarme de la apertura.{" "}
          <Link to="/privacidad" className={`underline underline-offset-4 ${enlace}`}>
            Privacidad
          </Link>
        </span>
      </label>

      {error && <p className="text-[13px]">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={enviar}
          disabled={!valido || estado === "enviando"}
          className={`min-h-[44px] border ${borde} px-5 text-[15px] disabled:opacity-40`}
        >
          {estado === "enviando" ? "Enviando" : "Enviar"}
        </button>
        <button
          type="button"
          onClick={onCerrar}
          className={`text-[13px] underline underline-offset-4 ${apagado}`}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Pregunta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <details className="border-t border-border py-4">
      <summary className="cursor-pointer list-none text-[16px]">{titulo}</summary>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{children}</p>
    </details>
  );
}

function Catalogo() {
  const [abierto, setAbierto] = useState<ProductoId | null>(null);

  const [productoEmpresa, setProductoEmpresa] = useState<ProductoId>("jornada");
  const [cantidad, setCantidad] = useState(10);
  const [empresaAbierto, setEmpresaAbierto] = useState(false);

  const tramo = tramoPara(cantidad);
  const unitario = precioUnitarioCentimos(productoEmpresa, cantidad);
  const total = totalCentimos(productoEmpresa, cantidad);

  return (
    <main>
      {/* 001 / catálogo */}
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-12 sm:px-8">
        <div className="index-label">001 / catálogo</div>
        <h1 className="mt-3 text-3xl sm:text-4xl">Alquila potencia de minería por horas</h1>
        <p className="mt-4 text-[16px] text-muted-foreground">
          1 PH/s minando para ti durante 8 o 24 horas.
        </p>
        <p className="mt-4 text-[14px]">
          <Link to="/" className="text-primary underline underline-offset-4">
            ¿Qué es 1 PH/s? Pruébalo en el simulador
          </Link>
        </p>
      </section>

      {/* 002 / para ti */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        <div className="index-label">002 / para ti</div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PRODUCTOS.map((p) => (
            <div key={p.id} className="border border-border p-6">
              <h2 className="text-xl">{p.nombre}</h2>
              <p className="hash-text mt-2 text-[13px] text-muted-foreground">
                {p.horas} horas · {p.potencia}
              </p>
              <p className="hash-text mt-4 text-2xl">{formatearEuros(p.precioCentimos)}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">IVA incluido</p>
              <p className="mt-4 text-[15px]">{p.nota}</p>

              {abierto === p.id ? (
                <Formulario
                  tipo="particular"
                  producto={p.id}
                  cantidad={1}
                  onCerrar={() => setAbierto(null)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAbierto(p.id)}
                  className="mt-6 min-h-[44px] w-full border border-border px-5 text-[15px]"
                >
                  Avísame cuando abra
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 003 / para empresas */}
      <section className="bg-[var(--ink)] text-[var(--on-dark)]">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <div className="hash-text text-[11px] tracking-[0.08em] text-[var(--on-dark-muted)]">
            003 / para empresas
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl">Comprar en volumen</h2>
          <p className="mt-4 text-[16px] text-[var(--on-dark-muted)]">
            El mismo producto, comprado en volumen para regalar a tu equipo. Cuantas más
            unidades, menor precio por unidad.
          </p>

          {/* Tramos: tarjetas en móvil */}
          <div className="mt-8 space-y-4 sm:hidden">
            {TRAMOS.map((t) => (
              <div key={t.id} className="border border-[var(--on-dark-border)] p-4">
                <div className="flex items-baseline justify-between">
                  <span className="hash-text text-[13px]">Tramo {t.id}</span>
                  <span className="hash-text text-[13px] text-[var(--on-dark-muted)]">
                    {t.descuento}
                  </span>
                </div>
                <p className="hash-text mt-2 text-[13px] text-[var(--on-dark-muted)]">
                  {t.unidades} unidades
                </p>
                <p className="hash-text mt-3 text-[15px]">
                  Jornada: {formatearEuros(t.jornadaCentimos)} / ud
                </p>
                <p className="hash-text text-[15px]">
                  Día: {formatearEuros(t.diaCentimos)} / ud
                </p>
              </div>
            ))}
          </div>

          {/* Tramos: tabla desde 640px */}
          <div className="mt-8 hidden sm:block">
            <table className="w-full border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-[var(--on-dark-border)]">
                  <th className="py-3 pr-4 font-medium">Tramo</th>
                  <th className="py-3 pr-4 font-medium">Unidades</th>
                  <th className="py-3 pr-4 font-medium">Descuento</th>
                  <th className="py-3 pr-4 font-medium">Jornada / ud</th>
                  <th className="py-3 font-medium">Día / ud</th>
                </tr>
              </thead>
              <tbody>
                {TRAMOS.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--on-dark-border)]">
                    <td className="hash-text py-3 pr-4">{t.id}</td>
                    <td className="hash-text py-3 pr-4">{t.unidades}</td>
                    <td className="hash-text py-3 pr-4">{t.descuento}</td>
                    <td className="hash-text py-3 pr-4">
                      {formatearEuros(t.jornadaCentimos)}
                    </td>
                    <td className="hash-text py-3">{formatearEuros(t.diaCentimos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[13px] text-[var(--on-dark-muted)]">
            Precios por unidad, IVA incluido.
          </p>

          {/* Calculadora */}
          <div className="mt-10 border border-[var(--on-dark-border)] p-6">
            <h3 className="text-lg">Calcula tu pedido</h3>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="producto-empresa" className="block text-[13px]">
                  Producto
                </label>
                <select
                  id="producto-empresa"
                  value={productoEmpresa}
                  onChange={(e) => setProductoEmpresa(e.target.value as ProductoId)}
                  className="mt-2 min-h-[44px] w-full border border-[var(--on-dark-border)] bg-transparent px-3 text-[15px] outline-none"
                >
                  {PRODUCTOS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[var(--ink)]">
                      {p.nombre} · {p.horas} h
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cantidad-empresa" className="block text-[13px]">
                  Cantidad
                </label>
                <input
                  id="cantidad-empresa"
                  type="number"
                  min={MINIMO_VOLUMEN}
                  step={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="hash-text mt-2 min-h-[44px] w-full border border-[var(--on-dark-border)] bg-transparent px-3 text-[15px] outline-none"
                />
              </div>
            </div>

            {tramo ? (
              <div className="mt-6 space-y-2 border-t border-[var(--on-dark-border)] pt-5 text-[15px]">
                <p>
                  Tramo aplicado:{" "}
                  <span className="hash-text">
                    {tramo.id} · {tramo.unidades} unidades · {tramo.descuento}
                  </span>
                </p>
                <p>
                  Precio por unidad: <span className="hash-text">{formatearEuros(unitario)}</span>
                </p>
                <p className="text-xl">
                  Total: <span className="hash-text">{formatearEuros(total)}</span>
                </p>
                <p className="text-[13px] text-[var(--on-dark-muted)]">IVA incluido</p>
              </div>
            ) : (
              <p className="mt-6 border-t border-[var(--on-dark-border)] pt-5 text-[15px] text-[var(--on-dark-muted)]">
                El precio por volumen empieza en 10 unidades.
              </p>
            )}

            {empresaAbierto ? (
              <Formulario
                tipo="empresa"
                producto={productoEmpresa}
                cantidad={Math.max(cantidad || 0, 1)}
                oscuro
                onCerrar={() => setEmpresaAbierto(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setEmpresaAbierto(true)}
                className="mt-6 min-h-[44px] w-full border border-[var(--instrument-dark)] px-5 text-[15px] text-[var(--instrument-dark)] sm:w-auto"
              >
                Pedir presupuesto
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 004 / preguntas */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="index-label">004 / preguntas</div>
        <div className="mt-6">
          <Pregunta titulo="¿Qué es 1 PH/s?">
            Mil billones de intentos por segundo, lo que hacen unas cinco máquinas
            profesionales a la vez.
          </Pregunta>
          <Pregunta titulo="¿Qué necesito para usarlo?">
            Una cuenta en un pool de minería donde recibir la potencia. Te guiamos en el
            proceso.
          </Pregunta>
          <Pregunta titulo="¿Cuándo se puede comprar?">
            Estamos preparando la apertura. Déjanos tu email y te avisamos.
          </Pregunta>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <Link to="/" className="text-[15px] text-primary underline underline-offset-4">
            Volver al simulador
          </Link>
        </div>
      </section>
    </main>
  );
}
