import { useState } from "react";

import { SERVICIO } from "@/content/servicio";
import { formatInt } from "@/lib/mining";

import { Demo } from "./Demo";

const c = SERVICIO.catalogo;
const RED_TH = c.redHashrateTH;
const TH_POR_MAQUINA = c.maxTH / SERVICIO.maquinasEquivalentes;
const ZOOM = 1000;

const f = (x: number) =>
  new Intl.NumberFormat("es-ES", { maximumSignificantDigits: 4, useGrouping: "always" as unknown as boolean }).format(x);

/** Potencia legible en la unidad que toque (TH/s, PH/s o EH/s), o en la que se pida. */
function potencia(th: number, unidad?: "TH" | "PH" | "EH"): string {
  const u = unidad ?? (th >= 1e6 ? "EH" : th >= 1e3 ? "PH" : "TH");
  const div = u === "EH" ? 1e6 : u === "PH" ? 1e3 : 1;
  return `${f(th / div)} ${u}/s`;
}

/** Redondeo a 2 cifras significativas («una entre 4.200.000»). */
const dosCifras = (x: number) => {
  const m = 10 ** (Math.floor(Math.log10(x)) - 1);
  return formatInt(Math.round(x / m) * m);
};

function Barra({ titulo, valor, pct, nota }: { titulo: string; valor: string; pct: number; nota: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[14px]">{titulo}</p>
        <p className="hash-text shrink-0 text-[13px] text-muted-foreground">{valor}</p>
      </div>
      <div className="mt-1 h-4 w-full bg-border" aria-hidden="true">
        <div className="h-full min-w-[2px] bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">{nota}</p>
    </div>
  );
}

export function DemoRed() {
  const [th, setTh] = useState<number>(c.minTH);

  const nivel2 = RED_TH / ZOOM;
  const nivel3 = nivel2 / ZOOM;
  const maquinas = th / TH_POR_MAQUINA;

  return (
    <Demo
      titulo="hashrate de la red"
      aviso={`La potencia de la red es un dato aproximado (${c.fechaEstimacion}) y cambia cada día. Esto no indica lo que recibirás: lo normal es recibir en sats menos de lo que pagas y, en Solitario, lo normal es no recibir nada. No es una inversión.`}
    >
      <label htmlFor="demo-red-th" className="block text-[13px] text-muted-foreground">
        Tu potencia
      </label>
      <p className="hash-text mt-1 text-[22px]">{potencia(th)}</p>
      <input
        id="demo-red-th"
        type="range"
        min={c.minTH}
        max={c.maxTH}
        step={c.pasoTH}
        value={th}
        onChange={(e) => setTh(Number(e.target.value))}
        className="mt-2 h-11 w-full accent-[var(--primary)]"
      />
      <div className="hash-text flex justify-between text-[12px] text-muted-foreground">
        <span>{potencia(c.minTH)}</span>
        <span>{potencia(c.maxTH)}</span>
      </div>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Más o menos {maquinas < 1.5 ? "lo que hace una máquina profesional" : `lo que hacen ${formatInt(Math.round(maquinas))} máquinas profesionales`}.
      </p>

      <div className="mt-6 space-y-5">
        <Barra
          titulo="Toda la red"
          valor={potencia(RED_TH)}
          pct={100 / ZOOM}
          nota="La raya verde es una milésima de la red. Tu parte ni siquiera se ve aquí."
        />
        <p className="etiqueta">↓ ampliamos esa milésima ×{formatInt(ZOOM)}</p>
        <Barra
          titulo="Una milésima de la red"
          valor={potencia(nivel2, "PH")}
          pct={100 / ZOOM}
          nota="Volvemos a coger una milésima. Tu parte sigue sin verse."
        />
        <p className="etiqueta">↓ ampliamos otra vez ×{formatInt(ZOOM)}</p>
        <Barra
          titulo="Una milésima de esa milésima"
          valor={potencia(nivel3, "TH")}
          pct={(th / nivel3) * 100}
          nota="Por fin: la parte verde es tu potencia."
        />
      </div>

      <p className="mt-6 border-t border-border pt-4 text-[15px]" aria-live="polite">
        Frente a toda la red, {potencia(th)} es más o menos una parte entre{" "}
        <span className="hash-text">{dosCifras(RED_TH / th)}</span>. Le pasa lo mismo a cualquier minero, incluso a
        granjas con cientos de máquinas.
      </p>
      <p className="mt-3 text-[15px]">
        Al comprar potencia eliges entre {potencia(c.minTH)} y {potencia(c.maxTH)}, siempre durante {c.horas} horas.
      </p>
    </Demo>
  );
}
