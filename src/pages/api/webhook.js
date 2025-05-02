// API Webhook para receber mensagens do Uazapi
import { createClient } from '@supabase/supabase-js'
import { processAudio } from '../../lib/audio-processor'
import { processIntent } from '../../lib/intent-processor'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido')
  }

  try {
    console.log('Webhook recebido:', JSON.stringify(req.body))
    
    // Verificar diferentes formatos de mensagem
    const message = req.body.body?.message || req.body.message || req.body
    if (!message) {
      console.log('Formato de mensagem não reconhecido:', JSON.stringify(req.body))
      return res.status(400).json({ error: 'Formato de mensagem inválido' })
    }

    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_ANON_KEY
    )

    // Obter o establishment_id da configuração
    const { data: configData, error: configError } = await supabase
      .from('whatsapp_ia_config')
      .select('id, establishment_id')
      .limit(1)
      .single()

    if (configError) {
      console.error('Erro ao obter configuração:', configError)
      return res.status(500).json({ error: 'Falha ao obter configuração do WhatsApp IA' })
    }

    // Extrair dados da mensagem suportando diferentes formatos
    const sender = message.sender || message.from || message.key?.remoteJid
    const messageType = message.type || (message.message?.audioMessage ? 'audio' : 
                                        message.message?.conversation ? 'text' : 'unknown')
    const messageContent = message.content || message.body || 
                           message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || 
                           'Conteúdo não identificado'
    const messageId = message.messageid || message.id || message.key?.id

    // Registrar mensagem recebida
    const { data: interaction, error } = await supabase
      .from('whatsapp_ia_messages')
      .insert({
        establishment_id: configData.establishment_id,
        client_phone: sender,
        message_type: messageType,
        message_content: messageContent,
        original_payload: JSON.stringify(req.body),
        is_from_client: true,
        created_at: new Date().toISOString(),
        processed: false,
        status: 'recebida'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao registrar mensagem:', error)
      return res.status(500).json({ error: 'Falha ao registrar mensagem' })
    }

    // Processar mensagem com base no tipo
    if (messageType === 'media' || messageType === 'audio' || messageType === 'voice' || 
        message.message?.audioMessage) {
      console.log('Processando áudio, ID da mensagem:', messageId)
      // Iniciar processamento de áudio assincronamente
      processAudio({
        messageId: interaction.id,
        mediaId: messageId,
        sender: sender,
        establishmentId: configData.establishment_id
      })
    } else if (messageType === 'text' || message.message?.conversation || 
              message.message?.extendedTextMessage) {
      console.log('Processando texto:', messageContent)
      // Processar texto diretamente
      processIntent({
        interactionId: interaction.id,
        text: messageContent,
        sender: sender,
        establishmentId: configData.establishment_id
      })
    }

    // Resposta imediata para o webhook (processamento continua em background)
    return res.status(200).json({ 
      success: true, 
      message: 'Mensagem recebida e está sendo processada',
      interactionId: interaction.id
    })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return res.status(500).json({ error: error.message })
  }
}
