// Verificador de disponibilidade para agendamentos
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from './whatsapp-sender'
import { createAppointment } from './appointment-creator'

export async function checkAvailability({ interactionId, sender, establishmentId, token, service, professional, date, time }) {
  try {
    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    )

    // Atualizar status
    await supabase
      .from('whatsapp_ia_messages')
      .update({ status: 'verificando_disponibilidade' })
      .eq('id', interactionId)

    // Processar datas relativas
    let formattedDate = date
    const today = new Date()
    
    if (date === 'hoje') {
      formattedDate = today.toLocaleDateString('pt-BR')
    } else if (date === 'amanhã' || date === 'amanha') {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      formattedDate = tomorrow.toLocaleDateString('pt-BR')
    }

    // Verificar se o serviço existe
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('establishment_id', establishmentId)
      .ilike('name', `%${service}%`)
      .limit(1)
      .single()

    if (serviceError || !serviceData) {
      // Serviço não encontrado
      const { data: availableServices } = await supabase
        .from('services')
        .select('name')
        .eq('establishment_id', establishmentId)
        .limit(10)

      const serviceNames = availableServices.data.map(s => s.name).join(', ')
      
      const responseMessage = `Não encontrei o serviço "${service}" em nosso sistema. Temos disponíveis: ${serviceNames}. Poderia especificar qual desses serviços deseja agendar?`
      
      await sendWhatsAppMessage({
        to: sender,
        message: responseMessage,
        token
      })

      await supabase
        .from('whatsapp_ia_messages')
        .update({ 
          response_sent: responseMessage,
          status: 'servico_nao_encontrado'
        })
        .eq('id', interactionId)

      return { success: false, reason: 'service_not_found' }
    }

    // Verificar se o profissional existe (se especificado)
    let professionalData = null
    if (professional) {
      const { data: profData, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('establishment_id', establishmentId)
        .ilike('name', `%${professional}%`)
        .limit(1)
        .single()

      if (!profError && profData) {
        professionalData = profData
      }
    }

    // Buscar agendamentos existentes para verificar disponibilidade
    const dateFormatted = new Date(formattedDate.split('/').reverse().join('-')).toISOString().split('T')[0]
    
    // Verificar agendamentos para o dia e profissional (se especificado)
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', dateFormatted)
      .eq(professionalData ? 'professional_id' : 'date', professionalData ? professionalData.id : dateFormatted)
      .order('start_time')

    // Calcular slots disponíveis (horário de funcionamento padrão: 8h às 19h em intervalos de 30 min)
    const allSlots = []
    for (let hour = 8; hour < 19; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`)
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    // Remover slots já ocupados
    const busySlots = existingAppointments?.map(app => app.start_time) || []
    const availableSlots = allSlots.filter(slot => !busySlots.includes(slot))

    // Se não houver horários disponíveis ou ocorrer erro
    if (!availableSlots || availableSlots.length === 0) {
      const responseMessage = `Não temos horários disponíveis ${professionalData ? `com ${professionalData.name} ` : ''}para ${formattedDate}. Poderia tentar outra data?`
      
      await sendWhatsAppMessage({
        to: sender,
        message: responseMessage,
        token
      })

      await supabase
        .from('whatsapp_ia_messages')
        .update({ 
          response_sent: responseMessage,
          status: 'sem_disponibilidade'
        })
        .eq('id', interactionId)

      return { success: false, reason: 'no_availability' }
    }

    // Se tiver horário específico
    if (time) {
      const isTimeAvailable = availableSlots.includes(time)

      if (isTimeAvailable) {
        // Horário disponível, criar agendamento
        return await createAppointment({
          interactionId,
          sender,
          token,
          establishmentId,
          serviceId: serviceData.id,
          serviceName: serviceData.name,
          professionalId: professionalData?.id,
          professionalName: professionalData?.name,
          date: formattedDate,
          time
        })
      } else {
        // Horário solicitado não disponível, sugerir alternativas
        const suggestedTimes = availableSlots.slice(0, 5).join(', ')

        const responseMessage = `O horário ${time} ${professionalData ? `com ${professionalData.name} ` : ''}não está disponível para ${formattedDate}. Horários disponíveis: ${suggestedTimes}. Gostaria de agendar em algum desses horários?`
        
        await sendWhatsAppMessage({
          to: sender,
          message: responseMessage,
          token
        })

        await supabase
          .from('whatsapp_ia_messages')
          .update({ 
            response_sent: responseMessage,
            status: 'horario_indisponivel'
          })
          .eq('id', interactionId)

        return { success: false, reason: 'time_not_available' }
      }
    } else {
      // Sem horário específico, sugerir horários disponíveis
      const suggestedTimes = availableSlots.slice(0, 5).join(', ')

      const responseMessage = `Temos os seguintes horários disponíveis ${professionalData ? `com ${professionalData.name} ` : ''}para ${serviceData.name} em ${formattedDate}: ${suggestedTimes}. Qual horário prefere?`
      
      await sendWhatsAppMessage({
        to: sender,
        message: responseMessage,
        token
      })

      await supabase
        .from('whatsapp_ia_messages')
        .update({ 
          response_sent: responseMessage,
          status: 'sugerindo_horarios',
          ai_analysis: {
            service_id: serviceData.id,
            service_name: serviceData.name,
            professional_id: professionalData?.id,
            professional_name: professionalData?.name,
            date: formattedDate
          }
        })
        .eq('id', interactionId)

      return { success: true, suggested: true }
    }
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
    
    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    )

    // Registrar erro
    await supabase
      .from('whatsapp_ia_messages')
      .update({ 
        status: 'erro_disponibilidade',
        processing_error: error.message
      })
      .eq('id', interactionId)

    return { success: false, error: error.message }
  }
}
