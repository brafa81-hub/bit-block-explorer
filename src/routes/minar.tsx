import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { SERVICIO } from "@/content/servicio";
import {
  MINIMO_VOLUMEN,
  PRESUPUESTO_DESDE,
  PRODUCTOS,
  TRAMOS,
  formatearEuros,
  getProducto,
  precioUnitarioCentimos,
  totalCentimos,
  tramoPara,
  type ProductoId,
} from "@/lib/catalogo";

export const Route = createFileRoute("/minar")({
  head: () => ({
    meta: [
      { title: "Alquila 1 PH/s de potencia de minería por horas | Minar" },
      {
        name: "description",
        content:
          "Alquila 1 PH/s de potencia de minería durante 8 o 24 horas. Precios con IVA para particulares y descuento por volumen para grupos y empresas.",
      },
      {
        property: "og:title",
        content: "Alquila 1 PH/s de potencia de minería por horas",
      },
      {
        property: "og:description",
        content:
          "1 PH/s minando para ti durante 8 o 24 horas. Precios con IVA y descuento por volumen para grupos y empresas.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bit-block-explorer.lovable.app/minar" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://bit-block-explorer.lovable.app/minar" }],
  }),
  component: Minar,
});

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

/** Máquina de minería en vertical: carcasa, rejilla, ventilador con aspas, tornillos y LEDs. */
function IconoMaquina() {
  const aspas = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="0 0 30 44" className="h-11 w-[30px]" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="0.6" y="0.6" width="28.8" height="42.8" rx="1.5" strokeWidth="1.2" />
      <rect x="3" y="3" width="24" height="5" strokeWidth="0.7" />
      {[6, 9.5, 13, 16.5, 20, 23.5].map((x) => (
        <line key={x} x1={x} y1="4" x2={x} y2="7" strokeWidth="0.7" />
      ))}
      <rect x="3" y="11" width="24" height="24" strokeWidth="0.7" />
      <circle cx="15" cy="23" r="10" strokeWidth="1" />
      {aspas.map((a) => (
        <path key={a} d="M15 23 Q19 17 15 13.6" strokeWidth="0.9" transform={`rotate(${a} 15 23)`} />
      ))}
      <circle cx="15" cy="23" r="2.4" fill="currentColor" stroke="none" />
      {[[5, 13], [25, 13], [5, 33], [25, 33]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.8" fill="currentColor" stroke="none" />
      ))}
      <line x1="3" y1="38.5" x2="17" y2="38.5" strokeWidth="0.7" />
      <line x1="3" y1="40.5" x2="17" y2="40.5" strokeWidth="0.7" />
      <circle cx="22" cy="39.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="25.5" cy="39.5" r="1" strokeWidth="0.7" />
    </svg>
  );
}

function Equivalencia() {
  const n = SERVICIO.maquinasEquivalentes;
  return (
    <div className="mt-4" aria-label={`Equivale a unas ${n} máquinas profesionales`}>
      <div className="flex flex-wrap gap-2 text-primary">
        {Array.from({ length: n }, (_, i) => (
          <IconoMaquina key={i} />
        ))}
      </div>
      <p className="hash-text mt-2 text-[12px] text-muted-foreground">≈ {n} máquinas profesionales</p>
    </div>
  );
}

