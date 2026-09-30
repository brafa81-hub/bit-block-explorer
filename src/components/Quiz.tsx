import { useState } from "react";

import type { PreguntaQuiz } from "@/content/mining101";
import { idx } from "@/content/glosario";

/** Quiz de opción única con explicación tras responder. Reutiliza los estilos existentes. */
export function Quiz({ preguntas }: { preguntas: PreguntaQuiz[] }) {
  const [resp, setResp] = useState<Record<number, number>>({});
  const aciertos = preguntas.filter((p, i) => resp[i] === p.correcta).length;
  const hechas = Object.keys(resp).length;

  return (
    <div className="space-y-8">
      {preguntas.map((p, i) => {
        const elegida = resp[i];
        const respondida = elegida !== undefined;
        return (
          <fieldset key={i} className="border-t border-border pt-5">
            <legend className="index-label">{idx(i + 1)} /</legend>
            <p className="mt-2 text-[17px]">{p.pregunta}</p>
            <div className="mt-3 flex flex-col gap-2">
              {p.opciones.map((o, j) => {
                const marcada = elegida === j;
                const correcta = respondida && j === p.correcta;
                return (
                  <button
                    key={j}
                    type="button"
                    disabled={respondida}
                    onClick={() => setResp((r) => ({ ...r, [i]: j }))}
                    aria-pressed={marcada}
                    className={`min-h-[44px] border px-4 text-left text-[15px] ${
                      correcta
                        ? "border-primary text-foreground"
                        : marcada
                          ? "border-foreground"
                          : "border-border hover:border-foreground"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            {respondida && (
              <p className="mt-3 text-[15px]" role="status">
                <span className="etiqueta">{elegida === p.correcta ? "Correcto. " : "No exactamente. "}</span>
                {p.explicacion}
              </p>
            )}
          </fieldset>
        );
      })}
      {hechas === preguntas.length && (
        <p className="border-t border-border pt-5 text-[16px]">
          <span className="font-mono">
            {aciertos}/{preguntas.length}
          </span>{" "}
          respuestas correctas.
        </p>
      )}
    </div>
  );
}
