// Enviador de mensagens WhatsApp via API Uazapi/Evolution
import axios from 'axios'

export async function sendWhatsAppMessage({ to, message, token }) {
  try {
    // Verificar se é um número formatado corretamente (adicionar @c.us se necessário)
    const formattedNumber = to.includes('@') ? to : `${to}@c.us`;

    // Enviar mensagem via API Uazapi/Evolution
    const response = await axios({
      method: 'POST',
      url: 'https://api.uazapi.com/message/sendText',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'token': token
      },
      data: {
        number: formattedNumber,
        text: message,
        delay: 120 // Atraso de 120ms entre mensagens
      }
    })

    if (!response.data || !response.data.id) {
      throw new Error('Falha ao enviar mensagem')
    }

    return { success: true, messageId: response.data.id }
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return { success: false, error: error.message }
  }
}
