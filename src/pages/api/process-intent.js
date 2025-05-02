// API para processar intenções de texto das mensagens do WhatsApp
import { processIntent } from '../../lib/intent-processor'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { interactionId, text, sender, token, establishmentId } = req.body

    if (!interactionId || !text || !sender) {
      return res.status(400).json({ error: 'Parâmetros incompletos' })
    }

    // Iniciar processamento assíncrono
    processIntent({
      interactionId,
      text,
      sender,
      token: token || process.env.UAZAPI_TOKEN,
      establishmentId
    })

    return res.status(200).json({ success: true, message: 'Processamento de intenção iniciado' })
  } catch (error) {
    console.error('Erro na API de processamento de intenção:', error)
    return res.status(500).json({ error: error.message })
  }
}
