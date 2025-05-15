# Integração UAZAPI no Pulse Salon Manager

Este documento explica a integração entre o Pulse Salon Manager e a API UAZAPI para automação de mensagens de WhatsApp.

## Estrutura da Integração

### 1. Arquivos de Serviço
- `src/lib/webhookService.ts` - Serviço para gerenciar webhooks da UAZAPI
- `src/lib/automationService.ts` - Serviço para automações de marketing
- `src/lib/automationInit.ts` - Script de inicialização automática

### 2. Endpoint de Webhook
- `src/pages/api/webhook/uazapi.ts` - Endpoint para receber notificações da UAZAPI

### 3. Tabelas no Banco de Dados
- `webhook_configs` - Configurações de webhooks
- `webhook_events` - Eventos recebidos via webhook
- `marketing_automations` - Automações de marketing
- `automation_executions` - Registro de execuções

## Deploy no Vercel

Para garantir o funcionamento correto do sistema no Vercel, siga os passos abaixo:

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Vercel:

```
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-chave-anon]
VITE_UAZAPI_URL=https://i9place3.uazapi.com
VITE_UAZAPI_MAIN_TOKEN=695fb204-5af9-4cfe-9f9f-676d2ca47e69
```

### 2. Configuração do Webhook

O webhook da UAZAPI deve ser configurado para a URL:
```
https://app.pulsesalon.com.br/api/webhook/uazapi
```

### 3. Verificações Pós-Deploy

Após o deploy, acesse a URL do webhook em um navegador para verificar se está respondendo corretamente (deve retornar erro de método não permitido para GET).

### 4. Ativando Automações

As automações são ativadas automaticamente ao iniciar o aplicativo, mas você pode verificar o status na aba de Marketing > Automação.

## Banco de Dados (Supabase)

As migrações necessárias foram aplicadas automaticamente no banco de dados. Os seguintes itens foram criados:

1. Tabelas para webhooks e automações
2. Políticas de segurança (RLS)
3. Automações padrão:
   - Mensagem de Aniversário
   - Mensagem de Boas-vindas
   - Reativação de Clientes
   - Lembrete de Agendamento
   - Feedback Pós-atendimento

## Solução de Problemas

### Webhook não está recebendo eventos
- Verifique se a URL está configurada corretamente na UAZAPI
- Verifique logs no Vercel
- Verifique se a instância do WhatsApp está conectada

### Automações não estão sendo executadas
- Verifique logs do sistema
- Verifique se há clientes elegíveis no banco de dados
- Verifique se a automação está ativa

### Instância não conectada
- Verifique o status da instância na UAZAPI
- Reconecte a instância se necessário

## Atualizações Futuras

Para adicionar novas automações, use a tabela `marketing_automations`. Cada automação deve ter um tipo, mensagem e configurações específicas.

---

**IMPORTANTE:** Mantenha a tabela `webhook_configs` atualizada com a URL correta do sistema em produção para garantir o funcionamento adequado.
