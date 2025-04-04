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

-- Função para criar automaticamente um perfil ao criar um usuário
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Cria o perfil básico do estabelecimento
    INSERT INTO public.profiles (id, establishment_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'establishment_name');
    
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