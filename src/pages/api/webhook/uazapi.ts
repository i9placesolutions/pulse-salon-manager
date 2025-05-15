/**
 * API endpoint para receber webhooks da UAZAPI
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { processWebhookEvent } from '@/lib/webhookService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const webhookData = req.body;
    
    // Registra o evento recebido no log
    console.log('Webhook recebido da UAZAPI:', JSON.stringify(webhookData, null, 2));
    
    // Processa o evento de webhook
    const result = await processWebhookEvent(webhookData);
    
    if (result) {
      res.status(200).json({ success: true, message: 'Evento processado com sucesso' });
    } else {
      res.status(500).json({ success: false, message: 'Erro ao processar evento' });
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
