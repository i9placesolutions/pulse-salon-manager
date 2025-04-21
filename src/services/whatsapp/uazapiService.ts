// Serviço de integração com o Uazapi para WhatsApp
import axios from 'axios';

interface UazapiConfig {
  instance: string;
  token: string;
}

export interface WhatsAppMessage {
  type: 'text' | 'audio' | 'image' | 'video' | 'document';
  content: string;
  phone: string;
  isFromClient?: boolean;
}

class UazapiService {
  private instance: string;
  private token: string;
  private baseUrl: string;
  
  constructor(config: UazapiConfig) {
    this.instance = config.instance;
    this.token = config.token;
    this.baseUrl = `https://i9place3.uazapi.com`;
  }
  
  // Método para verificar se a instância está conectada
  async checkConnectionStatus(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/instance/status`,
        {
          headers: {
            'token': this.token
          }
        }
      );
      
      console.log('Status da instância:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.instance) {
        // Verifica se o status é "connected" ou "authenticated"
        const status = response.data.instance.status;
        return status === 'connected' || status === 'authenticated';
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar status da instância:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.status, error.response.data);
      }
      return false;
    }
  }
  
  // Método para enviar mensagem de texto
  async sendTextMessage(to: string, text: string): Promise<boolean> {
    try {
      // Verificar primeiro se a instância está conectada
      const isConnected = await this.checkConnectionStatus();
      if (!isConnected) {
        console.error('Não foi possível enviar a mensagem: instância não está conectada.');
        return false;
      }
      
      // Certifica-se que o número está formatado corretamente
      const formattedNumber = this.formatPhoneNumber(to);
      
      console.log(`Enviando mensagem para ${formattedNumber}: ${text.substring(0, 30)}...`);
      
      const response = await axios.post(
        `${this.baseUrl}/send/text`,
        {
          number: formattedNumber,
          text: text,
          linkPreview: true,
          readchat: true,
          delay: 1200
        },
        {
          headers: {
            'token': this.token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Resposta do envio de mensagem:', response.status, response.statusText);
      console.log('Dados da resposta:', JSON.stringify(response.data));
      
      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error('Erro ao enviar mensagem via Uazapi:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.status, error.response.data);
      }
      return false;
    }
  }
  
  // Método para baixar mídia (áudio, imagem, etc.) de uma mensagem
  async downloadMedia(mediaId: string): Promise<Buffer> {
    try {
      console.log(`Baixando mídia com ID: ${mediaId}`);
      
      const response = await axios.get(
        `${this.baseUrl}/media/${mediaId}`,
        {
          headers: {
            'token': this.token
          },
          responseType: 'arraybuffer'
        }
      );
      
      console.log('Mídia baixada com sucesso, tamanho:', response.data.length);
      
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Erro ao baixar mídia via Uazapi:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.status, error.response.data);
      }
      throw new Error('Falha ao baixar mídia da mensagem');
    }
  }
  
  // Método para configurar webhook para receber mensagens
  async configureWebhook(webhookUrl: string, options?: {
    events?: string[],
    excludeMessages?: string[],
    addUrlEvents?: boolean,
    addUrlTypesMessages?: boolean
  }): Promise<boolean> {
    try {
      console.log(`Configurando webhook para URL: ${webhookUrl}`);
      
      // Eventos padrão para monitorar (se não especificado)
      const defaultEvents = ["messages", "messages_update", "connection", "status", "state-change"];
      
      // Preparar payload da requisição
      const payload = {
        enabled: true,
        url: webhookUrl,
        events: options?.events || defaultEvents,
        excludeMessages: options?.excludeMessages || ["wasSentByApi"],
        addUrlEvents: options?.addUrlEvents !== undefined ? options.addUrlEvents : false,
        addUrlTypesMessages: options?.addUrlTypesMessages !== undefined ? options.addUrlTypesMessages : false,
        action: "add"
      };
      
      console.log('Configurando webhook com os parâmetros:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        `${this.baseUrl}/webhook`,
        payload,
        {
          headers: {
            'token': this.token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Resposta da configuração de webhook:', response.status, response.statusText);
      console.log('Detalhes da resposta:', JSON.stringify(response.data, null, 2));
      
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao configurar webhook no Uazapi:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.status, error.response.data);
      }
      return false;
    }
  }
  
  // Método para remover webhook
  async removeWebhook(): Promise<boolean> {
    try {
      console.log('Removendo webhook atual...');
      
      const response = await axios.post(
        `${this.baseUrl}/webhook`,
        {
          action: "delete",
          enabled: false
        },
        {
          headers: {
            'token': this.token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Webhook removido com sucesso:', response.status, response.statusText);
      
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao remover webhook no Uazapi:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.status, error.response.data);
      }
      return false;
    }
  }
  
  // Método para verificar configuração atual do webhook
  async getWebhookStatus(): Promise<any> {
    try {
      console.log('Verificando status do webhook...');
      
      const response = await axios.get(
        `${this.baseUrl}/webhook`,
        {
          headers: {
            'token': this.token
          }
        }
      );
      
      console.log('Status do webhook:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do webhook:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.status, error.response.data);
      }
      return null;
    }
  }
  
  // Método para buscar informações do contato
  async getContactInfo(phone: string): Promise<any> {
    try {
      const formattedNumber = this.formatPhoneNumber(phone);
      
      console.log(`Buscando informações do contato: ${formattedNumber}`);
      
      const response = await axios.get(
        `${this.baseUrl}/contacts/${formattedNumber}`,
        {
          headers: {
            'token': this.token
          }
        }
      );
      
      console.log('Informações do contato recebidas');
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar informações do contato via Uazapi:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.status, error.response.data);
      }
      return null;
    }
  }
  
  // Formata o número de telefone para garantir que está no formato correto
  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Se o número não começar com +, adiciona o prefixo do Brasil
    if (!phone.startsWith('+')) {
      // Se já começar com 55, adiciona apenas o +
      if (cleaned.startsWith('55')) {
        cleaned = '+' + cleaned;
      } else {
        // Adiciona o código do Brasil
        cleaned = '+55' + cleaned;
      }
    }
    
    return cleaned;
  }
}

export default UazapiService;
