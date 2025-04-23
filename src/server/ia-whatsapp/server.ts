import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import webhookRouter from './webhook';

// Configuração do servidor Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Rotas
app.use('/api/ia-whatsapp', webhookRouter);

// Rota de teste
app.get('/api/ia-whatsapp/health', (req, res) => {
  res.status(200).json({
    status: 'up',
    message: 'Servidor de webhook do WhatsApp IA está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[IA-WHATSAPP] Servidor iniciado na porta ${PORT}`);
  console.log(`[IA-WHATSAPP] URL do webhook: http://localhost:${PORT}/api/ia-whatsapp/webhook`);
  console.log(`[IA-WHATSAPP] Para produçao, utilize: https://app.pulsesalon.com.br/api/ia-whatsapp/webhook`);
});

export default app;
