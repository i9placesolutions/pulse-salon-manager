import axios from 'axios';

// Utilizar o URL exato da API fornecido
const BASE_URL = 'https://i9place3.uazapi.com';
const ADMIN_TOKEN = '43TUukVMHTIQV5j4iqbX52ZhM63b7s2slt3q04vjygM3lpMf06';

// Token da instância do sistema para notificações (não deve ser usado em interface gráfica)
const SYSTEM_NOTIFICATION_TOKEN = '695fb204-5af9-4cfe-9f9f-676d2ca47e69';

interface CreateInstanceResponse {
  response: string;
  instance: {
    id: string;
    token: string;
    status: string;
    paircode?: string;
    qrcode?: string;
    name: string;
    profileName?: string;
    profilePicUrl?: string;
    isBusiness?: boolean;
    plataform?: string;
    systemName?: string;
    owner?: string;
    lastDisconnect?: string;
    lastDisconnectReason?: string;
    adminField01?: string;
    adminField02?: string;
    openai_apikey?: string;
    chatbot_enabled?: boolean;
    chatbot_ignoreGroups?: boolean;
    chatbot_stopConversation?: string;
    chatbot_stopMinutes?: number;
    created: string;
    updated: string;
  };
  connected: boolean;
  loggedIn: boolean;
  name: string;
  token: string;
  info?: string;
}

interface CreateInstanceParams {
  name: string;
  systemName?: string;
  adminField01?: string;
  adminField02?: string;
}

/**
 * Cria uma nova instância do WhatsApp.
 * 
 * @param params - Parâmetros para criação da instância
 * @returns Promise com a resposta da criação da instância
 */
export const createWhatsAppInstance = async (params: CreateInstanceParams): Promise<CreateInstanceResponse> => {
  try {
    console.log('Criando instância com parâmetros:', params);
    
    const response = await axios.post<CreateInstanceResponse>(
      `${BASE_URL}/instance/init`,
      params,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'admintoken': ADMIN_TOKEN
        }
      }
    );
    
    console.log('Instância criada com sucesso:', response.data);
    // Agora precisamos salvar o token para uso posterior
    if (response.data && response.data.token) {
      console.log('Token recebido:', response.data.token);
      localStorage.setItem('whatsapp_instance_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao criar instância do WhatsApp:', error.response?.data || error.message);
      throw new Error(`Erro ao criar instância do WhatsApp: ${error.response?.data?.error || error.message}`);
    }
    
    console.error('Erro desconhecido ao criar instância do WhatsApp:', error);
    throw new Error('Erro desconhecido ao criar instância do WhatsApp');
  }
};

/**
 * Retorna o status de uma instância do WhatsApp.
 * 
 * @param token - Token da instância
 * @returns Promise com o status da instância
 */
/**
 * Verifica o status da instância do WhatsApp.
 * 
 * @param token Token da instância
 * @returns Promise com o status da instância
 */
export const getInstanceStatus = async (token: string) => {
  try {
    console.log('Verificando status com token:', token);
    
    // Usar formato conforme documentação
    const response = await axios.get(
      `${BASE_URL}/instance/status`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token
        }
      }
    );
    
    console.log('Status da instância:', response.data?.instance?.status || 'desconhecido');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao obter status da instância:', JSON.stringify(error.response?.data));
      throw new Error(`Erro ao obter status da instância: ${JSON.stringify(error.response?.data) || error.message}`);
    }
    
    console.error('Erro desconhecido ao obter status da instância:', error);
    throw new Error('Erro desconhecido ao obter status da instância');
  }
};

/**
 * Tipos para parâmetros de conexão da instância WhatsApp
 */
export interface ConnectInstanceParams {
  phone?: string; // Se fornecido, gera código de pareamento em vez de QR code
}

/**
 * Interface para parâmetros de envio de mensagem de texto via WhatsApp
 */
export interface SendTextMessageParams {
  number: string; // Número de telefone com código do país (ex: 5511999999999)
  text: string; // Texto da mensagem
  linkPreview?: boolean; // Se deve mostrar preview de links
  replyid?: string; // ID da mensagem a responder
  mentions?: string; // Menções ("all" ou IDs separados por vírgula)
  readchat?: boolean; // Marcar chat como lido
  delay?: number; // Atraso em segundos
}

/**
 * Interface para parâmetros de envio de mídia via WhatsApp
 */
