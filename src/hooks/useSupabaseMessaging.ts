import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { format, parseISO, addMinutes, isWithinInterval } from 'date-fns';

// Interfaces para tipagem
export interface Appointment {
  id: string;
  professional_id: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  start_time: string;
  end_time: string;
  value: number;
  status: string;
  notes?: string;
  commission?: number;
  created_at: string;
  updated_at: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  profile_image?: string;
  is_agenda_open: boolean;
  auth_id?: string;
  email?: string;
  phone?: string;
  hiring_date?: string;
  status?: string;
}

export interface EstablishmentDetails {
  id: string;
  name?: string;
  description?: string;
  logo_url?: string;
  whatsapp?: string;
  email?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
  custom_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export interface UseSupabaseMessagingReturn {
  // Dados
  establishmentData: EstablishmentDetails | null;
  professionals: Professional[];
  appointments: Appointment[];
  userAppointments: Appointment[];
  services: Service[];
  
  // Estado de carregamento
  isLoadingEstablishment: boolean;
  isLoadingProfessionals: boolean;
  isLoadingAppointments: boolean;
  isLoadingUserAppointments: boolean;
  
  // Funções para buscar dados
  fetchEstablishmentData: () => Promise<void>;
  fetchProfessionals: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchClientAppointments: (phone: string) => Promise<void>;
  
  // Funções para manipular agendamentos
  createAppointment: (appointmentData: Partial<Appointment>) => Promise<Appointment | null>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  
  // Funções para cálculos
  getAvailableDates: (professionalId: string, daysAhead?: number) => string[];
  getAvailableHours: (professionalId: string, date: string, serviceId: string) => string[];
  
  // Utilitários
  formatPhone: (phone: string) => string;
  normalizePhone: (phone: string) => string;
  
  // Handlers para evento
  subscriptions: Record<string, RealtimeChannel>;
}

// Mock de serviços - em produção viria do banco de dados
const defaultServices: Service[] = [
  { id: "1", name: "Corte de Cabelo", duration: 30, price: 50 },
  { id: "2", name: "Coloração", duration: 120, price: 150 },
  { id: "3", name: "Manicure", duration: 60, price: 40 },
  { id: "4", name: "Pedicure", duration: 60, price: 45 },
  { id: "5", name: "Hidratação", duration: 45, price: 70 }
];

export const useSupabaseMessaging = (): UseSupabaseMessagingReturn => {
  // Estados
  const [establishmentData, setEstablishmentData] = useState<EstablishmentDetails | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>(defaultServices);
  
  // Estados de carregamento
  const [isLoadingEstablishment, setIsLoadingEstablishment] = useState(false);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isLoadingUserAppointments, setIsLoadingUserAppointments] = useState(false);
  
  // Armazenar inscrições ativas
  const [subscriptions, setSubscriptions] = useState<Record<string, RealtimeChannel>>({});
  
  // Funções de utilidade
  const formatPhone = (phone: string): string => {
    const clean = phone.replace(/\D/g, '');
    
    // Formatação para telefone brasileiro
    if (clean.length <= 11) {
      const match = clean.match(/^(\d{2})(\d{4,5})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    
    return phone;
  };
  
  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };
  
  // Buscar dados do estabelecimento
  const fetchEstablishmentData = useCallback(async (): Promise<void> => {
    try {
      setIsLoadingEstablishment(true);
      
      const { data, error } = await supabase
        .from('establishment_details')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      
      setEstablishmentData(data);
    } catch (error) {
      console.error('Erro ao buscar dados do estabelecimento:', error);
    } finally {
      setIsLoadingEstablishment(false);
    }
  }, []);
  
  // Buscar profissionais
  const fetchProfessionals = useCallback(async (): Promise<void> => {
    try {
      setIsLoadingProfessionals(true);
      
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    } finally {
      setIsLoadingProfessionals(false);
    }
  }, []);
  
  // Buscar agendamentos
  const fetchAppointments = useCallback(async (): Promise<void> => {
    try {
      setIsLoadingAppointments(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time');
      
      if (error) throw error;
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, []);
  
  // Buscar agendamentos do cliente por telefone
  const fetchClientAppointments = useCallback(async (phone: string): Promise<void> => {
    if (!phone) return;
    
    try {
      setIsLoadingUserAppointments(true);
      
      // Normaliza o telefone removendo espaços e caracteres especiais
      const normalizedPhone = normalizePhone(phone);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_phone', normalizedPhone)
        .gte('start_time', new Date().toISOString())
        .order('start_time');
      
      if (error) throw error;
      
      setUserAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos do cliente:', error);
      throw error;
    } finally {
      setIsLoadingUserAppointments(false);
    }
  }, []);
  
  // Criar um novo agendamento
  const createAppointment = useCallback(async (appointmentData: Partial<Appointment>): Promise<Appointment | null> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar o cache local de agendamentos
      fetchAppointments();
      
      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }, [fetchAppointments]);
  
  // Cancelar um agendamento
  const cancelAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelado' })
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  }, []);
  
  // Obter datas disponíveis para agendamento
  const getAvailableDates = useCallback((professionalId: string, daysAhead = 7): string[] => {
    if (!professionalId) return [];
    
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Verificar se não é domingo (0) ou fora do horário comercial
      if (date.getDay() !== 0) {
        dates.push(format(date, 'yyyy-MM-dd'));
      }
    }
    
    return dates;
  }, []);
  
