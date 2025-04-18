/**
 * Utilitário para testes de segurança do Pulse Salon Manager
 * Execute esta função no console do navegador para verificar se as proteções estão funcionando
 */

import { validateData, Validators } from '@/lib/dataValidation';
import { getCSRFToken, setCSRFToken } from '@/lib/csrfProtection';

export function runSecurityTests() {
  console.group('🔒 Testes de Segurança do Pulse Salon Manager');
  
  // 1. Teste de validação de dados
  console.log('Testando validação de dados...');
  const testData = {
    name: 'Teste <script>alert("XSS")</script>',
    email: 'email-invalido',
    phone: '11999',
    cpf: '123.456.789-00'
  };
  
  const schema = {
    name: [Validators.required()],
    email: [Validators.email()],
    phone: [Validators.phone()],
    cpf: [Validators.cpf()]
  };
  
  const validationErrors = validateData(testData, schema);
  console.log('Erros de validação encontrados:', validationErrors);
  const sanitizedName = Validators.sanitize.text(testData.name);
  console.log('Nome sanitizado (proteção XSS):', sanitizedName);
  
  // 2. Teste de proteção CSRF
  console.log('Testando proteção CSRF...');
  const currentToken = getCSRFToken();
  console.log('Token CSRF atual:', currentToken);
  const newToken = setCSRFToken();
  console.log('Novo token CSRF gerado:', newToken);
  
  // 3. Teste de armazenamento seguro
  console.log('Verificando cookies seguros...');
  const cookies = document.cookie.split(';').map(c => c.trim());
  console.log('Cookies ativos:', cookies);
  
  // 4. Teste de CSP
  console.log('Testando Content Security Policy...');
  try {
    const img = document.createElement('img');
    img.src = 'https://wtpmedifsfbxctlssefd.supabase.co/storage/v1/object/public/test.jpg';
    img.style.display = 'none';
    document.body.appendChild(img);
    
    img.onload = () => {
      console.log('✅ Imagem do Supabase carregada com sucesso (CSP configurado corretamente)');
      document.body.removeChild(img);
    };
    
    img.onerror = () => {
      console.error('❌ Erro ao carregar imagem do Supabase (possível problema com CSP)');
      document.body.removeChild(img);
    };
  } catch (error) {
    console.error('Erro no teste de CSP:', error);
  }
  
  // 5. Teste de variáveis de ambiente
  console.log('Verificando variáveis de ambiente...');
  console.log('SUPABASE_URL definida:', !!import.meta.env.VITE_SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY definida:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  console.groupEnd();
  return 'Testes de segurança concluídos. Verifique o console para resultados.';
}

// Exportando para uso no console do navegador
(window as any).runSecurityTests = runSecurityTests;
