/**
 * Serviço para gerenciar automações de marketing com UAZAPI
 */

import { supabase } from '@/lib/supabaseClient';
import { sendBulkMessage, sendBulkMediaMessage } from './uazapiService';
import { getToken } from './whatsappApi';

// Interface para automações
export interface MarketingAutomation {
  id?: string;
  title: string;
  automation_type: 'welcome' | 'birthday' | 'reactivation' | 'reminder' | 'post_service' | 'campaign' | 'scheduling';
  message_template: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  settings: AutomationSettings;
}

// Interface para configurações de automação
export interface AutomationSettings {
  mediaUrl?: string;
  mediaCaption?: string;
  sendTime?: string;
  rewardType?: 'discount' | 'service' | 'none';
  rewardValue?: number;
  validityDays?: number;
  selectedServiceId?: string;
  minDelay?: number;
  maxDelay?: number;
  triggers?: AutomationTrigger[];
  conditions?: AutomationCondition[];
  actions?: AutomationAction[];
}

// Interface para gatilhos de automação
export interface AutomationTrigger {
  event: string;
  parameters?: Record<string, any>;
}

// Interface para condições de automação
export interface AutomationCondition {
  type: string;
  field: string;
  operator: string;
  value: any;
}

// Interface para ações de automação
export interface AutomationAction {
  type: string;
  parameters: Record<string, any>;
}

/**
 * Salva uma nova automação ou atualiza existente
 * @param automation Dados da automação
 * @returns Automação salva
 */
