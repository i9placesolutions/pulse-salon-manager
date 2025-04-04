# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e8fa3019-84cf-4912-8868-983ee75bc9e0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e8fa3019-84cf-4912-8868-983ee75bc9e0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e8fa3019-84cf-4912-8868-983ee75bc9e0) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

# Integração com o Asaas

## Configuração de Webhooks para Processamento de Pagamentos

O sistema inclui integração completa com a API do Asaas para processamento de pagamentos de mensalidades. Para configurar corretamente o sistema de webhooks, siga as instruções abaixo:

### 1. Configuração no Dashboard do Asaas

1. Acesse sua conta Asaas em [https://www.asaas.com/](https://www.asaas.com/)
2. Navegue até a seção **Configurações > Integrações > Notificações Webhook**
3. Adicione um novo webhook com a URL do seu servidor:
   - URL: `https://seu-dominio.com/api/webhooks/asaas` (substitua pelo seu domínio real)
   - Email para notificações: (seu email para receber alertas)
   - Eventos a serem notificados:
     - Pagamentos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, PAYMENT_OVERDUE
     - Assinaturas: SUBSCRIPTION_CREATED, SUBSCRIPTION_PAYMENT_CREATED, SUBSCRIPTION_PAYMENT_FAILED, SUBSCRIPTION_CANCELED

### 2. Execução do Servidor de Webhooks

O sistema pode receber webhooks do Asaas de duas maneiras:

#### Em Produção

O servidor Express configurado irá automaticamente processar os webhooks recebidos na rota `/api/webhooks/asaas`. Para iniciar o servidor:

```bash
# Construir a aplicação
npm run build

# Iniciar o servidor de produção
node src/server/index.js
```

#### Em Desenvolvimento

Para testar webhooks durante o desenvolvimento, você pode:

1. Utilizar um serviço como [ngrok](https://ngrok.com/) para expor seu servidor local:
   ```bash
   ngrok http 3001
   ```

2. Configurar a URL do webhook no Asaas com a URL temporária fornecida pelo ngrok:
   ```
   https://seu-codigo-temporario.ngrok.io/api/webhooks/asaas
   ```

3. Iniciar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### 3. Banco de Dados para Webhooks

O sistema registra todos os eventos de webhook em duas tabelas no Supabase:

- `webhook_events`: Registra os eventos brutos recebidos do Asaas
- `payment_history`: Registra pagamentos processados
- `subscriptions`: Registra assinaturas criadas e atualizadas

Você deve criar estas tabelas no seu banco de dados Supabase com a estrutura adequada:

```sql
-- Tabela para armazenar eventos brutos do webhook
CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(20) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para armazenar histórico de pagamentos
CREATE TABLE payment_history (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(50) NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(20) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL,
  subscription_id VARCHAR(50),
  provider VARCHAR(20) NOT NULL,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabela para armazenar assinaturas
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(50) NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  plan_value DECIMAL(10,2) NOT NULL,
  billing_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  provider VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Adicionar coluna para o external_customer_id na tabela de perfis
ALTER TABLE profiles 
ADD COLUMN external_customer_id VARCHAR(50);
```

### 4. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente:

```
# URL do Supabase
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase

# Chave de API do Asaas
VITE_ASAAS_API_KEY=sua-chave-da-api-do-asaas

# URL de Webhook
VITE_ASAAS_WEBHOOK_URL=https://seu-dominio.com/api/webhooks/asaas
```

### 5. Testes

Para testar o funcionamento do sistema:

1. Crie uma assinatura através da página de Mensalidade
2. Verifique se o cliente foi criado no Asaas
3. Verifique se a assinatura foi criada corretamente 
4. Faça um pagamento de teste
5. Confirme que o webhook foi recebido e processado no log do servidor
6. Verifique se o status da assinatura foi atualizado no sistema

## Melhorias na Integração com o Asaas (Abril/2025)

Implementamos várias melhorias na integração com o Asaas para aumentar a robustez, segurança e facilidade de manutenção:

### 1. Sistema de Logging Centralizado

- Criamos um utilitário de logging dedicado para a integração Asaas (`src/lib/asaasLogger.ts`)
- Benefícios:
  - Formatação consistente de logs
  - Ocultação automática de dados sensíveis (tokens, dados de cartão, etc.)
  - Suporte a IDs de transação para rastreabilidade completa
  - Configuração de níveis de log (debug, info, warn, error)

### 2. Tratamento Robusto de Erros

- A API foi modificada para retornar respostas no formato `ApiResponse<T>` com detalhes consistentes sobre erros
- Implementação de manipulação especializada para diferentes tipos de erros da API Asaas

### 3. Segurança e Validação

- Validação aprimorada das entradas de dados
- Manipulação segura de webhooks com verificação de corpo da requisição
- Geração de IDs únicos para cada requisição de webhook para rastreabilidade

### 4. Migração TypeScript

- Descontinuação gradual de implementações legadas em JavaScript
- Transição completa para TypeScript com tipagem adequada
- Interface entre o código legado e o novo sistema para compatibilidade

### Como Usar a Nova API

A API Asaas está agora organizada em módulos especializados:

1. `asaasApi.ts` - Funções principais para interagir com a API Asaas
2. `asaasWebhookHandler.ts` - Processamento de webhooks com integração Supabase
3. `asaasLogger.ts` - Sistema de logging para toda a integração

Exemplo de uso do novo sistema de logging:

```typescript
import asaasLogger, { startAsaasTransaction } from './lib/asaasLogger';

// Log simples
asaasLogger.info('Iniciando processo de pagamento');

// Log com contexto de transação
const logger = startAsaasTransaction('pagamento-123');
logger.info('Processando pagamento', { value: 99.90 });
logger.debug('Detalhes técnicos', { paymentMethod: 'pix' });

// Em caso de erro
try {
  // código que pode falhar
} catch (error) {
  logger.error('Falha no processamento', error);
}
```
