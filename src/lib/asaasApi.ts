/**
 * Asaas API Service
 * Serviço para integração com a API do Asaas para processamento de pagamentos
 */

import axios from 'axios';
import asaasLogger from './asaasLogger';

// URL base da API
const API_URL = 'https://api.asaas.com/v3';
// API Key de produção
const PRODUCTION_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjUyNTlkZjIxLWJjNGYtNDc1My05OTE1LWVlYjhhY2Q0NDI5MTo6JGFhY2hfYzAzODYzMGMtNmJkMS00NDRlLWI3NTgtMGU2NzhlMDNjMzIx';

// URL para onde os webhooks serão enviados
const WEBHOOK_URL = import.meta.env.VITE_ASAAS_WEBHOOK_URL || 'https://seu-dominio.com/api/webhooks/asaas';

// Interface de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    details: any;
  };
}

// Eventos disponíveis para webhook
export type WebhookEvent = 
  | 'PAYMENT_CREATED'          // Criação de pagamento
  | 'PAYMENT_UPDATED'          // Atualização de pagamento
  | 'PAYMENT_CONFIRMED'        // Confirmação de pagamento
  | 'PAYMENT_RECEIVED'         // Pagamento recebido
  | 'PAYMENT_OVERDUE'          // Pagamento atrasado
  | 'PAYMENT_DELETED'          // Pagamento excluído
  | 'PAYMENT_REFUNDED'         // Pagamento estornado
  | 'PAYMENT_REFUND_FAILED'    // Falha no estorno de pagamento
  | 'PAYMENT_RECEIVED_IN_CASH_UNDONE' // Recebimento em dinheiro desfeito
  | 'PAYMENT_CHARGEBACK_REQUESTED'     // Chargeback solicitado
  | 'PAYMENT_CHARGEBACK_DISPUTE'      // Disputa de chargeback
  | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL' // Aguardando reversão de chargeback
  | 'PAYMENT_DUNNING_RECEIVED'        // Recebimento de negativação
  | 'PAYMENT_DUNNING_REQUESTED'       // Negativação solicitada
  | 'PAYMENT_BANK_SLIP_VIEWED'        // Boleto visualizado
  | 'PAYMENT_CHECKOUT_VIEWED'         // Checkout visualizado
  | 'SUBSCRIPTION_CREATED'        // Assinatura criada
  | 'SUBSCRIPTION_UPDATED'        // Assinatura atualizada
  | 'SUBSCRIPTION_PAYMENT_CREATED' // Pagamento de assinatura criado
  | 'SUBSCRIPTION_PAYMENT_FAILED' // Falha no pagamento de assinatura
  | 'SUBSCRIPTION_CANCELLED'      // Assinatura cancelada
  | 'SUBSCRIPTION_ACTIVATED'      // Assinatura ativada
  | 'SUBSCRIPTION_EXPIRED'        // Assinatura expirada
  | 'INVOICE_CREATED'     // Fatura criada
  | 'INVOICE_UPDATED'     // Fatura atualizada
  | 'BILL_PAYMENT_CREATED'    // Conta a pagar criada
  | 'BILL_PAYMENT_UPDATED'    // Conta a pagar atualizada
  | 'BILL_PAYMENT_DELETED'    // Conta a pagar excluída
  | 'TRANSFER_CREATED'   // Transferência criada
  | 'TRANSFER_UPDATED'   // Transferência atualizada
  | 'MOBILE_PHONE_RECHARGE_CREATED'   // Recarga de celular criada
  | 'MOBILE_PHONE_RECHARGE_UPDATED'   // Recarga de celular atualizada
  | 'ACCOUNT_STATUS_CHANGED'; // Status da conta alterado

// Interface para configuração de webhook
export interface WebhookConfig {
  url: string;
  email: string;
  apiVersion?: 3;
  enabled?: boolean;
  interrupted?: boolean;
  authorization?: string;
  events?: WebhookEvent[];
}

// Interface para resposta da criação/consulta de webhook
export interface WebhookResponse {
  id: string;
  url: string;
  email: string;
  apiVersion: number;
  enabled: boolean;
  interrupted: boolean;
  events: WebhookEvent[];
  authorization?: string;
}

// Obter a API Key configurada
export const getApiKey = (): string => {
  // Em produção, essa chave deve vir de uma variável de ambiente ou configuração segura
  const storedApiKey = localStorage.getItem('asaas_api_key');
  return storedApiKey || PRODUCTION_API_KEY;
};