function Minar() {
  const [abierto, setAbierto] = useState<ProductoId | null>(null);

  const [productoEmpresa, setProductoEmpresa] = useState<ProductoId>("jornada");
  const [cantidad, setCantidad] = useState(10);
  const [empresaAbierto, setEmpresaAbierto] = useState(false);

  const aMedida = cantidad >= PRESUPUESTO_DESDE;
  const tramo = tramoPara(cantidad);
  const unitario = precioUnitarioCentimos(productoEmpresa, cantidad);
  const total = totalCentimos(productoEmpresa, cantidad);

  return (
    <main>
      {/* 001 / minar */}
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-12 sm:px-8">
        <div className="index-label">001 / minar</div>
        <h1 className="mt-3 text-3xl sm:text-4xl">Alquila potencia de minería por horas</h1>
        <p className="mt-4 text-[16px] text-muted-foreground">
          1 PH/s de potencia industrial trabajando para ti durante 8 o 24 horas: la de unas cinco
          máquinas profesionales. Tú solo pones la dirección de tu wallet; de lo técnico nos
          encargamos nosotros.
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
              <Equivalencia />
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
                  Apúntate a la lista de espera
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-[14px] leading-relaxed text-muted-foreground">
          {SERVICIO.transparencia} (<Link to="/" hash="escala-real" className="underline underline-offset-4">compruébalo en el simulador</Link>) y {SERVICIO.variacionPotencia}. {SERVICIO.resultado}
        </p>
        <div className="mt-8 flex flex-col gap-4 border border-primary p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl">¿Quieres más potencia?</p>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Combina varias unidades: desde {MINIMO_VOLUMEN}, con un {SERVICIO.tramosCorporate[0].descuentoPct} % de
              descuento.
            </p>
          </div>
          <a
            href="#volumen"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center bg-primary px-5 text-[15px] text-primary-foreground"
          >
            Calcula tu pedido
          </a>
        </div>
      </section>

      {/* 003 / grupos, empresas y más potencia */}
      <section id="volumen" className="scroll-mt-4 bg-[var(--ink)] text-[var(--on-dark)]">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <div className="hash-text text-[11px] tracking-[0.08em] text-[var(--on-dark-muted)]">
            003 / grupos, empresas y más potencia
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl">Comprar en volumen</h2>
          <p className="mt-4 text-[16px] text-[var(--on-dark-muted)]">
            El mismo servicio, en volumen, para regalar a tu equipo, a tus clientes o a tu grupo una
            experiencia diferente con Bitcoin, o para minar tú con más potencia: cada unidad es 1 PH/s y las puedes canjear todas con tu wallet. Desde {MINIMO_VOLUMEN} unidades, con descuento.
          </p>

          {/* Tramos: tarjetas en móvil */}
          <div className="mt-8 space-y-4 sm:hidden">
            {TRAMOS.map((t) => (
              <div key={t.min} className="border border-[var(--on-dark-border)] p-4">
                <div className="flex items-baseline justify-between">
                  <span className="hash-text text-[13px]">{t.unidades} uds.</span>
                  <span className="hash-text text-[13px] text-[var(--on-dark-muted)]">
                    {t.descuento}
                  </span>
                </div>
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
                  <th className="py-3 pr-4 font-medium">Unidades</th>
                  <th className="py-3 pr-4 font-medium">Descuento</th>
                  <th className="py-3 pr-4 font-medium">Jornada / ud</th>
                  <th className="py-3 font-medium">Día / ud</th>
                </tr>
              </thead>
              <tbody>
                {TRAMOS.map((t) => (
                  <tr key={t.min} className="border-b border-[var(--on-dark-border)]">
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
            Precios por unidad, IVA incluido. Desde {PRESUPUESTO_DESDE} unidades, presupuesto a medida.
            Los códigos caducan a los {SERVICIO.corporate.caducidadMeses} meses y el descuento no se
            acumula con otros.
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
                  min={1}
                  step={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                  className="hash-text mt-2 min-h-[44px] w-full border border-[var(--on-dark-border)] bg-transparent px-3 text-[15px] outline-none"
                />
              </div>
            </div>

            {aMedida ? (
              <div className="mt-6 space-y-2 border-t border-[var(--on-dark-border)] pt-5 text-[15px]">
                <p>
                  Para {PRESUPUESTO_DESDE} unidades o más preparamos un presupuesto a medida.
                </p>
                <p className="text-[13px] text-[var(--on-dark-muted)]">
                  Déjanos tu email y te lo enviamos al abrir.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-2 border-t border-[var(--on-dark-border)] pt-5 text-[15px]">
                  <p>
                    {tramo ? "Tramo aplicado:" : "Precio normal, sin descuento:"}{" "}
                    {tramo && <span className="hash-text">{tramo.unidades} unidades · {tramo.descuento}</span>}
                  </p>
                  <p>
                    Precio por unidad: <span className="hash-text">{formatearEuros(unitario)}</span>
                  </p>
                  <p className="text-xl">
                    Total: <span className="hash-text">{formatearEuros(total)}</span>
                  </p>
                  <p className="text-[13px] text-[var(--on-dark-muted)]">IVA incluido</p>
                </div>
                {!tramo && <p className="mt-2 text-[13px] text-[var(--on-dark-muted)]">El descuento empieza en {MINIMO_VOLUMEN} unidades.</p>}
              </>
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
                Apúntate a la lista de espera
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
            Solo la dirección de tu wallet. HashFlow se encarga del pool y de los datos técnicos.
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
