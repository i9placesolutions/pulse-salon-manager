/**
 * WhatsApp API Service
 * Baseado na documentação da API uazapiGO
 */

// URL base da API, deve ser configurável
const SERVER_URL = 'https://i9place3.uazapi.com';

// Token da instância principal para notificação dos estabelecimentos
export const MAIN_INSTANCE_TOKEN = '695fb204-5af9-4cfe-9f9f-676d2ca47e69';

// Função auxiliar para obter o token armazenado
export const getToken = (customToken?: string): string => {
  if (customToken) return customToken;
  const storedToken = localStorage.getItem('whatsapp_instance_token');
  if (!storedToken) {
    throw new Error('Token de instância WhatsApp não encontrado');
  }
  return storedToken;
};

// Interfaces para os tipos de mensagem
interface BaseMessageParams {
  number: string;
  replyid?: string;
  mentions?: string;
  readchat?: boolean;
  delay?: number;
  token?: string; // Token opcional para sobrepor o padrão
}

interface TextMessageParams extends BaseMessageParams {
  text: string;
  linkPreview?: boolean;
}

interface MediaMessageParams extends BaseMessageParams {
  text?: string;
  type: 'document' | 'video' | 'image' | 'audio' | 'ptt' | 'sticker';
  file: string; // URL ou base64
  docName?: string; // Nome do arquivo (apenas para documentos)
}

interface LocationMessageParams extends BaseMessageParams {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * Envia uma mensagem de texto via WhatsApp
 * @param params Parâmetros da mensagem
 * @returns Resposta da API
 */
export async function sendTextMessage(params: TextMessageParams): Promise<any> {
  try {
    const token = getToken(params.token);
    
    // Pequeno delay para evitar múltiplas chamadas acidentais
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(`${SERVER_URL}/send/text`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        number: params.number,
        text: params.text,
        linkPreview: params.linkPreview ?? false,
        replyid: params.replyid ?? '',
        mentions: params.mentions ?? '',
        readchat: params.readchat ?? true,
        delay: params.delay ?? 0
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar mensagem de texto');
    }
    
    return data;
  } catch (err) {
    console.error('Erro ao enviar mensagem de texto:', err);
    throw err;
  }
}

/**
 * Envia uma mensagem de mídia via WhatsApp
 * @param params Parâmetros da mensagem
 * @returns Resposta da API
 */
export async function sendMediaMessage(params: MediaMessageParams): Promise<any> {
  try {
    const token = getToken(params.token);
    
    // Pequeno delay para evitar múltiplas chamadas acidentais
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(`${SERVER_URL}/send/media`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        number: params.number,
        text: params.text || '',
        type: params.type,
        file: params.file,
        docName: params.docName || '',
        replyid: params.replyid || '',
        mentions: params.mentions || '',
        readchat: params.readchat ?? true,
        delay: params.delay ?? 0
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar mensagem de mídia');
    }
    
    return data;
  } catch (err) {
    console.error('Erro ao enviar mensagem de mídia:', err);
    throw err;
  }
}

/**
 * Envia uma localização via WhatsApp
 * @param params Parâmetros da localização
 * @returns Resposta da API
 */
export async function sendLocationMessage(params: LocationMessageParams): Promise<any> {
  try {
    const token = getToken(params.token);
    
    // Pequeno delay para evitar múltiplas chamadas acidentais
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(`${SERVER_URL}/send/location`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        number: params.number,
        name: params.name,
        address: params.address,
        latitude: params.latitude,
        longitude: params.longitude,
        replyid: params.replyid || '',
        mentions: params.mentions || '',
        readchat: params.readchat ?? true,
        delay: params.delay ?? 0
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar localização');
    }
    
    return data;
  } catch (err) {
    console.error('Erro ao enviar localização:', err);
    throw err;
  }
}

// Configurar a URL da API
export function setApiUrl(url: string): void {
  // Esta função pode ser usada para configurar a URL da API em tempo de execução
  (window as any).WHATSAPP_API_URL = url;
}

// Obter a URL configurada ou usar o padrão
export function getApiUrl(): string {
  return (window as any).WHATSAPP_API_URL || SERVER_URL;
} 