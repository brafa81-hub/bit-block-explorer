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

- Juego eliminado (10 nov 2026): /juego y todo su código se quitaron por no encajar con la seriedad de la marca; la idea es ampliar /aprende con contenido interactivo. Las tablas game_* (game_runs, game_events, game_entries, game_rounds, game_challenges) y las funciones SQL game_start, submit_game y game_enroll siguen en la base de datos sin uso: borrarlas al migrar a Supabase propio. El código está en el historial de git si se quiere recuperar.
