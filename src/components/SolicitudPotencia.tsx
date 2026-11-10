import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SOLICITUD_POTENCIA as texto } from "@/content/minar";
import { solicitudPotenciaSchema } from "@/lib/solicitudes";
import { supabase } from "@/integrations/supabase/client";
import { origen } from "@/lib/medicion";

export function SolicitudPotencia() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [estado, setEstado] = useState<"listo" | "enviando" | "hecho">("listo");
  const [error, setError] = useState(false);
  const datos = solicitudPotenciaSchema.safeParse({ mensaje, email });

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    if (!datos.success || !acepta || estado === "enviando") return;
    setEstado("enviando");
    setError(false);
    try {
      let { error } = await supabase.from("solicitudes_potencia").insert({ ...datos.data, ...origen() });
      // Si la base de datos aún no tiene las columnas de origen, se guarda igualmente sin ellas.
      if (error) ({ error } = await supabase.from("solicitudes_potencia").insert(datos.data));
      if (error) throw error;
      setEstado("hecho");
    } catch {
      setError(true);
      setEstado("listo");
    }
  }

  return <>
    <p className="mt-4 text-[15px] text-muted-foreground">
      {texto.pregunta}{" "}
      <Button variant="link" className="h-auto rounded-none p-0 text-[15px] font-semibold text-primary underline underline-offset-4" onClick={() => { setEstado("listo"); setError(false); setAbierto(true); }}>{texto.enlace}</Button>
    </p>
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-32px)] overflow-y-auto rounded-none border-border p-6">
        <DialogTitle className="text-xl font-normal">{estado === "hecho" ? texto.hecho : texto.titulo}</DialogTitle>
        <DialogDescription>{estado === "hecho" ? texto.confirmacion : texto.descripcion}</DialogDescription>
        {estado !== "hecho" && <form onSubmit={enviar} className="space-y-4">
          <div><label htmlFor="solicitud-mensaje" className="text-[13px]">{texto.mensaje}</label>
            <textarea id="solicitud-mensaje" rows={5} maxLength={2000} required value={mensaje} onChange={e => setMensaje(e.target.value)} className="mt-2 w-full border border-border bg-transparent px-3 py-2" /></div>
          <div><label htmlFor="solicitud-email" className="text-[13px]">{texto.email}</label>
            <input id="solicitud-email" type="email" maxLength={254} required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 min-h-[44px] w-full border border-border bg-transparent px-3" /></div>
          <label className="flex items-start gap-3 text-[13px]"><input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} className="mt-1 accent-current" /><span>{texto.consentimiento}{" "}<Link to="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary underline">Privacidad</Link></span></label>
          {error && <p role="alert" className="text-[13px]">{texto.error}</p>}
          <Button type="submit" disabled={!datos.success || !acepta || estado === "enviando"} className="min-h-[44px] rounded-none shadow-none">{estado === "enviando" ? texto.enviando : texto.enviar}</Button>
        </form>}
      </DialogContent>
    </Dialog>
  </>;
}