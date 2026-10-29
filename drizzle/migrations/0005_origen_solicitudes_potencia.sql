ALTER TABLE public.solicitudes_potencia
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS referrer text;
ALTER POLICY "Enviar solicitud de potencia" ON public.solicitudes_potencia WITH CHECK (
  potencia_ph > 1 AND potencia_ph <= 1000000 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254
  AND coalesce(length(utm_source), 0) <= 200 AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200 AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200 AND coalesce(length(referrer), 0) <= 500
);
