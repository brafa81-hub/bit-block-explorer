ALTER TABLE public.solicitudes_potencia
  ADD COLUMN utm_source TEXT,
  ADD COLUMN utm_medium TEXT,
  ADD COLUMN utm_campaign TEXT,
  ADD COLUMN utm_content TEXT,
  ADD COLUMN utm_term TEXT,
  ADD COLUMN referrer TEXT;

ALTER POLICY "Enviar solicitud de potencia"
ON public.solicitudes_potencia
TO anon, authenticated
WITH CHECK (
  potencia_ph > 1 AND potencia_ph <= 1000000
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(email) <= 254
  AND coalesce(length(utm_source), 0) <= 200
  AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200
  AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200
  AND coalesce(length(referrer), 0) <= 500
);