import { useEffect, useState } from "react";

import { RED_RESPALDO, validarDatosRed, type DatosRed } from "@/lib/red";

/** Una sola petición por página aunque varios componentes usen el hook. */
let promesa: Promise<DatosRed | null> | null = null;

function cargar(): Promise<DatosRed | null> {
  if (!promesa) {
    promesa = fetch("/api/red", { signal: AbortSignal.timeout(8000) })
      .then((r) => (r.ok ? r.json() : null))
      .then(validarDatosRed)
      .catch(() => null);
  }
  return promesa;
}

/**
 * Datos de la red. En el servidor y al cargar la página devuelve el respaldo de servicio.ts;
 * si /api/red responde bien, lo sustituye. Nunca muestra error.
 */
export function useRed(): DatosRed {
  const [datos, setDatos] = useState<DatosRed>(RED_RESPALDO);
  useEffect(() => {
    let vivo = true;
    void cargar().then((d) => {
      if (vivo && d) setDatos(d);
    });
    return () => {
      vivo = false;
    };
  }, []);
  return datos;
}
