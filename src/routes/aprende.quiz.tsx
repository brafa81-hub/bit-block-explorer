import { createFileRoute, redirect } from "@tanstack/react-router";

/** Dirección antigua del test: redirige a /aprende/test para no romper enlaces. */
export const Route = createFileRoute("/aprende/quiz")({
  beforeLoad: () => {
    throw redirect({ to: "/aprende/test", statusCode: 301 });
  },
});
