-- Bloque170 · Esquema inicial para un proyecto Supabase nuevo
-- Reúne el estado final de drizzle/migrations 0000 a 0011 (sin las tablas del juego, ya eliminadas) en un solo archivo.
-- Uso: Supabase → SQL Editor → New query → pegar todo → Run. Solo una vez, en un proyecto vacío.
-- La web solo puede AÑADIR filas (nunca leerlas). Los datos se consultan desde el panel de Supabase.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 1. Lista de espera ---------------------------------------------------------
CREATE TABLE public.lista_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'particular',
  producto TEXT,
  cantidad INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  modo TEXT,
  para_quien TEXT,
  cuando TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT
);

GRANT INSERT ON public.lista_espera TO anon, authenticated;
GRANT ALL ON public.lista_espera TO service_role;
ALTER TABLE public.lista_espera ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede apuntarse a la lista de espera"
ON public.lista_espera FOR INSERT TO anon, authenticated
WITH CHECK (
  email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254
  AND tipo IN ('particular', 'empresa') AND cantidad BETWEEN 1 AND 1000000
  AND (producto IS NULL OR producto IN ('unidad', 'pack', 'corporate', 'potencia', 'regalos'))
  AND (modo IS NULL OR modo IN ('estable', 'solitario', 'mixto', 'no_se'))
  AND (para_quien IS NULL OR para_quien IN ('para_mi', 'regalo'))
  AND (cuando IS NULL OR cuando IN ('ya', 'este_mes', 'navidad', 'sin_prisa'))
  AND coalesce(length(utm_source), 0) <= 200 AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200 AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200 AND coalesce(length(referrer), 0) <= 500
);

-- 2. Eventos anónimos (visitas, clics y recorrido en Aprende) ----------------
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo TEXT NOT NULL,
  producto TEXT,
  modo TEXT,
  cantidad INTEGER,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  detalle TEXT
);

GRANT INSERT ON public.eventos TO anon, authenticated;
GRANT ALL ON public.eventos TO service_role;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede registrar un evento"
ON public.eventos FOR INSERT TO anon, authenticated
WITH CHECK (
  tipo IN ('visita', 'clic_comprar', 'cambio_modo', 'lectura_capitulo', 'test_terminado', 'test_aprobado')
  AND (producto IS NULL OR producto IN ('unidad', 'pack', 'corporate', 'potencia', 'regalos'))
  AND (modo IS NULL OR modo IN ('estable', 'solitario', 'mixto', 'no_se'))
  AND (cantidad IS NULL OR cantidad BETWEEN 1 AND 1000000)
  AND coalesce(length(utm_source), 0) <= 200 AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200 AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200 AND coalesce(length(referrer), 0) <= 500
  AND (detalle IS NULL OR length(detalle) <= 60)
);

CREATE INDEX eventos_created_at_idx ON public.eventos (created_at);

-- 3. Pedidos especiales (mensaje libre + email) -------------------------------
-- potencia_ph y fecha son opcionales: solo las traen solicitudes antiguas.
CREATE TABLE public.solicitudes_potencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  potencia_ph NUMERIC,
  fecha DATE,
  email TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  mensaje TEXT,
  CONSTRAINT solicitudes_potencia_valida CHECK (
    (potencia_ph IS NULL OR (potencia_ph > 1 AND potencia_ph <= 1000000))
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254
    AND (mensaje IS NULL OR length(mensaje) BETWEEN 1 AND 2000)
  )
);

GRANT INSERT ON public.solicitudes_potencia TO anon, authenticated;
GRANT ALL ON public.solicitudes_potencia TO service_role;
ALTER TABLE public.solicitudes_potencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enviar solicitud de potencia"
ON public.solicitudes_potencia FOR INSERT TO anon, authenticated
WITH CHECK (
  (potencia_ph IS NULL OR (potencia_ph > 1 AND potencia_ph <= 1000000))
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254
  AND (mensaje IS NULL OR length(mensaje) BETWEEN 1 AND 2000)
  AND coalesce(length(utm_source), 0) <= 200 AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200 AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200 AND coalesce(length(referrer), 0) <= 500
);