export interface SendMediaMessageParams {
  number: string; // Número de telefone com código do país
  text?: string; // Texto opcional da mensagem
  type: 'document' | 'video' | 'image' | 'audio' | 'ptt' | 'sticker'; // Tipo de mídia
  file: string; // URL da mídia ou base64
  docName?: string; // Nome do documento (apenas para 'document')
  replyid?: string; // ID da mensagem a responder
  mentions?: string; // Menções
  readchat?: boolean; // Marcar chat como lido
  delay?: number; // Atraso em segundos
}

/**
 * Conecta uma instância do WhatsApp (gera QR Code ou código de pareamento).
 * 
 * @param token Token da instância
 * @param params Parâmetros opcionais (phone para gerar código de pareamento)
 * @returns Promise com dados de conexão e QR Code ou código de pareamento
 */
export const connectInstance = async (token: string, params?: ConnectInstanceParams) => {
  try {
    console.log('Conectando com token:', token, params ? 'e telefone' : 'para QR code');
    
    // Preparar o corpo da requisição conforme a documentação
    const requestBody = params?.phone ? { phone: params.phone } : {};
    
    // Usar exatamente o formato da documentação
    const response = await axios.post(
      `${BASE_URL}/instance/connect`,
      requestBody,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token 
        }
      }
    );
    
    console.log('Resposta de conectar instância:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao conectar instância detalhado:', JSON.stringify(error.response?.data));
      throw new Error(`Erro ao conectar instância: ${JSON.stringify(error.response?.data) || error.message}`);
    }
    
    console.error('Erro desconhecido ao conectar instância:', error);
    throw new Error('Erro desconhecido ao conectar instância');
  }
};

/**
 * Desconecta uma instância do WhatsApp.
 * 
 * @param token Token da instância
 * @returns Promise com resultado da desconexão
 */
