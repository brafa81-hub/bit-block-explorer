import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo de potencia de minería | Alquilar 1 PH/s" },
      {
        name: "description",
        content:
          "Unidades de potencia de minería de Bitcoin para particulares y empresas. Contratación por volumen y datos de infraestructura reales.",
      },
      { property: "og:title", content: "Catálogo de potencia de minería" },
      {
        property: "og:description",
        content:
          "Unidades de potencia de minería de Bitcoin para particulares y empresas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalogo,
});

function Catalogo() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="index-label">001 / catálogo</div>
      <h1 className="mt-3 text-3xl sm:text-4xl">Potencia de minería</h1>
      <p className="mt-4 text-[16px] text-muted-foreground">
        Esta sección todavía no está publicada. Aquí verás las unidades disponibles, su
        potencia en TH/s y las condiciones de contratación por volumen.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center border border-border px-5 text-[15px]"
        >
          Volver al simulador
        </Link>
      </div>
    </main>
  );
}
