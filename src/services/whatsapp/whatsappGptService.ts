// Serviço de integração do WhatsApp com ChatGPT
import { supabase } from '../../lib/supabaseClient';
import ChatGPTService, { ChatMessage } from '../openai/chatgptService';
import WAPIService, { WhatsAppMessage } from './wapiService';

interface IAConfigProps {
  id?: string;
  establishment_id: string;
  openai_key: string;
  instance_id: string;
  instance_token: string;
  active: boolean;
  welcome_message: string;
  establishment_info: string;
}

class WhatsAppGPTService {
  private establishmentId: string;
  private chatGPTService: ChatGPTService | null = null;
  private wapiService: WAPIService | null = null;
  private config: IAConfigProps | null = null;
  
  constructor(establishmentId: string) {
    this.establishmentId = establishmentId;
  }
  
  // Inicializar serviços com as credenciais do banco de dados
  async initialize(): Promise<boolean> {
    try {
      console.log(`Inicializando serviço de IA WhatsApp para o estabelecimento: ${this.establishmentId}`);
      
      // Buscar configuração da IA no banco de dados
      const { data, error } = await supabase
        .from('whatsapp_ia_config')
        .select('*')
        .eq('establishment_id', this.establishmentId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar configuração da IA:', error);
        return false;
      }
      
      if (!data || !data.active) {
        console.log('Serviço de IA não está ativo para este estabelecimento');
        return false;
      }
      
      // Usar os dados do perfil para a instância e token
      this.config = {
        ...data,
        instance_id: data.instance_id || "1U3F27-WDQ2RG-AGAT7I",
        instance_token: data.instance_token || ""
      };
      
      console.log('Inicializando serviços com as credenciais encontradas');
      
      // Inicializar serviços com as credenciais encontradas
      this.chatGPTService = new ChatGPTService(this.config.openai_key);
      this.wapiService = new WAPIService({
        instanceId: this.config.instance_id,
        token: this.config.instance_token
      });
      
      // Verificar se a conexão com o WhatsApp está funcionando
      const connected = await this.wapiService.checkConnectionStatus();
      if (!connected) {
        console.error('WhatsApp não está conectado ou as credenciais estão inválidas');
        return false;
      }
      
      console.log('Serviço de IA WhatsApp inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar serviço de IA WhatsApp:', error);
      return false;
    }
  }
  
  // Processar mensagem recebida
  async processIncomingMessage(message: WhatsAppMessage): Promise<string | null> {
    try {
      console.log(`Processando mensagem recebida: tipo=${message.type}, telefone=${message.phone}`);
      
      if (!this.chatGPTService || !this.wapiService || !this.config) {
        console.log('Serviços não inicializados, tentando inicializar...');
        const initialized = await this.initialize();
        if (!initialized) {
          console.error('Falha ao inicializar serviços');
          return null;
        }
      }
      
      let messageContent = message.content;
      let audioTranscription = null;
      
      // Se for mensagem de áudio, tentar transcrever
      if (message.type === 'audio') {
        try {
          console.log('Transcrevendo mensagem de áudio...');
          audioTranscription = await this.chatGPTService!.transcribeAudio(message.content);
          console.log('Transcrição:', audioTranscription);
          messageContent = audioTranscription || 'Não foi possível transcrever o áudio';
        } catch (transcribeError) {
          console.error('Erro ao transcrever áudio:', transcribeError);
          messageContent = 'Não foi possível transcrever o áudio';
        }
      }
      
      // Registrar mensagem recebida no banco
      await this.saveMessage({
        client_phone: message.phone,
        message_type: message.type,
        message_content: message.content,
        is_from_client: true,
        audio_transcription: audioTranscription
      });
      
      // Obter histórico de mensagens
      const history = await this.getConversationHistory(message.phone);
      
      // Preparar prompt com informações do estabelecimento
      const systemPrompt = `Você é um assistente virtual para um salão de beleza, e deve atender os clientes de forma cordial e eficiente.
As informações sobre o estabelecimento são:
${this.config.establishment_info || 'Informações não disponíveis'}.

Suas respostas devem ser concisas e diretas, em linguagem simples e amigável.`;
      
      // Gerar resposta com o ChatGPT
      console.log('Gerando resposta com o ChatGPT...');
      const response = await this.chatGPTService!.sendMessage(history, systemPrompt);
      console.log('Resposta gerada:', response);
      
      // Enviar resposta
      const sent = await this.wapiService!.sendTextMessage(message.phone, response);
      
      if (sent) {
        console.log('Resposta enviada com sucesso');
        
        // Registrar resposta no banco
        await this.saveMessage({
          client_phone: message.phone,
          message_type: 'text',
          message_content: response,
          is_from_client: false
        });
        
        return response;
      } else {
        console.error('Falha ao enviar resposta');
        return null;
      }
    } catch (error) {
      console.error('Erro ao processar mensagem recebida:', error);
      return null;
    }
  }
  
