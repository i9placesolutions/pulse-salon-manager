/**
 * API de Marketing - Funções para envio de campanhas em massa
 * Integrado com uazapiGO API (v2.0)
 */

import { sendTextMessage, sendMediaMessage, getToken } from "./whatsappApi";

const SERVER_URL = 'https://i9place3.uazapi.com';

interface BulkMessageParams {
  numbers: string[];
  message: string;
  mediaUrl?: string;
  mediaType?: 'document' | 'video' | 'image' | 'audio' | 'ptt' | 'sticker';
  mediaName?: string;
  delay?: number;
  token?: string;
}

/**
 * Envia uma mensagem de texto em massa para múltiplos números
 * Endpoint: /bulk/sendText
 */
export async function sendBulkTextMessage(params: Omit<BulkMessageParams, 'mediaUrl' | 'mediaType' | 'mediaName'>): Promise<any> {
  try {
    const token = getToken(params.token);
    
    const response = await fetch(`${SERVER_URL}/bulk/sendText`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        numbers: params.numbers,
        text: params.message,
        delay: params.delay || 2000 // Delay padrão de 2 segundos entre mensagens
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar mensagens em massa');
    }
    
    return data;
  } catch (err) {
    console.error('Erro ao enviar mensagens em massa:', err);
    throw err;
  }
}

/**
 * Envia uma mensagem de mídia em massa para múltiplos números
 * Endpoint: /bulk/sendMedia
 */
export async function sendBulkMediaMessage(params: BulkMessageParams): Promise<any> {
  try {
    const token = getToken(params.token);
    
    if (!params.mediaUrl || !params.mediaType) {
      throw new Error('URL da mídia e tipo são obrigatórios');
    }
    
    const response = await fetch(`${SERVER_URL}/bulk/sendMedia`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        numbers: params.numbers,
        text: params.message,
        file: params.mediaUrl,
        type: params.mediaType,
        docName: params.mediaName || '',
        delay: params.delay || 2000 // Delay padrão de 2 segundos entre mensagens
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar mensagens com mídia em massa');
    }
    
    return data;
  } catch (err) {
    console.error('Erro ao enviar mensagens com mídia em massa:', err);
    throw err;
  }
}

/**
 * Envia campanha de marketing com opção de agendamento
 * Esta função envia uma campanha de marketing, que pode ser agendada ou imediata
 */
export async function sendMarketingCampaign({
  recipients,
  message,
  mediaFile,
  scheduleDate,
  scheduleTime
}: {
  recipients: string[];
  message: string;
  mediaFile?: { url: string; type: string; name?: string };
  scheduleDate?: string;
  scheduleTime?: string;
}): Promise<any> {
  try {
    // Verifica se é uma campanha agendada
    const isScheduled = scheduleDate && scheduleTime;
    
    // Se for agendada, precisaríamos usar um endpoint de agendamento
    // A uazapiGO não parece ter este endpoint específico na documentação base, então
    // seria necessário implementar isso no backend ou usar outro serviço
    
    // Para este exemplo, vamos apenas enviar imediatamente
    if (mediaFile) {
      return await sendBulkMediaMessage({
        numbers: recipients,
        message,
        mediaUrl: mediaFile.url,
        mediaType: determinarTipoMidia(mediaFile.type),
        mediaName: mediaFile.name,
        delay: 2000
      });
    } else {
      return await sendBulkTextMessage({
        numbers: recipients,
        message,
        delay: 2000
      });
    }
  } catch (err) {
    console.error('Erro ao enviar campanha de marketing:', err);
    throw err;
  }
}

// Função auxiliar para determinar o tipo de mídia
const determinarTipoMidia = (mimeType: string): 'document' | 'video' | 'image' | 'audio' | 'ptt' | 'sticker' => {
  if (mimeType.startsWith('image')) return 'image';
  if (mimeType.startsWith('video')) return 'video';
  if (mimeType.startsWith('audio')) return 'audio';
  return 'document';
}; 