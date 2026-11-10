import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { RETO as t } from "@/content/reto";

/** Segundos reales que dura el reto. */
const DURACION = 60;
/** Minutos simulados por cada segundo real. */
const MIN_POR_SEG = 5;
const OBJETIVO = 10;
const D_MIN = 50;
const D_MAX = 300;
const D_PASO = 10;
const D_INICIAL = 100;
/** Margen para considerar que un bloque ha salido «a buen ritmo». */
const BIEN_MIN = 7;
const BIEN_MAX = 13;

type Bloque = { n: number; min: number };
type Muestra = { seg: number; h: number; d: number };
type Fase = "inicio" | "jugando" | "fin";
type Ritmo = keyof typeof t.indicador;

function potenciaEn(seg: number) {
  let h: number = t.eventos[0].potencia;
  for (const e of t.eventos) if (seg >= e.seg) h = e.potencia;
  return h;
}

function eventoEn(seg: number) {
  let i = 0;
  t.eventos.forEach((e, j) => {
    if (seg >= e.seg) i = j;
  });
  return i;
}

/** La suerte de cada bloque, acotada para que el reto dependa de tu pulso y no del azar. */
const umbral = () => 0.6 + 0.8 * Math.random();

const ritmo = (min: number): Ritmo => (min < BIEN_MIN ? "rapido" : min > BIEN_MAX ? "lento" : "bien");
const bien = (min: number) => ritmo(min) === "bien";

