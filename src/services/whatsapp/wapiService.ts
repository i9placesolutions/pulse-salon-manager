// Serviço de integração com a W-API (API do WhatsApp)
import axios from 'axios';

export interface WAPIConfig {
  instanceId: string;
  token: string;
}

export interface WhatsAppMessage {
  phone: string;
  type: 'text' | 'audio' | 'image' | 'video' | 'document';
  content: string;
  filename?: string;
  caption?: string;
}

class WAPIService {
  private baseUrl: string = 'https://api.w-api.app';
  private instanceId: string;
  private token: string;

  constructor(config: WAPIConfig) {
    this.instanceId = config.instanceId;
    this.token = config.token;
  }

  // Verificar status de conexão da instância
  async checkConnectionStatus(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/instance/info`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          params: {
            instanceId: this.instanceId
          }
        }
      );

      const data = response.data;
      return data && !data.error && data.status === 'connected';
    } catch (error) {
      console.error('Erro ao verificar status da conexão W-API:', error);
      return false;
    }
  }

  // Enviar mensagem de texto
  async sendTextMessage(phone: string, text: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/messages/text`,
        { text },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          params: {
            instanceId: this.instanceId,
            phone
          }
        }
      );

      const data = response.data;
      return data && !data.error;
    } catch (error) {
      console.error('Erro ao enviar mensagem de texto W-API:', error);
      return false;
    }
  }

  // Configurar webhook
  async configureWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/v1/instance/webhook`,
        { 
          url: webhookUrl,
          events: ["messages", "status"]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          params: {
            instanceId: this.instanceId
          }
        }
      );

      const data = response.data;
      return data && !data.error;
    } catch (error) {
      console.error('Erro ao configurar webhook W-API:', error);
      return false;
    }
  }

  // Obter QR Code
  async getQRCode(): Promise<string | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/instance/qrcode`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          params: {
            instanceId: this.instanceId
          }
        }
      );

      const data = response.data;
      if (data && !data.error && data.qrcode) {
        return data.qrcode;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter QR Code W-API:', error);
      return null;
    }
  }

  // Identificar o tipo de mensagem baseada nos dados do webhook
  static determineMessageType(webhookData: any): 'text' | 'audio' | 'image' | 'video' | 'document' | null {
    try {
      if (webhookData?.message?.text?.body) {
        return 'text';
      } else if (webhookData?.message?.audio) {
        return 'audio';
      } else if (webhookData?.message?.image) {
        return 'image';
      } else if (webhookData?.message?.video) {
        return 'video';
      } else if (webhookData?.message?.document) {
        return 'document';
      }
      return null;
    } catch (error) {
      console.error('Erro ao determinar tipo de mensagem:', error);
      return null;
    }
  }

  // Extrair conteúdo da mensagem com base no tipo
  static extractMessageContent(webhookData: any): string {
    try {
      const messageType = WAPIService.determineMessageType(webhookData);
      
      switch(messageType) {
        case 'text':
          return webhookData.message.text.body;
        case 'audio':
          return webhookData.message.audio.url || webhookData.message.audio.id || '';
        case 'image':
          return webhookData.message.image.url || webhookData.message.image.id || '';
        case 'video':
          return webhookData.message.video.url || webhookData.message.video.id || '';
        case 'document':
          return webhookData.message.document.url || webhookData.message.document.id || '';
        default:
          return '';
      }
    } catch (error) {
      console.error('Erro ao extrair conteúdo da mensagem:', error);
      return '';
    }
  }

  // Extrair número de telefone do remetente
  static extractSenderPhone(webhookData: any): string {
    try {
      return webhookData?.from || webhookData?.sender || '';
    } catch (error) {
      console.error('Erro ao extrair telefone do remetente:', error);
      return '';
    }
  }
}

export default WAPIService;
