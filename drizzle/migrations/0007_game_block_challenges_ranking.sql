CREATE TABLE public.game_challenges (id integer PRIMARY KEY, name text NOT NULL, capacity integer NOT NULL, transactions jsonb NOT NULL, time_limit integer NOT NULL, best_fee integer NOT NULL);
GRANT SELECT (id,name,capacity,transactions,time_limit) ON public.game_challenges TO anon,authenticated;
GRANT ALL ON public.game_challenges TO service_role;
ALTER TABLE public.game_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public challenge data" ON public.game_challenges FOR SELECT TO anon,authenticated USING (true);
INSERT INTO public.game_challenges VALUES
(1,'fácil',1000,'[{"id":"t01","size":180,"fee":980},{"id":"t02","size":250,"fee":1600},{"id":"t03","size":120,"fee":840},{"id":"t04","size":340,"fee":1700},{"id":"t05","size":200,"fee":1500},{"id":"t06","size":150,"fee":1000},{"id":"t07","size":400,"fee":2100},{"id":"t08","size":90,"fee":500}]',60,6420),
(2,'medio',1400,'[{"id":"t01","size":350,"fee":2500},{"id":"t02","size":220,"fee":1540},{"id":"t03","size":480,"fee":2700},{"id":"t04","size":100,"fee":900},{"id":"t05","size":180,"fee":1530},{"id":"t06","size":300,"fee":2300},{"id":"t07","size":140,"fee":980},{"id":"t08","size":260,"fee":1950},{"id":"t09","size":520,"fee":3000},{"id":"t10","size":90,"fee":720},{"id":"t11","size":200,"fee":1700},{"id":"t12","size":160,"fee":1120}]',75,10900),
(3,'difícil',1800,'[{"id":"t01","size":1100,"fee":7000},{"id":"t02","size":900,"fee":6300},{"id":"t03","size":420,"fee":3500},{"id":"t04","size":180,"fee":1800},{"id":"t05","size":250,"fee":2400},{"id":"t06","size":160,"fee":1680},{"id":"t07","size":330,"fee":2970},{"id":"t08","size":120,"fee":1320},{"id":"t09","size":290,"fee":2610},{"id":"t10","size":200,"fee":2100},{"id":"t11","size":450,"fee":3600},{"id":"t12","size":150,"fee":1575},{"id":"t13","size":310,"fee":2790},{"id":"t14","size":90,"fee":990},{"id":"t15","size":240,"fee":2280},{"id":"t16","size":380,"fee":3230}]',90,17625);
CREATE TABLE public.game_runs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), secret uuid NOT NULL DEFAULT gen_random_uuid(), visitor_id uuid NOT NULL, ref text, started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz, score numeric, total_ms integer);
GRANT ALL ON public.game_runs TO service_role;
ALTER TABLE public.game_runs ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.game_rounds (run_id uuid REFERENCES public.game_runs(id) NOT NULL, challenge_id integer REFERENCES public.game_challenges(id) NOT NULL, started_at timestamptz NOT NULL DEFAULT now(), submitted_at timestamptz, selected jsonb, score numeric, elapsed_ms integer, PRIMARY KEY(run_id,challenge_id));
GRANT ALL ON public.game_rounds TO service_role;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.game_entries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), run_id uuid UNIQUE REFERENCES public.game_runs(id) NOT NULL, email text NOT NULL, alias text NOT NULL CHECK (length(alias) BETWEEN 1 AND 20 AND position('@' in alias)=0), play_day date NOT NULL, week date NOT NULL, score numeric NOT NULL, total_ms integer NOT NULL, confirmed_at timestamptz, confirmation_hash text NOT NULL, consent_at timestamptz NOT NULL DEFAULT now(), hidden boolean NOT NULL DEFAULT false, reviewed boolean NOT NULL DEFAULT false, UNIQUE(email,play_day));
GRANT ALL ON public.game_entries TO service_role;
ALTER TABLE public.game_entries ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.game_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), fecha timestamptz NOT NULL DEFAULT now(), run_id uuid REFERENCES public.game_runs(id), visitor_id uuid NOT NULL, email text, tipo text NOT NULL CHECK(tipo IN ('inicio','fin','compartir','email','test_inicio','test_fin','test_aprobado','compra')), ref text, extra jsonb NOT NULL DEFAULT '{}');
GRANT ALL ON public.game_events TO service_role;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX game_events_run_date ON public.game_events(run_id,fecha);
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,role public.app_role NOT NULL, UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own roles" ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated,service_role;
CREATE VIEW public.game_ranking WITH (security_barrier=true) AS SELECT alias,score,total_ms,week FROM public.game_entries WHERE confirmed_at IS NOT NULL AND NOT hidden;
GRANT SELECT ON public.game_ranking TO anon,authenticated;
GRANT ALL ON public.game_ranking TO service_role;
CREATE FUNCTION public.game_start(_visitor uuid,_ref text,_run uuid DEFAULT NULL,_secret uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.game_runs; c public.game_challenges; n integer; t timestamptz;
BEGIN
 IF _run IS NULL THEN
  IF (SELECT count(*) FROM public.game_runs WHERE visitor_id=_visitor AND started_at>now()-interval '1 hour')>=30 THEN RAISE EXCEPTION 'Demasiados intentos. Vuelve más tarde.'; END IF;
  INSERT INTO public.game_runs(visitor_id,ref) VALUES(_visitor,left(_ref,100)) RETURNING * INTO r;
  INSERT INTO public.game_events(run_id,visitor_id,tipo,ref) VALUES(r.id,_visitor,'inicio',r.ref);
 ELSE SELECT * INTO r FROM public.game_runs WHERE id=_run AND secret=_secret AND visitor_id=_visitor FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Partida no válida'; END IF;
 END IF;
 IF r.completed_at IS NOT NULL THEN RAISE EXCEPTION 'Partida ya terminada'; END IF;
 SELECT count(*)+1 INTO n FROM public.game_rounds WHERE run_id=r.id AND submitted_at IS NOT NULL;
 SELECT * INTO c FROM public.game_challenges WHERE id=n;
 INSERT INTO public.game_rounds(run_id,challenge_id) VALUES(r.id,n) ON CONFLICT DO NOTHING;
 SELECT started_at INTO t FROM public.game_rounds WHERE run_id=r.id AND challenge_id=n;
 RETURN jsonb_build_object('runId',r.id,'secret',r.secret,'challengeId',c.id,'name',c.name,'capacity',c.capacity,'transactions',c.transactions,'timeLimit',c.time_limit,'remainingMs',greatest(0,c.time_limit*1000-extract(epoch from (clock_timestamp()-t))*1000));
END $$;
REVOKE ALL ON FUNCTION public.game_start(uuid,text,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game_start(uuid,text,uuid,uuid) TO service_role;
CREATE FUNCTION public.submit_game(_run uuid,_secret uuid,_challenge integer,_selected text[]) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.game_runs; q public.game_rounds; c public.game_challenges; s integer; f integer; sc numeric; ms integer; stamp timestamptz:=clock_timestamp();
BEGIN
 SELECT * INTO r FROM public.game_runs WHERE id=_run AND secret=_secret FOR UPDATE;
 IF r.id IS NULL THEN RAISE EXCEPTION 'Partida no válida'; END IF;
 SELECT * INTO q FROM public.game_rounds WHERE run_id=r.id AND challenge_id=_challenge;
 IF q.run_id IS NULL THEN RAISE EXCEPTION 'Reto no iniciado'; END IF;
 IF q.submitted_at IS NOT NULL THEN RETURN jsonb_build_object('score',q.score,'elapsedMs',q.elapsed_ms,'finalScore',r.score,'totalMs',r.total_ms,'complete',r.completed_at IS NOT NULL); END IF;
 SELECT * INTO c FROM public.game_challenges WHERE id=_challenge;
 ms:=greatest(0,round(extract(epoch FROM (stamp-q.started_at))*1000)::integer);
 IF ms>(c.time_limit+5)*1000 THEN RAISE EXCEPTION 'Se ha agotado el tiempo de envío. Empieza una nueva partida.'; END IF;
 IF cardinality(_selected)<>(SELECT count(DISTINCT x) FROM unnest(_selected) x) OR EXISTS(SELECT 1 FROM unnest(_selected) x WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(c.transactions) t WHERE t->>'id'=x)) THEN RAISE EXCEPTION 'Transacciones no válidas'; END IF;
 SELECT coalesce(sum((t->>'size')::integer),0),coalesce(sum((t->>'fee')::integer),0) INTO s,f FROM jsonb_array_elements(c.transactions) t WHERE t->>'id'=ANY(_selected);
 sc:=CASE WHEN s>c.capacity THEN 0 ELSE round(f::numeric/c.best_fee*10,1) END;
 UPDATE public.game_rounds SET submitted_at=stamp,selected=to_jsonb(_selected),score=sc,elapsed_ms=ms WHERE run_id=r.id AND challenge_id=c.id;
 IF (SELECT count(*) FROM public.game_rounds WHERE run_id=r.id AND submitted_at IS NOT NULL)=3 THEN
 UPDATE public.game_runs SET completed_at=stamp,score=(SELECT round(avg(score),1) FROM public.game_rounds WHERE run_id=r.id),total_ms=(SELECT sum(elapsed_ms) FROM public.game_rounds WHERE run_id=r.id) WHERE id=r.id RETURNING * INTO r;
 INSERT INTO public.game_events(run_id,visitor_id,tipo,ref) VALUES(r.id,r.visitor_id,'fin',r.ref);
 END IF;
 RETURN jsonb_build_object('score',sc,'elapsedMs',ms,'finalScore',r.score,'totalMs',r.total_ms,'complete',r.completed_at IS NOT NULL);
END $$;
REVOKE ALL ON FUNCTION public.submit_game(uuid,uuid,integer,text[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.submit_game(uuid,uuid,integer,text[]) TO service_role;
CREATE FUNCTION public.game_enroll(_run uuid,_secret uuid,_email text,_alias text,_hash text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.game_runs; d date; w date; eid uuid;
BEGIN
 SELECT * INTO r FROM public.game_runs WHERE id=_run AND secret=_secret AND completed_at IS NOT NULL;
 IF r.id IS NULL THEN RAISE EXCEPTION 'Termina los tres retos primero'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(lower(trim(_email)),0));
 d:=(r.completed_at AT TIME ZONE 'Europe/Madrid')::date; w:=date_trunc('week',r.completed_at AT TIME ZONE 'Europe/Madrid')::date;
 IF EXISTS(SELECT 1 FROM public.game_entries WHERE email=lower(trim(_email)) AND play_day=d) THEN RAISE EXCEPTION 'Tu primer juego del día ya está registrado'; END IF;
 IF EXISTS(SELECT 1 FROM public.game_runs g JOIN public.game_entries e ON e.run_id=g.id WHERE e.email=lower(trim(_email)) AND (g.completed_at AT TIME ZONE 'Europe/Madrid')::date=d AND g.completed_at<r.completed_at) THEN RAISE EXCEPTION 'Solo cuenta el primer juego del día'; END IF;
 INSERT INTO public.game_entries(run_id,email,alias,play_day,week,score,total_ms,confirmation_hash) VALUES(r.id,lower(trim(_email)),trim(_alias),d,w,r.score,r.total_ms,_hash) RETURNING id INTO eid;
 INSERT INTO public.game_events(run_id,visitor_id,email,tipo,ref) VALUES(r.id,r.visitor_id,lower(trim(_email)),'email',r.ref);
 RETURN eid;
END $$;
REVOKE ALL ON FUNCTION public.game_enroll(uuid,uuid,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game_enroll(uuid,uuid,text,text,text) TO service_role;