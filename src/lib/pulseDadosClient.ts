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

// Interface para filtros de relatório
export interface ReportFilters {
  professional?: string;
  service?: string;
  status?: string;
  [key: string]: string | undefined;
}

// Interfaces para retornos das funções de relatório
export interface FinancialReportData {
  overview: {
    totalRevenue: number;
    totalExpenses: number;
    totalCommissions: number;
    profit: number;
    marginPercent: number;
    profitability: number;
    profitMargin: number;
    growthRate: number;
    period: {
      start: string;
      end: string;
    };
  };
  revenueByDay: Array<{
    date: string;
    value: number;
  }>;
  revenueByPaymentMethod: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    value: number;
    type: string;
  }>;
  paymentMethods: Array<{
    method: string;
    value: number;
    percentage: number;
  }>;
  expenseCategories: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
  cashFlow: Array<{
    date: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  commissions: Array<{
    professional_id: string;
    professional_name: string;
    service_count: number;
    total_value: number;
    commission_value: number;
  }>;
  rawData: {
    payments: any[];
    expenses: any[];
  };
}

export interface OperationalReportData {
  overview: {
    totalAppointments: number;
    completedRate: number;
    cancelationRate: number;
    averageServiceTime: number;
    capacityUtilization: number;
  };
  professionalEfficiency: Array<{
    id: string | number;
    name: string;
    totalAppointments: number;
    completedAppointments: number;
    canceledAppointments: number;
    totalServiceTime: number;
    occupancyRate: number;
  }>;
  servicePerformance: Array<{
    id: string | number;
    name: string;
    count: number;
    totalDuration: number;
    totalRevenue: number;
    averageDuration: number;
  }>;
  rawData: any[];
}

export interface MarketingReportData {
  overview: {
    totalCampaigns: number;
    totalInvestment: number;
    newClients: number;
    averageCostPerAcquisition: number;
  };
  channelPerformance: Array<{
    channel: string;
    clientCount: number;
    conversionRate: number;
    costPerAcquisition: number;
  }>;
  campaignPerformance: Array<{
    id: string | number;
    name: string;
    channel: string;
    startDate: string;
    endDate: string;
    budget: number;
    clientsAcquired: number;
    roi: number;
  }> | undefined;
  retentionData: {
    newClients: number;
    returningClientsCount: number;
    retentionRate: number;
  };
  rawData: {
    campaigns: any[];
    clientSources: any[];
  };
}

export interface InventoryReportData {
  overview: {
    totalProducts: number;
    lowStockCount: number;
    totalStockValue: number;
    totalConsumption: number;
    totalPurchases: number;
  };
  stockStatus: Array<{
    id: string | number;
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
    stockStatus: string;
    turnoverRate: number;
    value: number;
  }>;
  consumption: Array<{
    id: string | number;
    name: string;
    category: string;
    totalQuantity: number;
    totalValue: number;
  }>;
  purchases: Array<{
    id: string | number;
    date: string;
    productId: string | number;
    productName: string;
    supplier: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  rawData: {
    products: any[];
    movements: any[];
    purchases: any[];
  };
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
  try {
    // Buscar apenas dados reais do Supabase
    const { data, error } = await supabase
      .from('service_performance')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error('Erro ao buscar desempenho de serviços:', error);
      return [];
    }

    // Buscar dados das tabelas principais se a view estiver vazia
    if (!data || data.length === 0) {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          valor_total,
          order_items!inner(
            id,
            nome,
            preco,
            quantidade,
            tipo
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('order_items.tipo', 'servico');

      if (ordersError) {
        console.error('Erro ao buscar dados de serviços:', ordersError);
        return [];
      }

      // Transformar dados das tabelas em estatísticas de serviços
      const serviceStats = {};
      
      ordersData.forEach(order => {
        order.order_items.forEach(item => {
          if (!serviceStats[item.nome]) {
            serviceStats[item.nome] = {
              service_name: item.nome,
              service_count: 0,
              total_revenue: 0,
              average_duration: 45, // Duração padrão
              date: order.created_at
            };
          }
          
          serviceStats[item.nome].service_count += item.quantidade;
          serviceStats[item.nome].total_revenue += (item.preco * item.quantidade);
        });
      });
      
      return Object.values(serviceStats);
    }

    return data;
  } catch (error) {
    console.error('Erro geral ao buscar dados de serviços:', error);
    return [];
  }
}

export async function getProfessionalPerformance(startDate, endDate) {
  try {
    // Buscar apenas dados reais do Supabase
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

    // Buscar dados das tabelas principais se a view estiver vazia
    if (!data || data.length === 0) {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          professional_id,
          professional_name,
          date,
          total_value
        `)
        .gte('date', startDate)
        .lte('date', endDate);

      if (appointmentsError) {
        console.error('Erro ao buscar dados de profissionais:', appointmentsError);
        return [];
      }

      // Transformar dados das tabelas em estatísticas de profissionais
      const professionalStats = {};
      
      appointmentsData.forEach(appointment => {
        const profId = appointment.professional_id;
        const profName = appointment.professional_name;
        
        if (!professionalStats[profId]) {
          professionalStats[profId] = {
            professional_id: profId,
            professional_name: profName || `Profissional #${profId}`,
            appointment_count: 0,
            total_commission: 0,
            date: appointment.date
          };
        }
        
        professionalStats[profId].appointment_count += 1;
        professionalStats[profId].total_commission += appointment.total_value * 0.3; // Comissão estimada de 30%
      });
      
      return Object.values(professionalStats);
    }

    return data;
  } catch (error) {
    console.error('Erro geral ao buscar dados de profissionais:', error);
    return [];
  }
}

