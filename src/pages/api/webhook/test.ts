/**
 * API para testar a integração com UAZAPI usando o token específico
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { sendTestMessage, checkInstanceStatus, PRODUCTION_INSTANCE_TOKEN } from '@/lib/whatsAppTest';
import { configureWebhook } from '@/lib/webhookService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar se é uma requisição GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar parâmetro de número de telefone
    const { number } = req.query;
    
    // Resultado a ser retornado
    const result: any = {
      token: PRODUCTION_INSTANCE_TOKEN,
      timestamp: new Date().toISOString(),
      webhook: null,
      status: null,
      message: null,
    };
    
    // 1. Configurar webhook para a instância específica
    try {
      const webhookResult = await configureWebhook({
        instanceToken: PRODUCTION_INSTANCE_TOKEN,
        url: 'https://app.pulsesalon.com.br/api/webhook/uazapi',
        events: ['message', 'status', 'connection'],
        enabled: true
      });
      
      result.webhook = {
        success: true,
        data: webhookResult
      };
    } catch (error) {
      result.webhook = {
        success: false,
        error: (error as Error).message
      };
    }
    
    // 2. Verificar status da instância
    try {
      const statusResult = await checkInstanceStatus();
      result.status = statusResult;
    } catch (error) {
      result.status = {
        success: false,
        error: (error as Error).message
      };
    }
    
    // 3. Enviar mensagem de teste se o número foi fornecido
    if (number && typeof number === 'string') {
      try {
        const messageResult = await sendTestMessage(number);
        result.message = messageResult;
      } catch (error) {
        result.message = {
          success: false,
          error: (error as Error).message
        };
      }
    }
    
    // Retornar resultado completo
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro durante o teste de integração:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
}
