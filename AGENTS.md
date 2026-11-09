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
- Record only verified purchases as game conversion events; waitlist interest is not a purchase while payments are closed.
- Juego (/juego): «Bloque del día». Los tres retos de cada día se generan en el servidor a partir de la fecha (src/lib/game-puzzle.ts, solo servidor) y se valida en tests que cada reto de un año tiene una sola solución perfecta y que los atajos simples no llegan a 10. Si se define GAME_SEED en el servidor, los retos futuros no se pueden calcular desde el repo público (necesario antes de dar premios).
- La nota y el tiempo se calculan en las funciones de servidor de src/lib/game.functions.ts con la clave de servicio; el navegador nunca recibe la solución antes de cerrar el bloque. Las funciones SQL game_start, submit_game y game_enroll y la tabla game_challenges ya no se usan (la tabla sigue por la clave foránea de game_rounds); limpiarlas al migrar a Supabase propio.
- Ranking de fase 1 sin email ni premio: alias + id anónimo del navegador, guardado en game_entries con email = "visitante:<id>" y confirmación automática. Solo cuenta la primera partida terminada de cada día por navegador. Para la fase 2 (con premio) hará falta email confirmado.
- El evento «email» del juego significa «se apuntó a la lista de espera» (extra.action = lista_espera). «compra» solo se registrará cuando haya pagos reales.
- Textos del juego en src/content/juego.ts. Nada de «premio», «suerte», «apuesta», «experiencia», «sesión», «alquila» ni «rentabilidad».
