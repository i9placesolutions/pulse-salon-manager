import { supabase } from '@/lib/supabaseClient';
import WhatsAppIAService from './whatsappIAService';

/**
 * Processa os dados do webhook recebidos do n8n
 * Esta função será chamada pelo endpoint da API
 */
export async function processWebhookData(webhookData: any) {
  try {
    console.log('Webhook recebido:', JSON.stringify(webhookData, null, 2));
    
    // Verificar se há dados de mensagem válidos
    if (!webhookData.messages || webhookData.messages.length === 0) {
      console.log('Nenhuma mensagem encontrada no webhook');
      return { success: false, error: 'Nenhuma mensagem encontrada' };
    }
    
    // Extrair informações importantes
    const message = webhookData.messages[0];
    const instanceName = webhookData.instance || '';
    
    // Buscar estabelecimento associado a esta instância
    const { data: configData, error: configError } = await supabase
      .from('whatsapp_ia_config')
      .select('establishment_id, active')
      .eq('uazapi_instance', instanceName)
      .single();
    
    if (configError || !configData) {
      console.error('Erro ao encontrar configuração para instância:', instanceName, configError);
      return { 
        success: false, 
        error: 'Configuração não encontrada para esta instância' 
      };
    }
    
    // Verificar se o serviço de IA está ativo para este estabelecimento
    if (!configData.active) {
      console.log(`Serviço de IA inativo para o estabelecimento ${configData.establishment_id}`);
      return { 
        success: false, 
        error: 'Serviço de IA inativo para este estabelecimento' 
      };
    }
    
    // Inicializar o serviço de IA com o ID do estabelecimento
    const whatsAppIAService = new WhatsAppIAService(configData.establishment_id);
    await whatsAppIAService.initialize();
    
    // Processar o webhook recebido
    const result = await whatsAppIAService.processWebhook(webhookData);
    
    return { success: true, result };
  } catch (error) {
    console.error('Erro ao processar dados do webhook:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao processar webhook' 
    };
  }
}

/**
 * Registra logs de webhook para debug
 */
export async function logWebhookData(data: any, establishmentId: string) {
  try {
    const { error } = await supabase
      .from('whatsapp_webhook_logs')
      .insert({
        establishment_id: establishmentId,
        data: data,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Erro ao salvar log de webhook:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar log de webhook:', error);
  }
}
