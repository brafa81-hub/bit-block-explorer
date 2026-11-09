<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Los precios y tramos del catálogo proceden de `SERVICIO` y se convierten a céntimos antes de operar, para evitar cifras divergentes.
- El índice del glosario se ordena en español y cada ficha usa el slug del contenido como parámetro, para mantener enlaces coherentes.
- Store high-power requests in solicitudes_potencia with insert-only public access and shared Zod validation; this keeps contact data private and separate from waitlist interest.
- Keep gift-module and high-power-form copy in src/content/minar.ts so presentation components do not own business text.
- Game challenges, optimal fees, authoritative timing, submissions and daily ranking uniqueness live in database functions callable only by service_role; clients receive explicit safe projections and possession credentials, never optimal solutions.
- Game copy stays in src/content/juego.ts and UI reuses existing design tokens and Button; keep scores and visitor tracking independent of the mining simulator.
- Game ranking enrollments must remain unavailable until managed confirmation email sending is configured; never collect emails or publish pending entries without a working confirmation flow.
- Record only verified purchases as game conversion events; waitlist interest is not a purchase while payments are closed.
- Game administration authorizes through authenticated user_roles before privileged reads; never infer admin status from an email, browser state or anonymous game credentials.
