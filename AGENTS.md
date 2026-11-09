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
- Juego (/juego): «Snake minero», reto «Cadena del día». El motor (src/lib/snake.ts) es el mismo en navegador y servidor: mapa del día determinista (mismos muros y orden de bloques para todos, sin azar), 90 s de juego como máximo, 50 puntos por bloque con halving cada 21 bloques y más velocidad cada 10. Si se define GAME_SEED en el servidor, los mapas futuros no se pueden calcular desde el repo público (necesario antes de dar premios).
- El navegador solo envía los giros; src/lib/game.functions.ts repite la partida con el motor y calcula los puntos con la clave de servicio, y rechaza giros imposibles o partidas más rápidas que el tiempo real. Los tests de snake.test.ts comprueban un año de mapas con un jugador automático.
- Sin cambios en la base de datos: las partidas del Snake se marcan con extra.juego = "snake" en game_events (inicio con el número de intento; fin con puntos, bloques y giros) y sus entradas de ranking con confirmation_hash = "snake". Ranking y panel solo leen esas entradas; las del juego anterior siguen guardadas. game_rounds, game_challenges y las funciones SQL game_start, submit_game y game_enroll ya no se usan; limpiarlas al migrar a Supabase propio.
- Ranking de fase 1 sin email ni premio: alias + id anónimo del navegador, guardado en game_entries con email = "visitante:<id>" y confirmación automática. Cuentan los 3 primeros intentos de cada día por navegador y queda el mejor (más puntos; si empatan, quien llegó antes a esos puntos). Para la fase 2 (con premio) hará falta email confirmado.
- El evento «email» del juego significa «se apuntó a la lista de espera» (extra.action = lista_espera). «compra» solo se registrará cuando haya pagos reales.
- Textos del juego en src/content/juego.ts. Nada de «premio», «suerte», «apuesta», «experiencia», «sesión», «alquila» ni «rentabilidad».
