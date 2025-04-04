
/**
 * Manipulador de Webhooks do Asaas
 * 
 * Este arquivo contém funções para processar eventos de webhook do Asaas
 * Projetado para uso em ambientes de API serverless (como Vercel, Netlify, etc.)
 */

// Importando apenas o necessário
import { supabase } from '@/integrations/supabase/client';
import { WebhookEvent } from './asaasApi';
import asaasLogger, { startAsaasTransaction } from './asaasLogger';

// Tipo para eventos de pagamento
export interface AsaasPaymentEvent {
  event: WebhookEvent;
  payment: {
    id: string;
    customer: string;
    value: number;
    netValue: number;
    billingType: string;
    status: string;
    dueDate: string;
    paymentDate?: string;
    description: string;
    invoiceUrl?: string;
    subscription?: string;
  };
  subscription?: {
    id: string;
    customer: string;
    billingType: string;
    value: number;
    nextDueDate: string;
    cycle: string;
    description: string;
    status: string;
  };
}

// Interface para webhook_events
interface WebhookEventRecord {
  id?: string;
  provider: string;
  event_type: string;
  payload: any;
  processed: boolean;
  processed_at?: string;
  processing_result?: string;
  created_at: string;
}

// Interface para payment_history
interface PaymentHistoryRecord {
  id?: string;
  external_id: string;
  customer_id: string;
  amount: number;
  payment_date: string;
  due_date?: string;
  payment_method: string;
  description: string;
  status: string;
  subscription_id?: string;
  provider: string;
  invoice_url?: string;
  created_at: string;
}

// Interface para subscriptions
interface SubscriptionRecord {
  id?: string;
  external_id: string;
  customer_id: string;
  plan_value: number;
  billing_type: string;
  status: string;
  next_billing_date: string;
  description: string;
  provider: string;
  created_at: string;
  updated_at?: string;
}

// Interface para profiles
interface ProfileRecord {
  id: string;
  external_customer_id?: string;
  subscription_active: boolean;
  updated_at: string;
}

/**
 * Processa um webhook do Asaas e salva no banco de dados
 * @param eventData Dados do evento recebido do Asaas
 * @returns Status do processamento
 */
export async function handleWebhook(eventData: AsaasPaymentEvent): Promise<{
  success: boolean;
  message: string;
}> {
  // Iniciar transação de logging para rastreabilidade
  const logger = startAsaasTransaction('webhook');
  
  try {
    // Verificar se o evento é válido
    if (!eventData || !eventData.event) {
      logger.warn('Dados de evento inválidos');
      return { success: false, message: 'Dados de evento inválidos' };
    }

    // Registrar recebimento do webhook
    logger.info('Webhook recebido', { event: eventData.event });

    // Salvar o evento bruto no banco de dados para rastreabilidade
    // Usando uma tabela personalizada, não mapeada no @supabase/types.ts
    const { data: eventRecord, error: eventError } = await supabase
      .rpc('insert_webhook_event', {
        provider_input: 'asaas',
        event_type_input: eventData.event,
        payload_input: eventData
      });

    if (eventError) {
      logger.error('Erro ao salvar evento do webhook', eventError);
      throw new Error(`Erro ao salvar evento: ${eventError.message}`);
    }

    // Processar o evento baseado no tipo
    const result = await processEventByType(eventData, logger);

    // Atualizar o registro do evento como processado
    if (eventRecord) {
      const { error: updateError } = await supabase
        .rpc('update_webhook_event_status', {
          event_id_input: eventRecord.id,
          processed_input: result.success,
          processing_result_input: result.message
        });

      if (updateError) {
        logger.error('Erro ao atualizar status de processamento', updateError);
      }
    }

    logger.info('Processamento de webhook concluído', { success: result.success });
    return result;
  } catch (error: any) {
    logger.error('Erro ao processar webhook', error);
    return {
      success: false,
      message: `Erro ao processar webhook: ${error.message}`
    };
  }
}

/**
 * Processa o evento com base no seu tipo
 * @param eventData Dados do evento
 * @returns Resultado do processamento
 */
async function processEventByType(
  eventData: AsaasPaymentEvent,
  logger: any
): Promise<{
  success: boolean;
  message: string;
}> {
  const eventType = eventData.event;

  try {
    logger.info(`Processando evento ${eventType}`);
    
    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        return await handlePaymentConfirmed(eventData, logger);

      case 'SUBSCRIPTION_CREATED':
        return await handleSubscriptionCreated(eventData, logger);

      case 'SUBSCRIPTION_PAYMENT_CREATED':
        return await handleSubscriptionPaymentCreated(eventData, logger);

      case 'SUBSCRIPTION_PAYMENT_FAILED':
        return await handleSubscriptionPaymentFailed(eventData, logger);
        
      case 'SUBSCRIPTION_CANCELLED':
      case 'SUBSCRIPTION_EXPIRED':
        return await handleSubscriptionCancelled(eventData, logger);

      default:
        logger.info(`Evento ${eventType} registrado, mas sem processamento específico`);
        return {
          success: true,
          message: `Evento ${eventType} registrado sem processamento específico`
        };
    }
  } catch (error: any) {
    logger.error(`Erro ao processar evento ${eventType}`, error);
    return {
      success: false,
      message: `Erro ao processar evento ${eventType}: ${error.message}`
    };
  }
}