export function RetoRitmo() {
  const [fase, setFase] = useState<Fase>("inicio");
  const [dificultad, setDificultad] = useState(D_INICIAL);
  const [, setFrame] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const sim = useRef({
    inicio: 0,
    previo: 0,
    seg: 0,
    progreso: 0,
    umbral: 1,
    desdeBloque: 0,
    d: D_INICIAL,
    bloques: [] as Bloque[],
    muestras: [] as Muestra[],
    ultimaMuestra: -1,
    ultimoPintado: 0,
  });
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function empezar() {
    const ahora = performance.now();
    sim.current = {
      inicio: ahora,
      previo: ahora,
      seg: 0,
      progreso: 0,
      umbral: umbral(),
      desdeBloque: 0,
      d: D_INICIAL,
      bloques: [],
      muestras: [{ seg: 0, h: potenciaEn(0), d: D_INICIAL }],
      ultimaMuestra: 0,
      ultimoPintado: 0,
    };
    setDificultad(D_INICIAL);
    setCopiado(false);
    setFase("jugando");
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(paso);
  }

  function paso(ahora: number) {
    const s = sim.current;
    const dt = Math.min(0.1, (ahora - s.previo) / 1000);
    s.previo = ahora;
    s.seg = Math.min(DURACION, (ahora - s.inicio) / 1000);
    const h = potenciaEn(s.seg);
    const dtSim = dt * MIN_POR_SEG;
    s.progreso += dtSim / ((OBJETIVO * s.d) / h);
    s.desdeBloque += dtSim;
    if (s.progreso >= s.umbral) {
      s.bloques.push({ n: s.bloques.length + 1, min: s.desdeBloque });
      s.progreso = 0;
      s.desdeBloque = 0;
      s.umbral = umbral();
    }
    if (s.seg - s.ultimaMuestra >= 0.25) {
      s.muestras.push({ seg: s.seg, h, d: s.d });
      s.ultimaMuestra = s.seg;
    }
    if (s.seg >= DURACION) {
      s.muestras.push({ seg: DURACION, h, d: s.d });
      setFase("fin");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (ahora - s.ultimoPintado > 80) {
      s.ultimoPintado = ahora;
      setFrame((f) => f + 1);
    }
    raf.current = requestAnimationFrame(paso);
  }

  function cambiar(d: number) {
    const v = Math.max(D_MIN, Math.min(D_MAX, Math.round(d)));
    sim.current.d = v;
    setDificultad(v);
  }

  const s = sim.current;

  if (fase === "inicio") {
    return (
      <div className="border border-border p-5">
        <p className="text-[20px]">{t.objetivo}</p>
        <ul className="mt-3 space-y-2 text-[16px] text-muted-foreground">
          {t.instrucciones.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={empezar}
          className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center bg-primary px-6 text-[16px] text-primary-foreground sm:w-auto"
        >
          {t.empezar}
        </button>
      </div>
    );
  }

  if (fase === "fin")
    return <Resultado bloques={s.bloques} muestras={s.muestras} onRepetir={empezar} copiado={copiado} setCopiado={setCopiado} />;

  const restante = Math.ceil(DURACION - s.seg);
  const evento = eventoEn(s.seg);
  const ultimo = s.bloques[s.bloques.length - 1];
  const recientes = s.bloques.slice(-6).reverse();
  const estado = ultimo ? t.indicador[ritmo(ultimo.min)] : null;

  return (
    <div className="border border-border p-4 sm:p-5">
      {/* 1. Qué está pasando */}
      <div className="flex items-baseline justify-between gap-3">
        <p className="index-label">{t.ahora}</p>
        <p className="hash-text text-[15px]" aria-label={`Quedan ${restante} segundos`}>
          0:{String(restante).padStart(2, "0")}
        </p>
      </div>
      <p key={evento} className="aparece mt-1 min-h-[3em] text-[17px]" aria-live="polite">
        {t.eventos[evento].texto}
      </p>
      <div className="mt-1 h-[3px] w-full bg-border">
        <div className="h-full bg-primary" style={{ width: `${(s.seg / DURACION) * 100}%` }} />
      </div>

      {/* 2. Qué hacer */}
      <div
        className={`mt-5 flex min-h-[72px] items-center gap-4 border px-4 ${
          ultimo && bien(ultimo.min) ? "border-primary text-primary" : "border-border"
        }`}
        aria-live="polite"
      >
        {estado ? (
          <>
            <span className="text-[24px] leading-none" aria-hidden="true">
              {estado.simbolo}
            </span>
            <span>
              <span className="block text-[18px]">{estado.titulo}</span>
              <span className="block text-[14px] text-muted-foreground">{estado.accion}</span>
            </span>
          </>
        ) : (
          <span className="text-[15px] text-muted-foreground">{t.esperando}</span>
        )}
      </div>

      {/* 3. La cadena: cada bloque nuevo cae encima */}
      <div className="mt-4 flex h-[240px] flex-col gap-[6px] overflow-hidden">
        {recientes.map((b) => (
          <div
            key={b.n}
            className={`caer hash-text flex h-[34px] shrink-0 items-center justify-between border px-3 text-[13px] ${
              bien(b.min) ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
            }`}
          >
            <span>Bloque #{b.n}</span>
            <span>{Math.round(b.min)} min</span>
          </div>
        ))}
      </div>

      {/* 4. El único control */}
      <div className="mt-4 border-t border-border pt-4">
        <label htmlFor="reto-dificultad" className="etiqueta">
          {t.dificultad}
        </label>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            aria-label={t.bajar}
            onClick={() => cambiar(dificultad - D_PASO)}
            className="hash-text inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center border border-border text-[22px] hover:border-foreground"
          >
            −
          </button>
          <input
            id="reto-dificultad"
            type="range"
            min={D_MIN}
            max={D_MAX}
            step={5}
            value={dificultad}
            onChange={(e) => cambiar(Number(e.target.value))}
            className="h-[48px] w-full accent-[var(--primary)]"
          />
          <button
            type="button"
            aria-label={t.subir}
            onClick={() => cambiar(dificultad + D_PASO)}
            className="hash-text inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center border border-border text-[22px] hover:border-foreground"
          >
            +
          </button>
        </div>
        <div className="mt-1 flex justify-between px-[60px] text-[12px] text-muted-foreground">
          <span>{t.facil}</span>
          <span>{t.dificil}</span>
        </div>
      </div>
    </div>
  );
}

/** Barras de minutos de cada bloque, con la línea del objetivo de 10 minutos. */
function Barras({ bloques, alto, ancho = 300 }: { bloques: Bloque[]; alto: number; ancho?: number }) {
  const TOPE = 20;
  const y = (m: number) => alto - (Math.min(m, TOPE) / TOPE) * (alto - 8);
  const w = ancho / Math.max(bloques.length, 14);
  return (
    <>
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mt-2 block h-auto w-full" role="img" aria-label={t.fin.ritmo}>
        <line x1={0} x2={ancho} y1={alto - 0.5} y2={alto - 0.5} className="stroke-border" />
        {bloques.map((b, i) => (
          <rect
            key={b.n}
            x={i * w + 1.5}
            y={y(b.min)}
            width={w - 3}
            height={alto - y(b.min)}
            className={bien(b.min) ? "fill-primary" : "fill-muted-foreground/50"}
          />
        ))}
        <line x1={0} x2={ancho} y1={y(OBJETIVO)} y2={y(OBJETIVO)} className="stroke-foreground" strokeDasharray="4 4" />
      </svg>
      <p className="mt-2 flex items-center gap-2 text-[13px] text-muted-foreground">
        <span className="inline-block w-5 border-t border-dashed border-foreground" />
        {t.fin.objetivoLinea}
      </p>
    </>
  );
}

function Resultado({
  bloques,
  muestras,
  onRepetir,
  copiado,
  setCopiado,
}: {
  bloques: Bloque[];
  muestras: Muestra[];
  onRepetir: () => void;
  copiado: boolean;
  setCopiado: (v: boolean) => void;
}) {
  const total = bloques.length;
  const verdes = bloques.filter((b) => bien(b.min)).length;
  const proporcion = total ? verdes / total : 0;
  const media = total ? bloques.reduce((a, b) => a + b.min, 0) / total : 0;
  const valoracion = t.fin.valoracion.find((v) => proporcion >= v.desde)!.texto;

  async function compartir() {
    const texto = t.fin.textoCompartir(verdes, total);
    const url = `https://bloque170.com/aprende/${t.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ text: texto, url });
        return;
      }
      await navigator.clipboard.writeText(`${texto} ${url}`);
      setCopiado(true);
    } catch {
      /* El usuario canceló o el navegador no lo permite: no pasa nada. */
    }
  }

  // Gráfico de potencia frente a dificultad
  const W = 300;
  const H = 150;
  const x = (seg: number) => (seg / DURACION) * W;
  const y = (v: number) => H - 6 - (v / D_MAX) * (H - 16);
  const linea = (k: "h" | "d") =>
    muestras.map((m, i) => `${i ? "L" : "M"}${x(m.seg).toFixed(1)},${y(m[k]).toFixed(1)}`).join(" ");

  return (
    <div className="border border-border p-4 sm:p-5">
      <p className="index-label">{t.fin.etiqueta}</p>
      <p className="mt-2 text-[24px] leading-snug">
        <span className="hash-text text-primary">{verdes}</span> de <span className="hash-text">{total}</span>{" "}
        bloques a buen ritmo
      </p>
      <p className="mt-2 text-[15px] text-muted-foreground">{t.fin.media(media.toFixed(1).replace(".", ","))}</p>
      <p className="mt-4 text-[17px]">{valoracion}</p>

      <p className="index-label mt-8">{t.fin.ritmo}</p>
      <Barras bloques={bloques} alto={120} />

      <p className="index-label mt-8">{t.fin.grafico}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block h-auto w-full" role="img" aria-label={`${t.fin.potencia} y ${t.fin.tuDificultad}`}>
        <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} className="stroke-border" />
        <path d={linea("h")} fill="none" className="stroke-muted-foreground" strokeWidth={2} strokeDasharray="5 4" />
        <path d={linea("d")} fill="none" className="stroke-primary" strokeWidth={2.5} />
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
        <span className="flex items-center gap-2">
          <span className="inline-block w-5 border-t-2 border-dashed border-muted-foreground" />
          {t.fin.potencia}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-5 border-t-2 border-primary" />
          {t.fin.tuDificultad}
        </span>
      </div>
      <p className="mt-2 text-[15px] text-muted-foreground">{t.fin.graficoTexto}</p>

      <p className="mt-8 border-t border-border pt-4 text-[16px]">{t.fin.explicacion}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRepetir}
          className="inline-flex min-h-[48px] items-center justify-center bg-primary px-6 text-[16px] text-primary-foreground"
        >
          {t.fin.repetir}
        </button>
        <button
          type="button"
          onClick={compartir}
          className="inline-flex min-h-[48px] items-center justify-center border border-border px-6 text-[16px] hover:border-foreground"
        >
          {copiado ? t.fin.copiado : t.fin.compartir}
        </button>
      </div>
      <Link
        to="/aprende/$slug"
        params={{ slug: "hashrate-y-dificultad" }}
        className="mt-5 inline-block text-[15px] text-primary underline underline-offset-4"
      >
        {t.fin.capitulo}
      </Link>
    </div>
  );
}
