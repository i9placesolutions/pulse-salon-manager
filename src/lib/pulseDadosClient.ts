import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { addCSRFToken, verifyCSRFToken } from './csrfProtection';
import { validateData, Validators } from './dataValidation';
import { SecurityEventType, logSecurityEvent, monitorLoginAttempt, clearLoginAttempts } from '@/utils/securityMonitor';

// Configuração do cliente Supabase para o banco pulsedados
const pulseDadosUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wtpmedifsfbxctlssefd.supabase.co';
const pulseDadosAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG1lZGlmc2ZieGN0bHNzZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTMwNzUsImV4cCI6MjA1OTg4OTA3NX0.Mmro8vKbusSP_HNCqX9f5XlrotRbeA8-HIGvQE07mwU';

export const pulseDadosClient = createClient(pulseDadosUrl, pulseDadosAnonKey);
// Alias para compatibilidade com código existente
export const supabase = pulseDadosClient;

// Interface para o cliente
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  first_visit?: string;
  cpf?: string;
  status?: string;
  points?: number;
  cashback?: number;
  total_spent?: number;
  visits_count?: number;
  last_visit?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para o agendamento
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
  services?: AppointmentService[];
}

// Interface para serviços do agendamento
export interface AppointmentService {
  id: number;
  appointment_id: number;
  service_id: number;
  service_name: string;
  duration: number;
  price: number;
}

/**
 * Autenticar cliente com telefone e data de nascimento
 */
export async function authenticateClient(phone: string, birthDate: string): Promise<Client | null> {
  try {
    // Normaliza o telefone (remove formatação)
    const normalizedPhone = phone.replace(/\D/g, '');
    
    // Consulta cliente pelo telefone
    const { data, error } = await pulseDadosClient
      .from('clients')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('status', 'active')
      .single();
    
    if (error || !data) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
    
    // Verifica se a data de nascimento confere
    // Formato esperado: YYYY-MM-DD
    if (data.birth_date && data.birth_date === birthDate) {
      return data as Client;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao autenticar cliente:', error);
    return null;
  }
}

/**
 * Verificar se cliente já existe por telefone e estabelecimento
 */
export async function checkClientExists(phone: string, establishmentId: string): Promise<boolean> {
  try {
    // Normaliza o telefone (remove formatação)
    const normalizedPhone = phone.replace(/\D/g, '');
    
    // Conta quantos clientes têm este telefone neste estabelecimento
    const { count, error } = await pulseDadosClient
      .from('clients')
      .select('*', { count: 'exact', head: true})
      .eq('phone', normalizedPhone)
      .eq('establishment_id', establishmentId);
    
    if (error) {
      console.error('Erro ao verificar cliente:', error);
      return false;
    }
    
    return (count || 0) > 0;
  } catch (error) {
    console.error('Erro ao verificar cliente:', error);
    return false;
  }
}

/**
 * Buscar histórico de agendamentos do cliente
 */
export async function getClientAppointmentHistory(clientId: string): Promise<ClientAppointment[]> {
  try {
    // Busca agendamentos
    const { data: appointments, error } = await pulseDadosClient
      .from('appointments')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    
    if (error || !appointments) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
    
    // Para cada agendamento, busca os serviços associados
    const appointmentsWithServices: ClientAppointment[] = [];
    
    for (const appointment of appointments) {
      const { data: services, error: serviceError } = await pulseDadosClient
        .from('appointment_services')
        .select('*')
        .eq('appointment_id', appointment.id);
      
      if (serviceError) {
        console.error('Erro ao buscar serviços do agendamento:', serviceError);
      }
      
      appointmentsWithServices.push({
        ...appointment,
        services: services || []
      } as ClientAppointment);
    }
    
    return appointmentsWithServices;
  } catch (error) {
    console.error('Erro ao buscar histórico de agendamentos:', error);
    return [];
  }
}

/**
 * Criar ou atualizar cliente
 */
export async function createOrUpdateClient(clientData: Partial<Client>, establishmentId: string): Promise<Client | null> {
  try {
    // Valide os dados do cliente antes de processar
    const validationSchema = {
      name: [Validators.required('Nome é obrigatório')],
      phone: [Validators.required('Telefone é obrigatório'), Validators.phone()],
      email: [Validators.email()],
      cpf: [Validators.cpf()]
    };
    
    const errors = validateData(clientData, validationSchema);
    if (Object.keys(errors).length > 0) {
      console.error('Erro de validação:', errors);
      throw new Error('Dados de cliente inválidos: ' + JSON.stringify(errors));
    }
    
    // Sanitize os dados para prevenir XSS
    if (clientData.name) clientData.name = Validators.sanitize.text(clientData.name);
    if (clientData.email) clientData.email = Validators.sanitize.text(clientData.email);
    
    // Normaliza o telefone (remove formatação)
    if (clientData.phone) {
      clientData.phone = Validators.sanitize.phone(clientData.phone);
    }
    
    // Utilize a proteção CSRF para a operação
    return await verifyCSRFToken(async () => {
      // Adiciona token CSRF aos dados
      const secureData = addCSRFToken({
        ...clientData,
        establishment_id: establishmentId
      });
      
      // Verifica se cliente já existe
      const { data: existingClient, error: searchError } = await pulseDadosClient
        .from('clients')
        .select('*')
        .eq('phone', secureData.phone)
        .eq('establishment_id', establishmentId)
        .maybeSingle();
      
      if (searchError) {
        console.error('Erro ao verificar cliente existente:', searchError);
        return null;
      }
      
      if (existingClient) {
        // Atualiza cliente existente
        const { data: updatedClient, error: updateError } = await pulseDadosClient
          .from('clients')
          .update({
            ...clientData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingClient.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Erro ao atualizar cliente:', updateError);
          return null;
        }
        
        return updatedClient as Client;
      } else {
        // Cria novo cliente
        const { data: newClient, error: insertError } = await pulseDadosClient
          .from('clients')
          .insert({
            ...clientData,
            establishment_id: establishmentId,
            status: 'active',
            first_visit: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Erro ao criar cliente:', insertError);
          return null;
        }
        
        return newClient as Client;
      }
    });
  } catch (error) {
    console.error('Erro ao criar/atualizar cliente:', error);
    return null;
  }
}

// Função para adaptar chamadas de API do código antigo
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }

  return data;
}

// Função para adaptar chamadas de API do código antigo
export async function getEstablishmentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil do estabelecimento:', error);
    return null;
  }

  return data;
}

