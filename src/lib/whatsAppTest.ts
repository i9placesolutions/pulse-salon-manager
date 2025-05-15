/**
 * Arquivo para testes de integração com WhatsApp
 * Função específica para testar envio de mensagens
 */

import { whatsAppService } from './whatsappApi';
import { sendBulkMessage } from './uazapiService';

// Token específico da instância em produção
export const PRODUCTION_INSTANCE_TOKEN = '64c79c76-4f4d-4fb8-9a00-8160be3089ae';

/**
 * Envia mensagem de teste para verificar conexão com a instância
 * @param number Número para enviar a mensagem
 * @returns Resultado do envio
 */
export async function sendTestMessage(number: string): Promise<any> {
  try {
    console.log(`Enviando mensagem de teste para ${number} usando o token: ${PRODUCTION_INSTANCE_TOKEN}`);
    
    // Formatação do número para padrão internacional
    let formattedNumber = number.replace(/\D/g, '');
    if (formattedNumber.length === 11) {
      formattedNumber = `55${formattedNumber}`;
    } else if (formattedNumber.length === 10) {
      formattedNumber = `55${formattedNumber}`;
    }
    
    // Mensagem para testar a integração
    const message = "🔔 TESTE DE INTEGRAÇÃO UAZAPI\n\n"
      + "Teste de conexão com sistema de automação do Pulse Salon.\n\n"
      + "✅ Mensagem enviada com sucesso.\n\n"
      + `⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n`
      + `📱 Número: ${formattedNumber}`;
      
    // Enviar usando função de envio em massa (mesmo que seja para apenas um número)
    const result = await sendBulkMessage(
      [formattedNumber],
      message,
      0, // sem delay
      0, // sem delay máximo
      PRODUCTION_INSTANCE_TOKEN // token específico
    );
    
    console.log('Resultado do envio:', result);
    return {
      success: result.success,
      message: 'Mensagem de teste enviada com sucesso',
      details: result
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error);
    return {
      success: false,
      message: `Erro ao enviar mensagem: ${(error as Error).message}`,
      error
    };
  }
}

/**
 * Verifica o status da instância específica
 * @returns Dados da instância
 */
export async function checkInstanceStatus(): Promise<any> {
  try {
    // Verificar diretamente a instância pelo token específico
    const instance = await whatsAppService.getInstanceStatus(PRODUCTION_INSTANCE_TOKEN);
    
    console.log('Status da instância:', instance);
    
    return {
      success: true,
      status: instance.status || instance.state,
      instanceData: instance
    };
  } catch (error) {
    console.error('Erro ao verificar status da instância:', error);
    return {
      success: false,
      message: `Erro ao verificar status: ${(error as Error).message}`,
      error
    };
  }
}