export const disconnectInstance = async (token: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/instance/disconnect`,
      {},  // corpo vazio, pois a API requer apenas o token no header
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao desconectar instância:', error.response?.data || error.message);
      throw new Error(`Erro ao desconectar instância: ${error.response?.data?.error || error.message}`);
    }
    
    console.error('Erro desconhecido ao desconectar instância:', error);
    throw new Error('Erro desconhecido ao desconectar instância');
  }
};

/**
 * Interface para os dados da instância do WhatsApp
 */
export interface WhatsAppInstance {
  id: string;
  name: string;
  token: string;
  status: string;
  paircode?: string;
  qrcode?: string;
  profileName?: string;
  profilePicUrl?: string;
  isBusiness?: boolean;
  plataform?: string;
  systemName: string;
  owner?: string;
  lastDisconnect?: string;
  lastDisconnectReason?: string;
  adminField01?: string;
  adminField02?: string;
  created: string;
  updated: string;
}

/**
 * Lista todas as instâncias do WhatsApp.
 * 
 * @returns Promise com a lista de instâncias
 */
export const listAllInstances = async (): Promise<WhatsAppInstance[]> => {
  try {
    console.log('Listando todas as instâncias');
    
    const response = await axios.get(
      `${BASE_URL}/instance/all`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'admintoken': ADMIN_TOKEN
        }
      }
    );
    
    // Verificar se a resposta é válida e tem o formato esperado
    if (response.data && Array.isArray(response.data)) {
      console.log(`${response.data.length} instâncias encontradas`);
      return response.data;
    }
    
    console.log('Formato de resposta inesperado na listagem de instâncias');
    return [];
  } catch (error) {
    // Silenciar erros de rede e retornar array vazio
    console.log("Não foi possível conectar ao servidor de instâncias, retornando lista vazia");
    return [];
  }
};

/**
 * Lista as instâncias do WhatsApp criadas pelo usuário logado.
 * 
 * @param userId ID do usuário logado
 * @returns Promise com a lista de instâncias do usuário
 */
export const listUserInstances = async (userId: string): Promise<WhatsAppInstance[]> => {
  try {
    console.log(`Listando instâncias para o usuário: ${userId}`);
    
    // Primeiro, obter todas as instâncias
    const allInstances = await listAllInstances();
    
    // Filtrar por instâncias que correspondem ao adminField01 (userID) do usuário atual
    const userInstances = allInstances.filter(instance => 
      instance.adminField01 === userId
    );
    
    console.log(`${userInstances.length} instâncias encontradas para o usuário ${userId}`);
    return userInstances;
  } catch (error) {
    // Silenciar erros e retornar array vazio
    console.log(`Não foi possível obter instâncias para o usuário ${userId}, retornando lista vazia`);
    return [];
  }
};

/**
 * Exclui uma instância do WhatsApp.
 * 
 * @param token Token da instância a ser excluída
 * @returns Promise com o resultado da exclusão
 */
export const deleteInstance = async (token: string): Promise<any> => {
  try {
    console.log('Excluindo instância com token:', token);
    
    const response = await axios.delete(
      `${BASE_URL}/instance`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token,
          'admintoken': ADMIN_TOKEN
        }
      }
    );
    
    console.log('Instância excluída com sucesso:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao excluir instância:', error.response?.data || error.message);
      throw new Error(`Erro ao excluir instância: ${error.response?.data?.error || error.message}`);
    }
    
    console.error('Erro desconhecido ao excluir instância:', error);
    throw new Error('Erro desconhecido ao excluir instância');
  }
};

/**
 * Envia uma mensagem de texto via WhatsApp.
 * 
 * @param token Token da instância WhatsApp
 * @param params Parâmetros da mensagem de texto
 * @returns Promise com o resultado do envio
 */
export const sendTextMessage = async (token: string, params: SendTextMessageParams): Promise<any> => {
  try {
    console.log('Enviando mensagem de texto via WhatsApp:', params.number);
    
    const response = await axios.post(
      `${BASE_URL}/send/text`,
      params,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token,
          'convert': 'true'
        }
      }
    );
    
    console.log('Mensagem de texto enviada com sucesso:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao enviar mensagem de texto:', error.response?.data || error.message);
      throw new Error(`Erro ao enviar mensagem de texto: ${error.response?.data?.error || error.message}`);
    }
    
    console.error('Erro desconhecido ao enviar mensagem de texto:', error);
    throw new Error('Erro desconhecido ao enviar mensagem de texto');
  }
};

/**
 * Envia uma mensagem de mídia via WhatsApp.
 * 
 * @param token Token da instância WhatsApp
 * @param params Parâmetros da mensagem de mídia
 * @returns Promise com o resultado do envio
 */
export const sendMediaMessage = async (token: string, params: SendMediaMessageParams): Promise<any> => {
  try {
    console.log('Enviando mensagem de mídia via WhatsApp:', params.number);
    
    const response = await axios.post(
      `${BASE_URL}/send/media`,
      params,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token
        }
      }
    );
    
    console.log('Mensagem de mídia enviada com sucesso:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao enviar mensagem de mídia:', error.response?.data || error.message);
      throw new Error(`Erro ao enviar mensagem de mídia: ${error.response?.data?.error || error.message}`);
    }
    
    console.error('Erro desconhecido ao enviar mensagem de mídia:', error);
    throw new Error('Erro desconhecido ao enviar mensagem de mídia');
  }
};

/**
 * Envia uma notificação de login para o número de telefone do estabelecimento.
 * 
 * @param establishmentName Nome do estabelecimento
 * @param phoneNumber Número de telefone com código do país (ex: 5511999999999)
 * @returns Promise com o resultado do envio
 */
export const sendLoginNotification = async (establishmentName: string, phoneNumber: string): Promise<any> => {
  try {
    console.log(`Enviando notificação de login para ${establishmentName} (${phoneNumber})`);
    
    // Formatar data e hora atual
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR');
    const timeFormatted = now.toLocaleTimeString('pt-BR');
    
    // Mensagem formatada conforme solicitado
    const message = `✨ Login realizado com sucesso no *Pulse Salon Manager!*\n\n🏢 Estabelecimento: *${establishmentName}*\n📅 Data: *${dateFormatted}*\n🕒 Horário: *${timeFormatted}*\n\nSe não foi você, entre em contato com o *suporte* imediatamente. 🔒`;
    
    // Usar a instância de notificação do sistema
    const result = await sendTextMessage(SYSTEM_NOTIFICATION_TOKEN, {
      number: phoneNumber,
      text: message,
      linkPreview: false,
      readchat: true
    });
    
    console.log('Notificação de login enviada com sucesso');
    return result;
  } catch (error) {
    // Apenas logamos o erro mas não interrompemos o fluxo principal
    console.error('Erro ao enviar notificação de login:', error);
    // Não rethrow para não bloquear o fluxo principal
    return { error: true, message: 'Falha ao enviar notificação' };
  }
};
