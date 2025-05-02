// Criador de agendamentos
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from './whatsapp-sender'

export async function createAppointment({ 
  interactionId, 
  sender, 
  token,
  establishmentId,
  serviceId, 
  serviceName, 
  professionalId, 
  professionalName, 
  date, 
  time 
}) {
  try {
    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    )

    // Atualizar status
    await supabase
      .from('whatsapp_ia_messages')
      .update({ status: 'criando_agendamento' })
      .eq('id', interactionId)

    // Verificar se o cliente já existe
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', sender)
      .maybeSingle()

    let clientId = null
    let clientName = 'Cliente WhatsApp'
    
    // Se o cliente já existe, use o ID existente
    if (clientData) {
      clientId = clientData.id
      clientName = clientData.name
    } else {
      // Criar novo cliente
      const { data: newClient, error: newClientError } = await supabase
        .from('clients')
        .insert({
          phone: sender,
          name: clientName,
          establishment_id: establishmentId,
          created_at: new Date().toISOString(),
          source: 'whatsapp'
        })
        .select()
        .single()

      if (newClientError) {
        throw new Error(`Erro ao criar cliente: ${newClientError.message}`)
      }
      
      clientId = newClient.id
    }

    // Calcular a duração do serviço (padrão: 1 hora se não especificado)
    const { data: serviceDetails } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single()
    
    const duration = serviceDetails?.duration || 60 // minutos

    // Calcular horário de término
    const [hour, minute] = time.split(':').map(Number)
    const endHour = Math.floor((hour * 60 + minute + duration) / 60)
    const endMinute = (hour * 60 + minute + duration) % 60
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

    // Formatar a data para o banco de dados
    const dateParts = date.split('/')
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`

    // Criar o agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        client_name: clientName,
        professional_id: professionalId,
        professional_name: professionalName || 'Profissional disponível',
        date: formattedDate,
        start_time: time,
        end_time: endTime,
        duration: duration,
        status: 'confirmado',
        payment_status: 'pendente',
        total_value: serviceDetails?.price || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (appointmentError) {
      throw new Error(`Erro ao criar agendamento: ${appointmentError.message}`)
    }

    // Criar vínculo entre agendamento e serviço
    await supabase
      .from('appointment_services')
      .insert({
        appointment_id: appointment.id,
        service_id: serviceId,
        service_name: serviceName,
        professional_id: professionalId,
        professional_name: professionalName || 'Profissional disponível',
        value: serviceDetails?.price || 0,
        establishment_id: establishmentId,
        created_at: new Date().toISOString()
      })

    // Enviar confirmação ao cliente
    const professionalText = professionalName ? ` com ${professionalName}` : ''
    const responseMessage = `✅ Agendamento confirmado!\n\n*${serviceName}*${professionalText}\n📅 ${date}\n⏰ ${time}\n\nVocê receberá um lembrete um dia antes. Para cancelar ou reagendar, basta nos enviar uma mensagem. Agradecemos sua preferência!`
    
    await sendWhatsAppMessage({
      to: sender,
      message: responseMessage,
      token
    })

    // Atualizar interação
    await supabase
      .from('whatsapp_ia_messages')
      .update({ 
        response_sent: responseMessage,
        status: 'agendamento_confirmado',
        appointment_id: appointment.id
      })
      .eq('id', interactionId)

    return { success: true, appointmentId: appointment.id }
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    
    // Conectar ao Supabase
    const supabase = createClient(
      'https://wtpmedifsfbxctlssefd.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    )

    // Registrar erro
    await supabase
      .from('whatsapp_ia_messages')
      .update({ 
        status: 'erro_agendamento',
        processing_error: error.message
      })
      .eq('id', interactionId)

    // Enviar mensagem de erro
    await sendWhatsAppMessage({
      to: sender,
      message: "Desculpe, tivemos um problema ao criar seu agendamento. Por favor, tente novamente ou entre em contato conosco pelo telefone do salão.",
      token
    })

    return { success: false, error: error.message }
  }
}
