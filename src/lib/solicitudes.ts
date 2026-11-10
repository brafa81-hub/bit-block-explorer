import { z } from "zod";

export const emailSolicitud = z.string().trim().toLowerCase().email().max(254);
export const solicitudPotenciaSchema = z.object({
  mensaje: z.string().trim().min(1).max(2000),
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