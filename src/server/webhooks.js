/**
 * ARQUIVO DESCONTINUADO
 * 
 * Este arquivo foi substituído pela implementação TypeScript em:
 * - src/lib/asaasWebhookHandler.ts (lógica de processamento)
 * - src/pages/api/webhooks/asaas.ts (endpoint)
 * 
 * O servidor atual utiliza o manipulador de webhook tipado através do arquivo src/server/index.js
 * 
 * Mantido apenas para referência histórica e compatibilidade com versões anteriores.
 * 
 * Para migração:
 * 1. Use o manipulador em src/lib/asaasWebhookHandler.ts para processamento dos webhooks
 * 2. Configure o endpoint em src/pages/api/webhooks/asaas.ts
 * 3. Atualize src/server/index.js para usar o novo manipulador
 */

// Importar o manipulador TypeScript (para compatibilidade)
const asaasWebhookHandler = require('../lib/asaasWebhookHandler');

// Função legada para processar webhooks (mantida para compatibilidade)
exports.handleAsaasWebhook = async (req, res) => {
  console.warn('Usando manipulador de webhook legado. Considere migrar para a nova implementação TypeScript.');
  
  try {
    // Redirecionar para o manipulador TypeScript
    const result = await asaasWebhookHandler.handleWebhook(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao processar webhook (legado):', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao processar webhook',
      error: error.message
    });
  }
};

// Arquivo descontinuado - Migre para a nova implementação TypeScript 