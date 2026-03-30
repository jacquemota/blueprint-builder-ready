
-- ==========================================================
-- ENUM: app_role (perfis de acesso)
-- ==========================================================
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'assistente_social',
  'atendimento',
  'consulta',
  'auditoria'
);

-- ==========================================================
-- FUNCTION: update_updated_at_column
-- ==========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ==========================================================
-- TABLE: profiles (linked to auth.users)
-- ==========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- TABLE: user_roles (RBAC separado)
-- ==========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- FUNCTION: has_role (security definer para evitar recursão)
-- ==========================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ==========================================================
-- FUNCTION: get_user_role (retorna o primeiro role)
-- ==========================================================
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- ==========================================================
-- TABLE: familias
-- ==========================================================
CREATE TABLE public.familias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responsavel TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE CHECK (length(replace(replace(cpf, '.', ''), '-', '')) = 11),
  telefone TEXT NOT NULL CHECK (length(regexp_replace(telefone, '[^0-9]', '', 'g')) >= 10),
  endereco TEXT NOT NULL,
  bairro TEXT NOT NULL,
  comunidade TEXT NOT NULL DEFAULT '',
  num_moradores INTEGER NOT NULL DEFAULT 1 CHECK (num_moradores >= 1),
  num_criancas INTEGER NOT NULL DEFAULT 0 CHECK (num_criancas >= 0),
  num_idosos INTEGER NOT NULL DEFAULT 0 CHECK (num_idosos >= 0),
  situacao_social TEXT NOT NULL DEFAULT 'Estável',
  data_nascimento_responsavel DATE,
  observacoes TEXT DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.familias ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_familias_cpf ON public.familias(cpf);
CREATE INDEX idx_familias_bairro ON public.familias(bairro);
CREATE INDEX idx_familias_comunidade ON public.familias(comunidade);
CREATE INDEX idx_familias_situacao ON public.familias(situacao_social);

CREATE TRIGGER update_familias_updated_at
  BEFORE UPDATE ON public.familias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- TABLE: membros_familia
-- ==========================================================
CREATE TABLE public.membros_familia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_nascimento DATE,
  parentesco TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.membros_familia ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_membros_familia_id ON public.membros_familia(familia_id);

-- ==========================================================
-- TABLE: atendimentos
-- ==========================================================
CREATE TABLE public.atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  tipo_atendimento TEXT NOT NULL CHECK (tipo_atendimento IN ('Fisioterapia', 'Assistente Social', 'Orientação Social', 'Outros')),
  profissional_id UUID NOT NULL REFERENCES auth.users(id),
  data_atendimento DATE NOT NULL,
  observacoes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_atendimentos_familia ON public.atendimentos(familia_id);
CREATE INDEX idx_atendimentos_profissional ON public.atendimentos(profissional_id);
CREATE INDEX idx_atendimentos_data ON public.atendimentos(data_atendimento);

CREATE TRIGGER update_atendimentos_updated_at
  BEFORE UPDATE ON public.atendimentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- TABLE: entregas_cestas
-- ==========================================================
CREATE TABLE public.entregas_cestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  data_entrega DATE NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade >= 1),
  observacoes TEXT DEFAULT '',
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.entregas_cestas ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_entregas_familia ON public.entregas_cestas(familia_id);
CREATE INDEX idx_entregas_data ON public.entregas_cestas(data_entrega);

-- ==========================================================
-- TABLE: atividades (grupos de socialização)
-- ==========================================================
CREATE TABLE public.atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data_atividade DATE NOT NULL,
  responsavel_id UUID REFERENCES auth.users(id),
  descricao TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_atividades_updated_at
  BEFORE UPDATE ON public.atividades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- TABLE: participantes_atividade
-- ==========================================================
CREATE TABLE public.participantes_atividade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id UUID NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  familia_id UUID REFERENCES public.familias(id) ON DELETE SET NULL,
  nome_participante TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.participantes_atividade ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_participantes_atividade ON public.participantes_atividade(atividade_id);

-- ==========================================================
-- TABLE: logs_auditoria
-- ==========================================================
CREATE TABLE public.logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  acao TEXT NOT NULL,
  tabela TEXT NOT NULL,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_logs_user ON public.logs_auditoria(user_id);
CREATE INDEX idx_logs_tabela ON public.logs_auditoria(tabela);
CREATE INDEX idx_logs_created ON public.logs_auditoria(created_at);

-- ==========================================================
-- TRIGGER: check_cesta_30_dias (bloqueia duplicidade)
-- ==========================================================
CREATE OR REPLACE FUNCTION public.check_cesta_30_dias()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.entregas_cestas
    WHERE familia_id = NEW.familia_id
      AND ABS(EXTRACT(EPOCH FROM (NEW.data_entrega::timestamp - data_entrega::timestamp))) < 30 * 24 * 60 * 60
      AND id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION 'Esta família já recebeu cesta nos últimos 30 dias.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_check_cesta_30_dias
  BEFORE INSERT OR UPDATE ON public.entregas_cestas
  FOR EACH ROW EXECUTE FUNCTION public.check_cesta_30_dias();

-- ==========================================================
-- TRIGGER: auto-create profile on signup
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'consulta');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- RLS POLICIES: profiles
-- ==========================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================================
-- RLS POLICIES: user_roles
-- ==========================================================
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================================
-- RLS POLICIES: familias
-- ==========================================================
CREATE POLICY "Authenticated users can view familias"
  ON public.familias FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can insert familias"
  ON public.familias FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  );

CREATE POLICY "Staff can update familias"
  ON public.familias FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  );

CREATE POLICY "Admin can delete familias"
  ON public.familias FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================================
-- RLS POLICIES: membros_familia
-- ==========================================================
CREATE POLICY "Authenticated users can view membros"
  ON public.membros_familia FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can manage membros"
  ON public.membros_familia FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  );

-- ==========================================================
-- RLS POLICIES: atendimentos
-- ==========================================================
CREATE POLICY "Authenticated users can view atendimentos"
  ON public.atendimentos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can insert atendimentos"
  ON public.atendimentos FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  );

CREATE POLICY "Staff can update atendimentos"
  ON public.atendimentos FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social')
  );

CREATE POLICY "Admin can delete atendimentos"
  ON public.atendimentos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================================
-- RLS POLICIES: entregas_cestas
-- ==========================================================
CREATE POLICY "Authenticated users can view cestas"
  ON public.entregas_cestas FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can insert cestas"
  ON public.entregas_cestas FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  );

CREATE POLICY "Admin can delete cestas"
  ON public.entregas_cestas FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================================
-- RLS POLICIES: atividades
-- ==========================================================
CREATE POLICY "Authenticated users can view atividades"
  ON public.atividades FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can manage atividades"
  ON public.atividades FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  );

-- ==========================================================
-- RLS POLICIES: participantes_atividade
-- ==========================================================
CREATE POLICY "Authenticated users can view participantes"
  ON public.participantes_atividade FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can manage participantes"
  ON public.participantes_atividade FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'assistente_social') OR
    public.has_role(auth.uid(), 'atendimento')
  );

-- ==========================================================
-- RLS POLICIES: logs_auditoria
-- ==========================================================
CREATE POLICY "Admins and auditors can view logs"
  ON public.logs_auditoria FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'auditoria')
  );

CREATE POLICY "System can insert logs"
  ON public.logs_auditoria FOR INSERT TO authenticated
  WITH CHECK (true);
