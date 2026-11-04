import { useEffect, useState } from "react";

import { doubleSha256 } from "@/lib/mining";

import { BotonDemo, Demo } from "./Demo";

const TEXTO_INICIAL = "Hola, Bitcoin";

/** Cambia la última letra por la siguiente (a→b, z→a, 9→0). Si no hay texto, escribe «a». */
function cambiarUnaLetra(texto: string): string {
  if (!texto) return "a";
  const ultima = texto.slice(-1);
  const siguiente = (desde: string, hasta: string) =>
    ultima === hasta ? desde : String.fromCharCode(ultima.charCodeAt(0) + 1);
  let nueva = "a";
  if (ultima >= "a" && ultima <= "z") nueva = siguiente("a", "z");
  else if (ultima >= "A" && ultima <= "Z") nueva = siguiente("A", "Z");
  else if (ultima >= "0" && ultima <= "9") nueva = siguiente("0", "9");
  else return texto + "a";
  return texto.slice(0, -1) + nueva;
}

/** Hash en Plex Mono, en grupos de 16 para que quepa a 360 px. Marca en verde lo que cambia respecto a `otro`. */
function HashVisible({ hash, otro }: { hash: string; otro?: string }) {
  if (!hash) return <p className="hash-text text-[13px] text-muted-foreground">calculando…</p>;
  const grupos = hash.match(/.{1,16}/g) ?? [];
  return (
    <p className="hash-text text-[13px] leading-relaxed sm:text-[14px]">
      {grupos.map((g, gi) => (
        <span key={gi} className="block">
          {g.split("").map((c, i) => {
            const pos = gi * 16 + i;
            const cambia = otro && otro[pos] !== c;
            return (
              <span key={i} className={cambia ? "text-primary" : ""}>
                {c}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}

export function DemoHash() {
  const [texto, setTexto] = useState(TEXTO_INICIAL);
  const [hash, setHash] = useState("");
  const [anterior, setAnterior] = useState<{ texto: string; hash: string } | null>(null);

  useEffect(() => {
    let vivo = true;
    doubleSha256(texto).then((h) => vivo && setHash(h));
    return () => {
      vivo = false;
    };
  }, [texto]);

  const cambiar = (nuevo: string) => {
    if (hash) setAnterior({ texto, hash });
    setTexto(nuevo);
  };

  const distintos = anterior && hash ? hash.split("").filter((c, i) => anterior.hash[i] !== c).length : 0;

  return (
    <Demo
      titulo="hash"
      aviso="Bitcoin aplica SHA-256 dos veces a la cabecera del bloque; aquí se hace lo mismo con el texto que escribas. El texto no sale de tu navegador."
    >
      <label htmlFor="demo-hash-texto" className="block text-[13px] text-muted-foreground">
        Escribe lo que quieras
      </label>
      <input
        id="demo-hash-texto"
        type="text"
        value={texto}
        maxLength={200}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => cambiar(e.target.value)}
        className="mt-2 min-h-[44px] w-full border border-border bg-transparent px-3 text-[15px] outline-none focus:border-foreground"
      />
      <BotonDemo className="mt-3 w-full sm:w-auto" onClick={() => cambiar(cambiarUnaLetra(texto))}>
        Cambiar solo la última letra
      </BotonDemo>

      <div className="mt-5">
        <p className="etiqueta">Su hash (64 caracteres)</p>
        <div className="mt-1" aria-live="polite">
          <HashVisible hash={hash} {...(anterior ? { otro: anterior.hash } : {})} />
        </div>
      </div>

      {anterior && hash && anterior.texto !== texto && (
        <div className="mt-4">
          <p className="etiqueta">
            Antes: <span className="hash-text break-all">«{anterior.texto || " "}»</span>
          </p>
          <div className="mt-1 opacity-60">
            <HashVisible hash={anterior.hash} />
          </div>
          <p className="mt-3 text-[15px]">
            Han cambiado <span className="hash-text">{distintos}</span> de{" "}
            <span className="hash-text">64</span> caracteres <span className="text-primary">(en verde)</span>.
          </p>
        </div>
      )}
    </Demo>
  );
}
