/**
 * Servidor Webhook para integração WhatsApp UazAPI
 * Este servidor recebe e processa eventos de webhook da UazAPI
 */

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

// Cliente Supabase para o banco principal
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://pdrzrqnkxwtxsxbtcklk.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcnpycW5reHd0eHN4YnRja2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzYzOTM0MTIsImV4cCI6MTk5MTk2OTQxMn0.D_6K9A3I5XOe1z4vJQDh9-XB67cmLQQEn5DkpONeU4E'
);

// Função para obter configuração do estabelecimento pelo token
async function getEstablishmentConfig(instanceToken) {
  try {
    console.log(`Buscando configuração para token: ${instanceToken.substring(0, 10)}...`);
    
    // Primeiro, encontrar o ID do estabelecimento que usa este token
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, whatsapp_config')
      .order('updated_at', { ascending: false })
      .limit(100);
      
    if (profilesError) {
      console.error('Erro ao buscar perfis:', profilesError);
      return null;
    }
    
    // Encontrar perfil com o token correspondente
    let establishmentId = null;
    let establishmentName = '';
    
    for (const profile of profilesData) {
      if (profile.whatsapp_config) {
        try {
          const config = typeof profile.whatsapp_config === 'string'
            ? JSON.parse(profile.whatsapp_config)
            : profile.whatsapp_config;
            
          if (config.instanceToken === instanceToken) {
            establishmentId = profile.id;
            establishmentName = config.establishmentName || 'Salão';
            console.log(`Encontrado estabelecimento: ${establishmentId}`);
            break;
          }
        } catch (e) {
          console.error('Erro ao processar configuração:', e);
        }
      }
    }
    
    if (!establishmentId) {
      console.log('Estabelecimento não encontrado para este token');
      return null;
    }
    
    // Buscar as configurações de IA do estabelecimento
    const { data: iaConfig, error: iaError } = await supabase
      .from('whatsapp_ia_config')
      .select('*')
      .eq('establishment_id', establishmentId)
      .single();
      
    if (iaError) {
      console.error('Erro ao buscar configuração da IA:', iaError);
      return null;
    }
    
    if (!iaConfig || !iaConfig.active) {
      console.log('IA não está configurada ou ativa para este estabelecimento');
      return null;
    }
    
    console.log('Configuração de IA encontrada:', {
      establishmentId,
      openaiKey: iaConfig.openai_key ? 'Presente' : 'Ausente',
      welcomeMessage: iaConfig.welcome_message?.substring(0, 30) + '...',
      active: iaConfig.active
    });
    
    return {
      establishmentId,
      establishmentName,
      openaiKey: iaConfig.openai_key,
      welcomeMessage: iaConfig.welcome_message || 'Olá! Como posso ajudar?',
      establishmentInfo: iaConfig.establishment_info || '',
      active: iaConfig.active
    };
  } catch (error) {
    console.error('Erro ao obter configuração do estabelecimento:', error);
    return null;
  }
}

// Função para salvar mensagem no banco
async function saveMessage(establishmentId, phone, content, isFromClient, messageType = 'text', audioTranscription = null) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_ia_messages')
      .insert({
        establishment_id: establishmentId,
        client_phone: phone,
        message_content: content,
        is_from_client: isFromClient,
        message_type: messageType,
        audio_transcription: audioTranscription,
        processed: true
      });
      
    if (error) {
      console.error('Erro ao salvar mensagem:', error);
    } else {
      console.log('Mensagem salva com sucesso');
    }
    
    return !error;
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    return false;
  }
}

// Função para verificar se é o primeiro contato
async function isFirstContact(establishmentId, phone) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_ia_messages')
      .select('id')
      .eq('establishment_id', establishmentId)
      .eq('client_phone', phone)
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

// Função para obter histórico de conversa
async function getConversationHistory(establishmentId, phone) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_ia_messages')
      .select('message_content, is_from_client, audio_transcription, created_at')
      .eq('establishment_id', establishmentId)
      .eq('client_phone', phone)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Erro ao buscar histórico de conversa:', error);
      return [];
    }
    
    // Inverter para ordem cronológica
    const history = data.reverse();
    
    // Converter para formato esperado pela OpenAI
    return history.map(msg => {
      const content = msg.audio_transcription || msg.message_content;
      // Papel da mensagem (user = cliente, assistant = IA)
      const role = msg.is_from_client ? 'user' : 'assistant';
      return { role, content };
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de conversa:', error);
    return [];
  }
}

