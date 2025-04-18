/**
 * Utilitário para proteção contra ataques CSRF (Cross-Site Request Forgery)
 */

// Gerar um token CSRF aleatório
export function generateCSRFToken(): string {
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Armazenar o token CSRF em um cookie seguro
export function setCSRFToken(): string {
  const token = generateCSRFToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(); // 24 horas
  document.cookie = `csrf_token=${token}; expires=${expires}; path=/; secure; samesite=strict`;
  return token;
}

// Obter o token CSRF atual
export function getCSRFToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

// Adicionar o token CSRF a um objeto de dados
export function addCSRFToken<T extends Record<string, any>>(data: T): T & { csrf_token: string } {
  const token = getCSRFToken() || setCSRFToken();
  return { ...data, csrf_token: token };
}

// Middleware para verificar o token CSRF
export async function verifyCSRFToken<T>(callback: () => Promise<T>): Promise<T> {
  // Em uma aplicação real, a verificação aconteceria no servidor
  // Aqui simulamos apenas a adição do token em todas as requisições
  const token = getCSRFToken() || setCSRFToken();
  
  // Adicionar um interceptor temporário para o Fetch API
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    if (!init) init = {};
    if (!init.headers) init.headers = {};
    
    // Adicionar o token CSRF ao header
    (init.headers as Record<string, string>)['X-CSRF-Token'] = token;
    
    return originalFetch(input, init);
  };
  
  try {
    // Executar a função original com a proteção CSRF
    const result = await callback();
    
    // Restaurar o fetch original
    window.fetch = originalFetch;
    
    return result;
  } catch (error) {
    // Restaurar o fetch original mesmo em caso de erro
    window.fetch = originalFetch;
    throw error;
  }
}
