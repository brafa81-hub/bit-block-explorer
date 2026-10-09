import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const botonPrimario =
  "inline-flex min-h-[44px] items-center justify-center bg-primary px-5 text-[15px] text-primary-foreground transition-opacity hover:opacity-90";
const botonSecundario =
  "inline-flex min-h-[44px] items-center justify-center border border-border bg-transparent px-5 text-[15px] text-foreground";

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md">
        <div className="index-label">404 / página no encontrada</div>
        <h1 className="mt-3 text-3xl">Esta página no existe</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          Puede que la dirección esté mal escrita o que la página se haya movido.
        </p>
        <div className="mt-6">
          <Link to="/" className={botonPrimario}>
            Volver al simulador
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md">
        <div className="index-label">error</div>
        <h1 className="mt-3 text-3xl">La página no ha cargado</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          Algo ha fallado por nuestra parte. Prueba a cargarla de nuevo o vuelve al inicio.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className={botonPrimario}
          >
            Intentar de nuevo
          </button>
          <a href="/" className={botonSecundario}>
            Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Simulador de minería de Bitcoin" },
      { name: "description", content: "Aprende qué es minar Bitcoin probando combinaciones en tu propio navegador." },
            { property: "og:title", content: "Simulador de minería de Bitcoin" },
      { property: "og:description", content: "Aprende qué es minar Bitcoin probando combinaciones en tu propio navegador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <nav aria-label="Navegación principal" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 pt-5 text-[14px] sm:px-8">
        <Link to="/" className="text-foreground hover:underline">Simulador</Link>
        <Link to="/mining-101" className="text-foreground hover:underline">Mining 101</Link>
        <Link to="/diccionario" className="text-foreground hover:underline">Diccionario</Link>
        <Link to="/catalogo" className="text-foreground hover:underline">Catálogo</Link>
      </nav>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <footer className="mx-auto max-w-6xl border-t border-border px-5 py-8 text-[14px] sm:px-8">
        <Link to="/catalogo" className="text-foreground underline underline-offset-4">
          Apúntate a la lista de espera
        </Link>
      </footer>
    </QueryClientProvider>
  );
}
