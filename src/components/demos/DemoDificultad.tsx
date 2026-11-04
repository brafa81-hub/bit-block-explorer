import { useEffect, useRef, useState } from "react";

import { useRed } from "@/hooks/useRed";
import { cifraEnPalabras, doubleSha256, formatInt, leadingZeros } from "@/lib/mining";
import { intentosPorBloque } from "@/lib/red";

import { BotonDemo, Demo } from "./Demo";

const CEROS = [1, 2, 3, 4, 5, 6] as const;
/** Hasta aquí se puede probar en directo sin que el móvil tarde demasiado. */
const MAX_PRUEBA = 4;

type Prueba = { estado: "probando" | "hecho"; intentos: number; hash: string };

export function DemoDificultad() {
  const [ceros, setCeros] = useState<number>(3);
  const [prueba, setPrueba] = useState<Prueba | null>(null);
  const run = useRef(0);
  /** Intentos de media para la red real, según su dificultad (fuente única: /api/red o respaldo). */
  const INTENTOS_RED = intentosPorBloque(useRed());
  /** Ceros equivalentes (cada carácter hexadecimal divide entre 16). */
  const CEROS_RED = Math.floor(Math.log(INTENTOS_RED) / Math.log(16));

  useEffect(
    () => () => {
      run.current++;
    },
    [],
  );

  const elegir = (n: number) => {
    run.current++;
    setPrueba(null);
    setCeros(n);
  };

  const probar = async () => {
    const id = ++run.current;
    const semilla = Math.random().toString(36).slice(2, 8);
    let intentos = 0;
    setPrueba({ estado: "probando", intentos: 0, hash: "" });
    for (;;) {
      if (run.current !== id) return;
      const h = await doubleSha256(`${semilla}${intentos}`);
      intentos++;
      if (leadingZeros(h) >= ceros) {
        setPrueba({ estado: "hecho", intentos, hash: h });
        return;
      }
      if (intentos % 500 === 0) {
        setPrueba({ estado: "probando", intentos, hash: h });
        // Deja respirar al navegador para que el contador se vea avanzar.
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  };

  const media = 16 ** ceros;
  const probando = prueba?.estado === "probando";

  return (
    <Demo
      titulo="dificultad"
      aviso="Aquí la dificultad se cuenta en ceros al principio del hash, como en el simulador. La red real usa un número objetivo y se ajusta cada 2.016 bloques."
    >
      <p className="text-[13px] text-muted-foreground">¿Cuántos ceros exiges al principio del hash?</p>
      <div className="mt-2 grid grid-cols-6 gap-2" role="group" aria-label="Ceros exigidos">
        {CEROS.map((n) => (
          <BotonDemo key={n} activo={n === ceros} aria-pressed={n === ceros} onClick={() => elegir(n)} className="hash-text px-0">
            {n}
          </BotonDemo>
        ))}
      </div>

      <p className="hash-text mt-5 break-all text-[15px]" aria-hidden="true">
        <span className="text-primary">{"0".repeat(ceros)}</span>
        <span className="text-muted-foreground">{"·".repeat(16 - ceros)}…</span>
      </p>

      <dl className="mt-4 grid grid-cols-1 gap-px sm:grid-cols-2 border border-border bg-border">
        <div className="bg-background p-3">
          <dt className="etiqueta">Intentos de media</dt>
          <dd className="hash-text mt-1 text-[18px]">{formatInt(media)}</dd>
        </div>
        <div className="bg-background p-3">
          <dt className="etiqueta">Acierta</dt>
          <dd className="hash-text mt-1 text-[18px]">1 de cada {formatInt(media)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[15px]">Cada cero más multiplica por 16 los intentos necesarios.</p>

      <div className="mt-5">
        {ceros <= MAX_PRUEBA ? (
          <BotonDemo onClick={probar} disabled={probando} className="w-full sm:w-auto">
            {probando ? "Probando…" : prueba ? "Probar otra vez" : `Probar con ${ceros} ${ceros === 1 ? "cero" : "ceros"}`}
          </BotonDemo>
        ) : (
          <p className="text-[15px] text-muted-foreground">
            Con {ceros} ceros, tu navegador tardaría demasiado. Prueba en directo con 4 o menos.
          </p>
        )}
        {prueba && (
          <div className="mt-3" aria-live="polite">
            <p className="text-[15px]">
              {prueba.estado === "hecho" ? "Encontrado tras " : "Llevas "}
              <span className="hash-text">{formatInt(prueba.intentos)}</span> intentos
              {prueba.estado === "hecho" && (
                <>
                  {" "}
                  (la media es <span className="hash-text">{formatInt(media)}</span>). Unas veces hace falta más y
                  otras menos: es cuestión de suerte.
                </>
              )}
            </p>
            {prueba.hash && (
              <p className="hash-text mt-2 break-all text-[13px] text-muted-foreground">{prueba.hash}</p>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 border-t border-border pt-4 text-[15px]">
        En la red real, la diana equivale a unos <span className="hash-text">{CEROS_RED}</span> ceros: hacen
        falta unos {cifraEnPalabras(INTENTOS_RED)} de intentos para cada bloque, entre todos los mineros del mundo.
      </p>
    </Demo>
  );
}
