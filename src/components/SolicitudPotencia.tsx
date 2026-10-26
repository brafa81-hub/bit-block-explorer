import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SOLICITUD_POTENCIA as texto } from "@/content/minar";
import { solicitudPotenciaSchema } from "@/lib/solicitudes";
import { supabase } from "@/integrations/supabase/client";

export function SolicitudPotencia() {
  const [abierto, setAbierto] = useState(false);
  const [potencia, setPotencia] = useState("");
  const [fecha, setFecha] = useState("");
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [estado, setEstado] = useState<"listo" | "enviando" | "hecho">("listo");
  const [error, setError] = useState(false);
  const datos = solicitudPotenciaSchema.safeParse({ potencia_ph: Number(potencia), fecha, email });

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    if (!datos.success || !acepta || estado === "enviando") return;
    setEstado("enviando");
    setError(false);
    try {
      const { error } = await supabase.from("solicitudes_potencia").insert(datos.data);
      if (error) throw error;
      setEstado("hecho");
    } catch {
      setError(true);
      setEstado("listo");
    }
  }

  return <>
    <p className="mt-3 text-[12px] text-muted-foreground">
      {texto.pregunta}{" "}
      <Button variant="link" className="h-auto rounded-none p-0 text-[12px]" onClick={() => { setEstado("listo"); setError(false); setAbierto(true); }}>{texto.enlace}</Button>
    </p>
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-32px)] overflow-y-auto rounded-none border-border p-6">
        <DialogTitle className="text-xl font-normal">{estado === "hecho" ? texto.hecho : texto.titulo}</DialogTitle>
        <DialogDescription>{estado === "hecho" ? texto.confirmacion : texto.descripcion}</DialogDescription>
        {estado !== "hecho" && <form onSubmit={enviar} className="space-y-4">
          <div><label htmlFor="solicitud-ph" className="text-[13px]">{texto.potencia}</label>
            <input id="solicitud-ph" type="number" min="1.001" max="1000000" step="any" required value={potencia} onChange={e => setPotencia(e.target.value)} className="hash-text mt-2 min-h-[44px] w-full border border-border bg-transparent px-3" /></div>
          <div><label htmlFor="solicitud-fecha" className="text-[13px]">{texto.fecha}</label>
            <input id="solicitud-fecha" type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="hash-text mt-2 min-h-[44px] w-full min-w-0 border border-border bg-transparent px-3" /></div>
          <div><label htmlFor="solicitud-email" className="text-[13px]">{texto.email}</label>
            <input id="solicitud-email" type="email" maxLength={254} required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 min-h-[44px] w-full border border-border bg-transparent px-3" /></div>
          <label className="flex items-start gap-3 text-[13px]"><input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} className="mt-1 accent-current" /><span>{texto.consentimiento}{" "}<Link to="/privacidad" className="text-primary underline">Privacidad</Link></span></label>
          {error && <p role="alert" className="text-[13px]">{texto.error}</p>}
          <Button type="submit" disabled={!datos.success || !acepta || estado === "enviando"} className="min-h-[44px] rounded-none shadow-none">{estado === "enviando" ? texto.enviando : texto.enviar}</Button>
        </form>}
      </DialogContent>
    </Dialog>
  </>;
}