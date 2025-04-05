-- SCHEMA: Sistema SaaS para gerenciamento de salões de beleza
-- Cada usuário criado é um administrador de um estabelecimento

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configuração do RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Tabela de perfis dos usuários
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    establishment_name TEXT NOT NULL,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    subscription_active BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de detalhes do estabelecimento
CREATE TABLE IF NOT EXISTS public.establishment_details (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    -- Configurações gerais
    email TEXT,
    whatsapp TEXT,
    document_type TEXT,
    document_number TEXT,
    address_street TEXT,
    address_number TEXT,
    address_complement TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zipcode TEXT,
    address_latitude TEXT,
    address_longitude TEXT,
    logo_url TEXT,
    custom_url TEXT UNIQUE,
    primary_color TEXT,
    description TEXT,
    responsible_name TEXT,
    responsible_email TEXT,
    responsible_phone TEXT,
    website TEXT,
    instagram TEXT,
    facebook TEXT,
    tiktok TEXT,
    
    -- Configurações de horário
    working_hours JSONB,
    
    -- Configurações regionais
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    time_format TEXT DEFAULT '24h',
    currency TEXT DEFAULT 'BRL',
    language TEXT DEFAULT 'pt-BR',
    
    -- Configurações de notificações
    notifications_settings JSONB,
    
    -- Configurações de WhatsApp
    whatsapp_instance_token TEXT,
    whatsapp_instance_status TEXT,
    whatsapp_instance_name TEXT,
    whatsapp_qrcode TEXT,
    whatsapp_paircode TEXT,
    whatsapp_profile_name TEXT,
    whatsapp_profile_pic_url TEXT,
    
    -- Configurações de segurança
    security_settings JSONB,
    
    -- Configurações de pagamento
    payment_methods JSONB,
    installment_config JSONB,
    
    -- Configurações de relatórios
    report_settings JSONB,
    report_recipients JSONB,
    
    -- Campos gerais
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de funções/cargos de usuários
CREATE TABLE IF NOT EXISTS public.user_roles (
    id SERIAL PRIMARY KEY,
    establishment_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de permissões por função
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES public.user_roles(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    can_view BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, module)
);

-- Tabela de usuários do estabelecimento
CREATE TABLE IF NOT EXISTS public.establishment_users (
    id SERIAL PRIMARY KEY,
    establishment_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role_id INTEGER REFERENCES public.user_roles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    is_professional BOOLEAN DEFAULT FALSE,
    phone TEXT,
    specialties TEXT[],
    experience_level TEXT,
    hire_date DATE,
    password_hash TEXT, -- Armazena hash de senha para usuários não-Supabase
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(establishment_id, email)
);

-- Tabela de especialidades
CREATE TABLE IF NOT EXISTS public.specialties (
    id SERIAL PRIMARY KEY,
    establishment_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(establishment_id, name)
);

-- Tabela de bloqueios de horário
CREATE TABLE IF NOT EXISTS public.blocked_times (
    id SERIAL PRIMARY KEY,
    establishment_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    professional_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason TEXT,
    is_full_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de logs de auditoria e segurança
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    establishment_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    username TEXT,
    action TEXT NOT NULL,
    ip_address TEXT,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS security_audit_logs_establishment_idx ON public.security_audit_logs(establishment_id);
CREATE INDEX IF NOT EXISTS security_audit_logs_user_id_idx ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS security_audit_logs_created_at_idx ON public.security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS security_audit_logs_action_idx ON public.security_audit_logs(action);

-- Configurar RLS para tabela de logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tabela de logs
CREATE POLICY "Usuários podem visualizar logs do seu próprio estabelecimento" ON public.security_audit_logs
    FOR SELECT USING (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem inserir logs no seu próprio estabelecimento" ON public.security_audit_logs
    FOR INSERT WITH CHECK (auth.uid() = establishment_id);

-- Função para criar um log de auditoria automaticamente
CREATE OR REPLACE FUNCTION public.fn_create_audit_log(
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_username TEXT;
    v_ip_address TEXT;
BEGIN
    -- Obter informações do usuário atual
    SELECT auth.uid() INTO v_user_id;
    
    -- Obter email e nome do usuário
    SELECT email, raw_user_meta_data->>'full_name' 
    FROM auth.users 
    WHERE id = v_user_id 
    INTO v_user_email, v_username;
    
    -- Inserir o log
    INSERT INTO public.security_audit_logs (
        establishment_id,
        user_id,
        user_email,
        username,
        action,
        ip_address,
        resource_type,
        resource_id,
        details
    ) VALUES (
        v_user_id,
        v_user_id,
        v_user_email,
        COALESCE(v_username, v_user_email),
        p_action,
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        p_resource_type,
        p_resource_id,
        p_details
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários na tabela e nas colunas
COMMENT ON TABLE public.security_audit_logs IS 'Tabela para armazenar logs de auditoria e segurança do sistema';
COMMENT ON COLUMN public.security_audit_logs.id IS 'Identificador único do log';
COMMENT ON COLUMN public.security_audit_logs.establishment_id IS 'ID do estabelecimento ao qual o log pertence';
COMMENT ON COLUMN public.security_audit_logs.user_id IS 'ID do usuário que realizou a ação';
COMMENT ON COLUMN public.security_audit_logs.user_email IS 'Email do usuário que realizou a ação';
COMMENT ON COLUMN public.security_audit_logs.username IS 'Nome do usuário que realizou a ação';
COMMENT ON COLUMN public.security_audit_logs.action IS 'Ação realizada pelo usuário';
COMMENT ON COLUMN public.security_audit_logs.ip_address IS 'Endereço IP de onde a ação foi realizada';
COMMENT ON COLUMN public.security_audit_logs.resource_type IS 'Tipo do recurso afetado (tabela, entidade)';
COMMENT ON COLUMN public.security_audit_logs.resource_id IS 'ID do recurso afetado';
COMMENT ON COLUMN public.security_audit_logs.details IS 'Detalhes adicionais da ação em formato JSON';
COMMENT ON COLUMN public.security_audit_logs.created_at IS 'Data e hora de criação do log';

-- Configurar funções para atualização automática
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização do campo updated_at
CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_establishment_details
BEFORE UPDATE ON public.establishment_details
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_blocked_times
BEFORE UPDATE ON public.blocked_times
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_roles
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_role_permissions
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_establishment_users
BEFORE UPDATE ON public.establishment_users
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_specialties
BEFORE UPDATE ON public.specialties
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar automaticamente um perfil ao criar um usuário
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Cria o perfil básico do estabelecimento
    INSERT INTO public.profiles (id, establishment_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'establishment_name');
    
    -- Cria funções padrão para o estabelecimento
    WITH inserted_roles AS (
        INSERT INTO public.user_roles (establishment_id, name, description)
        VALUES 
            (NEW.id, 'Administrador', 'Acesso completo a todas as funcionalidades'),
            (NEW.id, 'Gerente', 'Acesso a gerenciamento sem configurações avançadas'),
            (NEW.id, 'Profissional', 'Acesso a agenda e clientes'),
            (NEW.id, 'Recepcionista', 'Acesso a agenda e atendimento')
        RETURNING id, name
    )
    
    -- Configura permissões para cada função
    INSERT INTO public.role_permissions (role_id, module, can_view, can_edit, can_delete)
    SELECT 
        r.id,
        m.module_name,
        CASE 
            WHEN r.name = 'Administrador' THEN TRUE
            WHEN r.name = 'Gerente' AND m.module_name IN ('dashboard', 'agenda', 'clientes', 'financeiro', 'estoque', 'relatorios', 'profissionais', 'servicos', 'produtos', 'perfil') THEN TRUE
            WHEN r.name = 'Profissional' AND m.module_name IN ('dashboard', 'agenda', 'clientes', 'financeiro', 'estoque', 'servicos', 'produtos', 'perfil') THEN TRUE
            WHEN r.name = 'Recepcionista' AND m.module_name IN ('dashboard', 'agenda', 'clientes', 'profissionais', 'servicos', 'produtos', 'perfil') THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN r.name = 'Administrador' THEN TRUE
            WHEN r.name = 'Gerente' AND m.module_name IN ('agenda', 'clientes', 'financeiro', 'estoque', 'profissionais', 'servicos', 'produtos', 'perfil') THEN TRUE
            WHEN r.name = 'Profissional' AND m.module_name IN ('agenda', 'clientes', 'perfil') THEN TRUE
            WHEN r.name = 'Recepcionista' AND m.module_name IN ('agenda', 'perfil') THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN r.name = 'Administrador' THEN TRUE
            WHEN r.name = 'Gerente' AND m.module_name IN ('agenda', 'clientes') THEN TRUE
            ELSE FALSE
        END
    FROM inserted_roles r
    CROSS JOIN (
        SELECT unnest(ARRAY[
            'dashboard', 'agenda', 'clientes', 'financeiro', 'estoque', 
            'relatorios', 'configuracoes', 'profissionais', 'servicos', 
            'produtos', 'perfil'
        ]) AS module_name
    ) m;
    
    -- Cria usuário administrador (vinculado ao usuário principal)
    INSERT INTO public.establishment_users (
        establishment_id, 
        name, 
        email, 
        role_id, 
        status,
        is_professional
    )
    SELECT 
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'Administrador'), 
        NEW.email, 
        r.id, 
        'active',
        false
    FROM inserted_roles r
    WHERE r.name = 'Administrador'
    LIMIT 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente após cadastrar usuário
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS (Row Level Security) para garantir segurança dos dados
-- Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem editar seu próprio perfil" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Detalhes do estabelecimento
ALTER TABLE public.establishment_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver detalhes do seu próprio estabelecimento" ON public.establishment_details 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem adicionar detalhes ao seu próprio estabelecimento" ON public.establishment_details 
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar detalhes do seu próprio estabelecimento" ON public.establishment_details 
    FOR UPDATE USING (auth.uid() = id);

-- Bloqueio de horários
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver bloqueios do seu próprio estabelecimento" ON public.blocked_times 
    FOR SELECT USING (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem adicionar bloqueios ao seu próprio estabelecimento" ON public.blocked_times 
    FOR INSERT WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem editar bloqueios do seu próprio estabelecimento" ON public.blocked_times 
    FOR UPDATE USING (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem excluir bloqueios do seu próprio estabelecimento" ON public.blocked_times 
    FOR DELETE USING (auth.uid() = establishment_id);

-- Segurança para tabela de funções
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver funções do seu próprio estabelecimento" ON public.user_roles 
    FOR SELECT USING (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem adicionar funções ao seu próprio estabelecimento" ON public.user_roles 
    FOR INSERT WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem atualizar funções do seu próprio estabelecimento" ON public.user_roles 
    FOR UPDATE USING (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem excluir funções do seu próprio estabelecimento" ON public.user_roles 
    FOR DELETE USING (auth.uid() = establishment_id);

-- Segurança para tabela de permissões
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver permissões das funções do seu próprio estabelecimento" ON public.role_permissions 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE id = public.role_permissions.role_id 
            AND establishment_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem adicionar permissões às funções do seu próprio estabelecimento" ON public.role_permissions 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE id = public.role_permissions.role_id 
            AND establishment_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar permissões das funções do seu próprio estabelecimento" ON public.role_permissions 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE id = public.role_permissions.role_id 
            AND establishment_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem excluir permissões das funções do seu próprio estabelecimento" ON public.role_permissions 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE id = public.role_permissions.role_id 
            AND establishment_id = auth.uid()
        )
    );

-- Segurança para tabela de usuários do estabelecimento
ALTER TABLE public.establishment_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver usuários do seu próprio estabelecimento" ON public.establishment_users 
    FOR SELECT USING (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem adicionar usuários ao seu próprio estabelecimento" ON public.establishment_users 
    FOR INSERT WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem atualizar usuários do seu próprio estabelecimento" ON public.establishment_users 
    FOR UPDATE USING (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem excluir usuários do seu próprio estabelecimento" ON public.establishment_users 
    FOR DELETE USING (auth.uid() = establishment_id);

-- Segurança para tabela de especialidades
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver especialidades do seu próprio estabelecimento" ON public.specialties 
    FOR SELECT USING (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem adicionar especialidades ao seu próprio estabelecimento" ON public.specialties 
    FOR INSERT WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem atualizar especialidades do seu próprio estabelecimento" ON public.specialties 
    FOR UPDATE USING (auth.uid() = establishment_id);

CREATE POLICY "Usuários podem excluir especialidades do seu próprio estabelecimento" ON public.specialties 
    FOR DELETE USING (auth.uid() = establishment_id);

-- Função para a página de agendamento pública ver detalhes do estabelecimento
-- Permite acesso somente leitura via URL personalizada para agendamento público
CREATE OR REPLACE FUNCTION public.get_establishment_by_custom_url(custom_url TEXT)
RETURNS SETOF public.establishment_details
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM public.establishment_details WHERE custom_url = custom_url;
$$;

-- Adiciona política para permitir visualização pública dos estabelecimentos
CREATE POLICY "Visualização pública por URL personalizada" ON public.establishment_details 
    FOR SELECT USING (true);

-- Função para inicializar ou atualizar o período de teste de um usuário
CREATE OR REPLACE FUNCTION public.start_or_extend_trial(user_id UUID, days INTEGER DEFAULT 7)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET trial_ends_at = NOW() + (days || ' days')::INTERVAL
    WHERE id = user_id;
END;
$$;

-- Função para limpar logs antigos mantendo apenas registros recentes
CREATE OR REPLACE FUNCTION public.limpar_registros_antigos(p_dias INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    v_usuario_id UUID;
    v_limite_data TIMESTAMP WITH TIME ZONE;
    v_deleted INTEGER;
BEGIN
    -- Obter ID do usuário atual
    SELECT auth.uid() INTO v_usuario_id;
    
    -- Calcular data limite para manter logs
    SELECT (NOW() - (p_dias || ' days')::INTERVAL) INTO v_limite_data;
    
    -- Deletar registros antigos
    DELETE FROM public.security_audit_logs 
    WHERE establishment_id = v_usuario_id
    AND created_at < v_limite_data
    RETURNING COUNT(*) INTO v_deleted;
    
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 