/**
 * Endpoint para receber webhooks do Asaas
 * 
 * Este arquivo será usado tanto para API Routes quanto para Express diretamente
 */

import { handleWebhook } from '@/lib/asaasWebhookHandler';
import { Request, Response } from 'express';

// Cria um hash único para identificação do webhook
function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Função para validar e processar requisições de webhook
export default async function handler(
  req: Request, 
  res: Response
) {
  const requestId = generateRequestId();
  
  // Apenas aceitar métodos POST para webhooks
  if (req.method !== 'POST') {
    console.warn(`[${requestId}] Método não permitido: ${req.method}`);
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // Verificar autorização do webhook (opcional, mas recomendado para segurança)
    const authHeader = req.headers.authorization;
    
    // Log seguro (não exibe tokens completos)
    console.log(`[${requestId}] Webhook recebido, auth: ${authHeader ? '****' + authHeader.substr(-4) : 'não fornecido'}`);
    
    // Verificar se há um corpo na requisição
    if (!req.body || Object.keys(req.body).length === 0) {
      console.warn(`[${requestId}] Corpo da requisição vazio ou inválido`);
      return res.status(400).json({ success: false, message: 'Corpo da requisição vazio ou inválido' });
    }

    // Obter dados do corpo da requisição
    const webhookData = req.body;
    
    // Registrar recebimento do webhook de forma segura (não exibe dados sensíveis)
    console.log(`[${requestId}] Webhook recebido do Asaas: ${webhookData.event}, payment ID: ${webhookData.payment?.id || 'N/A'}`);
    
    // Processar o webhook usando o manipulador dedicado
    const result = await handleWebhook(webhookData);
    
    // Log de resultado
    console.log(`[${requestId}] Webhook processado: ${result.success ? 'Sucesso' : 'Falha'} - ${result.message}`);
    
    // Retornar resposta de sucesso
    return res.status(200).json({
      success: result.success,
      message: result.message,
      requestId
    });
  } catch (error) {
    // Registrar erro com ID da requisição para rastreabilidade
    console.error(`[${requestId}] Erro ao processar webhook do Asaas:`, error);
    
    // Retornar erro 500
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar webhook',
      error: error.message,
      requestId
    });
  }
} 