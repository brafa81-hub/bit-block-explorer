-- Pedido especial: el formulario pasa a ser un mensaje libre + email.
-- Las filas existentes no cambian; potencia_ph y fecha quedan como datos opcionales.
ALTER TABLE public.solicitudes_potencia
  ADD COLUMN IF NOT EXISTS mensaje TEXT,
  ALTER COLUMN potencia_ph DROP NOT NULL,
  ALTER COLUMN fecha DROP NOT NULL;

ALTER TABLE public.solicitudes_potencia DROP CONSTRAINT solicitudes_potencia_valida;
ALTER TABLE public.solicitudes_potencia ADD CONSTRAINT solicitudes_potencia_valida CHECK (
  (potencia_ph IS NULL OR (potencia_ph > 1 AND potencia_ph <= 1000000))
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254
  AND (mensaje IS NULL OR length(mensaje) BETWEEN 1 AND 2000)
);

ALTER POLICY "Enviar solicitud de potencia"
ON public.solicitudes_potencia
TO anon, authenticated
WITH CHECK (
  (potencia_ph IS NULL OR (potencia_ph > 1 AND potencia_ph <= 1000000))
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(email) <= 254
  AND (mensaje IS NULL OR length(mensaje) BETWEEN 1 AND 2000)
  AND coalesce(length(utm_source), 0) <= 200
  AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200
  AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200
  AND coalesce(length(referrer), 0) <= 500
);