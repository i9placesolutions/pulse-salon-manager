// API Webhook para receber mensagens do WhatsApp
import type { Request, Response } from 'express';
import WhatsAppGPTService from '../../../services/whatsapp/whatsappGptService';

export default async function handler(
  req: Request,
  res: Response
) {
  // Apenas método POST é permitido para webhook
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Obter o ID do estabelecimento da query
    const { establishmentId } = req.query;
    
    if (!establishmentId || typeof establishmentId !== 'string') {
      return res.status(400).json({ error: 'ID do estabelecimento é obrigatório' });
    }
    
    console.log(`Webhook recebido para estabelecimento: ${establishmentId}`);
    console.log('Payload do webhook:', JSON.stringify(req.body).substring(0, 500) + '...');
    
    // Inicializar serviço de IA WhatsApp
    const whatsappGPTService = new WhatsAppGPTService(establishmentId);
    
    // Processar webhook
    const response = await whatsappGPTService.processWebhook(req.body);
    
    // Retornar resposta
    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
