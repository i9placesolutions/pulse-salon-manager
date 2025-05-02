// Processador de intenções utilizando Google Gemini
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { sendWhatsAppMessage } from './whatsapp-sender'
import { checkAvailability } from './availability-checker'

export async function processIntent({ interactionId, text, sender, establishmentId, isTranscribed = false }) {
  try {
    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    )

    // Atualizar status para processando intenção
    await supabase
      .from('whatsapp_ia_messages')
      .update({ status: 'analisando_intencao' })
      .eq('id', interactionId)

    // Obter configuração do WhatsApp
    const { data: config, error: configError } = await supabase
      .from('whatsapp_ia_config')
      .select('*')
      .eq('establishment_id', establishmentId)
      .single()

    if (configError) {
      throw new Error(`Erro ao obter configuração: ${configError.message}`)
    }

    // Determinar qual token usar (evolution ou uazapi)
    const token = config.evolution_token || config.uazapi_token

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI('AIzaSyD8HqS6P_AkdrUQi3J_G_Iarb2mlRVYk5w')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Buscar dados de contexto para o prompt
    const { data: services } = await supabase
      .from('services')
      .select('id, name, description, duration, price')
      .eq('establishment_id', establishmentId)
      .limit(20)

    const { data: professionals } = await supabase
      .from('professionals')
      .select('id, name, specialty')
      .eq('establishment_id', establishmentId)
      .limit(10)

    // Buscar informação sobre o cliente se já estiver cadastrado
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, name')
      .eq('phone', sender)
      .maybeSingle()

    const clientName = clientData?.name || 'Cliente não identificado'

    // Construir o prompt para o Gemini - em português para melhor performance
    const prompt = `
      Analise a seguinte mensagem de um cliente de salão de beleza via WhatsApp:
      "${text}"
      
      Serviços disponíveis: ${JSON.stringify(services)}
      Profissionais disponíveis: ${JSON.stringify(professionals)}
      Nome do cliente: ${clientName}
      
      Extraia as seguintes informações em formato JSON:
      {
        "intent": "agendar|cancelar|consultar|reagendar|informacao|outro",
        "service": "nome do serviço mencionado ou null",
        "professional": "nome do profissional mencionado ou null",
        "date": "data mencionada em formato DD/MM/YYYY ou 'hoje', 'amanhã' ou null",
        "time": "horário mencionado (formato HH:MM) ou null",
        "action": "qual ação deve ser tomada"
      }
      
      Se a mensagem for uma saudação ou uma pergunta genérica, indique "intent": "informacao".
      Responda APENAS o JSON sem explicações adicionais.
    `

    // Consultar Gemini
    const result = await model.generateContent(prompt)
    let responseText = result.response.text()
    let aiAnalysis

    try {
      // Tentar extrair JSON da resposta (pode vir com texto explicativo)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : responseText
      aiAnalysis = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Erro ao processar resposta da IA:', parseError, responseText)
      aiAnalysis = {
        intent: "erro",
        error: "Não foi possível interpretar a mensagem"
      }
    }

    // Atualizar no Supabase
    await supabase
      .from('whatsapp_ia_messages')
      .update({ 
        ai_analysis: aiAnalysis,
        status: 'intencao_analisada'
      })
      .eq('id', interactionId)

    // Processar com base na intenção
    if (aiAnalysis.intent === 'agendar') {
      // Verificar disponibilidade e processar agendamento
      await checkAvailability({
        interactionId,
        sender,
        establishmentId,
        token,
        service: aiAnalysis.service,
        professional: aiAnalysis.professional,
        date: aiAnalysis.date,
        time: aiAnalysis.time
      })
    } else {
      // Gerar resposta para outras intenções - em português
      let responseToUser = ""
      
      if (aiAnalysis.intent === 'informacao') {
        responseToUser = "Olá! Como posso ajudar com informações sobre nossos serviços?"
      } else if (aiAnalysis.intent === 'consultar') {
        responseToUser = `Entendi que você quer consultar informações sobre ${aiAnalysis.service || 'nossos serviços'}. Posso te ajudar com isso!`
      } else if (aiAnalysis.intent === 'cancelar') {
        responseToUser = "Entendi que você deseja cancelar um agendamento. Poderia confirmar qual data e horário deseja cancelar?"
      } else {
        responseToUser = "Obrigado pela sua mensagem! Em que posso ajudar hoje?"
      }

      // Enviar resposta ao cliente
      await sendWhatsAppMessage({
        to: sender,
        message: responseToUser,
        token
      })

      // Atualizar status
      await supabase
        .from('whatsapp_ia_messages')
        .update({ 
          response_sent: responseToUser,
          status: 'resposta_enviada'
        })
        .eq('id', interactionId)
    }

    return { success: true, analysis: aiAnalysis }
  } catch (error) {
    console.error('Erro ao processar intenção:', error)
    
    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    )

    // Registrar erro
    await supabase
      .from('whatsapp_ia_messages')
      .update({ 
        status: 'erro_analise',
        processing_error: error.message
      })
      .eq('id', interactionId)

    return { success: false, error: error.message }
  }
}
