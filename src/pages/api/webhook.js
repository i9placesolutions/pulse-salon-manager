// API Webhook para receber mensagens do Uazapi
import { createClient } from '@supabase/supabase-js'
import { processAudio } from '../../lib/audio-processor'
import { processIntent } from '../../lib/intent-processor'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido')
  }

  try {
    const message = req.body.body?.message || req.body.message
    if (!message) {
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

    // Registrar mensagem recebida
    const { data: interaction, error } = await supabase
      .from('whatsapp_ia_messages')
      .insert({
        establishment_id: configData.establishment_id,
        client_phone: message.sender || message.from,
        message_type: message.type,
        message_content: message.content || message.body,
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
    if (message.type === 'media' || message.type === 'audio' || message.type === 'voice') {
      // Iniciar processamento de áudio assincronamente
      processAudio({
        messageId: interaction.id,
        mediaId: message.messageid || message.id,
        sender: message.sender || message.from,
        establishmentId: configData.establishment_id
      })
    } else if (message.type === 'text') {
      // Processar texto diretamente
      processIntent({
        interactionId: interaction.id,
        text: message.content || message.body,
        sender: message.sender || message.from,
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
