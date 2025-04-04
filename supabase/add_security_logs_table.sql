-- Criar tabela de logs de auditoria e segurança (nova adição)
DROP TABLE IF EXISTS public.security_audit_logs CASCADE;

CREATE TABLE public.security_audit_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    establishment_id UUID NOT NULL,
    user_id UUID,
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
CREATE INDEX security_audit_logs_establishment_idx ON public.security_audit_logs(establishment_id);
CREATE INDEX security_audit_logs_user_id_idx ON public.security_audit_logs(user_id);
CREATE INDEX security_audit_logs_created_at_idx ON public.security_audit_logs(created_at);
CREATE INDEX security_audit_logs_action_idx ON public.security_audit_logs(action);

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
EXCEPTION
    WHEN OTHERS THEN
        -- Silenciosamente falha, mas não interrompe a transação
        NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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