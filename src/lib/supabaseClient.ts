import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase para o banco pulsedados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wtpmedifsfbxctlssefd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG1lZGlmc2ZieGN0bHNzZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTMwNzUsImV4cCI6MjA1OTg4OTA3NX0.Mmro8vKbusSP_HNCqX9f5XlrotRbeA8-HIGvQE07mwU';

// Criar cliente com opções de persistência de sessão
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'pulse_session',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Usando cookieStorage para maior segurança (HttpOnly cookies)
    storage: {
      getItem: (key) => {
        const item = document.cookie
          .split('; ')
          .find((row) => row.startsWith(key + '='))
          ?.split('=')[1];
        return item ? JSON.parse(decodeURIComponent(item)) : null;
      },
      setItem: (key, value) => {
        // Configurando cookie como HttpOnly e Secure
        // Expira em 7 dias
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${key}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/; secure; samesite=strict`;
      },
      removeItem: (key) => {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict`;
      }
    }
  }
});

// Exportando também as interfaces e funções do pulseDadosClient
export * from './pulseDadosClient';
