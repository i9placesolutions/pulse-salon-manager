// Script para testar o envio de mensagem via uazAPI
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Configuração do Supabase
const supabaseUrl = 'https://ozsnsshsiiwtkzrxwtwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96c25zc2hzaWl3dGt6cnh3dHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM1NzAyNTQsImV4cCI6MjAyOTE0NjI1NH0.FcBVXR2lwJImcQA9R3cqP5L0fzNd-IQrk4TjaEm1W2s';
const supabase = createClient(supabaseUrl, supabaseKey);

// Interface para leitura de input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para perguntar ao usuário
function pergunta(questao) {
  return new Promise((resolve) => {
    rl.question(questao, (resposta) => {
      resolve(resposta);
    });
  });
}

async function enviarMensagemTeste() {
  try {
    console.log('=== TESTE DE ENVIO DE MENSAGEM VIA WHATSAPP ===');
    
    // Solicitar informações do usuário
    const ESTABLISHMENT_ID = await pergunta('Digite o ID do estabelecimento: ');
    const PHONE_NUMBER = await pergunta('Digite o número de telefone para enviar a mensagem (com DDD, ex: 11987654321): ');
    
    // Formatar número de telefone
    let phoneFormatted = PHONE_NUMBER.replace(/\D/g, '');
    if (!phoneFormatted.startsWith('+')) {
      if (phoneFormatted.startsWith('55')) {
        phoneFormatted = '+' + phoneFormatted;
      } else {
        phoneFormatted = '+55' + phoneFormatted;
      }
    }
    
    console.log(`\nBuscando credenciais do WhatsApp para o estabelecimento ID: ${ESTABLISHMENT_ID}...`);
    
    // Buscar credenciais do WhatsApp no Supabase
    const { data, error } = await supabase
      .from('establishments')
      .select('whatsapp_instance, whatsapp_token')
      .eq('id', ESTABLISHMENT_ID)
      .single();
    
    if (error || !data) {
      console.error('Erro ao buscar credenciais:', error);
      rl.close();
      return;
    }
    
    if (!data.whatsapp_instance || !data.whatsapp_token) {
      console.error('Credenciais de WhatsApp não encontradas para este estabelecimento');
      rl.close();
      return;
    }
    
    console.log('Credenciais encontradas:', {
      instance: data.whatsapp_instance,
      token: data.whatsapp_token.substring(0, 5) + '...'
    });
    
    // Configuração da requisição
    const baseUrl = `https://api.uazapi.com/v1/instances/${data.whatsapp_instance}`;
    const mensagem = 'Esta é uma mensagem de teste enviada pelo script de teste da IA do WhatsApp. ' + 
                     'Se você recebeu esta mensagem, o sistema está funcionando corretamente! ' +
                     'Responda a esta mensagem para testar o webhook de recebimento.';
    
    console.log(`\nEnviando mensagem para ${phoneFormatted}...`);
    
    // Enviar mensagem de texto
    const response = await axios.post(
      `${baseUrl}/send/text`,
      {
        number: phoneFormatted,
        text: mensagem,
        options: {
          delay: 1200,
          linkPreview: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${data.whatsapp_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Resposta do envio:', response.status, response.statusText);
    console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
    
    console.log('\n✅ Teste concluído com sucesso!');
    console.log('Agora aguarde a resposta para ver se o webhook está funcionando corretamente.');
    
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.status, error.response.data);
    }
  } finally {
    rl.close();
  }
}

// Executar o teste
enviarMensagemTeste();
