CREATE TABLE public.lista_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'particular',
  producto TEXT,
  cantidad INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.lista_espera TO anon;
GRANT INSERT ON public.lista_espera TO authenticated;
GRANT ALL ON public.lista_espera TO service_role;

ALTER TABLE public.lista_espera ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede apuntarse a la lista de espera"
ON public.lista_espera
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND tipo IN ('particular', 'empresa')
  AND cantidad >= 1
);
