import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Privacidad | Potencia de minería por 24 horas" },
      {
        name: "description",
        content:
          "Cómo tratamos tu email cuando te apuntas al aviso de apertura de la venta de potencia de minería.",
      },
      { property: "og:title", content: "Privacidad" },
      {
        property: "og:description",
        content:
          "Cómo tratamos tu email cuando te apuntas al aviso de apertura de la venta de potencia de minería.",
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

      <div className="mt-10 space-y-8 text-[15px]">
        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Quién guarda tus datos</h2>
          <p className="mt-2 text-muted-foreground">
            INDENE OÜ (en constitución), Lõõtsa tn 5, 11415 Tallinn, Estonia. Contacto: contact@bloque170.com.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Qué guardamos</h2>
          <p className="mt-2 text-muted-foreground">
            Tu email, el producto y el modo que te interesan, si es para ti o para regalar, para
            cuándo lo querrías y, si escribes desde una empresa, la potencia que nos indicas, junto
            con la fecha en que nos lo envías y la web o campaña desde la que llegaste. Además
            contamos de forma anónima las visitas y los clics en la página de compra, sin cookies ni
            datos que te identifiquen.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Para qué</h2>
          <p className="mt-2 text-muted-foreground">
            Solo para avisarte de la apertura y responderte si nos consultas por un pedido. No lo
            usamos para nada más ni se lo cedemos a terceros.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Cuánto tiempo</h2>
          <p className="mt-2 text-muted-foreground">Conservamos tu email hasta que se abra la venta o pidas la baja, y como máximo 12 meses.</p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Tus derechos</h2>
          <p className="mt-2 text-muted-foreground">
            Puedes pedirnos en cualquier momento que te digamos qué tenemos tuyo, que lo corrijamos
            o que lo borremos. Escríbenos a contact@bloque170.com.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center border border-border px-5 text-[15px]"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
