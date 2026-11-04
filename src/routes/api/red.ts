import { createFileRoute } from "@tanstack/react-router";

import { obtenerDatosRed } from "@/lib/red";

/**
 * GET /api/red — datos de la red de Bitcoin para el simulador y el Diccionario.
 * Nuestro servidor consulta mempool.space; el navegador del visitante no se conecta con ellos.
 * Siempre responde 200: si mempool.space falla, devuelve el respaldo (origen "respaldo").
 */
export const Route = createFileRoute("/api/red")({
  server: {
    handlers: {
      GET: async () => {
        const datos = await obtenerDatosRed();
        return Response.json(datos, {
          headers: {
            // El navegador guarda la respuesta 5 min; el respaldo, solo 1 min para reintentar antes.
            "cache-control": `public, max-age=${datos.origen === "directo" ? 300 : 60}`,
          },
        });
      },
    },
  },
});
