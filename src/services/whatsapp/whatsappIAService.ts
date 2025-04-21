// Serviço de integração da IA com WhatsApp
import { supabase } from '../../lib/supabaseClient';
import OpenAIService from '../openai/openaiService';
import UazapiService, { WhatsAppMessage } from './uazapiService';

interface IAConfigProps {
  id?: string;
  establishment_id: string;
  openai_key: string;
  uazapi_instance: string;
  uazapi_token: string;
  active: boolean;
  welcome_message: string;
  establishment_info: string;
}

class WhatsAppIAService {
  private establishmentId: string;
  private openAIService: OpenAIService | null = null;
  private uazapiService: UazapiService | null = null;
  private config: IAConfigProps | null = null;
  
  constructor(establishmentId: string) {
    this.establishmentId = establishmentId;
  }
  
  // Inicializar serviços com as credenciais do banco de dados
  async initialize(): Promise<boolean> {
    try {
      console.log(`Inicializando serviço de IA WhatsApp para o estabelecimento: ${this.establishmentId}`);
      
      // Primeiro, buscar as configurações do perfil para obter as credenciais do WhatsApp
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('whatsapp_config')
        .eq('id', this.establishmentId)
        .single();
      
      if (profileError) {
        console.error('Erro ao buscar configuração do WhatsApp do perfil:', profileError);
        return false;
      }
      
      let uazapiInstance = '';
      let uazapiToken = '';
      
      if (profileData?.whatsapp_config) {
        const whatsappConfig = typeof profileData.whatsapp_config === 'string' 
          ? JSON.parse(profileData.whatsapp_config) 
          : profileData.whatsapp_config;
        
        uazapiInstance = whatsappConfig.instance || '';
        uazapiToken = whatsappConfig.token || '';
        console.log(`Credenciais do WhatsApp encontradas: instância=${uazapiInstance}, token=${uazapiToken ? 'presente' : 'ausente'}`);
      }
      
      if (!uazapiInstance || !uazapiToken) {
        console.error('WhatsApp não configurado no perfil do estabelecimento');
        return false;
      }
      
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
      
      // Usar os dados do perfil para a instância e token do Uazapi
      this.config = {
        ...data,
        uazapi_instance: uazapiInstance,
        uazapi_token: uazapiToken
      };
      
      console.log('Inicializando serviços com as credenciais encontradas');
      
      // Inicializar serviços com as credenciais encontradas
      this.openAIService = new OpenAIService(this.config.openai_key);
      this.uazapiService = new UazapiService({
        instance: this.config.uazapi_instance,
        token: this.config.uazapi_token
      });
      
      // Verificar se a conexão com o WhatsApp está funcionando
      const connected = await this.uazapiService.checkConnectionStatus();
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
      
      if (!this.openAIService || !this.uazapiService || !this.config) {
        console.log('Serviços não inicializados, tentando inicializar...');
        const initialized = await this.initialize();
        if (!initialized) {
          console.error('Falha ao inicializar serviços');
          return null;
        }
      }
      
      // Registrar mensagem recebida no banco
      await this.saveMessage({
        client_phone: message.phone,
        message_type: message.type,
        message_content: message.content,
        is_from_client: true
      });
      
      let processedContent = message.content;
      
      // Se for áudio, transcrever
      if (message.type === 'audio' && this.openAIService) {
        try {
          console.log('Recebido áudio, iniciando transcrição...');
          
          // Baixar o arquivo de áudio
          const mediaBuffer = await this.uazapiService!.downloadMedia(message.content);
          
          // Transcrever o áudio
          const transcription = await this.openAIService.transcribeAudio(
            mediaBuffer, 
            `audio_${Date.now()}.mp3`
          );
          
          console.log(`Áudio transcrito: "${transcription.substring(0, 100)}..."`);
          
          // Atualizar mensagem com a transcrição
          await this.updateMessageTranscription(message.phone, message.content, transcription);
          
          // Usar transcrição como conteúdo para processamento
          processedContent = transcription;
        } catch (error) {
          console.error('Erro ao transcrever áudio:', error);
          return 'Não consegui processar seu áudio. Poderia enviar sua mensagem em texto?';
        }
      }
      
      // Buscar histórico recente da conversa
      console.log('Buscando histórico da conversa...');
      const conversationHistory = await this.getConversationHistory(message.phone);
      
      // Processar mensagem com IA
      console.log('Processando mensagem com a IA...');
      const response = await this.openAIService!.processMessage(
        processedContent,
        this.config.establishment_info,
        conversationHistory as { role: 'user' | 'assistant' | 'system'; content: string }[]
      );
      
      console.log(`Resposta da IA: "${response.substring(0, 100)}..."`);
      
      // Salvar resposta no banco
      await this.saveMessage({
        client_phone: message.phone,
        message_type: 'text',
        message_content: response,
        is_from_client: false
      });
      
      // Enviar resposta
      console.log('Enviando resposta para o cliente...');
      const sent = await this.uazapiService!.sendTextMessage(message.phone, response);
      
      if (!sent) {
        console.error('Falha ao enviar resposta via WhatsApp');
      } else {
        console.log('Resposta enviada com sucesso');
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      return null;
    }
  }
  
  // Verificar status do webhook
  async checkWebhookStatus(): Promise<boolean> {
    try {
      if (!this.uazapiService) {
        const initialized = await this.initialize();
        if (!initialized) {
          return false;
        }
      }
      
      const status = await this.uazapiService!.getWebhookStatus();
      return !!(status && status.url);
    } catch (error) {
      console.error('Erro ao verificar status do webhook:', error);
      return false;
    }
  }
  
  // Configurar webhook
  async configureWebhook(webhookUrl: string): Promise<boolean> {
    try {
      if (!this.uazapiService) {
        console.log('Serviços não inicializados, tentando inicializar...');
        const initialized = await this.initialize();
        if (!initialized) {
          console.error('Não foi possível inicializar os serviços para configurar o webhook');
          return false;
        }
      }

      // Configurar webhook com parâmetros avançados
      const webhookOptions = {
        events: [
          "connection", 
          "messages", 
          "messages_update", 
          "status", 
          "state-change",
          "call",
          "contacts",
          "groups"
        ],
        excludeMessages: ["wasSentByApi"],
        addUrlEvents: true,
        addUrlTypesMessages: true
      };
      
      console.log('Configurando webhook com opções avançadas:', webhookOptions);
      
      const result = await this.uazapiService!.configureWebhook(webhookUrl, webhookOptions);
      
      console.log('Resultado da configuração do webhook:', result ? 'Sucesso' : 'Falha');
      
      return result;
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      return false;
    }
  }
  
  // Processar webhook de entrada
  async processWebhook(webhookData: any): Promise<any> {
    try {
      if (!webhookData) {
        console.error('Dados do webhook vazios');
        return { success: false, message: 'Dados do webhook vazios' };
      }
      
      console.log('Processando webhook recebido:', JSON.stringify(webhookData));
      
      // Verificar o tipo de evento do webhook
      if (webhookData.event === 'connection') {
        // Webhook de conexão - verificar status
        console.log('Evento de conexão recebido:', webhookData.status);
        return { success: true, message: 'Evento de conexão processado' };
      }
      
      // Processar mensagens recebidas
      if (webhookData.event === 'messages' && webhookData.data) {
        return await this.handleMessageWebhook(webhookData.data);
      }
      
      // Processar atualizações de mensagens
      if (webhookData.event === 'messages_update' && webhookData.data) {
        console.log('Atualização de mensagem recebida:', webhookData.data);
        return { success: true, message: 'Atualização de mensagem processada' };
      }
      
      // Processar outros tipos de eventos
      console.log('Evento de webhook não tratado:', webhookData.event);
      return { success: true, message: 'Evento recebido, mas não tratado' };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return { 
        success: false, 
        message: 'Erro ao processar webhook', 
        error: error.message || 'Erro desconhecido' 
      };
    }
  }
  
  // Tratar webhook de mensagem
  private async handleMessageWebhook(messageData: any): Promise<any> {
    try {
      // Verificar se a mensagem foi enviada pelo usuário (não pelo bot)
      const isFromClient = !messageData.fromMe;
      
      if (!isFromClient) {
        console.log('Mensagem enviada por mim, ignorando');
        return { success: true, message: 'Mensagem própria ignorada' };
      }
      
      // Extrair informações da mensagem
      const phone = messageData.from || messageData.key?.remoteJid;
      if (!phone) {
        console.error('Telefone não encontrado na mensagem');
        return { success: false, message: 'Telefone não encontrado' };
      }
      
      // Verificar se é o primeiro contato
      const isFirstContact = await this.isFirstContact(phone);
      
      // Se for o primeiro contato, enviar mensagem de boas-vindas
      if (isFirstContact) {
        console.log('Primeiro contato detectado, enviando mensagem de boas-vindas');
        await this.sendWelcomeMessage(phone);
        return { 
          success: true, 
          message: 'Primeiro contato processado, mensagem de boas-vindas enviada',
          isFirstContact: true
        };
      }
      
      // Construir objeto de mensagem para processamento
      const message: WhatsAppMessage = {
        phone: this.formatPhoneNumber(phone),
        type: this.determineMessageType(messageData),
        content: this.extractMessageContent(messageData),
        isFromClient: true
      };
      
      // Processar a mensagem com a IA
      console.log('Processando mensagem recebida com IA');
      await this.processIncomingMessage(message);
      
      return { 
        success: true, 
        message: 'Mensagem processada com sucesso',
        isFirstContact: false
      };
    } catch (error) {
      console.error('Erro ao processar mensagem do webhook:', error);
      return { 
        success: false, 
        message: 'Erro ao processar mensagem', 
        error: error.message || 'Erro desconhecido' 
      };
    }
  }
  
  // Verificar se é o primeiro contato deste número
  private async isFirstContact(phone: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // Verificar no histórico de mensagens
      const { data, error } = await supabase
        .from('whatsapp_ia_messages')
        .select('id')
        .eq('client_phone', formattedPhone)
        .eq('establishment_id', this.establishmentId)
        .limit(1);
      
      if (error) {
        console.error('Erro ao verificar histórico de mensagens:', error);
        // Em caso de erro, assumimos que não é o primeiro contato para evitar spam
        return false;
      }
      
      // É o primeiro contato se não houver mensagens no histórico
      return data.length === 0;
    } catch (error) {
      console.error('Erro ao verificar se é primeiro contato:', error);
      return false;
    }
  }
  