export async function getRevenueData(startDate, endDate) {
  try {
    // Buscar apenas dados reais do Supabase
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

    // Buscar dados das tabelas principais se a view estiver vazia
    if (!data || data.length === 0) {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, valor_total')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (ordersError) {
        console.error('Erro ao buscar dados de receita:', ordersError);
        return [];
      }

      // Agrupar dados por mês
      const revenueByMonth: Record<string, {
        date: string;
        revenue: number;
        transaction_count: number;
        average_ticket: number;
      }> = {};
      
      ordersData.forEach(order => {
        const monthKey = new Date(order.created_at).toISOString().substring(0, 7); // formato YYYY-MM
        
        if (!revenueByMonth[monthKey]) {
          revenueByMonth[monthKey] = {
            date: `${monthKey}-01`,  // Primeiro dia do mês
            revenue: 0,
            transaction_count: 0,
            average_ticket: 0
          };
        }
        
        revenueByMonth[monthKey].revenue += parseFloat(order.valor_total || 0);
        revenueByMonth[monthKey].transaction_count += 1;
      });
      
      // Calcular ticket médio e ordenar por data
      const result = Object.values(revenueByMonth).map(month => {
        return {
          date: month.date,
          revenue: month.revenue,
          transaction_count: month.transaction_count,
          average_ticket: month.transaction_count > 0 ? month.revenue / month.transaction_count : 0
        };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return result.length > 0 ? result : [];
    }

    return data;
  } catch (error) {
    console.error('Erro geral ao buscar dados de receita:', error);
    return [];
  }
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

/**
 * Busca dados financeiros detalhados para relatórios
 * @param startDate Data inicial no formato YYYY-MM-DD
 * @param endDate Data final no formato YYYY-MM-DD
 * @param filters Filtros adicionais
 */
export async function getFinancialReportData(startDate: string, endDate: string, filters: ReportFilters = {}): Promise<FinancialReportData> {
  try {
    const { professional = 'todos', service = 'todos' } = filters;
    
    // Buscar pagamentos (receitas)
    const { data: payments, error: paymentsError } = await pulseDadosClient
      .from('payments')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
      
    if (paymentsError) throw paymentsError;
    
    // Buscar despesas
    const { data: expenses, error: expensesError } = await pulseDadosClient
      .from('expenses')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (expensesError) throw expensesError;
    
    // Calcular totais
    const totalRevenue = payments?.reduce((sum, payment) => sum + parseFloat(payment.valor || 0), 0) || 0;
    const totalExpenses = expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0;
    
    // Agrupar por dia para gráficos de tendência
    const revenueByDay: Array<{ date: string; value: number }> = [];
    const expensesByDay: { [key: string]: number } = {};
    const dateRange = new Map<string, boolean>();
    
    // Processar período
    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);
    
    // Inicializar todas as datas no período
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateRange.set(dateStr, true);
      revenueByDay.push({ date: dateStr, value: 0 });
      expensesByDay[dateStr] = 0;
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Agregar receitas por dia
    payments?.forEach(payment => {
      const paymentDate = payment.date.split('T')[0];
      const revenueData = revenueByDay.find(item => item.date === paymentDate);
      if (revenueData) {
        revenueData.value += parseFloat(payment.valor || 0);
      }
    });
    
    // Agregar despesas por dia
    expenses?.forEach(expense => {
      const expenseDate = expense.date.split('T')[0];
      if (expensesByDay[expenseDate] !== undefined) {
        expensesByDay[expenseDate] += parseFloat(expense.amount || 0);
      }
    });
    
    // Calcular fluxo de caixa
    const cashFlow = Object.keys(expensesByDay).map(date => {
      const revenueForDay = revenueByDay.find(item => item.date === date)?.value || 0;
      return {
        date,
        income: revenueForDay,
        expense: expensesByDay[date],
        balance: revenueForDay - expensesByDay[date]
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
    
    // Processar métodos de pagamento
    const revenueByPaymentMethod: { [key: string]: { method: string; amount: number; count: number } } = {};
    
    // Agrupar pagamentos por método
    payments?.forEach(payment => {
      const method = payment.payment_method || 'Outros';
      
      if (!revenueByPaymentMethod[method]) {
        revenueByPaymentMethod[method] = { method, amount: 0, count: 0 };
      }
      
      revenueByPaymentMethod[method].amount += parseFloat(payment.valor || 0);
      revenueByPaymentMethod[method].count += 1;
    });
    
    // Processar categorias de despesas
    const expensesByCategory: { [key: string]: { category: string; amount: number; count: number } } = {};
    
    // Agrupar despesas por categoria
    expenses?.forEach(expense => {
      const category = expense.category || 'Outros';
      
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = { category, amount: 0, count: 0 };
      }
      
      expensesByCategory[category].amount += parseFloat(expense.amount || 0);
      expensesByCategory[category].count += 1;
    });
    
    // Calcular comissões
    const { data: commissions, error: commError } = await pulseDadosClient
      .from('professional_commissions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (commError) throw commError;
    
    // Formatar dados de comissões
    const formattedCommissions = commissions?.map(comm => ({
      professional_id: comm.professional_id,
      professional_name: comm.professional_name,
      service_count: parseInt(comm.service_count || '0', 10),
      total_value: parseFloat(comm.total_value || '0'),
      commission_value: parseFloat(comm.commission_value || '0')
    })) || [];
    
    // Calcular total de comissões
    const totalCommissions = formattedCommissions.reduce((sum, comm) => sum + comm.commission_value, 0);
    
    // Transformar dados para métodos de pagamento para o formato necessário
    const paymentMethods = Object.values(revenueByPaymentMethod).map(method => ({
      method: method.method,
      value: method.amount,
      percentage: totalRevenue > 0 ? (method.amount / totalRevenue) * 100 : 0
    }));
    
    // Transformar dados de categorias de despesas para o formato necessário
    const expenseCategories = Object.values(expensesByCategory).map(category => ({
      category: category.category,
      value: category.amount,
      percentage: totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
    }));
    
    // Formatar transações
    const transactions = [
      ...(payments?.map(payment => ({
        id: payment.id,
        date: payment.date,
        description: payment.description || 'Pagamento',
        value: parseFloat(payment.valor || '0'),
        type: 'receita'
      })) || []),
      ...(expenses?.map(expense => ({
        id: expense.id,
        date: expense.date,
        description: expense.description || 'Despesa',
        value: parseFloat(expense.amount || '0'),
        type: 'despesa'
      })) || [])
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Lucro e margem
    const profit = totalRevenue - totalExpenses - totalCommissions;
    const marginPercent = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Calcular crescimento (comparando com período anterior)
    const previousPeriodStart = new Date(start);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const previousPeriodEnd = new Date(start);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
    
    const { data: prevPayments } = await pulseDadosClient
      .from('payments')
      .select('valor')
      .gte('date', previousPeriodStart.toISOString().split('T')[0])
      .lte('date', previousPeriodEnd.toISOString().split('T')[0]);
    
    const prevRevenue = prevPayments?.reduce((sum, payment) => sum + parseFloat(payment.valor || 0), 0) || 0;
    const growthRate = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    
    return {
      overview: {
        totalRevenue,
        totalExpenses,
        totalCommissions,
        profit,
        marginPercent,
        profitability: profit > 0 ? profit / totalExpenses * 100 : 0,
        profitMargin: marginPercent,
        growthRate,
        period: {
          start: startDate,
          end: endDate
        }
      },
      revenueByDay,
      revenueByPaymentMethod: Object.values(revenueByPaymentMethod),
      expensesByCategory: Object.values(expensesByCategory),
      transactions,
      paymentMethods,
      expenseCategories,
      cashFlow,
      commissions: formattedCommissions,
      rawData: {
        payments: payments || [],
        expenses: expenses || []
      }
    };
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return {
      overview: {
        totalRevenue: 0,
        totalExpenses: 0,
        totalCommissions: 0,
        profit: 0,
        marginPercent: 0,
        profitability: 0,
        profitMargin: 0,
        growthRate: 0,
        period: {
          start: startDate,
          end: endDate
        }
      },
      revenueByDay: [],
      revenueByPaymentMethod: [],
      expensesByCategory: [],
      transactions: [],
      paymentMethods: [],
      expenseCategories: [],
      cashFlow: [],
      commissions: [],
      rawData: {
        payments: [],
        expenses: []
      }
    };
  }
}

/**
 * Busca dados de clientes para relatórios
 * @param startDate Data inicial no formato YYYY-MM-DD
 * @param endDate Data final no formato YYYY-MM-DD
 * @param filters Filtros adicionais
 */
export async function getClientReportData(startDate: string, endDate: string, filters: ReportFilters = {}): Promise<any> {
  try {
    // Busca clientes, agendamentos e transações no período
    const [clientsPromise, appointmentsPromise, ordersPromise] = await Promise.allSettled([
      // Clientes existentes
      supabase
        .from('clients')
        .select('*'),
      
      // Agendamentos no período
      supabase
        .from('appointments')
        .select('*, appointment_services(*)')
        .gte('date', startDate)
        .lte('date', endDate),
      
      // Transações/pedidos no período
      supabase
        .from('orders')
        .select('*')
        .gte('data_hora', startDate)
        .lte('data_hora', endDate)
    ]);
    
    // Processar resultados
    const clients = clientsPromise.status === 'fulfilled' && !clientsPromise.value.error ? clientsPromise.value.data || [] : [];
    const appointments = appointmentsPromise.status === 'fulfilled' && !appointmentsPromise.value.error ? appointmentsPromise.value.data || [] : [];
    const orders = ordersPromise.status === 'fulfilled' && !ordersPromise.value.error ? ordersPromise.value.data || [] : [];
    
    // Contagem de novos clientes no período
    const newClients = clients.filter(client => {
      const createdAt = new Date(client.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Ajustar para final do dia
      
      return createdAt >= start && createdAt <= end;
    }).length;
    
    // Conjunto de clientes ativos no período
    const activeClientsInPeriod = new Set<string>();
    
    // Mapear serviços por cliente
    const servicesPerClient: Record<string, {
      clientId: string;
      clientName: string;
      serviceCount: number;
      services: Record<string, {
        serviceId: string;
        serviceName: string;
        count: number;
        revenue: number;
      }>;
    }> = {};
    
    // Mapear ticket médio por cliente
    const ticketByClient: Record<string, {
      clientId: string;
      clientName: string;
      orderCount: number;
      totalSpent: number;
    }> = {};
    
    // Processar agendamentos
    appointments.forEach(app => {
      const clientId = app.client_id;
      if (clientId) {
        activeClientsInPeriod.add(clientId);
        
        if (!servicesPerClient[clientId]) {
          servicesPerClient[clientId] = {
            clientId,
            clientName: app.client_name || 'Cliente não identificado',
            serviceCount: 0,
            services: {}
          };
        }
        
        const serviceCount = app.appointment_services?.length || 0;
        servicesPerClient[clientId].serviceCount += serviceCount;
        
        // Contabilizar serviços específicos
        app.appointment_services?.forEach(service => {
          const serviceId = service.service_id;
          if (!servicesPerClient[clientId].services[serviceId]) {
            servicesPerClient[clientId].services[serviceId] = {
              serviceId,
              serviceName: service.service_name,
              count: 0,
              revenue: 0
            };
          }
          servicesPerClient[clientId].services[serviceId].count += 1;
          servicesPerClient[clientId].services[serviceId].revenue += parseFloat(service.price || 0);
        });
      }
    });
    
    // Processar pedidos/transações
    orders.forEach(order => {
      const clientId = order.client_id;
      if (clientId) {
        activeClientsInPeriod.add(clientId);
        
        if (!ticketByClient[clientId]) {
          ticketByClient[clientId] = {
            clientId,
            clientName: order.client_nome || 'Cliente não identificado',
            orderCount: 0,
            totalSpent: 0
          };
        }
        
        ticketByClient[clientId].orderCount += 1;
        ticketByClient[clientId].totalSpent += parseFloat(order.valor_total || 0);
      }
    });
    
    // Calcular estatísticas
    const activeClientCount = activeClientsInPeriod.size;
    const servicesData = Object.values(servicesPerClient);
    const ticketData = Object.values(ticketByClient).map(client => ({
      ...client,
      avgTicket: client.orderCount > 0 ? client.totalSpent / client.orderCount : 0
    }));
    
    // Calcular frequência dos clientes (clientes recorrentes)
    const clientFrequency: Record<string, {
      clientId: string;
      clientName: string;
      visitCount: number;
      lastVisit: string | null;
    }> = {};
    
    appointments.forEach(app => {
      if (!clientFrequency[app.client_id]) {
        clientFrequency[app.client_id] = {
          clientId: app.client_id,
          clientName: app.client_name,
          visitCount: 0,
          lastVisit: null
        };
      }
      
      clientFrequency[app.client_id].visitCount += 1;
      const appDate = new Date(app.date);
      if (!clientFrequency[app.client_id].lastVisit || appDate > new Date(clientFrequency[app.client_id].lastVisit!)) {
        clientFrequency[app.client_id].lastVisit = app.date;
      }
    });
    
    // Segmentação de clientes
    const segments = {
      new: 0, // Novos clientes no período
      recurrent: 0, // Mais de uma visita no período
      oneTime: 0, // Apenas uma visita no período
      inactive: clients.length - activeClientCount // Total - ativos
    };
    
    Object.values(clientFrequency).forEach(client => {
      if (client.visitCount > 1) {
        segments.recurrent += 1;
      } else {
        segments.oneTime += 1;
      }
    });
    
    segments.new = newClients;
    
    return {
      overview: {
        totalClients: clients.length,
        activeClients: activeClientCount,
        newClients,
        avgServicesPerClient: activeClientCount > 0 ? appointments.length / activeClientCount : 0,
        avgTicket: orders.length > 0 ? orders.reduce((sum, order) => sum + parseFloat(order.valor_total || 0), 0) / orders.length : 0
      },
      segments,
      servicesData,
      ticketData,
      clientFrequency: Object.values(clientFrequency),
      rawData: {
        clients,
        appointments,
        orders
      }
    };
  } catch (error) {
    console.error('Erro ao buscar dados de clientes para relatório:', error);
    return {
      overview: {
        totalClients: 0,
        activeClients: 0,
        newClients: 0,
        avgServicesPerClient: 0,
        avgTicket: 0
      },
      segments: {
        new: 0,
        recurrent: 0,
        oneTime: 0,
        inactive: 0
      },
      servicesData: [],
      ticketData: [],
      clientFrequency: [],
      rawData: {
        clients: [],
        appointments: [],
        orders: []
      }
    };
  }
}

// Busca dados operacionais para relatórios
// @param startDate Data inicial no formato YYYY-MM-DD
// @param endDate Data final no formato YYYY-MM-DD
// @param filters Filtros adicionais
export async function getOperationalReportData(startDate: string, endDate: string, filters: ReportFilters = {}): Promise<OperationalReportData> {
  try {
    // Busca agendamentos no período
    const { data: appointments, error: appointmentError } = await pulseDadosClient
      .from('appointments')
      .select(`
        *,
        appointment_services(*)
      `)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (appointmentError) throw appointmentError;
    
    // Aplicar filtros caso existam
    const filteredAppointments = appointments.filter(appointment => {
      let passesFilter = true;
      
      if (filters.professional && filters.professional !== 'todos') {
        passesFilter = passesFilter && appointment.professional_id.toString() === filters.professional;
      }
      
      if (filters.status && filters.status !== 'todos') {
        passesFilter = passesFilter && appointment.status === filters.status;
      }
      
      return passesFilter;
    });
    
    // Cálculos de eficiência
    const totalSlots = filteredAppointments.length;
    const completedAppointments = filteredAppointments.filter(a => a.status === 'concluido').length;
    const canceledAppointments = filteredAppointments.filter(a => a.status === 'cancelado').length;
    
    // Tempo total de serviços e ociosidade
    let totalServiceTime = 0;
    
    // Análise de eficiência por profissional
    const professionalStats: Record<string, {
      id: string | number;
      name: string;
      totalAppointments: number;
      completedAppointments: number;
      canceledAppointments: number;
      totalServiceTime: number;
      occupancyRate: number;
    }> = {};
    
    filteredAppointments.forEach(appointment => {
      const profId = appointment.professional_id;
      
      if (!professionalStats[profId]) {
        professionalStats[profId] = {
          id: profId,
          name: appointment.professional_name,
          totalAppointments: 0,
          completedAppointments: 0,
          canceledAppointments: 0,
          totalServiceTime: 0,
          occupancyRate: 0
        };
      }
      
      professionalStats[profId].totalAppointments += 1;
      
      if (appointment.status === 'concluido') {
        professionalStats[profId].completedAppointments += 1;
        professionalStats[profId].totalServiceTime += appointment.duration || 0;
        totalServiceTime += appointment.duration || 0;
      } else if (appointment.status === 'cancelado') {
        professionalStats[profId].canceledAppointments += 1;
      }
    });
    
    // Análise de serviços
    const serviceStats: Record<string, {
      id: string | number;
      name: string;
      count: number;
      totalDuration: number;
      totalRevenue: number;
      averageDuration: number;
    }> = {};
    
    filteredAppointments.forEach(appointment => {
      appointment.appointment_services?.forEach(service => {
        const serviceId = service.service_id;
        
        if (!serviceStats[serviceId]) {
          serviceStats[serviceId] = {
            id: serviceId,
            name: service.service_name,
            count: 0,
            totalDuration: 0,
            totalRevenue: 0,
            averageDuration: 0
          };
        }
        
        serviceStats[serviceId].count += 1;
        serviceStats[serviceId].totalDuration += service.duration || 0;
        serviceStats[serviceId].totalRevenue += parseFloat(service.price || 0);
      });
    });
    
    // Calcular médias
    Object.values(serviceStats).forEach(service => {
      service.averageDuration = service.count > 0 ? service.totalDuration / service.count : 0;
    });
    
    // Calcular ocupação por profissional
    Object.values(professionalStats).forEach(prof => {
      // Considerando 8h de trabalho por dia útil no período
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const workingDays = Math.max(1, diffDays * 0.7); // Aproximadamente 70% dos dias são úteis
      const availableMinutes = workingDays * 8 * 60; // 8 horas em minutos
      
      prof.occupancyRate = (prof.totalServiceTime / availableMinutes) * 100;
    });
    
    return {
      overview: {
        totalAppointments: totalSlots,
        completedRate: totalSlots > 0 ? (completedAppointments / totalSlots) * 100 : 0,
        cancelationRate: totalSlots > 0 ? (canceledAppointments / totalSlots) * 100 : 0,
        averageServiceTime: completedAppointments > 0 ? totalServiceTime / completedAppointments : 0,
        capacityUtilization: Object.keys(professionalStats).length > 0 ? 
          Object.values(professionalStats).reduce((sum, prof) => sum + prof.occupancyRate, 0) / Object.keys(professionalStats).length : 0
      },
      professionalEfficiency: Object.values(professionalStats),
      servicePerformance: Object.values(serviceStats),
      rawData: filteredAppointments
    };
  } catch (error) {
    console.error('Erro ao buscar dados operacionais para relatório:', error);
    return {
      overview: {
        totalAppointments: 0,
        completedRate: 0,
        cancelationRate: 0,
        averageServiceTime: 0,
        capacityUtilization: 0
      },
      professionalEfficiency: [],
      servicePerformance: [],
      rawData: []
    };
  }
}

// Busca dados de estoque para relatórios
// @param startDate Data inicial no formato YYYY-MM-DD
// @param endDate Data final no formato YYYY-MM-DD
// @param filters Filtros adicionais
export async function getInventoryReportData(startDate: string, endDate: string, filters: ReportFilters = {}): Promise<InventoryReportData> {
  try {
    // Buscar produtos
    const { data: products, error: productsError } = await pulseDadosClient
      .from('products')
      .select('*');
    
    if (productsError) throw productsError;
    
    // Buscar movimentações de estoque
    const { data: movements, error: movementsError } = await pulseDadosClient
      .from('stock_movements')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (movementsError) throw movementsError;
    
    // Tratar caso não existam os dados ainda
    const productsArray = products || [];
    const movementsArray = movements || [];
    
    // Análise de estoque atual
    const stockStatus = productsArray.map(product => {
      // Calcular estoque atual baseado em movimentações
      const productMovements = movementsArray.filter(m => m.product_id === product.id) || [];
      
      let currentStock = parseInt(product.quantity || 0);
      productMovements.forEach(movement => {
        if (movement.type === 'entrada') {
          currentStock += parseInt(movement.quantity || 0);
        } else if (movement.type === 'saida') {
          currentStock -= parseInt(movement.quantity || 0);
        }
      });
      
      // Calcular taxa de rotatividade
      const totalOut = productMovements
        .filter(m => m.type === 'saida')
        .reduce((sum, m) => sum + parseInt(m.quantity || 0), 0);
      
      const turnoverRate = currentStock > 0 ? totalOut / currentStock : 0;
      
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        currentStock,
        minStock: parseInt(product.min_quantity || 0),
        stockStatus: currentStock <= parseInt(product.min_quantity || 0) ? 'baixo' : 
                    currentStock <= parseInt(product.min_quantity || 0) * 1.5 ? 'médio' : 'adequado',
        turnoverRate,
        value: currentStock * parseFloat(product.sale_price || 0)
      };
    });
    
    // Análise de consumo
    const consumptionAnalysis: Record<string, {
      id: string | number;
      name: string;
      category: string;
      totalQuantity: number;
      totalValue: number;
    }> = {};
    
    movementsArray.forEach(movement => {
      if (movement.type === 'saida') {
        const productId = movement.product_id;
        const product = productsArray.find(p => p.id === productId);
        
        if (!product) return;
        
        if (!consumptionAnalysis[productId]) {
          consumptionAnalysis[productId] = {
            id: productId,
            name: product.name,
            category: product.category,
            totalQuantity: 0,
            totalValue: 0
          };
        }
        
        const quantity = parseInt(movement.quantity || 0);
        consumptionAnalysis[productId].totalQuantity += quantity;
        consumptionAnalysis[productId].totalValue += quantity * parseFloat(product.sale_price || 0);
      }
    });
    
    // Simplificando para evitar erros de tipagem com tabelas que ainda não existem
    const purchases: Array<{
      id: string | number;
      date: string;
      productId: string | number;
      productName: string;
      supplier: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
    }> = [];
    
    return {
      overview: {
        totalProducts: productsArray.length,
        lowStockCount: stockStatus.filter(p => p.stockStatus === 'baixo').length,
        totalStockValue: stockStatus.reduce((sum, p) => sum + p.value, 0),
        totalConsumption: Object.values(consumptionAnalysis).reduce((sum, p) => sum + p.totalValue, 0),
        totalPurchases: purchases.reduce((sum, p) => sum + p.totalCost, 0)
      },
      stockStatus,
      consumption: Object.values(consumptionAnalysis),
      purchases,
      rawData: {
        products: productsArray,
        movements: movementsArray,
        purchases: []
      }
    };
  } catch (error) {
    console.error('Erro ao buscar dados de estoque para relatório:', error);
    return {
      overview: {
        totalProducts: 0,
        lowStockCount: 0,
        totalStockValue: 0,
        totalConsumption: 0,
        totalPurchases: 0
      },
      stockStatus: [],
      consumption: [],
      purchases: [],
      rawData: {
        products: [],
        movements: [],
        purchases: []
      }
    };
  }
}

// Busca dados de marketing para relatórios
// @param startDate Data inicial no formato YYYY-MM-DD
// @param endDate Data final no formato YYYY-MM-DD
// @param filters Filtros adicionais
export async function getMarketingReportData(startDate: string, endDate: string, filters: ReportFilters = {}): Promise<MarketingReportData> {
  try {
    // Buscar dados de campanhas de marketing
    const { data: campaigns, error: campaignsError } = await pulseDadosClient
      .from('marketing_campaigns')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (campaignsError) throw campaignsError;
    
    // Buscar dados de clientes no período
    const { data: clients, error: clientsError } = await pulseDadosClient
      .from('clients')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    
    if (clientsError) throw clientsError;
    
    // Buscar dados de origem dos clientes
    const { data: clientSources, error: sourcesError } = await pulseDadosClient
      .from('client_acquisition')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (sourcesError) throw sourcesError;
    
    // Análise de canais de aquisição
    const channelPerformance = {};
    
    clientSources?.forEach(source => {
      const channel = source.source || 'Desconhecido';
      
      if (!channelPerformance[channel]) {
        channelPerformance[channel] = {
          channel,
          clientCount: 0,
          conversionRate: 0,
          costPerAcquisition: 0
        };
      }
      
      channelPerformance[channel].clientCount += source.count || 1;
    });
    
    // Calcular custo por aquisição por canal
    campaigns?.forEach(campaign => {
      const channel = campaign.channel;
      if (channelPerformance[channel]) {
        const cost = parseFloat(campaign.cost || 0);
        const count = channelPerformance[channel].clientCount;
        channelPerformance[channel].costPerAcquisition = count > 0 ? cost / count : 0;
      }
    });
    
    // Análise de campanhas
    const campaignPerformance = campaigns?.map(campaign => {
      const relatedChannel = channelPerformance[campaign.channel];
      return {
        id: campaign.id,
        name: campaign.name,
        channel: campaign.channel,
        startDate: campaign.date,
        endDate: campaign.end_date,
        budget: parseFloat(campaign.cost || 0),
        clientsAcquired: relatedChannel?.clientCount || 0,
        roi: relatedChannel ? (relatedChannel.clientCount * parseFloat(campaign.average_client_value || 0)) / parseFloat(campaign.cost || 1) : 0
      };
    });
    
    // Análise de retenção de clientes
    const retentionData = {
      newClients: clients?.length || 0,
      returningClientsCount: 0,
      retentionRate: 0
    };
    
    return {
      overview: {
        totalCampaigns: campaigns?.length || 0,
        totalInvestment: campaigns?.reduce((sum, campaign) => sum + parseFloat(campaign.cost || 0), 0) || 0,
        newClients: retentionData.newClients,
        averageCostPerAcquisition: retentionData.newClients > 0 ? 
          (campaigns?.reduce((sum, campaign) => sum + parseFloat(campaign.cost || 0), 0) || 0) / retentionData.newClients : 0
      },
      channelPerformance: Object.values(channelPerformance),
      campaignPerformance,
      retentionData,
      rawData: {
        campaigns: campaigns || [],
        clientSources: clientSources || []
      }
    };
  } catch (error) {
    console.error('Erro ao buscar dados de marketing para relatório:', error);
    return {
      overview: {
        totalCampaigns: 0,
        totalInvestment: 0,
        newClients: 0,
        averageCostPerAcquisition: 0
      },
      channelPerformance: [],
      campaignPerformance: [],
      retentionData: {
        newClients: 0,
        returningClientsCount: 0,
        retentionRate: 0
      },
      rawData: {
        campaigns: [],
        clientSources: []
      }
    };
  }
}
