-- Medición anónima del recorrido en Aprende. Solo inserción pública.
ALTER TABLE public.eventos ADD COLUMN detalle TEXT;

ALTER POLICY "Cualquiera puede registrar un evento"
ON public.eventos
TO anon, authenticated
WITH CHECK (
  tipo IN ('visita', 'clic_comprar', 'cambio_modo', 'lectura_capitulo', 'test_terminado', 'test_aprobado')
  AND (producto IS NULL OR producto IN ('unidad', 'pack', 'corporate', 'potencia', 'regalos'))
  AND (modo IS NULL OR modo IN ('estable', 'solitario', 'mixto', 'no_se'))
  AND (cantidad IS NULL OR cantidad BETWEEN 1 AND 1000000)
  AND coalesce(length(utm_source), 0) <= 200
  AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200
  AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200
  AND coalesce(length(referrer), 0) <= 500
  AND (detalle IS NULL OR length(detalle) <= 60)
);