// Funções adicionais para compatibilidade com o código existente
export async function getProfessionals() {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar profissionais:', error);
    return [];
  }

  return data || [];
}

export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }

  return data || [];
}

export async function getAppointments(filters = {}) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      appointment_services(*)
    `);

  // Aplicar filtros se existirem
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  const { data, error } = await query.order('date', { ascending: true });

  if (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }

  return data || [];
}

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }

  return data || [];
}

// Funções para o módulo financeiro
export async function getFinancialData(period = 'month') {
  let startDate, endDate;
  const now = new Date();
  
  if (period === 'day') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  } else if (period === 'week') {
    const day = now.getDay() || 7;
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1).toISOString();
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 8).toISOString();
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1).toISOString();
    endDate = new Date(now.getFullYear() + 1, 0, 0).toISOString();
  }

  const revenuePromise = supabase
    .from('payments')
    .select('*')
    .gte('date', startDate)
    .lt('date', endDate);

  const expensesPromise = supabase
    .from('expenses')
    .select('*')
    .gte('date', startDate)
    .lt('date', endDate);

  const [revenueResult, expensesResult] = await Promise.all([revenuePromise, expensesPromise]);

  return {
    revenue: revenueResult.data || [],
    expenses: expensesResult.data || [],
    revenueError: revenueResult.error,
    expensesError: expensesResult.error
  };
}

// Funções para o módulo de estoque
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  return data || [];
}

export async function getStockMovements() {
  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      *,
      products(id, name, code)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar movimentações de estoque:', error);
    return [];
  }

  return data || [];
}

// Função para salvar agendamento
export async function saveAppointment(appointmentData: any, services: any[]): Promise<any> {
  try {
    // Validação dos dados do agendamento
    const appointmentSchema = {
      client_id: [Validators.required('Cliente é obrigatório')],
      professional_id: [Validators.required('Profissional é obrigatório')],
      date: [Validators.required('Data é obrigatória')],
      start_time: [Validators.required('Horário inicial é obrigatório')]
    };
    
    const errors = validateData(appointmentData, appointmentSchema);
    if (Object.keys(errors).length > 0) {
      console.error('Erro de validação do agendamento:', errors);
      throw new Error('Dados de agendamento inválidos');
    }
    
    // Utiliza proteção CSRF
    return await verifyCSRFToken(async () => {
      // Sanitiza notas para prevenir XSS
      if (appointmentData.notes) {
        appointmentData.notes = Validators.sanitize.text(appointmentData.notes);
      }
      
      // Adiciona token CSRF
      const secureAppointmentData = addCSRFToken(appointmentData);
      
      const { data: appointment, error } = await pulseDadosClient
        .from('appointments')
        .upsert(secureAppointmentData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao salvar agendamento:', error);
        return null;
      }
      
      // Salva os serviços do agendamento
      if (services && services.length > 0) {
        // Remove serviços anteriores se estiver atualizando
        if (appointmentData.id) {
          await pulseDadosClient
            .from('appointment_services')
            .delete()
            .eq('appointment_id', appointmentData.id);
        }
        
        // Adiciona os novos serviços
        const appointmentServices = services.map(service => ({
          appointment_id: appointment.id,
          service_id: service.id,
          service_name: service.name,
          duration: service.duration,
          price: service.price
        }));
        
        const { error: serviceError } = await pulseDadosClient
          .from('appointment_services')
          .insert(appointmentServices);
        
        if (serviceError) {
          console.error('Erro ao salvar serviços do agendamento:', serviceError);
        }
      }
      
      return appointment;
    });
  } catch (error) {
    console.error('Erro ao salvar agendamento:', error);
    return null;
  }
}

/**
 * Funções de autenticação
 */
export async function signIn(email: string, password: string): Promise<any> {
  try {
    // Validação básica
    if (!email || !password) {
      console.error('Email e senha são obrigatórios');
      return { error: { message: 'Email e senha são obrigatórios' } };
    }
    
    // Verificar se não está bloqueado por muitas tentativas
    if (monitorLoginAttempt(email)) {
      logSecurityEvent({
        type: SecurityEventType.LOGIN_FAILURE,
        userEmail: email,
        details: { reason: 'too_many_attempts' }
      });
      return { error: { message: 'Muitas tentativas de login. Tente novamente mais tarde.' } };
    }
    
    // Validação de formato de email
    const emailSchema = {
      email: [Validators.email()]
    };
    
    const errors = validateData({ email }, emailSchema);
    if (Object.keys(errors).length > 0) {
      console.error('Email inválido');
      
      // Registrar tentativa de login com email inválido
      logSecurityEvent({
        type: SecurityEventType.LOGIN_FAILURE,
        userEmail: email,
        details: { reason: 'invalid_email_format' }
      });
      
      return { error: { message: 'Email inválido' } };
    }
    
    // Verificar tentativa de injeção XSS no email
    if (email.includes('<script') || email.includes('javascript:')) {
      logSecurityEvent({
        type: SecurityEventType.XSS_ATTEMPT,
        details: { input: email }
      });
      return { error: { message: 'Formato de email inválido' } };
    }
    
    // Usar proteção CSRF no login
    return await verifyCSRFToken(async () => {
      const { data, error } = await pulseDadosClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erro ao fazer login:', error);
        
        // Registrar falha de login
        logSecurityEvent({
          type: SecurityEventType.LOGIN_FAILURE,
          userEmail: email,
          details: { error: error.message }
        });
        
        // Não revele detalhes específicos do erro para o usuário
        return { error: { message: 'Falha na autenticação. Verifique suas credenciais.' } };
      }
      
      // Login bem-sucedido - limpar contagem de tentativas
      clearLoginAttempts(email);
      
      // Registrar login bem-sucedido
      logSecurityEvent({
        type: SecurityEventType.LOGIN_SUCCESS,
        userId: data.user?.id,
        userEmail: email
      });
      
      return data;
    });
  } catch (error) {
    console.error('Erro no processo de login:', error);
    return { error: { message: 'Ocorreu um erro durante o login' } };
  }
}

export async function signUp(email, password, userData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });

  if (error) {
    console.error('Erro ao criar conta:', error);
    return { error };
  }

  // Se o cadastro foi bem-sucedido, criar o perfil do usuário
  if (data?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: data.user.id,
        ...userData
      }]);

    if (profileError) {
      console.error('Erro ao criar perfil do usuário:', profileError);
      return { error: profileError };
    }
  }

  return { user: data.user, session: data.session };
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });

  if (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return { error };
  }

  return { success: true };
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error('Erro ao atualizar senha:', error);
    return { error };
  }

  return { success: true };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Erro ao fazer logout:', error);
    return { error };
  }

  return { success: true };
}

// Funções para o módulo de marketing
export async function getMarketingCampaigns() {
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar campanhas de marketing:', error);
    return [];
  }

  return data || [];
}

export async function getMarketingMessages() {
  const { data, error } = await supabase
    .from('marketing_messages')
    .select(`
      *,
      marketing_message_recipients(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar mensagens de marketing:', error);
    return [];
  }

  return data || [];
}

