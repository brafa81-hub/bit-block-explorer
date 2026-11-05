import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Privacidad | Potencia de minería durante 24 horas" },
      {
        name: "description",
        content:
          "Cómo tratamos tus datos cuando usas la web y te apuntas al aviso de apertura de la venta de potencia de minería.",
      },
      { property: "og:title", content: "Privacidad" },
      {
        property: "og:description",
        content:
          "Cómo tratamos tus datos cuando usas la web y te apuntas al aviso de apertura de la venta de potencia de minería.",
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
            Tu email (también si lo dejas al aprobar el test de Aprende), el producto y el modo que
            te interesan, si es para ti o para regalar y, si escribes desde
            una empresa, la potencia que nos indicas, junto con la fecha en que nos lo envías y la
            web o campaña desde la que llegaste. Además contamos de forma anónima las visitas y los
            clics en la web, los capítulos de Aprende que se abren y el resultado del test, sin
            cookies ni datos que te identifiquen.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Para qué</h2>
          <p className="mt-2 text-muted-foreground">
            Solo para avisarte de la apertura, enviarte tu código si apruebas el test y estás entre
            las primeras plazas, responderte si nos consultas por un pedido y saber
            qué partes de la web se usan. No lo usamos para nada más ni se lo cedemos a terceros.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Servicios de terceros</h2>
          <p className="mt-2 text-muted-foreground">
            Para mostrar datos de la red de Bitcoin en directo (en el simulador y en algunas fichas
            del Diccionario), nuestro servidor los consulta en mempool.space. Tu navegador no se
            conecta con mempool.space, así que no ven tu dirección IP ni ningún dato tuyo.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Cuánto tiempo</h2>
          <p className="mt-2 text-muted-foreground">Conservamos tu email hasta que se abra la venta o pidas la baja, y como máximo 12 meses. Si
            tienes plaza de potencia extra por el test, lo guardamos además mientras dure esa ventaja.</p>
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