// Função para formatar número de telefone
function formatPhoneNumber(phone) {
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

// Enviar mensagem via WhatsApp
async function sendWhatsAppMessage(token, phone, text) {
  try {
    console.log(`Enviando mensagem para ${phone}`);
    
    const response = await axios.post(
      'https://i9place3.uazapi.com/send/text',
      {
        number: phone,
        text: text,
        linkPreview: true,
        readchat: true,
        delay: 1200
      },
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Resposta do envio:', response.status);
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return false;
  }
}

// Processar mensagem com OpenAI
async function processWithOpenAI(apiKey, message, establishmentInfo, conversationHistory) {
  try {
    console.log('Processando mensagem com OpenAI...');
    
    const systemMessage = `Você é um assistente virtual de um salão de beleza. 
      Seja sempre cordial e profissional. 
      Informações sobre o estabelecimento: ${establishmentInfo}
      
      Suas funções principais são:
      1. Agendar horários para clientes
      2. Confirmar agendamentos existentes
      3. Reagendar horários
      4. Responder perguntas sobre serviços, preços e disponibilidade
      5. Fornecer informações gerais sobre o salão
      
      Seja direto e objetivo em suas respostas.`;
    
    // Preparar o histórico da conversa
    const messages = [
      { role: 'system', content: systemMessage },
      ...conversationHistory,
      { role: 'user', content: message }
    ];
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao processar mensagem com OpenAI:', error);
    console.error('Detalhes:', error.response?.data || error.message);
    return 'Desculpe, não foi possível processar sua mensagem no momento. Por favor, tente novamente mais tarde.';
  }
}

// Baixar e transcrever áudio
async function transcribeAudio(token, apiKey, mediaId, fileName) {
  try {
    console.log(`Baixando mídia com ID: ${mediaId}`);
    
    // Baixar o arquivo de áudio da UazAPI
    const response = await axios.get(
      `https://i9place3.uazapi.com/media/${mediaId}`,
      {
        headers: {
          'token': token
        },
        responseType: 'arraybuffer'
      }
    );
    
    console.log('Áudio baixado, tamanho:', response.data.length);
    
    // Criar FormData para enviar para a OpenAI
    const formData = new FormData();
    formData.append('file', Buffer.from(response.data), fileName);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    
    // Enviar para transcrição
    const transcriptionResponse = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Transcrição recebida');
    return transcriptionResponse.data.text.trim();
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error);
    throw new Error('Falha ao transcrever áudio');
  }
}

// Determinar o tipo de mensagem
function determineMessageType(messageData) {
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
function extractMessageContent(messageData) {
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
    return messageData.message.audioMessage.url || messageData.message.audioMessage.mediaKey;
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

// Endpoint para receber webhook
app.post('/webhook/:instanceToken', async (req, res) => {
  try {
    const { instanceToken } = req.params;
    const webhookData = req.body;
    
    console.log(`=== WEBHOOK RECEBIDO [${new Date().toISOString()}] ===`);
    console.log(`Token da instância: ${instanceToken.substring(0, 10)}...`);
    console.log(`Tipo de evento: ${webhookData.event || webhookData.type || 'Desconhecido'}`);
    
    // Validação básica
    if (!instanceToken || !webhookData) {
      console.error('Dados de webhook inválidos');
      return res.status(400).json({ success: false, message: 'Dados inválidos' });
    }
    
    // Obter configuração para este token
    const config = await getEstablishmentConfig(instanceToken);
    
    if (!config) {
      console.error('Configuração não encontrada para este token');
      return res.status(404).json({ success: false, message: 'Configuração não encontrada' });
    }
    
    // Verificar se a IA está ativa para este estabelecimento
    if (!config.active || !config.openaiKey) {
      console.log('IA não está ativa ou sem chave OpenAI, ignorando webhook');
      return res.status(200).json({ success: true, message: 'IA não está ativa, webhook ignorado' });
    }
    
    // Garantir que estamos processando um evento de mensagem
    const isMessageEvent = webhookData.event === 'messages' || 
                          webhookData.type === 'message' || 
                          webhookData.messages;
                          
    // Obter os dados da mensagem
    const messageData = webhookData.data || 
                        webhookData.message || 
                        (webhookData.messages && webhookData.messages[0]) || 
                        webhookData;
    
    if (!isMessageEvent || !messageData) {
      console.log('Evento não é de mensagem ou sem dados de mensagem');
      return res.status(200).json({ success: true, message: 'Evento não processável' });
    }
    
    // Verificar se a mensagem foi enviada pelo usuário (não pelo bot)
    const isFromClient = !messageData.fromMe;
    
    if (!isFromClient) {
      console.log('Mensagem enviada por mim, ignorando');
      return res.status(200).json({ success: true, message: 'Mensagem própria ignorada' });
    }
    
    // Extrair informações da mensagem
    const phone = formatPhoneNumber(messageData.from || messageData.key?.remoteJid || messageData.chat?.id);
    if (!phone) {
      console.error('Telefone não encontrado na mensagem');
      return res.status(400).json({ success: false, message: 'Telefone não encontrado' });
    }
    
    // Determinar tipo de mensagem e conteúdo
    const messageType = determineMessageType(messageData);
    let messageContent = extractMessageContent(messageData);
    
    console.log(`Mensagem de ${phone}: tipo=${messageType}, conteúdo="${messageContent.substring(0, 30)}..."`);
    
    // Verificar se é o primeiro contato
    const firstContact = await isFirstContact(config.establishmentId, phone);
    
    // Salvar mensagem recebida
    await saveMessage(config.establishmentId, phone, messageContent, true, messageType);
    
    // Se for o primeiro contato, enviar mensagem de boas-vindas
    if (firstContact) {
      console.log('Primeiro contato detectado, enviando mensagem de boas-vindas');
      
      // Enviar mensagem de boas-vindas
      await sendWhatsAppMessage(instanceToken, phone, config.welcomeMessage);
      
      // Salvar a mensagem de boas-vindas
      await saveMessage(config.establishmentId, phone, config.welcomeMessage, false, 'text');
      
      // Resposta do webhook
      return res.status(200).json({ 
        success: true, 
        message: 'Mensagem de boas-vindas enviada',
        isFirstContact: true
      });
    }
    
    // Se for áudio, transcrever
    let transcription = null;
    if (messageType === 'audio') {
      try {
        console.log('Recebido áudio, iniciando transcrição...');
        transcription = await transcribeAudio(
          instanceToken,
          config.openaiKey,
          messageContent,
          `audio_${Date.now()}.mp3`
        );
        
        console.log(`Áudio transcrito: "${transcription.substring(0, 100)}..."`);
        
        // Atualizar a mensagem com a transcrição
        const { error } = await supabase
          .from('whatsapp_ia_messages')
          .update({ audio_transcription: transcription })
          .eq('establishment_id', config.establishmentId)
          .eq('client_phone', phone)
          .eq('message_content', messageContent)
          .eq('is_from_client', true)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Erro ao atualizar transcrição:', error);
        }
        
        // Usar transcrição como conteúdo
        messageContent = transcription;
      } catch (error) {
        console.error('Erro ao transcrever áudio:', error);
        
        // Enviar mensagem de erro
        await sendWhatsAppMessage(
          instanceToken, 
          phone, 
          "Desculpe, não consegui entender o áudio. Poderia enviar novamente como texto?"
        );
        
        // Salvar mensagem
        await saveMessage(
          config.establishmentId, 
          phone, 
          "Desculpe, não consegui entender o áudio. Poderia enviar novamente como texto?", 
          false
        );
        
        return res.status(200).json({ 
          success: true, 
          message: 'Erro ao processar áudio, resposta enviada',
          error: error.message
        });
      }
    }
    
    // Buscar histórico da conversa
    const conversationHistory = await getConversationHistory(config.establishmentId, phone);
    
    // Processar com OpenAI
    const aiResponse = await processWithOpenAI(
      config.openaiKey,
      messageContent,
      config.establishmentInfo,
      conversationHistory
    );
    
    console.log(`Resposta da IA: "${aiResponse.substring(0, 100)}..."`);
    
    // Salvar resposta
    await saveMessage(config.establishmentId, phone, aiResponse, false);
    
    // Enviar resposta
    await sendWhatsAppMessage(instanceToken, phone, aiResponse);
    
    // Responder ao webhook
    return res.status(200).json({ 
      success: true, 
      message: 'Mensagem processada com sucesso',
      response: aiResponse.substring(0, 50) + '...'
    });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar webhook',
      error: error.message || 'Erro desconhecido'
    });
  }
});

// Endpoint de verificação de status
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'WhatsApp AI Webhook'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor webhook do WhatsApp em execução na porta ${PORT}`);
  console.log(`Endpoint de webhook: http://localhost:${PORT}/webhook/:instanceToken`);
  console.log(`Verifique o status em: http://localhost:${PORT}/status`);
});

export default app;
