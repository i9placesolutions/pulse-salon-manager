// API para enviar mensagens WhatsApp
import { sendWhatsAppMessage } from '../../lib/whatsapp-sender'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { to, message, token } = req.body

    if (!to || !message) {
      return res.status(400).json({ error: 'Parâmetros incompletos' })
    }

    const result = await sendWhatsAppMessage({
      to,
      message,
      token: token || process.env.UAZAPI_TOKEN
    })

    if (!result.success) {
      throw new Error(result.error || 'Falha ao enviar mensagem')
    }

    return res.status(200).json({ success: true, messageId: result.messageId })
  } catch (error) {
    console.error('Erro na API de envio de mensagem:', error)
    return res.status(500).json({ error: error.message })
  }
}
