import { useState } from "react";

import { SERVICIO } from "@/content/servicio";

import { BotonDemo, Demo } from "./Demo";

const c = SERVICIO.catalogo;

const UNIDADES = [
  { id: "TH", nombre: "TH/s", enTH: 1 },
  { id: "PH", nombre: "PH/s", enTH: 1_000 },
  { id: "EH", nombre: "EH/s", enTH: 1_000_000 },
] as const;
type UnidadId = (typeof UNIDADES)[number]["id"];

/** Atajos con cifras de servicio.ts. */
const ATAJOS: { etiqueta: string; th: number }[] = [
  { etiqueta: "Una máquina", th: c.maxTH / SERVICIO.maquinasEquivalentes },
  { etiqueta: `${c.minTH} TH/s`, th: c.minTH },
  { etiqueta: "1 PH/s", th: c.maxTH },
  { etiqueta: "La red", th: c.redHashrateTH },
];

const fmt = (x: number) =>
  new Intl.NumberFormat("es-ES", {
    maximumSignificantDigits: x >= 1000 ? 21 : 4,
    maximumFractionDigits: 12,
    useGrouping: "always" as unknown as boolean,
  }).format(x);

/** Lee «1,5», «1.000» o «1.000,5» al estilo español. */
function leer(texto: string): number | null {
  const limpio = texto.replace(/\s/g, "");
  if (!limpio) return null;
  const normal = limpio.includes(",") ? limpio.replace(/\./g, "").replace(",", ".") : limpio.replace(/\.(?=\d{3}(\D|$))/g, "");
  const n = Number(normal);
  return isFinite(n) && n >= 0 ? n : null;
}

const ESCALAS: [number, string, string][] = [
  [1e18, "trillón", "trillones"],
  [1e15, "mil billones", "mil billones"],
  [1e12, "billón", "billones"],
  [1e9, "mil millones", "mil millones"],
  [1e6, "millón", "millones"],
];

/** Cifra con palabras de escala y hasta 4 cifras significativas (más precisa que cifraEnPalabras, que redondea a 2). */
function enPalabras(hashes: number): string {
  for (const [v, uno, varios] of ESCALAS) {
    if (hashes >= v) {
      const n = hashes / v;
      if (n === 1) return uno.startsWith("mil") ? uno : `un ${uno}`;
      return `${fmt(n)} ${varios}`;
    }
  }
  return fmt(hashes);
}

export function DemoUnidades() {
  const [texto, setTexto] = useState("1");
  const [unidad, setUnidad] = useState<UnidadId>("PH");

  const valor = leer(texto);
  const enTH = valor === null ? null : valor * (UNIDADES.find((u) => u.id === unidad)?.enTH ?? 1);

  const usarAtajo = (th: number) => {
    const mejor = [...UNIDADES].reverse().find((u) => th >= u.enTH) ?? UNIDADES[0];
    setUnidad(mejor.id);
    setTexto(fmt(th / mejor.enTH));
  };

  return (
    <Demo titulo="unidades" aviso="Las cifras de la red y de una máquina son aproximadas, solo para comparar órdenes de magnitud.">
      <label htmlFor="demo-unidades-valor" className="block text-[13px] text-muted-foreground">
        Escribe una potencia
      </label>
      <input
          id="demo-unidades-valor"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={texto}
          maxLength={20}
          onChange={(e) => setTexto(e.target.value)}
          className="hash-text mt-2 min-h-[44px] w-full min-w-0 border border-border bg-transparent px-3 text-[16px] outline-none focus:border-foreground"
        />
      <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Unidad">
        {UNIDADES.map((u) => (
          <BotonDemo key={u.id} activo={u.id === unidad} aria-pressed={u.id === unidad} onClick={() => setUnidad(u.id)} className="hash-text">
            {u.nombre}
          </BotonDemo>
        ))}
      </div>

      <p className="mt-4 text-[13px] text-muted-foreground">O prueba con:</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ATAJOS.map((a) => (
          <BotonDemo key={a.etiqueta} onClick={() => usarAtajo(a.th)} className="text-[14px]">
            {a.etiqueta}
          </BotonDemo>
        ))}
      </div>

      {enTH === null ? (
        <p className="mt-5 text-[15px] text-muted-foreground">Escribe un número, por ejemplo 250 o 1,5.</p>
      ) : (
        <div aria-live="polite">
          <dl className="mt-5 grid grid-cols-1 gap-px border border-border bg-border">
            {UNIDADES.map((u) => (
              <div key={u.id} className={`flex items-baseline justify-between gap-3 p-3 ${u.id === unidad ? "bg-card" : "bg-background"}`}>
                <dt className="hash-text text-[14px] text-muted-foreground">{u.nombre}</dt>
                <dd className="hash-text break-all text-right text-[17px]">{fmt(enTH / u.enTH)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[15px]">
            Son {enTH * 1e12 >= 1e6 ? `${enPalabras(enTH * 1e12)} de` : fmt(enTH * 1e12)} hashes por segundo.
          </p>
        </div>
      )}
      <p className="mt-3 text-[15px]">Cada unidad es mil veces la anterior, como gramos, kilos y toneladas.</p>
    </Demo>
  );
}
