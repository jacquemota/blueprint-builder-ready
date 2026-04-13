
-- Unique CPF constraint on familias
CREATE UNIQUE INDEX IF NOT EXISTS familias_cpf_unique ON public.familias (cpf);

-- Unique email constraint on profiles  
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles (lower(email));