export async function saveAutomation(automation: MarketingAutomation): Promise<MarketingAutomation | null> {
  try {
    const now = new Date().toISOString();
    
    const automationData = {
      ...automation,
      updated_at: now,
      created_at: automation.id ? automation.created_at : now
    };
    
    let result;
    
    if (automation.id) {
      // Atualizar automação existente
      const { data, error } = await supabase
        .from('marketing_automations')
        .update(automationData)
        .eq('id', automation.id)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else {
      // Criar nova automação
      const { data, error } = await supabase
        .from('marketing_automations')
        .insert(automationData)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    }
    
    return result || null;
  } catch (error) {
    console.error('Erro ao salvar automação:', error);
    return null;
  }
}

/**
 * Obtém todas as automações
 * @returns Lista de automações
 */
export async function getAutomations(): Promise<MarketingAutomation[]> {
  try {
    const { data, error } = await supabase
      .from('marketing_automations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar automações:', error);
    return [];
  }
}

/**
 * Obtém automações por tipo
 * @param type Tipo de automação
 * @returns Lista de automações do tipo especificado
 */
export async function getAutomationsByType(type: string): Promise<MarketingAutomation[]> {
  try {
    const { data, error } = await supabase
      .from('marketing_automations')
      .select('*')
      .eq('automation_type', type)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar automações do tipo ${type}:`, error);
    return [];
  }
}

/**
 * Ativa ou desativa uma automação
 * @param id ID da automação
 * @param isActive Status de ativação
 * @returns true se bem sucedido
 */
export async function toggleAutomationStatus(id: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('marketing_automations')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao alternar status da automação:', error);
    return false;
  }
}

/**
 * Exclui uma automação
 * @param id ID da automação
 * @returns true se bem sucedido
 */
export async function deleteAutomation(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('marketing_automations')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir automação:', error);
    return false;
  }
}

/**
 * Busca os clientes que correspondem a uma automação específica
 * @param automationType Tipo de automação
 * @param conditions Condições adicionais
 * @returns Lista de clientes elegíveis
 */
export async function getEligibleClients(automationType: string, conditions?: AutomationCondition[]): Promise<any[]> {
  try {
    let query = supabase.from('clients').select('*');
    
    // Aplicar filtros específicos por tipo de automação
    switch (automationType) {
      case 'birthday':
        // Clientes que fazem aniversário hoje
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        // Filtrar por mês e dia do aniversário (formato: MM-DD)
        query = query
          .or(`EXTRACT(MONTH FROM birth_date)=${month},EXTRACT(DAY FROM birth_date)=${day}`);
        break;
        
      case 'welcome':
        // Clientes recém-cadastrados (últimos 2 dias)
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        query = query
          .gte('created_at', twoDaysAgo.toISOString());
        break;
        
      case 'reactivation':
        // Clientes inativos (sem agendamento nos últimos 60 dias)
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        
        query = query
          .lt('last_appointment', sixtyDaysAgo.toISOString());
        break;
    }
    
    // Aplicar condições adicionais
    if (conditions && conditions.length > 0) {
      conditions.forEach(condition => {
        switch (condition.operator) {
          case 'eq':
            query = query.eq(condition.field, condition.value);
            break;
          case 'neq':
            query = query.neq(condition.field, condition.value);
            break;
          case 'gt':
            query = query.gt(condition.field, condition.value);
            break;
          case 'gte':
            query = query.gte(condition.field, condition.value);
            break;
          case 'lt':
            query = query.lt(condition.field, condition.value);
            break;
          case 'lte':
            query = query.lte(condition.field, condition.value);
            break;
          case 'like':
            query = query.ilike(condition.field, `%${condition.value}%`);
            break;
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar clientes elegíveis:', error);
    return [];
  }
}

/**
 * Executa uma automação específica
 * @param automation Automação a ser executada
 * @returns Resultado da execução
 */
export async function executeAutomation(automation: MarketingAutomation): Promise<any> {
  try {
    // Buscar clientes elegíveis
    const clients = await getEligibleClients(automation.automation_type);
    
    if (clients.length === 0) {
      console.log(`Nenhum cliente elegível para a automação: ${automation.title}`);
      return { success: true, count: 0, message: "Nenhum cliente elegível" };
    }
    
    // Extrair números de telefone
    const phoneNumbers = clients.map(client => {
      // Normalizar o número de telefone para formato internacional
      let phone = client.phone.replace(/\D/g, '');
      
      // Garantir que está no formato correto (com código do país)
      if (phone.length === 11) {
        phone = `55${phone}`;
      } else if (phone.length === 10) {
        phone = `55${phone}`;
      }
      
      return phone;
    });
    
    // Preparar o template da mensagem
    let messageTemplate = automation.message_template;
    
    // Substituir variáveis específicas por tipo
    switch (automation.automation_type) {
      case 'birthday':
        if (automation.settings.rewardType === 'discount') {
          messageTemplate = messageTemplate.replace('[benefício]', `${automation.settings.rewardValue}% de desconto em qualquer serviço`);
        } else if (automation.settings.rewardType === 'service') {
          // Aqui seria necessário buscar o nome do serviço
          messageTemplate = messageTemplate.replace('[benefício]', `${automation.settings.rewardValue}% de desconto no serviço selecionado`);
        }
        
        messageTemplate = messageTemplate.replace('[validade]', `${automation.settings.validityDays}`);
        break;
    }
    
    // Configurar delays
    const minDelay = automation.settings.minDelay || 3;
    const maxDelay = automation.settings.maxDelay || 8;
    
    // Obter token da instância
    const token = getToken();
    
    // Enviar mensagens
    let result;
    
    if (automation.settings.mediaUrl) {
      // Enviar mensagem com mídia
      result = await sendBulkMediaMessage(
        phoneNumbers,
        automation.settings.mediaUrl,
        automation.settings.mediaCaption || messageTemplate,
        minDelay,
        maxDelay,
        token
      );
    } else {
      // Enviar mensagem de texto
      result = await sendBulkMessage(
        phoneNumbers,
        messageTemplate,
        minDelay,
        maxDelay,
        token
      );
    }
    
    // Registrar a execução da automação
    await logAutomationExecution(automation.id || '', {
      clients_count: clients.length,
      success_count: result.results.filter((r: any) => r.success).length,
      error_count: result.results.filter((r: any) => !r.success).length,
      execution_date: new Date().toISOString()
    });
    
    return {
      success: true,
      count: clients.length,
      results: result.results
    };
  } catch (error) {
    console.error('Erro ao executar automação:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Registra a execução de uma automação no banco
 * @param automationId ID da automação
 * @param executionData Dados da execução
 */
async function logAutomationExecution(automationId: string, executionData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('automation_executions')
      .insert({
        automation_id: automationId,
        clients_count: executionData.clients_count,
        success_count: executionData.success_count,
        error_count: executionData.error_count,
        execution_date: executionData.execution_date
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao registrar execução da automação:', error);
  }
}

/**
 * Executa todas as automações ativas programadas para o momento atual
 * Essa função deve ser chamada por um job agendado
 */
export async function executeScheduledAutomations(): Promise<void> {
  try {
    // Obter todas as automações ativas
    const { data: automations, error } = await supabase
      .from('marketing_automations')
      .select('*')
      .eq('is_active', true);
      
    if (error) throw error;
    
    if (!automations || automations.length === 0) {
      console.log('Nenhuma automação ativa encontrada');
      return;
    }
    
    // Verificar cada automação para ver se deve ser executada
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (const automation of automations) {
      // Verificar se esta automação deve ser executada neste momento
      if (shouldExecuteNow(automation, currentHour, currentMinute)) {
        console.log(`Executando automação: ${automation.title}`);
        await executeAutomation(automation);
      }
    }
  } catch (error) {
    console.error('Erro ao executar automações agendadas:', error);
  }
}

/**
 * Verifica se uma automação deve ser executada no momento atual
 * @param automation Automação a verificar
 * @param currentHour Hora atual
 * @param currentMinute Minuto atual
 * @returns true se deve ser executada
 */
function shouldExecuteNow(automation: MarketingAutomation, currentHour: number, currentMinute: number): boolean {
  // Verificar hora de envio configurada
  if (automation.settings.sendTime) {
    const [hour, minute] = automation.settings.sendTime.split(':').map(Number);
    
    // Comparar com a hora atual (com uma janela de 5 minutos)
    if (hour === currentHour && Math.abs(minute - currentMinute) <= 5) {
      return true;
    }
  }
  
  // Verificações específicas por tipo de automação
  switch (automation.automation_type) {
    case 'birthday':
      // Automações de aniversário seguem o horário configurado
      return false;
      
    case 'welcome':
      // Automações de boas-vindas são acionadas por eventos
      return false;
      
    case 'post_service':
      // Automações pós-atendimento são acionadas por eventos
      return false;
      
    default:
      return false;
  }
}