-- 4. Vistas de resumen (solo desde el panel de Supabase, nunca desde la web) --
CREATE VIEW public.resumen_productos WITH (security_invoker = true) AS
WITH clics AS (
  SELECT producto, coalesce(modo, 'sin_modo') AS modo, count(*) AS clics
  FROM public.eventos WHERE tipo = 'clic_comprar' GROUP BY 1, 2
), emails AS (
  SELECT producto, coalesce(modo, 'sin_modo') AS modo, count(*) AS emails
  FROM public.lista_espera WHERE producto IN ('unidad', 'pack', 'corporate') GROUP BY 1, 2
)
SELECT coalesce(c.producto, e.producto) AS producto,
       coalesce(c.modo, e.modo) AS modo,
       coalesce(c.clics, 0) AS clics_comprar,
       coalesce(e.emails, 0) AS emails,
       CASE WHEN coalesce(c.clics, 0) > 0
            THEN round(100.0 * coalesce(e.emails, 0) / c.clics, 1) END AS pct_clic_a_email
FROM clics c FULL JOIN emails e ON e.producto = c.producto AND e.modo = c.modo
ORDER BY 1, 2;

CREATE VIEW public.resumen_origen WITH (security_invoker = true) AS
WITH ev AS (
  SELECT coalesce(utm_source, '(directo)') AS origen, coalesce(utm_campaign, '-') AS campana,
         count(*) FILTER (WHERE tipo = 'visita') AS visitas,
         count(*) FILTER (WHERE tipo = 'clic_comprar') AS clics_comprar
  FROM public.eventos GROUP BY 1, 2
), le AS (
  SELECT coalesce(utm_source, '(directo)') AS origen, coalesce(utm_campaign, '-') AS campana,
         count(*) AS emails
  FROM public.lista_espera WHERE producto IN ('unidad', 'pack', 'corporate') GROUP BY 1, 2
)
SELECT coalesce(ev.origen, le.origen) AS origen,
       coalesce(ev.campana, le.campana) AS campana,
       coalesce(ev.visitas, 0) AS visitas,
       coalesce(ev.clics_comprar, 0) AS clics_comprar,
       coalesce(le.emails, 0) AS emails,
       CASE WHEN coalesce(ev.visitas, 0) > 0
            THEN round(100.0 * coalesce(le.emails, 0) / ev.visitas, 1) END AS pct_visita_a_email
FROM ev FULL JOIN le ON le.origen = ev.origen AND le.campana = ev.campana
ORDER BY visitas DESC;

CREATE VIEW public.resumen_diario WITH (security_invoker = true) AS
WITH dias AS (
  SELECT (created_at AT TIME ZONE 'Europe/Madrid')::date AS dia,
         count(*) FILTER (WHERE tipo = 'visita') AS visitas,
         count(*) FILTER (WHERE tipo = 'clic_comprar') AS clics_comprar
  FROM public.eventos GROUP BY 1
), le AS (
  SELECT (created_at AT TIME ZONE 'Europe/Madrid')::date AS dia, count(*) AS emails
  FROM public.lista_espera WHERE producto IN ('unidad', 'pack', 'corporate') GROUP BY 1
)
SELECT coalesce(d.dia, le.dia) AS dia,
       coalesce(d.visitas, 0) AS visitas,
       coalesce(d.clics_comprar, 0) AS clics_comprar,
       coalesce(le.emails, 0) AS emails
FROM dias d FULL JOIN le ON le.dia = d.dia
ORDER BY 1 DESC;

CREATE VIEW public.resumen_respuestas WITH (security_invoker = true) AS
SELECT producto, coalesce(para_quien, '-') AS para_quien, coalesce(cuando, '-') AS cuando,
       count(*) AS emails
FROM public.lista_espera
WHERE producto IN ('unidad', 'pack', 'corporate')
GROUP BY 1, 2, 3
ORDER BY 1, 4 DESC;

REVOKE ALL ON public.resumen_productos, public.resumen_origen, public.resumen_diario, public.resumen_respuestas FROM anon, authenticated;
GRANT SELECT ON public.resumen_productos, public.resumen_origen, public.resumen_diario, public.resumen_respuestas TO service_role;
