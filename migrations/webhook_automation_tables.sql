-- Migração para criar as tabelas necessárias para webhooks e automações de marketing

-- Tabela para armazenar configurações de webhooks
CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_token TEXT NOT NULL UNIQUE,
  webhook_url TEXT NOT NULL,
  webhook_events TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar eventos recebidos via webhook
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  instance_token TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para automações de marketing
CREATE TABLE IF NOT EXISTS marketing_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  automation_type TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para registrar execuções de automações
CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES marketing_automations(id) ON DELETE CASCADE,
  clients_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  execution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança RLS
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso às configurações de webhook
CREATE POLICY webhook_configs_policy ON webhook_configs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para acesso aos eventos de webhook
CREATE POLICY webhook_events_policy ON webhook_events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para acesso às automações de marketing
CREATE POLICY marketing_automations_policy ON marketing_automations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para acesso às execuções de automações
CREATE POLICY automation_executions_policy ON automation_executions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para melhorar a performance
CREATE INDEX webhook_events_instance_idx ON webhook_events(instance_token);
CREATE INDEX webhook_events_type_idx ON webhook_events(event_type);
CREATE INDEX automation_type_idx ON marketing_automations(automation_type);
CREATE INDEX automation_active_idx ON marketing_automations(is_active);
CREATE INDEX automation_executions_date_idx ON automation_executions(execution_date);