  // Processar webhook de entrada
  async processWebhook(webhookData: any): Promise<any> {
    try {
      console.log('Processando webhook recebido:', JSON.stringify(webhookData).substring(0, 200) + '...');
      
      // Verificar se é uma mensagem
      if (webhookData.event === 'message' && webhookData.data) {
        return this.handleMessageWebhook(webhookData.data);
      }
      
      // Outros tipos de eventos podem ser tratados aqui
      
      return { success: true, message: 'Webhook processado com sucesso' };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return { error: true, message: 'Erro ao processar webhook' };
    }
  }
  
  // Tratar webhook de mensagem
  private async handleMessageWebhook(messageData: any): Promise<any> {
    try {
      // Extrair dados da mensagem
      const messageType = WAPIService.determineMessageType(messageData);
      const messageContent = WAPIService.extractMessageContent(messageData);
      const phone = WAPIService.extractSenderPhone(messageData);
      
      if (!messageType || !messageContent || !phone) {
        console.error('Dados inválidos na mensagem do webhook');
        return { error: true, message: 'Dados inválidos na mensagem' };
      }
      
      console.log(`Mensagem recebida via webhook: tipo=${messageType}, telefone=${phone}`);
      
      // Verificar se é o primeiro contato deste número
      const isFirstContact = await this.isFirstContact(phone);
      
      // Se for o primeiro contato, enviar mensagem de boas-vindas
      if (isFirstContact) {
        console.log(`Primeiro contato de ${phone}, enviando mensagem de boas-vindas...`);
        await this.sendWelcomeMessage(phone);
      }
      
      // Processar a mensagem recebida
      const message: WhatsAppMessage = {
        phone,
        type: messageType,
        content: messageContent
      };
      
      const response = await this.processIncomingMessage(message);
      
      return { 
        success: true, 
        message: 'Mensagem processada com sucesso',
        response
      };
    } catch (error) {
      console.error('Erro ao processar mensagem do webhook:', error);
      return { error: true, message: 'Erro ao processar mensagem' };
    }
  }
  
