import axios from 'axios';

/**
 * Interface para os parâmetros de mensagem de texto
 */
interface SendTextParams {
  number: string;
  text: string;
  options?: {
    delay?: number;
    linkPreview?: boolean;
  };
}

/**
 * Interface para os parâmetros de mensagem de áudio
 */
interface SendAudioParams {
  number: string;
  audio: string; // URL ou base64
  options?: {
    delay?: number;
  };
}

/**
 * Interface para a resposta padrão da API
 */
interface EvolutionApiResponse {
  status: boolean;
  message: string;
  [key: string]: any;
}

/**
 * Serviço para integração com a Evolution API para WhatsApp
 */
export class EvolutionAPIService {
  private baseUrl: string;
  private token: string;
  private instance: string;

  /**
   * Construtor do serviço da Evolution API
   * 
   * @param baseUrl URL base da API (Ex: https://evolution-evolution.ad2edf.easypanel.host)
   * @param token Token de autenticação
   * @param instance Nome da instância do WhatsApp
   */
  constructor(baseUrl: string, token: string, instance: string) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.instance = instance;
  }

  /**
   * Obtém o status da instância do WhatsApp
   * 
   * @returns Resposta com o status da instância
   */
  async getInstanceStatus(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/instance/info/${this.instance}`,
        {
          headers: this.getHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao obter status da instância');
    }
  }

  /**
   * Configura o webhook para receber notificações
   * 
   * @param url URL do webhook
   * @returns Resposta da configuração do webhook
   */
  async setWebhook(url: string): Promise<EvolutionApiResponse> {
    try {
      // Verificar se a instância existe antes de configurar o webhook
      try {
        await this.getInstanceStatus();
      } catch (err) {
        // Se a instância não existir, tenta criar
        console.log("Instância não encontrada, tentando criar...");
        await this.createInstance();
      }
      
      // Configurar webhook com autenticação adequada
      const response = await axios.post(
        `${this.baseUrl}/webhook/set/${this.instance}`,
        {
          url: url,
          enabled: true,
          webhookEvents: {
            allMessages: true,
            presences: false,
            statuses: true
          }
        },
        {
          headers: this.getHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Erro ao configurar webhook');
    }
  }

  /**
   * Cria uma nova instância no Evolution API
   * 
   * @returns Resposta da criação da instância
   */
  async createInstance(): Promise<EvolutionApiResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/instance/create`,
        {
          instanceName: this.instance
        },
        {
          headers: this.getHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Erro ao criar instância');
    }
  }

  /**
   * Envia uma mensagem de texto para um número
   * 
   * @param params Parâmetros da mensagem
   * @returns Resposta do envio
   */
  async sendText(params: SendTextParams): Promise<EvolutionApiResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/message/text/${this.instance}`,
        {
          number: params.number,
          text: params.text,
          options: params.options || {}
        },
        {
          headers: this.getHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Erro ao enviar mensagem de texto');
    }
  }

  /**
   * Envia uma mensagem de áudio para um número
   * 
   * @param params Parâmetros da mensagem de áudio
   * @returns Resposta do envio
   */
  async sendAudio(params: SendAudioParams): Promise<EvolutionApiResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/message/audio/${this.instance}`,
        {
          number: params.number,
          audio: params.audio,
          options: params.options || {}
        },
        {
          headers: this.getHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Erro ao enviar mensagem de áudio');
    }
  }

  /**
   * Configura um chatbot no Evolution API
   * 
   * @param config Configuração do chatbot
   * @returns Resposta da configuração
   */
  async configureChatbot(config: any): Promise<EvolutionApiResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chatbot/set/${this.instance}`,
        config,
        {
          headers: this.getHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Erro ao configurar chatbot');
    }
  }

  /**
   * Retorna os cabeçalhos padrão para as requisições
   * 
   * @returns Cabeçalhos HTTP
   */
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'ApiKey': this.token
    };
  }

  /**
   * Trata erros das requisições
   * 
   * @param error Erro ocorrido
   * @param defaultMessage Mensagem padrão
   * @returns Erro tratado
   */
  private handleError(error: any, defaultMessage: string = 'Erro na requisição'): never {
    let errorMessage = defaultMessage;
    
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        errorMessage = `${defaultMessage}: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `${defaultMessage}: ${error.message}`;
      }
      
      console.error('Erro na Evolution API:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      });
    } else {
      console.error('Erro desconhecido na Evolution API:', error);
    }
    
    throw new Error(errorMessage);
  }
}
