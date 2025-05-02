// API para processar intenção de mensagem manualmente
import { createClient } from '@supabase/supabase-js'
import { processIntent } from '../../../lib/intent-processor'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido')
  }

  try {
    const { interactionId, text, token } = req.body

    if (!interactionId || !text) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios não informados' })
    }

    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    )

    // Obter detalhes da interação
    const { data: interaction, error: getError } = await supabase
      .from('whatsapp_ia_messages')
      .select('*')
      .eq('id', interactionId)
      .single()

    if (getError) {
      console.error('Erro ao obter detalhes da interação:', getError)
      return res.status(500).json({ error: 'Falha ao obter detalhes da interação' })
    }

    // Atualizar o campo de transcrição editada
    const { error: updateError } = await supabase
      .from('whatsapp_ia_messages')
      .update({ 
        edited_transcription: text,
        status: 'processando_intenção'
      })
      .eq('id', interactionId)

    if (updateError) {
      console.error('Erro ao atualizar transcrição:', updateError)
      return res.status(500).json({ error: 'Falha ao atualizar transcrição' })
    }

    // Processar a intenção (async)
    processIntent({
      interactionId,
      text,
      sender: interaction.sender,
      token,
      establishmentId: interaction.establishment_id
    })

    return res.status(200).json({ 
      success: true, 
      message: 'Processamento de intenção iniciado'
    })

  } catch (error) {
    console.error('Erro ao processar intenção:', error)
    return res.status(500).json({ error: error.message })
  }
}
