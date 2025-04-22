# Configuração do Servidor de Webhook para WhatsApp IA

## Visão Geral
Este servidor recebe webhooks do n8n e os processa para a funcionalidade de IA do WhatsApp no Pulse Salon Manager.

## Requisitos
- Node.js 16+
- PM2 (para gerenciamento de processos em produção)

## Configuração em Produção

### 1. Instalar PM2 (se ainda não estiver instalado)
```bash
npm install -g pm2
```

### 2. Iniciar o Servidor com PM2
```bash
cd /path/to/pulse-salon-manager
pm2 start ecosystem.config.js --env production
```

### 3. Verificar Status
```bash
pm2 status
```

### 4. Configurar PM2 para Iniciar na Reinicialização do Servidor
```bash
pm2 startup
pm2 save
```

### 5. Configurar Nginx como Proxy Reverso
Adicione esta configuração ao seu arquivo de sites disponíveis no Nginx:

```nginx
server {
    listen 80;
    server_name app.pulsesalon.com.br;
    
    # ... outras configurações existentes ...
    
    # Webhook API
    location /api/ia-whatsapp/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Configurar URL do Webhook no n8n
Configure o webhook no n8n para apontar para:
```
https://app.pulsesalon.com.br/api/ia-whatsapp/process
```

### 7. Logs e Monitoramento
Para ver logs do servidor webhook:
```bash
pm2 logs webhook-server
```

Para monitoramento em tempo real:
```bash
pm2 monit
```

## Desenvolvimento Local
Para executar o servidor em ambiente de desenvolvimento:
```bash
pnpm webhook
```

## Tabelas do Banco de Dados
Este serviço utiliza as seguintes tabelas no Supabase:
- `whatsapp_ia_config` - Configurações da IA para cada estabelecimento
- `whatsapp_ia_messages` - Histórico de mensagens
- `whatsapp_webhook_logs` - Logs de webhooks recebidos