export async function sendMarketingMessage(message) {
  const { data, error } = await supabase
    .from('marketing_messages')
    .insert([message])
    .select()
    .single();

  if (error) {
    console.error('Erro ao enviar mensagem de marketing:', error);
    return { error };
  }

  return { message: data };
}

export async function getBirthdayConfig() {
  const { data, error } = await supabase
    .from('marketing_birthday_config')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignora erro de não encontrado
    console.error('Erro ao buscar configuração de aniversário:', error);
    return null;
  }

  return data;
}

export async function updateBirthdayConfig(config) {
  const { data, error } = await supabase
    .from('marketing_birthday_config')
    .upsert([config])
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar configuração de aniversário:', error);
    return { error };
  }

  return { config: data };
}

// Funções para o módulo de usuários e permissões
export async function getUsers() {
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Erro ao buscar usuários:', authError);
    return [];
  }
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
    
  if (profilesError) {
    console.error('Erro ao buscar perfis:', profilesError);
    return authUsers?.users || [];
  }
  
  // Combina os dados de auth com os perfis
  const usersWithProfiles = authUsers?.users.map(user => {
    const profile = profiles.find(p => p.id === user.id);
    return {
      ...user,
      profile
    };
  });
  
  return usersWithProfiles || [];
}

export async function updateUserRole(userId, role) {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role }
  });
  
  if (error) {
    console.error('Erro ao atualizar papel do usuário:', error);
    return { error };
  }
  
  return { success: true };
}

