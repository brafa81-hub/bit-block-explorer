import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getTermino } from "@/content/glosario";

export function Termino({ slug, children }: { slug: string; children?: ReactNode }) {
  const t = getTermino(slug);
  if (!t) return <>{children}</>;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline cursor-help underline decoration-dotted decoration-1 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={`${typeof children === "string" ? children : t.termino}: ver definición`}
        >
          {children ?? t.termino}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 rounded-sm border-border bg-background p-4 shadow-none">
        <div className="index-label">glosario</div>
        <p className="mt-1 text-[15px] font-medium">{t.termino}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{t.definicion}</p>
        <Link
          to="/glosario/$slug"
          params={{ slug: t.slug }}
          className="mt-3 inline-block text-[14px] text-primary underline underline-offset-4"
        >
          Ver ficha completa
        </Link>
      </PopoverContent>
    </Popover>
  );
}
