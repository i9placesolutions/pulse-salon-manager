// Função Edge Supabase para processar mensagens do WhatsApp via webhook da Uazapi
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UazapiMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    audioMessage?: {
      url: string;
      mimetype: string;
      seconds: number;
    };
    imageMessage?: {
      url: string;
      mimetype: string;
      caption?: string;
    };
  };
  messageTimestamp: number;
  pushName: string;
  id: string;
  from: string;
  type: string;
  // Outros campos relevantes
}

interface IAConfig {
  id: string;
  establishment_id: string;
  openai_key: string;
  uazapi_instance: string;
  uazapi_token: string;
  active: boolean;
  welcome_message: string;
  establishment_info: string;
}

// Função principal que recebe as solicitações do webhook
serve(async (req) => {
  // Lidar com solicitações OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://wtpmedifsfbxctlssefd.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter dados do corpo da solicitação
    const body = await req.json();
    console.log('Webhook recebido:', JSON.stringify(body));

    // Verificar se é uma mensagem válida
    if (!body || !body.key || !body.from) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mensagem inválida' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extrair dados da mensagem
    const message = body as UazapiMessage;
    const userPhone = message.from;
    const messageContent = message.message?.conversation || 
                         message.message?.imageMessage?.caption || 
                         'Áudio recebido';
    const isAudio = !!message.message?.audioMessage;
    const isImage = !!message.message?.imageMessage;
    const timestamp = message.messageTimestamp;
    const messageId = message.key.id;

    // Verificar em qual instância/estabelecimento esta mensagem pertence
    // Isto requer que sua tabela whatsapp_ia_config tenha um campo para armazenar o número do WhatsApp associado à instância
    const { data: instanciaData, error: instanciaError } = await supabase
      .from('profiles')
      .select('id, whatsapp_config')
      .filter('whatsapp_config->instance', 'eq', message.key.remoteJid.split('@')[0])
      .single();

    if (instanciaError || !instanciaData) {
      console.error('Instância não encontrada:', instanciaError);
      return new Response(
        JSON.stringify({ success: false, error: 'Instância não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const establishmentId = instanciaData.id;

    // Buscar configuração da IA para este estabelecimento
    const { data: iaConfig, error: iaError } = await supabase
      .from('whatsapp_ia_config')
      .select('*')
      .eq('establishment_id', establishmentId)
      .single();

    if (iaError || !iaConfig) {
      console.error('Configuração de IA não encontrada:', iaError);
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração de IA não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se a IA está ativa
    if (!iaConfig.active) {
      console.log('IA desativada para este estabelecimento');
      return new Response(
        JSON.stringify({ success: false, message: 'IA desativada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar a mensagem com OpenAI
    let processedText = messageContent;

    if (isAudio) {
      // Aqui você transcreveria o áudio usando a API da OpenAI
      // Como exemplo, apenas usamos um texto fixo
      processedText = "Áudio transcrito: (Esta é uma simulação de transcrição)";
    }

    // Montar o prompt para a OpenAI com contexto do estabelecimento
    const prompt = `Você é um assistente virtual do ${instanciaData.establishment} respondendo no WhatsApp. 
    
Informações do estabelecimento:
${iaConfig.establishment_info}

Histórico:
Cliente: ${processedText}

Responda de forma amigável, concisa e profissional. Se a mensagem for uma pergunta sobre agendamento, 
informe que você pode ajudar a verificar disponibilidade. Se o cliente quiser marcar um horário, 
peça o dia e horário de preferência.`;

    // Chamar a OpenAI para processar a mensagem
    let aiResponse = "";
    
    try {
      // Em uma implementação real, você faria a chamada à API da OpenAI aqui
      const openaiKey = iaConfig.openai_key;
      
      // Simulação de resposta - em produção, use a API da OpenAI
      aiResponse = `Olá! Sou o assistente virtual do ${instanciaData.establishment}. 
Como posso ajudar você hoje? Estou aqui para responder suas dúvidas e ajudar com agendamentos.`;
      
      // No futuro, implementar o código real de chamada à OpenAI
      /*
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      const openaiData = await openaiResponse.json();
      aiResponse = openaiData.choices[0].message.content;
      */
    } catch (error) {
      console.error('Erro ao processar mensagem com OpenAI:', error);
      aiResponse = "Desculpe, estou tendo dificuldades técnicas para processar sua mensagem. Por favor, tente novamente mais tarde.";
    }

    // Enviar resposta via API Uazapi
    // Aqui você faria uma chamada para a API da Uazapi para enviar a resposta
    // Exemplo simplificado:
    const uazapiUrl = `https://api.uazapi.dev/send/text`;
    const uazapiHeaders = {
      'Content-Type': 'application/json',
      'token': iaConfig.uazapi_token
    };
    
    const messagePayload = {
      number: userPhone,
      text: aiResponse,
      readchat: true
    };
    
    // Simulação de envio - em produção, descomente o código abaixo
    /*
    const sendResponse = await fetch(uazapiUrl, {
      method: 'POST',
      headers: uazapiHeaders,
      body: JSON.stringify(messagePayload)
    });
    
    const sendResult = await sendResponse.json();
    */
    
    // Guardar mensagem no banco de dados
    const { data: savedMessage, error: messageError } = await supabase
      .from('whatsapp_ia_messages')
      .insert({
        establishment_id: establishmentId,
        user_phone: userPhone,
        message_received: processedText,
        message_sent: aiResponse,
        is_audio: isAudio,
        is_image: isImage,
        message_id: messageId,
        created_at: new Date().toISOString()
      });
    
    if (messageError) {
      console.error('Erro ao salvar mensagem:', messageError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem processada com sucesso', 
        response: aiResponse 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
