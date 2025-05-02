// API para processar áudios do WhatsApp
import { processAudio } from '../../lib/audio-processor'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { interactionId, mediaId, sender, token, establishmentId } = req.body

    if (!interactionId || !mediaId || !sender) {
      return res.status(400).json({ error: 'Parâmetros incompletos' })
    }

    // Iniciar processamento assíncrono
    processAudio({
      messageId: interactionId,
      mediaId,
      sender,
      token: token || process.env.UAZAPI_TOKEN,
      establishmentId
    })

    return res.status(200).json({ success: true, message: 'Processamento de áudio iniciado' })
  } catch (error) {
    console.error('Erro na API de processamento de áudio:', error)
    return res.status(500).json({ error: error.message })
  }
}