// Interface para criação de cliente
export interface CustomerParams {
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

// Interface para criação de assinatura
export interface SubscriptionParams {
  customer: string; // ID do cliente no Asaas
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  nextDueDate: string; // Formato: YYYY-MM-DD
  description?: string;
  cycle: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  maxPayments?: number;
  externalReference?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
    mobilePhone?: string;
  };
  fine?: {
    value?: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  interest?: {
    value: number;
  };
}

// Interface para consulta de assinatura
export interface SubscriptionResponse {
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: string;
  billingType: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  description: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED';
  invoiceUrl?: string;
  fine?: {
    value: number;
    type: string;
  };
  interest?: {
    value: number;
  };
}

// Interface para consulta de pagamentos
export interface PaymentResponse {
  id: string;
  dateCreated: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: string;
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'CANCELED';
  dueDate: string;
  paymentDate?: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  description: string;
}

/**
 * Cria um novo cliente no Asaas
 * @param params Dados do cliente
 * @returns Resposta da API com os dados do cliente criado
 */
export async function createCustomer(params: CustomerParams): Promise<ApiResponse<any>> {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify(params)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      asaasLogger.error('Erro ao criar cliente', data);
      return {
        success: false,
        error: {
          code: response.status,
          message: data.message || 'Erro ao criar cliente',
          details: data
        }
      };
    }
    
    asaasLogger.info('Cliente criado com sucesso', data);
    return { success: true, data };
  } catch (err) {
    asaasLogger.error('Erro ao criar cliente no Asaas', err);
    return handleApiError(err);
  }
}

/**
 * Cria uma nova assinatura de mensalidade
 * @param params Dados da assinatura
 * @returns Resposta da API com os dados da assinatura criada
 */
export async function createSubscription(params: SubscriptionParams): Promise<ApiResponse<SubscriptionResponse>> {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify(params)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      asaasLogger.error('Erro ao criar assinatura', data);
      return {
        success: false,
        error: {
          code: response.status,
          message: data.message || 'Erro ao criar assinatura',
          details: data
        }
      };
    }
    
    asaasLogger.info('Assinatura criada com sucesso', data);
    return { success: true, data };
  } catch (err) {
    asaasLogger.error('Erro ao criar assinatura no Asaas', err);
    return handleApiError(err);
  }
}

/**
 * Consulta os detalhes de uma assinatura
 * @param id ID da assinatura
 * @returns Dados da assinatura
 */
export async function getSubscription(id: string): Promise<ApiResponse<SubscriptionResponse>> {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(`${API_URL}/subscriptions/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'access_token': apiKey
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status,
          message: data.message || 'Erro ao consultar assinatura',
          details: data
        }
      };
    }
    
    return { success: true, data };
  } catch (err) {
    asaasLogger.error('Erro ao consultar assinatura no Asaas', err);
    return handleApiError(err);
  }
}

/**
 * Cancela uma assinatura
 * @param id ID da assinatura
 * @returns Status da operação
 */
export async function cancelSubscription(id: string): Promise<ApiResponse<any>> {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(`${API_URL}/subscriptions/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'access_token': apiKey
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      asaasLogger.error('Erro ao cancelar assinatura', data);
      return {
        success: false,
        error: {
          code: response.status,
          message: data.message || 'Erro ao cancelar assinatura',
          details: data
        }
      };
    }
    
    asaasLogger.info('Assinatura cancelada com sucesso', { id });
    return { success: true, data };
  } catch (err) {
    asaasLogger.error('Erro ao cancelar assinatura no Asaas', err);
    return handleApiError(err);
  }
}

/**
 * Lista os pagamentos de uma assinatura
 * @param subscriptionId ID da assinatura
 * @returns Lista de pagamentos
 */
