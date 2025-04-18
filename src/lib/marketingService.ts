/**
 * Serviço para operações de marketing com Supabase
 */

import { supabase } from '@/lib/supabaseClient';
import { BirthdayMessageConfig, WhatsAppContact, ContactsResponse } from './uazapiService';
import { MessageCampaignData } from '@/types/marketing';

/**
 * Interface para campanhas de marketing
 */
export interface MarketingCampaign {
  id?: string;
  title: string;
  campaign_type: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'canceled';
  scheduled_date?: string;
  sent_date?: string;
  recipients_type: 'all' | 'vip' | 'inactive' | 'custom' | 'phone';
  recipients_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para mensagens de marketing
 */
export interface MarketingMessage {
  id?: string;
  campaign_id?: string;
  title: string;
  message: string;
  recipients_type: 'all' | 'vip' | 'inactive' | 'custom' | 'phone';
  channel: string;
  schedule_date?: string;
  status: 'draft' | 'sent' | 'scheduled' | 'error';
  total_recipients?: number;
  successful_sends?: number;
  failed_sends?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para destinatários de mensagens
 */
export interface MessageRecipient {
  id?: string;
  message_id: string;
  client_id?: string;
  phone?: string;
  email?: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at?: string;
}

/**
 * Interface para métricas de marketing
 */
export interface MarketingMetrics {
  activeCampaigns: number;
  activeCoupons: number;
  conversionRate: number;
  customerSavings: number;
  campaignsGrowth: number;
  couponsGrowth: number;
  conversionGrowth: number;
  savingsGrowth: number;
}

/**
 * Recupera todas as campanhas de marketing
 */
export async function fetchMarketingCampaigns(): Promise<MarketingCampaign[]> {
  try {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar campanhas de marketing:', error);
    return [];
  }
}

/**
 * Recupera campanhas de marketing por tipo
 * @param campaignType Tipo de campanha
 */
export async function fetchCampaignsByType(campaignType: string): Promise<MarketingCampaign[]> {
  try {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('campaign_type', campaignType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar campanhas do tipo ${campaignType}:`, error);
    return [];
  }
}

/**
 * Recupera todas as mensagens de marketing
 */
export async function fetchMarketingMessages(): Promise<MarketingMessage[]> {
  try {
    const { data, error } = await supabase
      .from('marketing_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar mensagens de marketing:', error);
    return [];
  }
}

/**
 * Salva uma nova mensagem de marketing
 * @param messageData Dados da mensagem
 */
export async function saveMarketingMessage(messageData: MessageCampaignData): Promise<MarketingMessage | null> {
  try {
    // Converter o formato de dados da UI para o formato do banco
    const dbMessageData: MarketingMessage = {
      title: messageData.title,
      message: messageData.message,
      recipients_type: messageData.recipients,
      channel: messageData.channels[0], // Assumindo que o primeiro canal é o principal
      status: messageData.scheduleDate ? 'scheduled' : 'draft',
      schedule_date: messageData.scheduleDate && messageData.scheduleTime 
        ? `${messageData.scheduleDate}T${messageData.scheduleTime}:00` 
        : undefined
    };

    // Salvar a mensagem
    const { data, error } = await supabase
      .from('marketing_messages')
      .insert(dbMessageData)
      .select()
      .single();

    if (error) throw error;

    // Se tivermos contatos específicos, salvar os destinatários
    if (messageData.recipients === 'phone' && messageData.selectedContactIds && messageData.selectedContactIds.length > 0) {
      await saveMessageRecipients(data.id, messageData.selectedContactIds);
      
      // Atualizar o count total de destinatários
      await supabase
        .from('marketing_messages')
        .update({ 
          total_recipients: messageData.selectedContactIds.length 
        })
        .eq('id', data.id);
      
      data.total_recipients = messageData.selectedContactIds.length;
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    return null;
  }
}

/**
 * Salva os destinatários de uma mensagem
 * @param messageId ID da mensagem
 * @param contactIds IDs dos contatos
 */
async function saveMessageRecipients(messageId: string, contactIds: string[]): Promise<boolean> {
  try {
    // Buscar informações dos contatos
    const { data: contacts } = await supabase
      .from('marketing_whatsapp_contacts')
      .select('id, client_id, number')
      .in('id', contactIds);
    
    if (!contacts || contacts.length === 0) return false;

    // Preparar os registros de destinatários
    const recipients = contacts.map(contact => ({
      message_id: messageId,
      client_id: contact.client_id,
      phone: contact.number,
      status: 'pending'
    }));

    // Inserir os destinatários
    const { error } = await supabase
      .from('marketing_message_recipients')
      .insert(recipients);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao salvar destinatários:', error);
    return false;
  }
}

/**
 * Atualiza o status de uma mensagem
 * @param messageId ID da mensagem
 * @param status Novo status
 * @param statsUpdate Estatísticas a atualizar
 */
export async function updateMessageStatus(
  messageId: string, 
  status: 'draft' | 'sent' | 'scheduled' | 'error',
  statsUpdate?: { 
    successful_sends?: number,
    failed_sends?: number
  }
): Promise<boolean> {
  try {
    const updateData: any = { status };
    
    if (status === 'sent') {
      updateData.sent_date = new Date().toISOString();
    }
    
    if (statsUpdate) {
      if (statsUpdate.successful_sends !== undefined) {
        updateData.successful_sends = statsUpdate.successful_sends;
      }
      if (statsUpdate.failed_sends !== undefined) {
        updateData.failed_sends = statsUpdate.failed_sends;
      }
    }
    
    const { error } = await supabase
      .from('marketing_messages')
      .update(updateData)
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status da mensagem:', error);
    return false;
  }
}

/**
 * Busca contatos de WhatsApp do banco de dados
 */
export async function fetchWhatsAppContactsFromDB(): Promise<WhatsAppContact[]> {
  try {
    const { data, error } = await supabase
      .from('marketing_whatsapp_contacts')
      .select('*')
      .order('name');

    if (error) throw error;
    
    // Converter para o formato esperado pela UI
    return (data || []).map(contact => ({
      id: contact.id,
      name: contact.name || '',
      pushname: contact.pushname,
      number: contact.number,
      formattedNumber: contact.formatted_number || contact.number,
      isMyContact: contact.is_my_contact,
      isWAContact: contact.is_wa_contact,
      isGroup: contact.is_group
    }));
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    return [];
  }
}

/**
 * Salva contatos de WhatsApp no banco de dados
 * @param contacts Lista de contatos
 */
export async function saveWhatsAppContacts(contacts: WhatsAppContact[]): Promise<boolean> {
  try {
    // Preparar dados para inserção
    const contactsToInsert = contacts.map(contact => ({
      name: contact.name,
      pushname: contact.pushname,
      number: contact.number,
      formatted_number: contact.formattedNumber,
      is_my_contact: contact.isMyContact,
      is_wa_contact: contact.isWAContact,
      is_group: contact.isGroup
    }));

    // Inserir usando upsert (atualiza se já existir)
    const { error } = await supabase
      .from('marketing_whatsapp_contacts')
      .upsert(contactsToInsert, { 
        onConflict: 'number',
        ignoreDuplicates: false 
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao salvar contatos:', error);
    return false;
  }
}

/**
 * Recupera a configuração de mensagens de aniversário
 */
export async function fetchBirthdayConfig(): Promise<BirthdayMessageConfig | null> {
  try {
    const { data, error } = await supabase
      .from('marketing_birthday_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignorar erro se não encontrar resultados
      throw error;
    }

    if (!data) {
      // Retornar configuração padrão
      return {
        isEnabled: false,
        messageTemplate: "Feliz aniversário, {nome}! \n\nPara celebrar seu dia especial, preparamos um presente para você: [benefício].\n\nVálido por [validade] dias.\n\nAproveite! ",
        sendTime: "09:00",
        rewardType: 'discount',
        rewardValue: 20,
        validityDays: 30,
        minDelay: 3,
        maxDelay: 5
      };
    }

    // Converter do formato do banco para o formato da UI
    return {
      isEnabled: data.is_enabled,
      messageTemplate: data.message_template,
      mediaUrl: data.media_url,
      mediaCaption: data.media_caption,
      sendTime: data.send_time,
      rewardType: data.reward_type as 'discount' | 'service' | 'none',
      rewardValue: Number(data.reward_value),
      validityDays: data.validity_days,
      selectedServiceId: data.selected_service_id?.toString(),
      minDelay: data.min_delay,
      maxDelay: data.max_delay
    };
  } catch (error) {
    console.error('Erro ao buscar configuração de aniversário:', error);
    return null;
  }
}

/**
 * Salva a configuração de mensagens de aniversário
 * @param config Configuração de aniversário
 */
export async function saveBirthdayConfig(config: BirthdayMessageConfig): Promise<boolean> {
  try {
    // Converter do formato da UI para o formato do banco
    const dbConfig = {
      is_enabled: config.isEnabled,
      message_template: config.messageTemplate,
      media_url: config.mediaUrl,
      media_caption: config.mediaCaption,
      send_time: config.sendTime,
      reward_type: config.rewardType,
      reward_value: config.rewardValue,
      validity_days: config.validityDays,
      selected_service_id: config.selectedServiceId ? parseInt(config.selectedServiceId) : null,
      min_delay: config.minDelay,
      max_delay: config.maxDelay,
      updated_at: new Date().toISOString()
    };

    // Verificar se já existe uma configuração
    const { data: existingConfig } = await supabase
      .from('marketing_birthday_config')
      .select('id')
      .limit(1);

    if (existingConfig && existingConfig.length > 0) {
      // Atualizar configuração existente
      const { error } = await supabase
        .from('marketing_birthday_config')
        .update(dbConfig)
        .eq('id', existingConfig[0].id);

      if (error) throw error;
    } else {
      // Criar nova configuração
      const { error } = await supabase
        .from('marketing_birthday_config')
        .insert(dbConfig);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar configuração de aniversário:', error);
    return false;
  }
}

/**
 * Busca métricas atualizadas de marketing
 */
export async function fetchMarketingMetrics(): Promise<MarketingMetrics> {
  try {
    // Buscar campanhas ativas
    const { data: activeCampaignsData, error: campaignsError } = await supabase
      .from('marketing_campaigns')
      .select('id')
      .in('status', ['active', 'scheduled']);
      
    if (campaignsError) throw campaignsError;
    
    // Buscar campanhas do mês passado para calcular o crescimento
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthDate = lastMonth.toISOString().split('T')[0];
    
    const { data: lastMonthCampaigns, error: lastMonthError } = await supabase
      .from('marketing_campaigns')
      .select('id')
      .lt('created_at', lastMonthDate)
      .in('status', ['active', 'scheduled']);
      
    if (lastMonthError) throw lastMonthError;
    
    // Calcular crescimento de campanhas
    const currentCampaigns = activeCampaignsData?.length || 0;
    const previousCampaigns = lastMonthCampaigns?.length || 0;
    const campaignsGrowth = previousCampaigns > 0 
      ? ((currentCampaigns - previousCampaigns) / previousCampaigns) * 100
      : 0;
    
    // Buscar cupons ativos (campanhas do tipo cupom)
    const { data: couponsData, error: couponsError } = await supabase
      .from('marketing_campaigns')
      .select('id')
      .eq('campaign_type', 'coupon')
      .in('status', ['active', 'scheduled']);
      
    if (couponsError) throw couponsError;
    
    // Cupons do mês passado
    const { data: lastMonthCoupons, error: lastMonthCouponsError } = await supabase
      .from('marketing_campaigns')
      .select('id')
      .eq('campaign_type', 'coupon')
      .lt('created_at', lastMonthDate);
      
    if (lastMonthCouponsError) throw lastMonthCouponsError;
    
    // Calcular crescimento de cupons
    const currentCoupons = couponsData?.length || 0;
    const previousCoupons = lastMonthCoupons?.length || 0;
    const couponsGrowth = previousCoupons > 0
      ? ((currentCoupons - previousCoupons) / previousCoupons) * 100
      : 0;
    
    // Taxa de conversão (poderia vir de uma tabela específica de analytics)
    // Aqui estamos simulando com base em dados disponíveis
    const { data: messageSentData, error: messageError } = await supabase
      .from('marketing_messages')
      .select('successful_sends, total_recipients')
      .eq('status', 'sent');
      
    if (messageError) throw messageError;
    
    // Calcular taxa de conversão com base em mensagens enviadas
    let totalSent = 0;
    let totalDelivered = 0;
    
    messageSentData?.forEach(msg => {
      totalSent += msg.total_recipients || 0;
      totalDelivered += msg.successful_sends || 0;
    });
    
    const conversionRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    
    // Simular crescimento da taxa de conversão (em uma implementação real, seria baseado em dados históricos)
    const conversionGrowth = 5.3; // Valor simulado
    
    // Economias para clientes (em uma implementação real, seria calculado a partir do valor dos descontos)
    // Aqui estamos usando um valor simulado baseado no número de campanhas
    const customerSavings = currentCampaigns * 250 + currentCoupons * 150;
    
    // Simular crescimento das economias
    const savingsGrowth = 15.8; // Valor simulado
    
    return {
      activeCampaigns: currentCampaigns,
      activeCoupons: currentCoupons,
      conversionRate,
      customerSavings,
      campaignsGrowth,
      couponsGrowth,
      conversionGrowth,
      savingsGrowth
    };
  } catch (error) {
    console.error('Erro ao buscar métricas de marketing:', error);
    
    // Retornar valores padrão em caso de erro
    return {
      activeCampaigns: 0,
      activeCoupons: 0,
      conversionRate: 0,
      customerSavings: 0,
      campaignsGrowth: 0,
      couponsGrowth: 0,
      conversionGrowth: 0,
      savingsGrowth: 0
    };
  }
}