  // Verificar se é o primeiro contato deste número
  private async isFirstContact(phone: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      const { data, error } = await supabase
        .from('whatsapp_ia_messages')
        .select('id')
        .eq('client_phone', formattedPhone)
        .eq('establishment_id', this.establishmentId)
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      return !data || data.length === 0;
    } catch (error) {
      console.error('Erro ao verificar se é o primeiro contato:', error);
      return false;
    }
  }
  
  // Formatar número de telefone
  private formatPhoneNumber(phone: string): string {
    try {
      // Remover caracteres não numéricos
      let cleaned = phone.replace(/\D/g, '');
      
      // Garantir que números começando com 55 (Brasil) tenham o formato correto
      if (cleaned.startsWith('55') && cleaned.length > 12) {
        cleaned = cleaned.substring(2);
      }
      
      // Adicionar prefixo do Brasil se necessário
      if (!cleaned.startsWith('55') && cleaned.length >= 10) {
        cleaned = '55' + cleaned;
      }
      
      return cleaned;
    } catch (error) {
      console.error('Erro ao formatar número de telefone:', error);
      return phone;
    }
  }
  
  // Salvar mensagem no banco de dados
  private async saveMessage({
    client_phone,
    message_type,
    message_content,
    is_from_client,
    audio_transcription = null
  }: {
    client_phone: string;
    message_type: string;
    message_content: string;
    is_from_client: boolean;
    audio_transcription?: string | null;
  }) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_ia_messages')
        .insert({
          establishment_id: this.establishmentId,
          client_phone: this.formatPhoneNumber(client_phone),
          message_type,
          message_content,
          is_from_client,
          audio_transcription
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Mensagem salva com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      return null;
    }
  }
  
  // Obter histórico recente da conversa
  private async getConversationHistory(clientPhone: string) {
    try {
      console.log(`Buscando histórico de conversa para ${clientPhone}...`);
      
      const { data, error } = await supabase
        .from('whatsapp_ia_messages')
        .select('message_content, is_from_client, audio_transcription, created_at')
        .eq('client_phone', this.formatPhoneNumber(clientPhone))
        .eq('establishment_id', this.establishmentId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      console.log(`Encontradas ${data.length} mensagens no histórico`);
      
      // Inverter para ordem cronológica
      const history = data.reverse();
      
      // Converter para formato esperado pelo ChatGPT
      return history.map(msg => {
        const content = msg.audio_transcription || msg.message_content;
        // Garantir que o role seja um dos valores aceitos pela API ChatGPT
        const role = msg.is_from_client ? 'user' : 'assistant' as 'user' | 'assistant';
        return {
          role,
          content
        };
      });
    } catch (error) {
      console.error('Erro ao buscar histórico de conversa:', error);
      return [];
    }
  }
  
  // Enviar mensagem de boas-vindas para novo contato
  async sendWelcomeMessage(phone: string) {
    try {
      console.log(`Enviando mensagem de boas-vindas para ${phone}...`);
      
      if (!this.wapiService || !this.config) {
        console.log('Serviços não inicializados, tentando inicializar...');
        const initialized = await this.initialize();
        if (!initialized) {
          console.error('Falha ao inicializar serviços');
          return false;
        }
      }
      
      // Verificar se a conexão com o WhatsApp está funcionando
      const connected = await this.wapiService!.checkConnectionStatus();
      if (!connected) {
        console.error('WhatsApp não está conectado ou as credenciais estão inválidas');
        return false;
      }
      
      // Enviar mensagem de boas-vindas
      const sent = await this.wapiService!.sendTextMessage(
        phone, 
        this.config!.welcome_message
      );
      
      if (sent) {
        console.log('Mensagem de boas-vindas enviada com sucesso');
        
        // Registrar mensagem no banco
        await this.saveMessage({
          client_phone: phone,
          message_type: 'text',
          message_content: this.config!.welcome_message,
          is_from_client: false
        });
        
        return true;
      } else {
        console.error('Falha ao enviar mensagem de boas-vindas');
        return false;
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem de boas-vindas:', error);
      return false;
    }
  }
  
  // Verificar se um token de instância é válido
  async checkInstanceToken(instanceToken: string): Promise<boolean> {
    try {
      console.log(`Verificando validade do token de instância: ${instanceToken.substring(0, 10)}...`);
      
      // Criar uma instância temporária do serviço W-API para testar o token
      const tempWAPIService = new WAPIService({
        instanceId: '1U3F27-WDQ2RG-AGAT7I',
        token: instanceToken
      });
      
      // Tentar verificar o status usando o token
      const isConnected = await tempWAPIService.checkConnectionStatus();
      
      console.log(`Token de instância ${isConnected ? 'válido' : 'inválido'}`);
      return isConnected;
    } catch (error) {
      console.error('Erro ao verificar token de instância:', error);
      return false;
    }
  }
  
  // Configurar webhook
  async configureWebhook(webhookUrl: string): Promise<boolean> {
    try {
      console.log(`Configurando webhook para ${webhookUrl}...`);
      
      if (!this.wapiService) {
        console.log('Serviço W-API não inicializado, tentando inicializar...');
        const initialized = await this.initialize();
        if (!initialized) {
          console.error('Falha ao inicializar serviço W-API');
          return false;
        }
      }
      
      const configured = await this.wapiService!.configureWebhook(webhookUrl);
      console.log(`Webhook ${configured ? 'configurado com sucesso' : 'falha ao configurar'}`);
      return configured;
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      return false;
    }
  }
}

export default WhatsAppGPTService;