export async function listSubscriptionPayments(subscriptionId: string): Promise<ApiResponse<PaymentResponse[]>> {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(`${API_URL}/payments?subscription=${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'access_token': apiKey
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status,
          message: data.message || 'Erro ao listar pagamentos da assinatura',
          details: data
        }
      };
    }
    
    return { success: true, data: data.data };
  } catch (err) {
    asaasLogger.error('Erro ao listar pagamentos da assinatura no Asaas', err);
    return handleApiError(err);
  }
}

/**
 * Gera um link de pagamento único
 * @param customerId ID do cliente
 * @param value Valor
 * @param description Descrição
 * @returns Link de pagamento
 */
export async function generatePaymentLink(
  customerId: string, 
  value: number, 
  description: string
): Promise<ApiResponse<string>> {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(`${API_URL}/paymentLinks`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED', // Permite todos os tipos de pagamento
        value,
        description,
        dueDays: 5,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 dias
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      asaasLogger.error('Erro ao gerar link de pagamento', data);
      return {
        success: false,
        error: {
          code: response.status,
          message: data.message || 'Erro ao gerar link de pagamento',
          details: data
        }
      };
    }
    
    asaasLogger.info('Link de pagamento gerado com sucesso', { url: data.url });
    return { success: true, data: data.url };
  } catch (err) {
    asaasLogger.error('Erro ao gerar link de pagamento no Asaas', err);
    return handleApiError(err);
  }
}

// Função melhorada para lidar com erros da API
function handleApiError(error: any): ApiResponse<any> {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || {};
    
    // Tratamento específico de erros do Asaas
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const errorMessages = errorData.errors.map((e: any) => e.description || e.message).join(', ');
      return {
        success: false,
        error: {
          code: status,
          message: errorMessages || 'Erro na API do Asaas',
          details: errorData
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: status,
        message: errorData.message || error.message || 'Erro na API do Asaas',
        details: errorData
      }
    };
  }
  
  return {
    success: false,
    error: {
      code: 500,
      message: error.message || 'Erro interno ao processar solicitação',
      details: error
    }
  };
}

/**
 * Configura um webhook para receber notificações do Asaas
 * @param config Configuração do webhook
 * @returns Dados do webhook criado
 */
export async function configureWebhook(config: WebhookConfig): Promise<ApiResponse<WebhookResponse>> {
  try {
    if (!config.url) {
      return {
        success: false,
        error: {
          code: 400,
          message: 'URL de webhook não fornecida',
          details: null
        }
      };
    }

    const apiKey = getApiKey();
    
    const webhookConfig = {
      url: config.url || WEBHOOK_URL,
      email: config.email,
      apiVersion: config.apiVersion || 3,
      enabled: config.enabled !== undefined ? config.enabled : true,
      interrupted: config.interrupted || false,
      authorization: config.authorization || '',
      events: config.events || [
        'PAYMENT_CREATED',
        'PAYMENT_UPDATED',
        'PAYMENT_CONFIRMED',
        'PAYMENT_RECEIVED',
        'SUBSCRIPTION_CREATED', 
        'SUBSCRIPTION_PAYMENT_CREATED',
        'SUBSCRIPTION_PAYMENT_FAILED',
        'SUBSCRIPTION_CANCELLED'
      ]
    };
    
    const response = await axios.post(`${API_URL}/webhook`, webhookConfig, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
    });
    
    asaasLogger.info('Webhook configurado com sucesso', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    asaasLogger.error('Erro ao configurar webhook', error);
    return handleApiError(error);
  }
}

/**
 * Obtém a configuração atual do webhook
 * @returns Dados do webhook configurado
 */
export async function getWebhookConfig(): Promise<ApiResponse<WebhookResponse>> {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(`${API_URL}/webhook`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'access_token': apiKey
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status,
          message: data.message || 'Erro ao obter configuração do webhook',
          details: data
        }
      };
    }
    
    return { success: true, data };
  } catch (err) {
    asaasLogger.error('Erro ao obter configuração do webhook no Asaas', err);
    return handleApiError(err);
  }
}

/**
 * Atualiza a configuração do webhook
 * @param config Configuração do webhook
 * @returns Dados do webhook atualizado
 */
export async function updateWebhookConfig(config: Partial<WebhookConfig>): Promise<ApiResponse<WebhookResponse>> {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(`${API_URL}/webhook`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify(config)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      asaasLogger.error('Erro ao atualizar configuração do webhook', data);
      return {
        success: false,
        error: {
          code: response.status,
          message: data.message || 'Erro ao atualizar configuração do webhook',
          details: data
        }
      };
    }
    
    asaasLogger.info('Configuração do webhook atualizada com sucesso', data);
    return { success: true, data };
  } catch (err) {
    asaasLogger.error('Erro ao atualizar configuração do webhook no Asaas', err);
    return handleApiError(err);
  }
}

/**
 * DESCONTINUADO: Esta função foi substituída pelo manipulador em src/lib/asaasWebhookHandler.ts
 * Consulte o arquivo para implementação atualizada com suporte ao Supabase
 * @deprecated Use handleWebhook de asaasWebhookHandler.ts
 */
export function processWebhookEvent(eventData: any): {success: boolean; message: string} {
  asaasLogger.warn('A função processWebhookEvent está descontinuada. Use handleWebhook de asaasWebhookHandler.ts');
  return { 
    success: false, 
    message: 'Função descontinuada. Use handleWebhook de asaasWebhookHandler.ts'
  };
}

// Funções auxiliares de processamento de eventos movidas para asaasWebhookHandler.ts 