// Funções para o módulo PDV
export async function createOrder(orderData) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar pedido:', error);
    return { error };
  }

  return { order };
}

export async function getOrders(filters = {}) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `);
    
  // Aplicar filtros se existirem
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }

  return data || [];
}

export async function getPaymentMethods() {
  const { data, error } = await supabase
    .from('payment_method_configs')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    return [];
  }

  return data || [];
}

// Funções para o módulo de relatórios
export async function getServicePerformance(startDate, endDate) {
  const { data, error } = await supabase
    .from('service_performance')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error('Erro ao buscar desempenho de serviços:', error);
    return [];
  }

  return data || [];
}

export async function getProfessionalPerformance(startDate, endDate) {
  const { data, error } = await supabase
    .from('professional_appointments')
    .select(`
      *,
      professionals(id, name)
    `)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error('Erro ao buscar desempenho de profissionais:', error);
    return [];
  }

  return data || [];
}

export async function getRevenueData(startDate, endDate) {
  const { data, error } = await supabase
    .from('revenue_data')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');

  if (error) {
    console.error('Erro ao buscar dados de receita:', error);
    return [];
  }

  return data || [];
}

// Funções de configuração de estabelecimento
export async function getEstablishmentConfig() {
  const { data, error } = await supabase
    .from('establishment_configs')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') { // Ignora erro de não encontrado
    console.error('Erro ao buscar configurações do estabelecimento:', error);
    return null;
  }

  return data || {};
}

export async function updateEstablishmentConfig(config) {
  const { data, error } = await supabase
    .from('establishment_configs')
    .upsert([config])
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar configurações do estabelecimento:', error);
    return { error };
  }

  return { config: data };
}

// Funções para o módulo de backup
export async function createBackup() {
  // Esta função seria implementada com a API específica do Supabase para backups
  // ou usando funções de edge para exportar dados
  console.info('Criando backup do banco de dados...');
  return { status: 'pending', message: 'Backup iniciado' };
}

// Websocket/Realtime para atualizações em tempo real
export function subscribeToTable(tableName, callback) {
  return supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, payload => {
      callback(payload);
    })
    .subscribe();
}

// Adaptar hooks personalizados
export function useRealtime(tableName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    // Função para buscar dados iniciais
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: initialData, error } = await supabase
          .from(tableName)
          .select('*');
          
        if (error) throw error;
        if (mounted) setData(initialData || []);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchData();
    
    // Configurar assinatura em tempo real
    const subscription = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, payload => {
        if (!mounted) return;
        
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        // Atualizar dados com base no tipo de evento
        if (eventType === 'INSERT') {
          setData(current => [...current, newRecord]);
        } else if (eventType === 'UPDATE') {
          setData(current => current.map(item => item.id === newRecord.id ? newRecord : item));
        } else if (eventType === 'DELETE') {
          setData(current => current.filter(item => item.id !== oldRecord.id));
        }
      })
      .subscribe();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [tableName]);
  
  return { data, loading, error };
}
