ALTER POLICY "Cualquiera puede apuntarse a la lista de espera" ON public.lista_espera WITH CHECK (
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
ALTER POLICY "Cualquiera puede registrar un evento" ON public.eventos WITH CHECK (
  tipo IN ('visita', 'clic_comprar', 'cambio_modo')
  AND (producto IS NULL OR producto IN ('unidad', 'pack', 'corporate', 'potencia', 'regalos'))
  AND (modo IS NULL OR modo IN ('estable', 'solitario', 'mixto', 'no_se'))
  AND (cantidad IS NULL OR cantidad BETWEEN 1 AND 1000000)
  AND coalesce(length(utm_source), 0) <= 200 AND coalesce(length(utm_medium), 0) <= 200
  AND coalesce(length(utm_campaign), 0) <= 200 AND coalesce(length(utm_content), 0) <= 200
  AND coalesce(length(utm_term), 0) <= 200 AND coalesce(length(referrer), 0) <= 500
);
CREATE TABLE public.solicitudes_potencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  potencia_ph numeric NOT NULL,
  fecha date NOT NULL,
  email text NOT NULL,
  CONSTRAINT solicitudes_potencia_valida CHECK (potencia_ph > 1 AND potencia_ph <= 1000000 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254)
);
GRANT INSERT ON public.solicitudes_potencia TO anon, authenticated;
GRANT ALL ON public.solicitudes_potencia TO service_role;
ALTER TABLE public.solicitudes_potencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enviar solicitud de potencia" ON public.solicitudes_potencia FOR INSERT TO anon, authenticated WITH CHECK (
  potencia_ph > 1 AND potencia_ph <= 1000000 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254
);