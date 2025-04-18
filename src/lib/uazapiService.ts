/**
 * Serviço para integração com a API uazapiGO
 */

import { getApiUrl } from './whatsappApi';

// Interface para contatos do WhatsApp
export interface WhatsAppContact {
  id: string;
  name: string;
  pushname?: string;
  number: string;
  formattedNumber: string;
  isMyContact: boolean;
  isWAContact: boolean;
  isGroup: boolean;
}

// Interface para resposta paginada de contatos
export interface ContactsResponse {
  contacts: WhatsAppContact[];
  cursor?: string;
  hasMore: boolean;
}

// Interface para configuração de mensagem de aniversário
export interface BirthdayMessageConfig {
  isEnabled: boolean;
  messageTemplate: string;
  mediaUrl?: string;
  mediaCaption?: string;
  sendTime: string;
  rewardType: 'discount' | 'service' | 'none';
  rewardValue: number;
  validityDays: number;
  selectedServiceId?: string;
  minDelay: number;
  maxDelay: number;
}

// Interface para cliente com aniversário
export interface BirthdayClient {
  id: string;
  name: string;
  phone: string;
  birthDate: string; // formato: "DD/MM"
}

/**
 * Busca os contatos disponíveis na instância do WhatsApp
 * @param limit Limite de contatos por página
 * @param cursor Cursor para paginação
 * @param token Token opcional da instância
 * @returns Lista de contatos
 */
export async function fetchWhatsAppContacts(
  limit: number = 100,
  cursor?: string,
  token?: string
): Promise<ContactsResponse> {
  try {
    const apiUrl = getApiUrl();
    const instanceToken = token || getToken();
    
    let url = `${apiUrl}/chat/contacts?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': instanceToken
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao buscar contatos');
    }
    
    const data = await response.json();
    return {
      contacts: data.contacts || [],
      cursor: data.cursor,
      hasMore: !!data.cursor
    };
  } catch (error) {
    console.error('Erro ao buscar contatos do WhatsApp:', error);
    throw error;
  }
}

/**
 * Envia mensagem em massa para vários contatos com delay aleatório
 * @param numbers Lista de números para envio
 * @param message Mensagem a ser enviada
 * @param minDelay Delay mínimo em segundos (padrão: 3 segundos)
 * @param maxDelay Delay máximo em segundos (padrão: 8 segundos)
 * @param token Token opcional da instância
 * @returns Object com status de sucesso e detalhes dos envios
 */
export async function sendBulkMessage(
  numbers: string[],
  message: string,
  minDelay: number = 3, 
  maxDelay: number = 8,
  token?: string
): Promise<{success: boolean, results: any[]}> {
  const apiUrl = getApiUrl();
  const instanceToken = token || getToken();
  const results = [];
  let successCount = 0;
  
  for (const number of numbers) {
    try {
      // Gera um delay aleatório entre minDelay e maxDelay (em segundos, convertido para milissegundos)
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay) * 1000;
      
      const response = await fetch(`${apiUrl}/send/text`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': instanceToken
        },
        body: JSON.stringify({
          number,
          text: message,
          delay: delay / 1000 // API espera o delay em segundos
        })
      });
      
      const data = await response.json();
      const isSuccess = response.ok;
      if (isSuccess) successCount++;
      
      results.push({ number, success: isSuccess, data });
      
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${number}:`, error);
      results.push({ number, success: false, error: (error as Error).message });
    }
  }
  
  // Retorna um objeto com status geral e detalhes
  return {
    success: successCount > 0,
    results
  };
}

/**
 * Envia mensagem com mídia em massa para vários contatos com delay aleatório
 * @param numbers Lista de números para envio
 * @param mediaUrl URL da mídia a ser enviada
 * @param caption Legenda opcional para mídia
 * @param minDelay Delay mínimo em segundos (padrão: 3 segundos)
 * @param maxDelay Delay máximo em segundos (padrão: 5 segundos)
 * @param token Token opcional da instância
 */
export async function sendBulkMediaMessage(
  numbers: string[],
  mediaUrl: string,
  caption?: string,
  minDelay: number = 3, 
  maxDelay: number = 5,
  token?: string
): Promise<any[]> {
  const apiUrl = getApiUrl();
  const instanceToken = token || getToken();
  const results = [];
  
  for (const number of numbers) {
    try {
      // Gera um delay aleatório entre minDelay e maxDelay
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay) * 1000;
      
      // Aguarda o delay antes de enviar a próxima mensagem
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const response = await fetch(`${apiUrl}/send/media`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': instanceToken
        },
        body: JSON.stringify({
          number,
          media: mediaUrl,
          caption: caption || '',
          delay: 0 // Não é necessário delay adicional aqui
        })
      });
      
      const data = await response.json();
      results.push({ number, success: response.ok, data });
      
    } catch (error) {
      console.error(`Erro ao enviar mídia para ${number}:`, error);
      results.push({ number, success: false, error: (error as Error).message });
    }
  }
  
  return results;
}

/**
 * Busca clientes que fazem aniversário hoje
 * @returns Lista de clientes aniversariantes
 */
export async function fetchBirthdayClients(): Promise<BirthdayClient[]> {
  // Esta função seria implementada para buscar clientes no banco de dados
  // Por enquanto, usamos dados simulados para demonstração
  
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const todayFormat = `${day}/${month}`;
  
  // Em um cenário real, buscaríamos os aniversariantes no banco de dados
  console.log(`Buscando aniversariantes para a data: ${todayFormat}`);
  
  // Dados simulados
  const mockClients: BirthdayClient[] = [
    { id: "1", name: "Maria Silva", phone: "5511987654321", birthDate: todayFormat },
    { id: "2", name: "João Oliveira", phone: "5511912345678", birthDate: todayFormat }
  ];
  
  return mockClients;
}

/**
 * Salva configuração de mensagem de aniversário
 * @param config Configuração da mensagem
 */
export async function saveBirthdayConfig(config: BirthdayMessageConfig): Promise<boolean> {
  try {
    // Aqui seria implementada a lógica para salvar no banco de dados
    localStorage.setItem('birthday_message_config', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    return false;
  }
}

/**
 * Recupera configuração de mensagem de aniversário
 * @returns Configuração salva ou padrão
 */
export function getBirthdayConfig(): BirthdayMessageConfig {
  try {
    const saved = localStorage.getItem('birthday_message_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Erro ao recuperar configuração:', error);
  }
  
  // Configuração padrão
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

/**
 * Função para obter token armazenado
 * @param customToken Token personalizado
 * @returns Token da instância
 */
export function getToken(customToken?: string): string {
  if (customToken) return customToken;
  const storedToken = localStorage.getItem('whatsapp_instance_token');
  if (!storedToken) {
    throw new Error('Token de instância WhatsApp não encontrado');
  }
  return storedToken;
}
