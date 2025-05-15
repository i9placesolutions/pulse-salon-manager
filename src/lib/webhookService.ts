/**
 * Serviço para gerenciar webhooks da UAZAPI
 */

import { supabase } from '@/lib/supabaseClient';
import { getApiUrl, whatsAppService, MAIN_INSTANCE_TOKEN } from './whatsappApi';
import { toast } from '@/components/ui/use-toast';

// Interface para configuração de webhook
export interface WebhookConfig {
  enabled: boolean;
  url: string;
  events: string[];
  instanceToken: string;
}

/**
 * Configura webhook automaticamente para todas as instâncias conectadas
 * @returns Lista de instâncias configuradas
 */
export async function autoConfigureWebhooks(): Promise<any[]> {
  try {
    // Lista de tokens de instância para verificar (incluindo o token específico fornecido)
    const tokensToCheck = [
      MAIN_INSTANCE_TOKEN, // Token padrão
      '64c79c76-4f4d-4fb8-9a00-8160be3089ae' // Token específico da instância em produção
    ];
    
    // Verificar diretamente a instância específica
    const specificInstance = await whatsAppService.findInstanceByUserId('64c79c76-4f4d-4fb8-9a00-8160be3089ae');
    if (specificInstance) {
      console.log('Instância específica encontrada:', specificInstance.instanceName || specificInstance.id);
      const token = specificInstance.token || specificInstance.id;
      
      // Configurar webhook para esta instância específica
      const result = await configureWebhook({
        instanceToken: token,
        url: 'https://app.pulsesalon.com.br/api/webhook/uazapi',
        events: ['message', 'status', 'connection'],
        enabled: true
      });
      
      return [{ instance: specificInstance, result }];
    }
    
    // Obter todas as instâncias disponíveis como backup
    const instances = await whatsAppService.getAllInstances();
    
    // Filtrar apenas instâncias conectadas
    const connectedInstances = instances.filter(instance => 
      instance.status === 'connected' || instance.status === 'CONNECTED'
    );
    
    if (connectedInstances.length === 0) {
      console.log('Nenhuma instância conectada encontrada');
      return [];
    }
    
    // Configurar webhook para cada instância
    const results = [];
    for (const instance of connectedInstances) {
      const instanceToken = instance.token || instance.id;
      
      // Configuração de webhook padrão
      const config: WebhookConfig = {
        instanceToken,
        url: 'https://app.pulsesalon.com.br/api/webhook/uazapi',
        events: ['message', 'status', 'connection'],
        enabled: true
      };
      
      const result = await configureWebhook(config);
      results.push({ instance, result });
    }
    
    return results;
  } catch (error) {
    console.error('Erro ao configurar webhooks automaticamente:', error);
    return [];
  }
}

/**
 * Configura um webhook para a instância do WhatsApp
 * @param config Configuração do webhook
 * @returns Resposta da API
 */
export async function configureWebhook(config: WebhookConfig): Promise<any> {
  try {
    const apiUrl = getApiUrl();
    
    const response = await fetch(`${apiUrl}/instance/webhook`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': config.instanceToken
      },
      body: JSON.stringify({
        webhook_url: config.url,
        webhook_events: config.events,
        enable: config.enabled
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao configurar webhook');
    }
    
    // Salvar a configuração no banco para referência futura
    await saveWebhookConfig(config);
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao configurar webhook:', error);
    throw error;
  }
}

/**
 * Salva a configuração de webhook no banco de dados
 * @param config Configuração do webhook
 */
async function saveWebhookConfig(config: WebhookConfig): Promise<void> {
  try {
    const { error } = await supabase
      .from('webhook_configs')
      .upsert({
        instance_token: config.instanceToken,
        webhook_url: config.url,
        webhook_events: config.events,
        enabled: config.enabled,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'instance_token'
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar configuração de webhook:', error);
  }
}

/**
 * Recupera a configuração de webhook do banco de dados
 * @param instanceToken Token da instância
 * @returns Configuração do webhook
 */
export async function getWebhookConfig(instanceToken: string): Promise<WebhookConfig | null> {
  try {
    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('instance_token', instanceToken)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhuma configuração encontrada
        return null;
      }
      throw error;
    }
    
    return {
      instanceToken: data.instance_token,
      url: data.webhook_url,
      events: data.webhook_events,
      enabled: data.enabled
    };
  } catch (error) {
    console.error('Erro ao recuperar configuração de webhook:', error);
    return null;
  }
}

/**
 * Processa um evento de webhook recebido da UAZAPI
 * @param event Evento recebido
 * @returns true se processado com sucesso
 */
export async function processWebhookEvent(event: any): Promise<boolean> {
  try {
    // Salvar o evento para análise
    await saveWebhookEvent(event);
    
    // Processar diferentes tipos de eventos
    switch (event.event) {
      case 'message':
        await processMessageEvent(event);
        break;
      case 'status':
        await processStatusEvent(event);
        break;
      case 'connection':
        await processConnectionEvent(event);
        break;
      default:
        console.log('Evento não processado:', event.event);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao processar evento de webhook:', error);
    return false;
  }
}

/**
 * Salva o evento de webhook no banco de dados
 * @param event Evento recebido
 */
async function saveWebhookEvent(event: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        event_type: event.event,
        instance_token: event.instanceToken || event.instanceId,
        payload: event,
        created_at: new Date().toISOString()
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar evento de webhook:', error);
  }
}

/**
 * Processa um evento de mensagem
 * @param event Evento de mensagem
 */
async function processMessageEvent(event: any): Promise<void> {
  // Implementar lógica para responder a mensagens recebidas
  console.log('Processando evento de mensagem:', event);
  
  // Aqui você pode implementar respostas automáticas, notificações, etc.
}

/**
 * Processa um evento de status
 * @param event Evento de status
 */
async function processStatusEvent(event: any): Promise<void> {
  console.log('Processando evento de status:', event);
  
  // Atualizar status da mensagem no banco, se aplicável
  if (event.messageId) {
    await updateMessageDeliveryStatus(event);
  }
}

/**
 * Processa um evento de conexão
 * @param event Evento de conexão
 */
async function processConnectionEvent(event: any): Promise<void> {
  console.log('Processando evento de conexão:', event);
  
  // Atualizar status da instância no banco
  const { error } = await supabase
    .from('whatsapp_instances')
    .update({
      status: event.status,
      updated_at: new Date().toISOString()
    })
    .eq('token', event.instanceToken || event.instanceId);
    
  if (error) {
    console.error('Erro ao atualizar status da instância:', error);
  }
}

/**
 * Atualiza o status de entrega de uma mensagem
 * @param event Evento de status
 */
async function updateMessageDeliveryStatus(event: any): Promise<void> {
  try {
    // Mapear o status do evento para o status na tabela
    let status = 'enviado';
    if (event.status === 'delivered') {
      status = 'entregue';
    } else if (event.status === 'read') {
      status = 'lido';
    } else if (event.status === 'failed') {
      status = 'falha';
    }
    
    // Atualizar o status na tabela de mensagens
    const { error } = await supabase
      .from('message_recipients')
      .update({
        status,
        delivered_at: event.status === 'delivered' ? new Date().toISOString() : null,
        read_at: event.status === 'read' ? new Date().toISOString() : null,
        error_message: event.status === 'failed' ? event.error || 'Falha na entrega' : null,
        updated_at: new Date().toISOString()
      })
      .eq('message_id', event.messageId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar status de entrega:', error);
  }
}
