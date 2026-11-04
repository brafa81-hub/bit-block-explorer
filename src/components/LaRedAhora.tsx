import { Link } from "@tanstack/react-router";

import { useRed } from "@/hooks/useRed";
import { cifraEnPalabras, formatDecimal, formatInt } from "@/lib/mining";
import type { AjusteDificultad, DatosRed } from "@/lib/red";

/**
 * «La red ahora mismo»: potencia, dificultad y último bloque.
 * Se renderiza completo en el servidor con el respaldo de servicio.ts; el dato en directo
 * (vía /api/red) lo sustituye al cargar. Si falla, se queda el respaldo con su fecha.
 */
export function LaRedAhora({ indice }: { indice: string }) {
  const red = useRed();
  const directo = red.origen === "directo";
  const ehs = Math.round(red.hashrateTH / 1e6);

  return (
    <section className="mt-12 lg:mt-16" aria-labelledby="red-ahora-titulo">
      <div className="index-label">{indice} / la red ahora mismo</div>
      <h2 id="red-ahora-titulo" className="mt-3 max-w-2xl text-2xl sm:text-3xl">
        La minería de Bitcoin, ahora mismo
      </h2>
      <p className="mt-3 max-w-2xl text-[16px]">
        Lo que acabas de ver pasa de verdad, a otra escala, en todo el mundo. Estos son tres datos
        de la red real. Cambian cada pocos minutos.
      </p>

      <p className="hash-text mt-5 flex items-center gap-2 text-[13px]" aria-live="polite">
        <span
          aria-hidden="true"
          className={`inline-block h-2 w-2 rounded-full ${directo ? "bg-primary" : "border border-muted-foreground"}`}
        />
        <span className={directo ? "text-primary" : "text-muted-foreground"}>{estado(red)}</span>
      </p>

      <dl className="mt-3 grid gap-px border border-border bg-border sm:grid-cols-3">
        <Dato
          etiqueta="Potencia de la red"
          valor={`≈ ${formatInt(ehs)} EH/s`}
          nota={`Todas las máquinas del mundo sumadas: unos ${formatInt(ehs)} trillones de intentos por segundo.`}
        />
        <Dato
          etiqueta="Dificultad"
          valor={`≈ ${cifraEnPalabras(red.dificultad)}`}
          nota={`Cuanto más alta, más intentos hacen falta para encontrar un bloque. Se ajusta sola cada 2.016 bloques (unas dos semanas) para que salga uno cada 10 minutos de media.${
            red.ajuste ? ` ${textoAjuste(red.ajuste)}` : ""
          }`}
        />
        {red.altura !== null ? (
          <Dato
            etiqueta="Último bloque"
            valor={`nº ${formatInt(red.altura)}`}
            nota="Cada bloque nuevo se encadena al anterior. Sale uno cada 10 minutos de media, a veces antes y a veces mucho después."
          />
        ) : (
          <Dato
            etiqueta="Un bloque nuevo"
            valor="≈ cada 10 min"
            nota="Es la media. A veces sale antes y a veces mucho después: depende de la suerte de todos los mineros."
          />
        )}
      </dl>

      <p className="mt-4 max-w-2xl text-[13px] text-muted-foreground">
        Datos orientativos{directo ? " de mempool.space" : ""}. No indican lo que recibirás: lo normal
        es recibir en sats menos de lo que pagas y, en Solitario, lo normal es no recibir nada. No es
        una inversión.
      </p>

      <div className="mt-4 flex flex-wrap gap-x-6">
        <Link
          to="/diccionario/$slug"
          params={{ slug: "hashrate-de-la-red" }}
          className="inline-flex min-h-[44px] items-center text-[15px] underline underline-offset-4"
        >
          Qué es la potencia de la red
        </Link>
        <Link
          to="/diccionario/$slug"
          params={{ slug: "dificultad" }}
          className="inline-flex min-h-[44px] items-center text-[15px] underline underline-offset-4"
        >
          Qué es la dificultad
        </Link>
      </div>
    </section>
  );
}

function Dato({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota: string }) {
  return (
    <div className="bg-background p-4 sm:p-5">
      <dt className="etiqueta">{etiqueta}</dt>
      <dd className="hash-text mt-1 text-[22px] leading-tight">{valor}</dd>
      <dd className="mt-2 text-[14px] text-muted-foreground">{nota}</dd>
    </div>
  );
}

function estado(red: DatosRed): string {
  if (red.origen !== "directo" || !red.actualizado) return `Dato aproximado · ${red.fechaRespaldo}`;
  const hora = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(red.actualizado);
  return `En directo · leído a las ${hora}`;
}

function textoAjuste({ cambioPct, restanteMs }: AjusteDificultad): string {
  const dias = Math.round(restanteMs / 86_400_000);
  const cuando = dias < 1 ? "en menos de un día" : dias === 1 ? "en 1 día" : `en unos ${formatInt(dias)} días`;
  const signo = cambioPct > 0 ? "+" : cambioPct < 0 ? "−" : "";
  return `Próximo ajuste ${cuando}: ${signo}${formatDecimal(Math.abs(cambioPct), 1)}\u00a0% estimado.`;
}
