import { createFileRoute, Link } from "@tanstack/react-router";
import { SERVICIO, urlPublica } from "@/content/servicio";

const DESC = `Quién está detrás de ${SERVICIO.marca}, en qué punto está el servicio y qué debes tener en cuenta.`;

export const Route = createFileRoute("/aviso-legal")({
  head: () => ({
    meta: [
      { title: `Aviso legal | ${SERVICIO.marca}` },
      { name: "description", content: DESC },
      { property: "og:title", content: "Aviso legal" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AvisoLegal,
});

function AvisoLegal() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <div className="index-label">001 / aviso legal</div>
      <h1 className="mt-3 text-3xl sm:text-4xl">Aviso legal</h1>

      <div className="mt-10 space-y-8 text-[15px]">
        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Quién está detrás</h2>
          <p className="mt-2 text-muted-foreground">
            {SERVICIO.marca} ({urlPublica("/")}) es un proyecto de INDENE OÜ (en constitución), con domicilio en Lõõtsa tn 5, 11415 Tallinn,
            Estonia. Contacto: contact@bloque170.com.
          </p>
          <p className="mt-2 text-muted-foreground">
            El número de registro y el de IVA de la sociedad se publicarán aquí en cuanto esté inscrita.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Estado del servicio</h2>
          <p className="mt-2 text-muted-foreground">
            La venta de potencia de minería todavía no está abierta. Los precios que ves son orientativos y pueden cambiar antes de abrir. Apuntarte a
            la lista de espera no es una compra ni te obliga a nada: solo nos permite avisarte cuando abramos.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Qué ofrecemos</h2>
          <p className="mt-2 text-muted-foreground">
            Potencia de minería de Bitcoin durante 24 horas. Compras potencia, no una cantidad de bitcoin. No es una inversión y ningún resultado está
            garantizado: lo que se genere depende de la red y del modo elegido, y lo normal es recibir en sats menos de lo que pagas. Los bitcoin que se
            generen van directos a tu wallet; no los custodiamos ni te pedimos tus claves ni tu frase de recuperación.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Contenidos informativos</h2>
          <p className="mt-2 text-muted-foreground">
            El simulador, Aprende y el Diccionario tienen fines educativos. No son asesoramiento financiero, fiscal ni legal.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-xl">Tus datos</h2>
          <p className="mt-2 text-muted-foreground">
            Cómo tratamos tu email está en la página de{" "}
            <Link to="/privacidad" className="text-primary underline underline-offset-4">
              Privacidad
            </Link>
            .
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link to="/" className="inline-flex min-h-[44px] items-center border border-border px-5 text-[15px]">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