/**
 * Processa pagamentos confirmados ou recebidos
 */
async function handlePaymentConfirmed(
  eventData: AsaasPaymentEvent,
  logger: any
): Promise<{ success: boolean; message: string }> {
  const payment = eventData.payment;
  logger.info('Processando pagamento confirmado', { paymentId: payment.id });

  try {
    // Se for pagamento de assinatura, atualizar status da assinatura
    if (payment.subscription) {
      await updateSubscriptionStatus(payment.customer, true);
    }

    // Registrar pagamento no histórico usando RPC em vez de acesso direto à tabela
    const { error } = await supabase.rpc('insert_payment_history', {
      external_id_input: payment.id,
      customer_id_input: payment.customer,
      amount_input: payment.value,
      payment_date_input: payment.paymentDate || new Date().toISOString(),
      payment_method_input: payment.billingType,
      description_input: payment.description,
      status_input: 'CONFIRMED',
      subscription_id_input: payment.subscription || null,
      provider_input: 'asaas',
      invoice_url_input: payment.invoiceUrl || null
    });

    if (error) {
      throw new Error(`Erro ao registrar pagamento: ${error.message}`);
    }

    return {
      success: true,
      message: `Pagamento ${payment.id} processado com sucesso`
    };
  } catch (error: any) {
    logger.error('Erro ao processar pagamento confirmado', error);
    return {
      success: false,
      message: `Erro ao processar pagamento: ${error.message}`
    };
  }
}

/**
 * Processa criação de assinaturas
 */
async function handleSubscriptionCreated(
  eventData: AsaasPaymentEvent,
  logger: any
): Promise<{ success: boolean; message: string }> {
  const subscription = eventData.subscription;
  if (!subscription) {
    return {
      success: false,
      message: 'Dados de assinatura não encontrados no evento'
    };
  }

  logger.info('Processando criação de assinatura', { subscriptionId: subscription.id });

  try {
    // Atualizar status da assinatura
    await updateSubscriptionStatus(subscription.customer, true);
    
    // Registrar assinatura no banco de dados usando RPC
    const { error } = await supabase.rpc('insert_subscription', {
      external_id_input: subscription.id,
      customer_id_input: subscription.customer,
      plan_value_input: subscription.value,
      billing_type_input: subscription.billingType,
      status_input: subscription.status,
      next_billing_date_input: subscription.nextDueDate,
      description_input: subscription.description,
      provider_input: 'asaas'
    });

    if (error) {
      throw new Error(`Erro ao registrar assinatura: ${error.message}`);
    }

    return {
      success: true,
      message: `Assinatura ${subscription.id} registrada com sucesso`
    };
  } catch (error: any) {
    logger.error('Erro ao processar criação de assinatura', error);
    return {
      success: false,
      message: `Erro ao processar criação de assinatura: ${error.message}`
    };
  }
}

/**
 * Processa pagamentos de assinatura
 */
async function handleSubscriptionPaymentCreated(
  eventData: AsaasPaymentEvent,
  logger: any
): Promise<{ success: boolean; message: string }> {
  const payment = eventData.payment;
  const subscription = eventData.subscription;

  if (!payment || !subscription) {
    return {
      success: false,
      message: 'Dados de pagamento ou assinatura não encontrados'
    };
  }

  logger.info('Processando pagamento de assinatura', { paymentId: payment.id });

  try {
    // Registrar pagamento de assinatura usando RPC
    const { error } = await supabase.rpc('insert_payment_history', {
      external_id_input: payment.id,
      customer_id_input: payment.customer,
      amount_input: payment.value,
      payment_date_input: new Date().toISOString(),
      due_date_input: payment.dueDate,
      payment_method_input: payment.billingType,
      description_input: `Pagamento de assinatura: ${payment.description}`,
      status_input: 'PENDING',
      subscription_id_input: subscription.id,
      provider_input: 'asaas',
      invoice_url_input: payment.invoiceUrl || null
    });

    if (error) {
      throw new Error(`Erro ao registrar pagamento de assinatura: ${error.message}`);
    }

    // Atualizar próxima data de cobrança da assinatura
    await updateSubscriptionNextBillingDate(
      subscription.id,
      subscription.customer,
      subscription.nextDueDate
    );

    return {
      success: true,
      message: `Pagamento de assinatura ${payment.id} registrado com sucesso`
    };
  } catch (error: any) {
    logger.error('Erro ao processar pagamento de assinatura', error);
    return {
      success: false,
      message: `Erro ao processar pagamento de assinatura: ${error.message}`
    };
  }
}

