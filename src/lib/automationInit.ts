/**
 * Script de inicialização das automações
 * Configura automaticamente webhooks e ativa automações
 */

import { autoConfigureWebhooks, configureWebhook, WebhookConfig } from './webhookService';
import { getAutomations, toggleAutomationStatus } from './automationService';
import { whatsAppService, MAIN_INSTANCE_TOKEN } from './whatsappApi';
import { toast } from '@/components/ui/use-toast';

/**
 * Inicializa configurações de automação
 */
export async function initializeAutomation(): Promise<boolean> {
  try {
    console.log('Inicializando configurações de automação...');
    
    // Lista de tokens de instância para verificar (incluindo o token específico fornecido)
    const tokensToCheck = [
      MAIN_INSTANCE_TOKEN,
      '64c79c76-4f4d-4fb8-9a00-8160be3089ae' // Token específico da instância em produção
    ];
    
    // Verificar cada token até encontrar uma instância conectada
    let connectedInstance = null;
    for (const token of tokensToCheck) {
      const instance = await whatsAppService.findInstanceByUserId(token);
      if (instance && (instance.status === 'connected' || instance.status === 'CONNECTED')) {
        console.log(`Instância conectada encontrada com token: ${token}`);
        connectedInstance = instance;
        break;
      }
    }
    
    if (!connectedInstance) {
      console.warn('Nenhuma instância WhatsApp conectada encontrada');
      return false;
    }
    
    // Configurar webhook especificamente para a instância conectada
    const instanceToken = connectedInstance.token || connectedInstance.id;
    
    // Configuração de webhook específica para esta instância
    const webhookConfig = {
      instanceToken,
      url: 'https://app.pulsesalon.com.br/api/webhook/uazapi',
      events: ['message', 'status', 'connection'],
      enabled: true
    };
    
    // Configurar webhook para a instância conectada
    try {
      const webhookResult = await configureWebhook(webhookConfig);
      console.log('Webhook configurado com sucesso para a instância:', connectedInstance.instanceName || connectedInstance.id);
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      // Continuar mesmo com erro na configuração do webhook para não bloquear outras funcionalidades
    }
    
    // Verificar e ativar automações
    const automations = await getAutomations();
    
    // Garantir que todas as automações estão ativas
    for (const automation of automations) {
      if (!automation.is_active) {
        await toggleAutomationStatus(automation.id!, true);
      }
    }
    
    console.log(`${automations.length} automações configuradas e ativadas`);
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar automações:', error);
    return false;
  }
}

/**
 * Inicializa automações quando a aplicação é carregada
 * Pode ser chamado de _app.tsx ou de um componente de alta ordem
 */
export function setupAutomationSystem(): void {
  // Aguardar carregamento do DOM e inicializar após 5 segundos
  if (typeof window !== 'undefined') {
    setTimeout(async () => {
      const success = await initializeAutomation();
      
      if (success) {
        console.log('Sistema de automação inicializado com sucesso');
      } else {
        console.warn('Falha ao inicializar sistema de automação');
      }
    }, 5000);
  }
}
