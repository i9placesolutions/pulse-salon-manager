/**
 * Serviço para gerenciamento de mensagens automáticas de aniversário
 */

import {
  getBirthdayConfig,
  fetchBirthdayClients,
  sendBulkMessage,
  sendBulkMediaMessage,
  type BirthdayMessageConfig,
  type BirthdayClient
} from './uazapiService';
import { getSelectedService } from '../lib/serviceHelpers';

// Verifica se é hora de enviar mensagens de aniversário
export async function checkAndSendBirthdayMessages() {
  try {
    const config = getBirthdayConfig();
    
    // Se a funcionalidade não estiver habilitada, não fazer nada
    if (!config.isEnabled) {
      console.log('Envio de mensagens de aniversário não está habilitado.');
      return;
    }

    // Verificar se é a hora configurada para envio
    const now = new Date();
    const [configHours, configMinutes] = config.sendTime.split(':').map(Number);
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Se não for o horário configurado (com tolerância de 5 minutos), não fazer nada
    if (
      currentHours !== configHours ||
      Math.abs(currentMinutes - configMinutes) > 5
    ) {
      console.log(`Não é hora de enviar mensagens. Hora atual: ${currentHours}:${currentMinutes}, hora configurada: ${configHours}:${configMinutes}`);
      return;
    }

    // Buscar aniversariantes do dia
    const birthdayClients = await fetchBirthdayClients();
    
    if (birthdayClients.length === 0) {
      console.log('Nenhum aniversariante encontrado para hoje.');
      return;
    }

    console.log(`Encontrados ${birthdayClients.length} aniversariantes para hoje.`);
    
    // Enviar mensagens para cada aniversariante
    for (const client of birthdayClients) {
      await sendBirthdayMessageToClient(client, config);
    }
    
    console.log(`Mensagens de aniversário enviadas com sucesso para ${birthdayClients.length} clientes.`);
    
  } catch (error) {
    console.error('Erro ao processar mensagens de aniversário:', error);
  }
}

// Envia mensagem personalizada para um cliente aniversariante
async function sendBirthdayMessageToClient(
  client: BirthdayClient,
  config: BirthdayMessageConfig
) {
  try {
    // Personalizar a mensagem para o cliente
    let personalizedMessage = config.messageTemplate
      .replace("{nome}", client.name);
    
    if (config.rewardType !== 'none') {
      const rewardText = getRewardText(config);
      personalizedMessage = personalizedMessage
        .replace("[benefício]", rewardText)
        .replace("[validade]", config.validityDays.toString());
    } else {
      // Remover menções a benefícios e validade se não houver benefício
      personalizedMessage = personalizedMessage
        .replace(/\[benefício\].*?\[validade\].*?dias\./gs, "");
    }

    // Se há mídia configurada, enviar mensagem com mídia
    if (config.mediaUrl) {
      await sendBulkMediaMessage(
        [client.phone],
        config.mediaUrl,
        personalizedMessage,
        config.minDelay,
        config.maxDelay
      );
    } else {
      // Senão, enviar apenas texto
      await sendBulkMessage(
        [client.phone],
        personalizedMessage,
        config.minDelay,
        config.maxDelay
      );
    }
    
    console.log(`Mensagem de aniversário enviada para ${client.name} (${client.phone})`);
    return true;
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${client.name}:`, error);
    return false;
  }
}

// Obtém o texto do benefício baseado na configuração
function getRewardText(config: BirthdayMessageConfig): string {
  switch (config.rewardType) {
    case 'discount':
      return `${config.rewardValue}% de desconto em qualquer serviço`;
    case 'service': {
      const service = getSelectedService(config.selectedServiceId);
      return service 
        ? `um(a) ${service.name} gratuito(a)`
        : "um serviço gratuito à sua escolha";
    }
    case 'none':
      return "nenhum benefício adicional";
    default:
      return "";
  }
}

// Inicia o serviço para verificar aniversariantes a cada 1 hora
export function startBirthdayService() {
  // Executar imediatamente na inicialização
  checkAndSendBirthdayMessages();
  
  // Configurar verificação a cada 1 hora
  const HOUR_IN_MS = 60 * 60 * 1000;
  setInterval(checkAndSendBirthdayMessages, HOUR_IN_MS);
  
  console.log('Serviço de mensagens de aniversário iniciado.');
}
