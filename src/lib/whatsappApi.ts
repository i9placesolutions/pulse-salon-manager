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

// Serviço para comunicação com a API do WhatsApp uazapiGO
const API_URL = "https://i9place3.uazapi.com";
const ADMIN_TOKEN = "43TUukVMHTIQV5j4iqbX52ZhM63b7s2slt3q04vjygM3lpMf06";

// Define os tipos principais
export interface WhatsAppInstance {
  id: string;
  instanceName: string;
  status: string;
  qrcode?: string;
  pairingCode?: string;
  user?: {
    name?: string;
    id?: string;
    profilePictureUrl?: string;
  };
  token?: string;
}

// Serviço para gerenciar as instâncias do WhatsApp
export const whatsAppService = {
  // Criar uma nova instância
  async createInstance(name: string, userId: string, systemName?: string, adminField02?: string): Promise<WhatsAppInstance> {
    try {
      const response = await fetch(`${API_URL}/instance/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admintoken": ADMIN_TOKEN
        },
        body: JSON.stringify({
          name: name,
          systemName: systemName || "Pulse Salon Manager",
          adminField01: userId, // Usamos este campo para guardar o ID do usuário
          adminField02: adminField02 || ""
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar instância: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Resposta da API ao criar instância:", data);
      
      // Verificar se o token foi retornado corretamente
      if (!data.token) {
        console.error("Token da instância não encontrado na resposta:", data);
        throw new Error("Token da instância não encontrado na resposta");
      }
      
      // Salvar o token no localStorage para uso futuro
      localStorage.setItem('whatsapp_instance_token', data.token);
      
      return {
        id: data.instance.id,
        instanceName: data.instance.name,
        status: data.instance.status,
        token: data.token
      };
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      throw error;
    }
  },

  // Conectar uma instância existente (gera QR code)
  async connectInstance(instanceToken: string): Promise<any> {
    try {
      // Seguindo exatamente a documentação da API uazapiGO
      // Não passamos o parâmetro "phone" para obter o QR code
      const response = await fetch(`${API_URL}/instance/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": instanceToken
        },
        // Enviamos um objeto vazio conforme a documentação
        body: JSON.stringify({})
      });

      // Verifica se a resposta está OK
      if (!response.ok) {
        throw new Error(`Erro ao conectar instância: ${response.status}`);
      }

      // Retorna os dados exatamente como vieram da API
      return await response.json();
    } catch (error) {
      console.error("Erro ao conectar instância:", error);
      throw error;
    }
  },

  // Obter o status atual da instância
  async getInstanceStatus(instanceToken: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/instance/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "token": instanceToken
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao verificar status da instância:", errorData);
        throw new Error(errorData.message || "Não foi possível verificar o status da instância");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao verificar status da instância:", error);
      throw error;
    }
  },

  // Desconectar uma instância
  async disconnectInstance(instanceToken: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/instance/logout`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "token": instanceToken
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao desconectar instância: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao desconectar instância:", error);
      throw error;
    }
  },

  // Obter todas as instâncias (apenas para admin)
  async getAllInstances(): Promise<WhatsAppInstance[]> {
    try {
      const response = await fetch(`${API_URL}/instance/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "admintoken": ADMIN_TOKEN
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter instâncias: ${response.statusText}`);
      }

      const data = await response.json();
      return data.instances.map((instance: any) => ({
        id: instance.id,
        instanceName: instance.name,
        status: instance.status,
        user: {
          name: instance.user?.name,
          id: instance.user?.id,
          profilePictureUrl: instance.user?.profilePictureUrl
        }
      }));
    } catch (error) {
      console.error("Erro ao obter instâncias:", error);
      throw error;
    }
  },

  // Encontrar instância por usuário
  async findInstanceByUserId(userId: string): Promise<WhatsAppInstance | null> {
    try {
      // Obter todas as instâncias usando a API de admin
      const response = await fetch(`${API_URL}/instance/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "admintoken": ADMIN_TOKEN
        }
      });

      if (!response.ok) {
        console.error("Erro ao obter instâncias:", response.statusText);
        return null;
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        console.error("Formato de resposta inesperado na listagem de instâncias");
        return null;
      }
      
      // Encontrar a instância onde adminField01 corresponde ao ID do usuário
      const userInstance = data.find((instance: any) => instance.adminField01 === userId);
      
      if (!userInstance) {
        console.log(`Nenhuma instância encontrada para o usuário com ID ${userId}`);
        return null;
      }
      
      return {
        id: userInstance.id,
        instanceName: userInstance.name || userInstance.instanceName,
        status: userInstance.status,
        token: userInstance.token || userInstance.id,
        user: {
          name: userInstance.user?.name,
          id: userInstance.user?.id,
          profilePictureUrl: userInstance.user?.profilePictureUrl
        }
      };
    } catch (error) {
      console.error("Erro ao buscar instância do usuário:", error);
      return null;
    }
  }
};