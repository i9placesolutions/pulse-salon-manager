import { sendTextMessage, MAIN_INSTANCE_TOKEN } from "@/lib/whatsappApi";

/**
 * Formata um número de telefone para o formato usado pela API do WhatsApp
 * Remove caracteres não numéricos e adiciona o código do país se necessário
 */
export function formatPhoneNumber(phone: string): string {
  // Remover todos os caracteres não numéricos
  let cleanNumber = phone.replace(/\D/g, '');
  
  // Se o número não começar com '55' (código do Brasil), adicionar
  if (!cleanNumber.startsWith('55')) {
    cleanNumber = '55' + cleanNumber;
  }
  
  // Garantir que o número esteja no formato correto (55DDNNNNNNNNN)
  return cleanNumber;
}

/**
 * Salva as configurações do usuário e envia uma mensagem de WhatsApp 
 * de boas-vindas após o cadastro
 */
export async function saveConfigAndSendWhatsApp(phone: string, establishmentName: string): Promise<boolean> {
  try {
    // Formatar o número de telefone
    const formattedPhone = formatPhoneNumber(phone);
    
    // Texto da mensagem com informações sobre o período de teste
    const message = `Olá! Bem-vindo(a) ao Pulse Salon Manager! 🎉

Seu cadastro para *${establishmentName}* foi realizado com sucesso!

Você tem um período de testes gratuito de 7 dias para explorar todas as funcionalidades do sistema. Após este período, escolha um de nossos planos para continuar utilizando.

Estamos à disposição para qualquer dúvida ou suporte que precisar.

Equipe Pulse Salon Manager`;
    
    // Enviar a mensagem usando a função sendTextMessage com o formato correto
    const result = await sendTextMessage({
      number: formattedPhone,
      text: message,
      token: MAIN_INSTANCE_TOKEN
    });
    
    return !!result;
  } catch (error) {
    console.error("Erro ao enviar mensagem de WhatsApp:", error);
    return false;
  }
} 