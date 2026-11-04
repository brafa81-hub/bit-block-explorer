import type { ReactNode } from "react";

/**
 * Marco común de las demos del Diccionario.
 * La ficha se entiende sin la demo: esto es solo un añadido para probar el concepto.
 */
export function Demo({ titulo, aviso, children }: { titulo: string; aviso: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t border-border pt-6" aria-label={`Pruébalo: ${titulo}`}>
      <h2 className="text-xl">Pruébalo</h2>
      <div className="mt-4 border border-border p-4 sm:p-5">
        <p className="index-label">demo · {titulo}</p>
        <div className="mt-3">{children}</div>
        <p className="mt-5 border-t border-border pt-3 text-[13px] text-muted-foreground">
          Simplificación. {aviso}
        </p>
      </div>
    </section>
  );
}

/** Botón de las demos: al menos 44 px de alto. `activo` lo marca como elegido. */
export function BotonDemo({
  activo = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { activo?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={props["aria-pressed"] ?? (activo || undefined)}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center border px-3 text-[15px] transition-colors disabled:opacity-40 ${
        activo
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border hover:border-foreground"
      } ${className}`}
      {...props}
    />
  );
}
