// Endpoint de API para o Vercel para processar webhooks do WhatsApp via n8n
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wtpmedifsfbxctlssefd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG1lZGlmc2ZieGN0bHNzZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTMwNzUsImV4cCI6MjA1OTg4OTA3NX0.Mmro8vKbusSP_HNCqX9f5XlrotRbeA8-HIGvQE07mwU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função handler principal da API Vercel
module.exports = async (req, res) => {
  // Permitir apenas método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido' 
    });
  }

  try {
    console.log('Recebido webhook do n8n:', new Date().toISOString());
    
    const webhookData = req.body;
    
    // Registrar o webhook recebido (para debug)
    await logWebhook(webhookData);
    
    // Verificar se há dados de mensagem válidos
    if (!webhookData.messages || webhookData.messages.length === 0) {
      console.log('Nenhuma mensagem encontrada no webhook');
      return res.status(400).json({ 
        success: false, 
        error: 'Nenhuma mensagem encontrada' 
      });
    }
    
    // Extrair informações importantes
    const message = webhookData.messages[0];
    const instanceName = webhookData.instance || '';
    
    // Filtrar mensagens do próprio sistema (enviadas pela API)
    if (message.fromMe) {
      console.log('Ignorando mensagem enviada pelo próprio sistema');
      return res.status(200).json({ 
        success: true, 
        message: 'Mensagem do sistema ignorada' 
      });
    }
    
    // Buscar estabelecimento associado a esta instância
    const { data: configData, error: configError } = await supabase
      .from('whatsapp_ia_config')
      .select('establishment_id, active, welcome_message, establishment_info, openai_key')
      .eq('uazapi_instance', instanceName)
      .single();
    
    if (configError) {
      console.error('Erro ao encontrar configuração para instância:', instanceName, configError);
      return res.status(404).json({ 
        success: false, 
        error: 'Configuração não encontrada para esta instância' 
      });
    }
    
    // Verificar se o serviço de IA está ativo para este estabelecimento
    if (!configData || !configData.active) {
      console.log(`Serviço de IA inativo para o estabelecimento ${configData?.establishment_id || 'desconhecido'}`);
      return res.status(200).json({ 
        success: false, 
        error: 'Serviço de IA inativo para este estabelecimento' 
      });
    }
    
    // Processar a mensagem e gerar resposta da IA
    const response = await processMessage(webhookData, configData);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook processado com sucesso',
      response
    });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro interno ao processar webhook' 
    });
  }
};

// Função para registrar o webhook no banco de dados (log)
async function logWebhook(data) {
  try {
    // Simplificar os dados para não sobrecarregar o banco
    const simplifiedData = {
      instance: data.instance,
      messageCount: data.messages?.length || 0,
      timestamp: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('whatsapp_webhook_logs')
      .insert({
        data: simplifiedData,
        full_data: data,  // Dados completos para debug
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Erro ao salvar log de webhook:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar log de webhook:', error);
  }
}

// Função para processar uma mensagem e gerar resposta da IA
async function processMessage(webhookData, config) {
  try {
    // Aqui você integraria com a API da OpenAI
    // Por enquanto, vamos usar uma resposta simples
    
    const message = webhookData.messages[0];
    const messageBody = message.body || '';
    const senderName = message.senderName || 'Cliente';
    const phone = message.from || '';
    
    console.log(`Mensagem recebida de ${senderName} (${phone}): ${messageBody}`);
    
    // Verificar se é o primeiro contato e enviar mensagem de boas-vindas
    const isFirstContact = await checkIfFirstContact(phone, config.establishment_id);
    
    if (isFirstContact) {
      await sendWhatsAppMessage(
        phone, 
        config.welcome_message || 'Olá! Sou o assistente virtual do salão. Como posso ajudar?',
        webhookData.instance
      );
      
      // Registrar o contato para não enviar boas-vindas novamente
      await registerContact(phone, senderName, config.establishment_id);
      
      return {
        sent: true,
        isFirstContact: true,
        message: 'Mensagem de boas-vindas enviada'
      };
    }
    
    // Aqui você integraria com a API da OpenAI para resposta contextual
    // em uma implementação real
    
    return {
      received: true,
      processed: true
    };
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    throw error;
  }
}

// Verifica se é o primeiro contato deste número
async function checkIfFirstContact(phone, establishmentId) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_ia_messages')
      .select('id')
      .eq('client_phone', phone)
      .eq('establishment_id', establishmentId)
      .limit(1);
      
    if (error) {
      console.error('Erro ao verificar contato:', error);
      return false;
    }
    
    return !data || data.length === 0;
  } catch (error) {
    console.error('Erro ao verificar primeiro contato:', error);
    return false;
  }
}

// Registra um novo contato no banco
async function registerContact(phone, name, establishmentId) {
  try {
    const { error } = await supabase
      .from('whatsapp_ia_messages')
      .insert({
        client_phone: phone,
        client_name: name,
        establishment_id: establishmentId,
        message_type: 'system',
        message_content: 'Primeiro contato',
        is_from_client: false,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Erro ao registrar contato:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar contato:', error);
  }
}

// Função para enviar mensagem de volta via WhatsApp
async function sendWhatsAppMessage(to, text, instance) {
  try {
    // Montar payload para a API Uazapi
    const payload = {
      number: to,
      text: text,
      linkPreview: true,
      readchat: true,
      delay: 1200
    };
    
    // Buscar token da instância no Supabase
    const { data: configData, error: configError } = await supabase
      .from('whatsapp_ia_config')
      .select('uazapi_token')
      .eq('uazapi_instance', instance)
      .single();
      
    if (configError || !configData?.uazapi_token) {
      throw new Error('Token da instância não encontrado');
    }
    
    // Enviar mensagem via API Uazapi
    const response = await fetch('https://i9place3.uazapi.com/send/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': configData.uazapi_token
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar mensagem: ${responseData.error || response.statusText}`);
    }
    
    console.log('Mensagem enviada com sucesso:', responseData);
    
    // Registrar mensagem enviada no banco
    await supabase
      .from('whatsapp_ia_messages')
      .insert({
        client_phone: to,
        client_name: 'Cliente',
        establishment_id: configData.establishment_id,
        message_type: 'text',
        message_content: text,
        is_from_client: false,
        created_at: new Date().toISOString()
      });
    
    return responseData;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}
