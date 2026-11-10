-- Eliminar el juego /juego (10 nov 2026): tablas, vista, funciones y roles de
-- administración que solo usaba el juego. Se pierden sus datos (partidas, ranking y eventos).
DROP VIEW IF EXISTS public.game_ranking;
DROP FUNCTION IF EXISTS public.game_enroll(uuid, uuid, text, text, text);
DROP FUNCTION IF EXISTS public.submit_game(uuid, uuid, integer, text[]);
DROP FUNCTION IF EXISTS public.game_start(uuid, text, uuid, uuid);
DROP TABLE IF EXISTS public.game_events;
DROP TABLE IF EXISTS public.game_entries;
DROP TABLE IF EXISTS public.game_rounds;
DROP TABLE IF EXISTS public.game_runs;
DROP TABLE IF EXISTS public.game_challenges;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP TABLE IF EXISTS public.user_roles;
DROP TYPE IF EXISTS public.app_role;
