import { z } from "zod";

export const emailSolicitud = z.string().trim().toLowerCase().email().max(254);
export const solicitudPotenciaSchema = z.object({
  potencia_ph: z.number().finite().gt(1).max(1_000_000),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((fecha) => {
    const date = new Date(`${fecha}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === fecha;
  }),
  email: emailSolicitud,
});

export function interesRegalos(cantidad: number) {
  return z.object({
    producto: z.literal("regalos"),
    para_quien: z.literal("regalo"),
    cantidad: z.number().int().min(1).max(1_000_000),
    modo: z.null(),
  }).parse({ producto: "regalos", para_quien: "regalo", cantidad, modo: null });
}