/**
 * Processa falhas de pagamento de assinatura
 */
async function handleSubscriptionPaymentFailed(
  eventData: AsaasPaymentEvent,
  logger: any
): Promise<{ success: boolean; message: string }> {
  const payment = eventData.payment;
  const subscription = eventData.subscription;

  if (!payment || !subscription) {
    return {
      success: false,
      message: 'Dados de pagamento ou assinatura não encontrados'
    };
  }

  logger.info('Processando falha em pagamento de assinatura', { paymentId: payment.id });

  try {
    // Registrar falha de pagamento usando RPC
    const { error } = await supabase.rpc('insert_payment_history', {
      external_id_input: payment.id,
      customer_id_input: payment.customer,
      amount_input: payment.value,
      payment_date_input: new Date().toISOString(),
      due_date_input: payment.dueDate,
      payment_method_input: payment.billingType,
      description_input: `Falha no pagamento de assinatura: ${payment.description}`,
      status_input: 'FAILED',
      subscription_id_input: subscription.id,
      provider_input: 'asaas',
      invoice_url_input: payment.invoiceUrl || null
    });

    if (error) {
      throw new Error(`Erro ao registrar falha de pagamento: ${error.message}`);
    }

    // Enviar notificação sobre falha de pagamento (a ser implementado)
    // TODO: Implementar sistema de notificações para falhas de pagamento

    return {
      success: true,
      message: `Falha de pagamento ${payment.id} registrada com sucesso`
    };
  } catch (error: any) {
    logger.error('Erro ao processar falha de pagamento', error);
    return {
      success: false,
      message: `Erro ao processar falha de pagamento: ${error.message}`
    };
  }
}

/**
 * Processa cancelamentos ou expiração de assinatura
 */
async function handleSubscriptionCancelled(
  eventData: AsaasPaymentEvent,
  logger: any
): Promise<{ success: boolean; message: string }> {
  const subscription = eventData.subscription;
  if (!subscription) {
    return {
      success: false,
      message: 'Dados de assinatura não encontrados no evento'
    };
  }

  logger.info('Processando cancelamento de assinatura', { subscriptionId: subscription.id });

  try {
    // Atualizar status da assinatura para cancelada/expirada
    await updateSubscriptionStatus(subscription.customer, false);
    
    // Atualizar registro da assinatura usando RPC
    const { error } = await supabase.rpc('update_subscription_status', {
      subscription_id_input: subscription.id, 
      status_input: subscription.status
    });

    if (error) {
      throw new Error(`Erro ao atualizar status da assinatura: ${error.message}`);
    }

    return {
      success: true,
      message: `Assinatura ${subscription.id} cancelada com sucesso`
    };
  } catch (error: any) {
    logger.error('Erro ao processar cancelamento de assinatura', error);
    return {
      success: false,
      message: `Erro ao processar cancelamento: ${error.message}`
    };
  }
}

/**
 * Atualiza o status de assinatura de um cliente
 */
async function updateSubscriptionStatus(
  customerId: string,
  isActive: boolean
): Promise<void> {
  try {
    // Encontrar o perfil do usuário pelo ID externo do cliente
    const { data: profileData, error: profileError } = await supabase.rpc('find_profile_by_customer_id', {
      customer_id_input: customerId
    });

    if (profileError) {
      throw new Error(`Perfil não encontrado: ${profileError.message}`);
    }

    if (!profileData) {
      // Tentar encontrar por outros campos usando RPC
      const { data: alternativeProfile, error } = await supabase.rpc('find_profile_by_id', {
        profile_id_input: customerId
      });

      if (error || !alternativeProfile) {
        throw new Error('Não foi possível encontrar o perfil do usuário');
      }

      // Atualizar o external_customer_id para facilitar futuras consultas
      await supabase.rpc('update_profile_customer_id', {
        profile_id_input: alternativeProfile.id,
        customer_id_input: customerId
      });
    }

    // Atualizar o status da assinatura
    const { error: updateError } = await supabase.rpc('update_profile_subscription', {
      customer_id_input: customerId,
      is_active_input: isActive
    });

    if (updateError) {
      throw new Error(`Erro ao atualizar status da assinatura: ${updateError.message}`);
    }
  } catch (error: any) {
    console.error('Erro ao atualizar status da assinatura', error);
    throw error;
  }
}

/**
 * Atualiza a próxima data de cobrança da assinatura
 */
async function updateSubscriptionNextBillingDate(
  subscriptionId: string,
  customerId: string,
  nextBillingDate: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('update_subscription_billing_date', {
      subscription_id_input: subscriptionId,
      next_date_input: nextBillingDate
    });

    if (error) {
      throw new Error(`Erro ao atualizar próxima data de cobrança: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Erro ao atualizar próxima data de cobrança', error);
    throw error;
  }
} 
