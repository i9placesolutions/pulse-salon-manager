import express, { Request, Response } from 'express';
import { supabase } from '@/lib/supabaseClient';
import { OpenAIService } from '@/services/ia/openaiService';
import { EvolutionAPIService } from '@/services/whatsapp/evolutionApiService';
import axios from 'axios';

const router = express.Router();

/**
 * Webhook para receber mensagens do WhatsApp via Evolution API
 */
router.post('/webhook', async (req: Request, res: Response) => {
  // Registrar o webhook recebido para debug
  try {
    await supabase.from('whatsapp_webhook_logs').insert({
      payload: req.body,
      headers: req.headers,
      received_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao registrar webhook:', error);
    // Continuamos mesmo se o log falhar
  }

  try {
    // Verificar se é uma mensagem válida
    const webhookData = req.body;
    
    // Ignorar eventos que não são mensagens
    if (!webhookData || !webhookData.data || webhookData.event !== 'messages.upsert') {
      return res.status(200).json({ status: 'ignored', message: 'Evento não relevante' });
    }
    
    const message = webhookData.data;
    
    // Ignorar mensagens enviadas pelo próprio bot ou de status
    if (message.key?.fromMe || message.messageType === 'protocolMessage') {
      return res.status(200).json({ status: 'ignored', message: 'Mensagem do bot ou status' });
    }

    // Buscar configuração atual de IA
    const { data: config, error: configError } = await supabase
      .from('whatsapp_ia_config')
      .select('*')
      .limit(1)
      .single();

    if (configError || !config) {
      console.error('Configuração de IA não encontrada:', configError);
      return res.status(500).json({ error: 'Configuração de IA não encontrada' });
    }

    // Verificar se a resposta automática está ativada
    if (!config.auto_response_enabled) {
      return res.status(200).json({ status: 'ignored', message: 'Auto-resposta desativada' });
    }

    // Extrair dados da mensagem
    const sender = message.key.remoteJid;
    let content = '';
    let messageType = '';

    // Extrair o conteúdo com base no tipo de mensagem
    if (message.message?.conversation) {
      content = message.message.conversation;
      messageType = 'text';
    } else if (message.message?.extendedTextMessage?.text) {
      content = message.message.extendedTextMessage.text;
      messageType = 'text';
    } else if (message.message?.audioMessage) {
      messageType = 'audio';
      // URL do áudio para download posterior
      const audioUrl = message.message.audioMessage.url;
      content = '[Áudio]';
      // Aqui você poderia baixar e transcrever o áudio (implementado depois)
    } else if (message.message?.imageMessage) {
      content = message.message.imageMessage.caption || '[Imagem sem legenda]';
      messageType = 'image';
    } else {
      content = '[Tipo de mensagem não suportado]';
      messageType = 'unknown';
    }

    // Registrar a mensagem recebida
    const { data: savedMessage, error: messageError } = await supabase
      .from('whatsapp_ia_messages')
      .insert({
        sender,
        content,
        message_type: messageType,
        establishment_id: config.establishment_id,
        direction: 'incoming',
        raw_data: message
      })
      .select()
      .single();

    if (messageError) {
      console.error('Erro ao salvar mensagem:', messageError);
      return res.status(500).json({ error: 'Erro ao processar mensagem' });
    }

    // Buscar dados do estabelecimento
    const { data: establishment, error: estError } = await supabase
      .from('establishments')
      .select('*')
      .eq('id', config.establishment_id)
      .single();

    if (estError || !establishment) {
      console.error('Estabelecimento não encontrado:', estError);
      return res.status(500).json({ error: 'Estabelecimento não encontrado' });
    }

    // Buscar histórico de mensagens recentes com este remetente
    const { data: conversationHistory, error: historyError } = await supabase
      .from('whatsapp_ia_messages')
      .select('id, content, direction, response, created_at')
      .eq('sender', sender)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('Erro ao buscar histórico de conversa:', historyError);
      // Continuamos mesmo sem o histórico completo
    }

    // Preparar histórico no formato para o ChatGPT
    const formattedHistory = (conversationHistory || [])
      .filter(msg => msg.id !== savedMessage.id) // Excluir a mensagem atual
      .map(msg => {
        if (msg.direction === 'incoming') {
          return { role: 'user' as const, content: msg.content };
        } else {
          return { role: 'assistant' as const, content: msg.response || '' };
        }
      });

    // Construir contexto para o prompt
    const context = {
      estabelecimento: establishment.name || '',
      endereco: establishment.address || '',
      telefone: establishment.phone || '',
      horario: establishment.business_hours || '9h às 19h',
      servicos: establishment.services_description || 'Corte, coloração, tratamentos e outros serviços de beleza.'
    };

    // Processar a mensagem com OpenAI
    const openaiService = new OpenAIService(config.openai_key);
    let aiResponse;

    try {
      // Se for áudio e tivermos a URL, baixar e transcrever primeiro
      if (messageType === 'audio' && message.message?.audioMessage?.url) {
        // Implementação para download e transcrição de áudio (simplificado)
        try {
          const audioUrl = message.message.audioMessage.url;
          // Baixar o áudio
          const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
          const audioBuffer = Buffer.from(audioResponse.data);
          
          // Transcrever com OpenAI
          const transcription = await openaiService.transcribeAudio(
            audioBuffer,
            'audio.mp3'
          );
          
          // Atualizar o conteúdo para a transcrição
          content = transcription;
          
          // Atualizar a mensagem com a transcrição
          await supabase
            .from('whatsapp_ia_messages')
            .update({ content: `[Áudio] Transcrição: ${transcription}` })
            .eq('id', savedMessage.id);
        } catch (transcriptError) {
          console.error('Erro na transcrição:', transcriptError);
          content = '[Não foi possível transcrever o áudio]';
        }
      }

      // Agora processar com ChatGPT
      aiResponse = await openaiService.processMessage(
        config.prompt_template,
        content,
        context,
        formattedHistory
      );
    } catch (aiError) {
      console.error('Erro ao processar com OpenAI:', aiError);
      aiResponse = "Desculpe, estou com dificuldades para processar sua mensagem no momento. Um atendente entrará em contato em breve.";
    }

    // Enviar resposta via Evolution API
    const evolutionService = new EvolutionAPIService(
      config.evolution_url || 'https://evolution-evolution.ad2edf.easypanel.host',
      config.evolution_token,
      config.evolution_instance
    );

    await evolutionService.sendText({
      number: sender.replace('@s.whatsapp.net', ''),
      text: aiResponse,
      options: {
        delay: 1000,
        linkPreview: true
      }
    });

    // Registrar a resposta enviada
    await supabase
      .from('whatsapp_ia_messages')
      .update({
        response: aiResponse,
        processed_at: new Date().toISOString()
      })
      .eq('id', savedMessage.id);

    return res.status(200).json({
      status: 'success',
      message: 'Mensagem processada com sucesso',
      response: aiResponse
    });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao processar webhook',
      error: error.message
    });
  }
});

export default router;