  // Obter horários disponíveis para agendamento
  const getAvailableHours = useCallback((professionalId: string, date: string, serviceId: string): string[] => {
    if (!professionalId || !date || !serviceId) return [];
    
    const service = services.find(s => s.id === serviceId);
    if (!service) return [];
    
    const serviceDuration = service.duration;
    const hours = [];
    
    // Horário comercial: 9h às 18h
    for (let hour = 9; hour <= 17; hour++) {
      const startHour = `${hour.toString().padStart(2, '0')}:00`;
      
      // Verifica se já existe agendamento neste horário para este profissional
      const isAvailable = !appointments.some(appointment => {
        if (appointment.professional_id !== professionalId) return false;
        if (appointment.status === 'cancelado') return false;
        
        const apptStart = new Date(appointment.start_time);
        const apptEnd = new Date(appointment.end_time);
        
        const currentStart = new Date(`${date}T${startHour}:00`);
        const currentEnd = addMinutes(currentStart, serviceDuration);
        
        return (
          // Verifica sobreposição de horários
          isWithinInterval(currentStart, { start: apptStart, end: apptEnd }) ||
          isWithinInterval(currentEnd, { start: apptStart, end: apptEnd }) ||
          (currentStart <= apptStart && currentEnd >= apptEnd)
        );
      });
      
      if (isAvailable) {
        hours.push(startHour);
      }
    }
    
    return hours;
  }, [appointments, services]);
  
  // Configurar assinaturas em tempo real ao montar
  useEffect(() => {
    const setupRealtimeSubscriptions = () => {
      // Assinatura para alterações em agendamentos
      const appointmentsChannel = supabase
        .channel('appointments-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'appointments'
        }, () => {
          fetchAppointments();
        })
        .subscribe();
      
      // Assinatura para alterações em profissionais
      const professionalsChannel = supabase
        .channel('professionals-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'professionals'
        }, () => {
          fetchProfessionals();
        })
        .subscribe();
      
      // Assinatura para alterações em dados do estabelecimento
      const establishmentChannel = supabase
        .channel('establishment-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'establishment_details'
        }, () => {
          fetchEstablishmentData();
        })
        .subscribe();
      
      // Atualizar estado de inscrições
      setSubscriptions({
        appointments: appointmentsChannel,
        professionals: professionalsChannel,
        establishment: establishmentChannel
      });
      
      // Carregar os dados iniciais
      fetchEstablishmentData();
      fetchProfessionals();
      fetchAppointments();
    };
    
    setupRealtimeSubscriptions();
    
    // Limpeza ao desmontar
    return () => {
      Object.values(subscriptions).forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [fetchAppointments, fetchEstablishmentData, fetchProfessionals]);
  
  return {
    // Dados
    establishmentData,
    professionals,
    appointments,
    userAppointments,
    services,
    
    // Estado de carregamento
    isLoadingEstablishment,
    isLoadingProfessionals,
    isLoadingAppointments,
    isLoadingUserAppointments,
    
    // Funções para buscar dados
    fetchEstablishmentData,
    fetchProfessionals,
    fetchAppointments,
    fetchClientAppointments,
    
    // Funções para manipular agendamentos
    createAppointment,
    cancelAppointment,
    
    // Funções para cálculos
    getAvailableDates,
    getAvailableHours,
    
    // Utilitários
    formatPhone,
    normalizePhone,
    
    // Handlers para evento
    subscriptions
  };
};

export default useSupabaseMessaging;