  // Formatar número de telefone
  private formatPhoneNumber(phone: string): string {
    // Remove caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Remove prefixos de grupos do WhatsApp
    if (cleaned.includes('@g.us')) {
      cleaned = cleaned.replace('@g.us', '');
    }
    if (cleaned.includes('@c.us')) {
      cleaned = cleaned.replace('@c.us', '');
    }
    
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
  
  // Determinar o tipo de mensagem com base nos dados recebidos
  private determineMessageType(messageData: any): 'text' | 'audio' | 'image' | 'video' | 'document' {
    if (messageData.message?.conversation || messageData.message?.extendedTextMessage) {
      return 'text';
    }
    
    if (messageData.message?.audioMessage) {
      return 'audio';
    }
    
    if (messageData.message?.imageMessage) {
      return 'image';
    }
    
    if (messageData.message?.videoMessage) {
      return 'video';
    }
    
    if (messageData.message?.documentMessage) {
      return 'document';
    }
    
    // Padrão: texto
    return 'text';
  }
  
  // Extrair o conteúdo da mensagem
  private extractMessageContent(messageData: any): string {
    // Mensagem de texto normal
    if (messageData.message?.conversation) {
      return messageData.message.conversation;
    }
    
    // Mensagem de texto extendida (com formatação, menções, etc.)
    if (messageData.message?.extendedTextMessage) {
      return messageData.message.extendedTextMessage.text;
    }
    
    // Mensagem de áudio
    if (messageData.message?.audioMessage) {
      return messageData.message.audioMessage.url || "Áudio recebido";
    }
    
    // Mensagem de imagem
    if (messageData.message?.imageMessage) {
      return messageData.message.imageMessage.caption || "Imagem recebida";
    }
    
    // Mensagem de vídeo
    if (messageData.message?.videoMessage) {
      return messageData.message.videoMessage.caption || "Vídeo recebido";
    }
    
    // Mensagem de documento
    if (messageData.message?.documentMessage) {
      return messageData.message.documentMessage.fileName || "Documento recebido";
    }
    
    // Mensagem desconhecida
    return "Mensagem recebida";
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
      console.log(`Salvando mensagem: ${is_from_client ? 'do cliente' : 'do sistema'}, tipo=${message_type}`);
      
      // Verificar se o cliente já existe
      const { data: clientData } = await supabase
        .from('clients')
        .select('id, name')
        .eq('phone', client_phone)
        .single();
      
      if (clientData) {
        console.log(`Cliente encontrado: ${clientData.name}`);
      }
      
      const { data, error } = await supabase
        .from('whatsapp_ia_messages')
        .insert({
          establishment_id: this.establishmentId,
          client_phone,
          client_name: clientData?.name || null,
          message_type,
          message_content,
          is_from_client,
          audio_transcription,
          processed: true
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Mensagem salva com sucesso');
      return data[0];
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      return null;
    }
  }
  
  // Atualizar transcrição de áudio
  private async updateMessageTranscription(
    client_phone: string,
    message_content: string,
    transcription: string
  ) {
    try {
      console.log('Atualizando transcrição de áudio...');
      
      const { error } = await supabase
        .from('whatsapp_ia_messages')
        .update({
          audio_transcription: transcription
        })
        .eq('client_phone', client_phone)
        .eq('message_content', message_content)
        .eq('is_from_client', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      console.log('Transcrição atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar transcrição:', error);
      return false;
    }
  }
  
  // Obter histórico recente da conversa
  private async getConversationHistory(clientPhone: string) {
    try {
      console.log(`Buscando histórico de conversa para ${clientPhone}...`);
      
      const { data, error } = await supabase
        .from('whatsapp_ia_messages')
        .select('message_content, is_from_client, audio_transcription, created_at')
        .eq('client_phone', clientPhone)
        .eq('establishment_id', this.establishmentId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      console.log(`Encontradas ${data.length} mensagens no histórico`);
      
      // Inverter para ordem cronológica
      const history = data.reverse();
      
      // Converter para formato esperado pela OpenAI
      return history.map(msg => {
        const content = msg.audio_transcription || msg.message_content;
        // Garantir que o role seja um dos valores aceitos pela API OpenAI
        const role = msg.is_from_client ? 'user' : 'assistant' as const;
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
      
      if (!this.uazapiService || !this.config) {
        console.log('Serviços não inicializados, tentando inicializar...');
        const initialized = await this.initialize();
        if (!initialized) {
          console.error('Falha ao inicializar serviços');
          return false;
        }
      }
      
      // Verificar se a conexão com o WhatsApp está funcionando
      const connected = await this.uazapiService!.checkConnectionStatus();
      if (!connected) {
        console.error('WhatsApp não está conectado ou as credenciais estão inválidas');
        return false;
      }
      
      // Enviar mensagem de boas-vindas
      const sent = await this.uazapiService!.sendTextMessage(
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
      
      // Criar uma instância temporária do serviço UazAPI para testar o token
      const tempUazapiService = new UazapiService({
        instance: 'temp',  // O valor real não importa aqui
        token: instanceToken
      });
      
      // Tentar verificar o status usando o token
      const isConnected = await tempUazapiService.checkConnectionStatus();
      
      console.log(`Token de instância ${isConnected ? 'válido' : 'inválido'}`);
      return isConnected;
    } catch (error) {
      console.error('Erro ao verificar token de instância:', error);
      return false;
    }
  }
}

export default WhatsAppIAService;
