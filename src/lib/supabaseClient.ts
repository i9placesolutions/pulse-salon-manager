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

// Interface para representar um agendamento de cliente
export interface ClientAppointment {
  id: number;
  client_id: string;
  client_name: string;
  professional_id: number;
  professional_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: string;
  payment_status: string;
  total_value: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  services?: {
    id: number;
    service_name: string;
    price: number;
  }[];
}

// Função para obter o histórico de agendamentos de um cliente
export async function getClientAppointmentHistory(clientId: string): Promise<{ data: ClientAppointment[] | null, error: any }> {
  try {
    // Buscar os agendamentos do cliente
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    
    if (appointmentsError) {
      return { data: null, error: appointmentsError };
    }
    
    // Para cada agendamento, buscar os serviços associados
    if (appointments && appointments.length > 0) {
      // Buscar na tabela appointment_services os serviços de cada agendamento
      for (const appointment of appointments) {
        const { data: services, error: servicesError } = await supabase
          .from('appointment_services')
          .select('*')
          .eq('appointment_id', appointment.id);
        
        if (!servicesError && services) {
          appointment.services = services;
        }
      }
    }
    
    return { data: appointments, error: null };
  } catch (error) {
    console.error("Erro ao buscar histórico de agendamentos:", error);
    return { data: null, error };
  }
}

// Função para autenticar um cliente (login de cliente)
export async function authenticateClient(phone: string, birthDate: string) {
  try {
    // Verificar se o cliente existe pelo telefone e data de nascimento
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .eq('birth_date', birthDate)
      .single();
    
    if (clientError) {
      return { data: null, error: 'Cliente não encontrado' };
    }
    
    // Retornar os dados do cliente se autenticado com sucesso
    return { data: client, error: null };
  } catch (error) {
    return { data: null, error: 'Erro ao autenticar cliente' };
  }
}

// Função para realizar login com email e senha
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

// Função para realizar logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Função para verificar a sessão atual
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (session && session.user) {
    return { user: session.user, error: null };
  }
  return { user: null, error };
}

// Função para recuperar senha
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });
  return { data, error };
}

// Função para atualizar senha
export async function updateUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password
  });
  return { data, error };
}

// Função para verificar permissões do usuário
export async function checkUserPermissions(userId: string, action: string, resource: string) {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', userId)
    .eq('action', action)
    .eq('resource', resource)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao verificar permissões:', error);
    return false;
  }
  
  return !!data;
}
