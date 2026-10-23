DROP POLICY IF EXISTS "Cualquiera puede apuntarse a la lista de espera" ON public.lista_espera;
CREATE POLICY "Cualquiera puede apuntarse a la lista de espera"
ON public.lista_espera FOR INSERT TO anon, authenticated
WITH CHECK (
  email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(email) <= 254
  AND tipo IN ('particular', 'empresa')
  AND cantidad BETWEEN 1 AND 1000000
  AND (producto IS NULL OR producto IN ('unidad', 'pack', 'corporate', 'potencia'))
  AND (modo IS NULL OR modo IN ('estable', 'solitario', 'mixto', 'no_se'))
  AND (para_quien IS NULL OR para_quien IN ('para_mi', 'regalo'))
  AND (cuando IS NULL OR cuando IN ('ya', 'este_mes', 'navidad', 'sin_prisa'))
  AND coalesce(length(utm_source), 0) <= 200
  AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200
  AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200
  AND coalesce(length(referrer), 0) <= 500
);
DROP POLICY IF EXISTS "Cualquiera puede registrar un evento" ON public.eventos;
CREATE POLICY "Cualquiera puede registrar un evento"
ON public.eventos FOR INSERT TO anon, authenticated
WITH CHECK (
  tipo IN ('visita', 'clic_comprar', 'cambio_modo')
  AND (producto IS NULL OR producto IN ('unidad', 'pack', 'corporate', 'potencia'))
  AND (modo IS NULL OR modo IN ('estable', 'solitario', 'mixto', 'no_se'))
  AND (cantidad IS NULL OR cantidad BETWEEN 1 AND 1000000)
  AND coalesce(length(utm_source), 0) <= 200
  AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200
  AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200
  AND coalesce(length(referrer), 0) <= 500
);