// Processador de áudios recebidos via WhatsApp
import { createClient } from '@supabase/supabase-js'
import { processIntent } from './intent-processor'
import axios from 'axios'

export async function processAudio({ messageId, mediaId, sender, establishmentId }) {
  try {
    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    )

    // Atualizar status para processando
    await supabase
      .from('whatsapp_ia_messages')
      .update({ status: 'transcrevendo_audio' })
      .eq('id', messageId)

    // Obter configuração e tokens do WhatsApp
    const { data: config, error: configError } = await supabase
      .from('whatsapp_ia_config')
      .select('openai_key, uazapi_token, evolution_token')
      .eq('establishment_id', establishmentId)
      .single()

    if (configError) {
      throw new Error(`Erro ao obter configuração: ${configError.message}`)
    }

    // Determinar qual token usar (evolution ou uazapi)
    const token = config.evolution_token || config.uazapi_token

    // Baixar o áudio via API Uazapi/Evolution
    const downloadResponse = await axios({
      method: 'POST',
      url: 'https://api.uazapi.com/message/download',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'token': token
      },
      data: {
        id: mediaId,
        transcribe: true,
        openai_apikey: config.openai_key || process.env.OPENAI_API_KEY
      }
    })

    if (!downloadResponse.data || !downloadResponse.data.transcription) {
      throw new Error('Falha ao transcrever áudio')
    }

    const transcription = downloadResponse.data.transcription

    // Atualizar interação com a transcrição
    await supabase
      .from('whatsapp_ia_messages')
      .update({ 
        audio_transcription: transcription,
        status: 'transcrito'
      })
      .eq('id', messageId)

    // Processar o texto transcrito
    await processIntent({
      interactionId: messageId,
      text: transcription,
      sender,
      establishmentId,
      isTranscribed: true
    })

    return { success: true, transcription }
  } catch (error) {
    console.error('Erro ao processar áudio:', error)
    
    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    )

    // Registrar erro
    await supabase
      .from('whatsapp_ia_messages')
      .update({ 
        status: 'erro_transcricao',
        processing_error: error.message
      })
      .eq('id', messageId)

    return { success: false, error: error.message }
  }
}
