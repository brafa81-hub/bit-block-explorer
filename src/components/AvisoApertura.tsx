import { useState } from "react";
import { trackGame } from "@/lib/game-tracking";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { AVISO_APERTURA as texto } from "@/content/minar";
import { supabase } from "@/integrations/supabase/client";
import { origen } from "@/lib/medicion";
import { emailSolicitud } from "@/lib/solicitudes";

/**
 * Lista de espera para quien aprueba el test de Aprende. Las primeras plazas
 * (SERVICIO.certificado) reciben más potencia; se asignan al abrir la venta.
 * Usa la misma tabla que /minar: aquí no se guarda "para_quien",
 * así que esas filas se distinguen de las de /minar (que siempre lo traen).
 */
export function AvisoApertura() {
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [estado, setEstado] = useState<"listo" | "enviando" | "hecho">("listo");
  const [error, setError] = useState(false);
  const valido = emailSolicitud.safeParse(email).success && acepta;

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    if (!valido || estado === "enviando") return;
    setEstado("enviando");
    setError(false);
    const { error: err } = await supabase.from("lista_espera").insert({
      email: email.trim().toLowerCase(),
      tipo: "particular",
      producto: "potencia",
      ...origen(),
    });
    if (err) {
      setError(true);
      setEstado("listo");
      return;
    }
    trackGame("email", "lista_espera");
    setEstado("hecho");
  }

  if (estado === "hecho") {
    return (
      <div className="mt-5 border-2 border-primary p-5">
        <p role="status" className="text-[16px]">{texto.hecho}</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-5 space-y-4 border-2 border-primary p-5">
      <div>
        <h2 className="text-xl">{texto.titulo}</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">{texto.descripcion}</p>
        <p className="mt-2 text-[13px] text-muted-foreground">{texto.condiciones}</p>
      </div>
      <div>
        <label htmlFor="apertura-email" className="block text-[13px]">{texto.email}</label>
        <input
          id="apertura-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@ejemplo.com"
          className="mt-2 min-h-[44px] w-full border border-border bg-transparent px-3 text-[15px] outline-none focus:border-foreground"
        />
      </div>
      <label className="flex items-start gap-3 text-[13px] leading-relaxed">
        <input
          type="checkbox"
          checked={acepta}
          onChange={(e) => setAcepta(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-current"
        />
        <span>
          {texto.consentimiento}{" "}
          <Link to="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
            Privacidad
          </Link>
        </span>
      </label>
      {error && <p role="alert" className="text-[13px]">{texto.error}</p>}
      <Button
        type="submit"
        disabled={!valido || estado === "enviando"}
        className="min-h-[44px] rounded-none bg-primary px-5 text-[15px] text-primary-foreground shadow-none disabled:opacity-40"
      >
        {estado === "enviando" ? texto.enviando : texto.boton}
      </Button>
    </form>
  );
}
