import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase para o banco pulsedados
const supabaseUrl = 'https://wtpmedifsfbxctlssefd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG1lZGlmc2ZieGN0bHNzZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTMwNzUsImV4cCI6MjA1OTg4OTA3NX0.Mmro8vKbusSP_HNCqX9f5XlrotRbeA8-HIGvQE07mwU';

// Criar cliente com opções de persistência de sessão
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'pulse_session',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

// Exportando também as interfaces e funções do pulseDadosClient
export * from './pulseDadosClient';
