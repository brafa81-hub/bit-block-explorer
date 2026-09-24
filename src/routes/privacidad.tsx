import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Privacidad | Alquiler de potencia de minería en PH/s" },
      {
        name: "description",
        content:
          "Cómo tratamos tu email cuando te apuntas al aviso de apertura del alquiler de potencia de minería de 1 PH/s.",
      },
      { property: "og:title", content: "Privacidad" },
      {
        property: "og:description",
        content:
          "Cómo tratamos tu email cuando te apuntas al aviso de apertura del alquiler de 1 PH/s.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacidad,
});

function Privacidad() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <div className="index-label">001 / privacidad</div>
      <h1 className="mt-3 text-3xl sm:text-4xl">Privacidad</h1>

      <p className="mt-6 text-[16px] text-muted-foreground">
        Texto provisional. Queda pendiente de completar con los datos definitivos.
      </p>

      <div className="mt-10 space-y-8 text-[15px]">
        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Quién guarda tus datos</h2>
          <p className="mt-2 text-muted-foreground">
            [Pendiente: nombre o razón social, dirección y email de contacto.]
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Qué guardamos</h2>
          <p className="mt-2 text-muted-foreground">
            Tu email y, si escribes desde una empresa, el producto y la cantidad que nos
            indicas, junto con la fecha en que nos lo envías.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Para qué</h2>
          <p className="mt-2 text-muted-foreground">
            Solo para avisarte de la apertura y responderte si nos pides un presupuesto. No
            lo usamos para nada más ni se lo cedemos a terceros.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Cuánto tiempo</h2>
          <p className="mt-2 text-muted-foreground">
            [Pendiente: plazo de conservación.]
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Tus derechos</h2>
          <p className="mt-2 text-muted-foreground">
            Puedes pedirnos en cualquier momento que te digamos qué tenemos tuyo, que lo
            corrijamos o que lo borremos. Escríbenos a [pendiente: email de contacto].
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link
          to="/catalogo"
          className="inline-flex min-h-[44px] items-center border border-border px-5 text-[15px]"
        >
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}
