/**
 * Manipulador de Webhooks do Asaas
 * 
 * Este arquivo contém funções para processar eventos de webhook do Asaas
 * Projetado para uso em ambientes de API serverless (como Vercel, Netlify, etc.)
 */

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
    const { data: eventRecord, error: eventError } = await supabase
      .from('webhook_events')
      .insert({
        provider: 'asaas',
        event_type: eventData.event,
        payload: eventData,
        processed: false,
        created_at: new Date().toISOString()
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
        .from('webhook_events')
        .update({
          processed: result.success,
          processed_at: new Date().toISOString(),
          processing_result: result.message
        })
        .eq('id', eventRecord[0].id);

      if (updateError) {
        logger.error('Erro ao atualizar status de processamento', updateError);
      }
    }

    logger.info('Processamento de webhook concluído', { success: result.success });
    return result;
  } catch (error) {
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
  } catch (error) {
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

    // Registrar pagamento no histórico
    const { error } = await supabase.from('payment_history').insert({
      external_id: payment.id,
      customer_id: payment.customer,
      amount: payment.value,
      payment_date: payment.paymentDate || new Date().toISOString(),
      payment_method: payment.billingType,
      description: payment.description,
      status: 'CONFIRMED',
      subscription_id: payment.subscription || null,
      provider: 'asaas',
      invoice_url: payment.invoiceUrl || null,
      created_at: new Date().toISOString()
    });

    if (error) {
      throw new Error(`Erro ao registrar pagamento: ${error.message}`);
    }

    return {
      success: true,
      message: `Pagamento ${payment.id} processado com sucesso`
    };
  } catch (error) {
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
    
    // Registrar assinatura no banco de dados
    const { error } = await supabase.from('subscriptions').insert({
      external_id: subscription.id,
      customer_id: subscription.customer,
      plan_value: subscription.value,
      billing_type: subscription.billingType,
      status: subscription.status,
      next_billing_date: subscription.nextDueDate,
      description: subscription.description,
      provider: 'asaas',
      created_at: new Date().toISOString()
    });

    if (error) {
      throw new Error(`Erro ao registrar assinatura: ${error.message}`);
    }

    return {
      success: true,
      message: `Assinatura ${subscription.id} registrada com sucesso`
    };
  } catch (error) {
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
    // Registrar pagamento de assinatura
    const { error } = await supabase.from('payment_history').insert({
      external_id: payment.id,
      customer_id: payment.customer,
      amount: payment.value,
      payment_date: new Date().toISOString(),
      due_date: payment.dueDate,
      payment_method: payment.billingType,
      description: `Pagamento de assinatura: ${payment.description}`,
      status: 'PENDING',
      subscription_id: subscription.id,
      provider: 'asaas',
      invoice_url: payment.invoiceUrl || null,
      created_at: new Date().toISOString()
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
  } catch (error) {
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
    // Registrar falha de pagamento
    const { error } = await supabase.from('payment_history').insert({
      external_id: payment.id,
      customer_id: payment.customer,
      amount: payment.value,
      payment_date: new Date().toISOString(),
      due_date: payment.dueDate,
      payment_method: payment.billingType,
      description: `Falha no pagamento de assinatura: ${payment.description}`,
      status: 'FAILED',
      subscription_id: subscription.id,
      provider: 'asaas',
      invoice_url: payment.invoiceUrl || null,
      created_at: new Date().toISOString()
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
  } catch (error) {
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
    
    // Atualizar registro da assinatura
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('external_id', subscription.id);

    if (error) {
      throw new Error(`Erro ao atualizar status da assinatura: ${error.message}`);
    }

    return {
      success: true,
      message: `Assinatura ${subscription.id} cancelada com sucesso`
    };
  } catch (error) {
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
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('external_customer_id', customerId)
      .single();

    if (profileError) {
      throw new Error(`Perfil não encontrado: ${profileError.message}`);
    }

    if (!profileData) {
      // Tentar encontrar por outros campos
      // Este é um fallback e pode precisar ser ajustado com base na sua estrutura de dados
      const { data: alternativeProfile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', customerId)
        .single();

      if (error || !alternativeProfile) {
        throw new Error('Não foi possível encontrar o perfil do usuário');
      }

      // Atualizar o external_customer_id para facilitar futuras consultas
      await supabase
        .from('profiles')
        .update({ external_customer_id: customerId })
        .eq('id', alternativeProfile.id);
    }

    // Atualizar o status da assinatura
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('external_customer_id', customerId);

    if (updateError) {
      throw new Error(`Erro ao atualizar status da assinatura: ${updateError.message}`);
    }
  } catch (error) {
    logger.error('Erro ao atualizar status da assinatura', error);
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
    const { error } = await supabase
      .from('subscriptions')
      .update({
        next_billing_date: nextBillingDate,
        updated_at: new Date().toISOString()
      })
      .eq('external_id', subscriptionId);

    if (error) {
      throw new Error(`Erro ao atualizar próxima data de cobrança: ${error.message}`);
    }
  } catch (error) {
    logger.error('Erro ao atualizar próxima data de cobrança', error);
    throw error;
  }
} 