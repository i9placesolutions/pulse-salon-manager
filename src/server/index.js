/**
 * Servidor Express para o sistema Pulse Salon Manager
 * Este arquivo configura um servidor para receber webhooks e outras APIs necessárias
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const asaasWebhookHandler = require('../pages/api/webhooks/asaas').default;

// Inicializa o app Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos do diretório 'dist' (depois do build)
app.use(express.static(path.join(__dirname, '../../dist')));

// Rota de verificação de saúde
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API em funcionamento' });
});

// Rota para receber webhooks do Asaas
app.post('/api/webhooks/asaas', asaasWebhookHandler);

// Rotas adicionais da API podem ser adicionadas aqui

// Roteamento para o SPA React
app.get('*', (req, res) => {
  // Retorna a aplicação React para todas as outras rotas
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; 