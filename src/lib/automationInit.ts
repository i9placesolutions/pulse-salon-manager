/**
 * Script de inicialização das automações
 * Configura automaticamente webhooks e ativa automações
 */

import { autoConfigureWebhooks } from './webhookService';
import { getAutomations, toggleAutomationStatus } from './automationService';
import { whatsAppService, MAIN_INSTANCE_TOKEN } from './whatsappApi';
import { toast } from '@/components/ui/use-toast';

/**
 * Inicializa configurações de automação
 */
export async function initializeAutomation(): Promise<boolean> {
  try {
    console.log('Inicializando configurações de automação...');
    
    // Verificar se existe uma instância conectada
    const instance = await whatsAppService.findInstanceByUserId(MAIN_INSTANCE_TOKEN);
    
    if (!instance || instance.status !== 'connected') {
      console.warn('Nenhuma instância WhatsApp conectada encontrada');
      return false;
    }
    
    // Configurar webhooks automaticamente
    const webhookResults = await autoConfigureWebhooks();
    
    if (webhookResults.length === 0) {
      console.warn('Não foi possível configurar webhooks');
      return false;
    }
    
    console.log('Webhooks configurados com sucesso para as instâncias:', 
      webhookResults.map(r => r.instance.instanceName || r.instance.id).join(', '));
    
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
