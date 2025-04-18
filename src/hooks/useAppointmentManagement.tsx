import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import type { Appointment } from '@/types/appointment';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseAppointmentManagementProps {
  initialFilter?: {
    startDate?: Date;
    endDate?: Date;
    professionalId?: number | null;
    status?: string;
    searchTerm?: string;
  };
}

export function useAppointmentManagement({
  initialFilter = {}
}: UseAppointmentManagementProps = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Estado para os filtros
  const [filters, setFilters] = useState({
    startDate: initialFilter.startDate || new Date(),
    endDate: initialFilter.endDate,
    professionalId: initialFilter.professionalId || null,
    status: initialFilter.status || '',
    searchTerm: initialFilter.searchTerm || '',
  });

  // Função para buscar os agendamentos do Supabase
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Consulta base para a tabela appointments
      let query = supabase
        .from('appointments')
        .select(`
          *,
          appointment_services (*)
        `);
      
      // Aplicar filtros se fornecidos
      if (filters.startDate) {
        const startDateStr = filters.startDate.toISOString();
        query = query.gte('date', startDateStr);
      }
      
      if (filters.endDate) {
        const endDateStr = filters.endDate.toISOString();
        query = query.lte('date', endDateStr);
      }
      
      if (filters.professionalId) {
        query = query.eq('professional_id', filters.professionalId);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.searchTerm) {
        query = query.or(`client_name.ilike.%${filters.searchTerm}%,professional_name.ilike.%${filters.searchTerm}%`);
      }
      
      // Ordenar por data e hora
      query = query.order('date', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
      }
      
      // Mapear os dados do Supabase para o formato usado pelo frontend
      const formattedAppointments: Appointment[] = data.map(app => ({
        id: app.id,
        clientId: app.client_id,
        clientName: app.client_name,
        professionalId: app.professional_id,
        professionalName: app.professional_name,
        date: new Date(app.date),
        startTime: app.start_time,
        endTime: app.end_time,
        duration: app.duration,
        status: app.status,
        paymentStatus: app.payment_status,
        totalValue: app.total_value,
        notes: app.notes,
        services: app.appointment_services.map((service: any) => ({
          id: service.service_id,
          name: service.service_name,
          duration: service.duration,
          price: service.price
        }))
      }));
      
      setAppointments(formattedAppointments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar agendamentos'));
      console.error('Erro ao buscar agendamentos:', err);
      toast({
        title: 'Erro ao carregar agendamentos',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // Função para atualizar os filtros
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Função para criar um novo agendamento
  const createAppointment = useCallback(async (appointment: Omit<Appointment, 'id'>) => {
    try {
      setLoading(true);
      
      // Primeiro, inserir na tabela principal
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: appointment.clientId,
          client_name: appointment.clientName,
          professional_id: appointment.professionalId,
          professional_name: appointment.professionalName,
          date: appointment.date.toISOString(),
          start_time: appointment.startTime,
          end_time: appointment.endTime,
          duration: appointment.duration,
          status: appointment.status,
          payment_status: appointment.paymentStatus,
          total_value: appointment.totalValue,
          notes: appointment.notes
        })
        .select();
      
      if (appointmentError) {
        throw new Error(`Erro ao criar agendamento: ${appointmentError.message}`);
      }
      
      if (!appointmentData || appointmentData.length === 0) {
        throw new Error('Nenhum dado retornado após a criação do agendamento');
      }
      
      const newAppointmentId = appointmentData[0].id;
      
      // Em seguida, inserir os serviços associados
      if (appointment.services && appointment.services.length > 0) {
        const servicesData = appointment.services.map(service => ({
          appointment_id: newAppointmentId,
          service_id: service.id,
          service_name: service.name,
          duration: service.duration,
          price: service.price
        }));
        
        const { error: servicesError } = await supabase
          .from('appointment_services')
          .insert(servicesData);
        
        if (servicesError) {
          throw new Error(`Erro ao adicionar serviços ao agendamento: ${servicesError.message}`);
        }
      }
      
      // Atualizar a lista local de agendamentos
      await fetchAppointments();
      
      toast({
        title: 'Agendamento criado',
        description: 'O agendamento foi criado com sucesso',
      });
      
      return newAppointmentId;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao criar agendamento'));
      toast({
        title: 'Erro ao criar agendamento',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAppointments, toast]);

  // Função para atualizar um agendamento existente
  const updateAppointment = useCallback(async (id: number, updates: Partial<Appointment>) => {
    try {
      setLoading(true);
      
      // Formatando dados para o formato do banco
      const appointmentUpdates: Record<string, any> = {};
      
      if (updates.clientId) appointmentUpdates.client_id = updates.clientId;
      if (updates.clientName) appointmentUpdates.client_name = updates.clientName;
      if (updates.professionalId) appointmentUpdates.professional_id = updates.professionalId;
      if (updates.professionalName) appointmentUpdates.professional_name = updates.professionalName;
      if (updates.date) appointmentUpdates.date = updates.date.toISOString();
      if (updates.startTime) appointmentUpdates.start_time = updates.startTime;
      if (updates.endTime) appointmentUpdates.end_time = updates.endTime;
      if (updates.duration) appointmentUpdates.duration = updates.duration;
      if (updates.status) appointmentUpdates.status = updates.status;
      if (updates.paymentStatus) appointmentUpdates.payment_status = updates.paymentStatus;
      if (updates.totalValue !== undefined) appointmentUpdates.total_value = updates.totalValue;
      if (updates.notes !== undefined) appointmentUpdates.notes = updates.notes;
      
      // Atualizar a tabela principal se houver atualizações
      if (Object.keys(appointmentUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from('appointments')
          .update(appointmentUpdates)
          .eq('id', id);
        
        if (updateError) {
          throw new Error(`Erro ao atualizar agendamento: ${updateError.message}`);
        }
      }
      
      // Se há serviços a atualizar, primeiro remover os existentes e inserir os novos
      if (updates.services) {
        // Remover serviços existentes
        const { error: deleteError } = await supabase
          .from('appointment_services')
          .delete()
          .eq('appointment_id', id);
        
        if (deleteError) {
          throw new Error(`Erro ao atualizar serviços do agendamento: ${deleteError.message}`);
        }
        
        // Inserir novos serviços
        if (updates.services.length > 0) {
          const servicesData = updates.services.map(service => ({
            appointment_id: id,
            service_id: service.id,
            service_name: service.name,
            duration: service.duration,
            price: service.price
          }));
          
          const { error: insertError } = await supabase
            .from('appointment_services')
            .insert(servicesData);
          
          if (insertError) {
            throw new Error(`Erro ao inserir novos serviços ao agendamento: ${insertError.message}`);
          }
        }
      }
      
      // Atualizar a lista local de agendamentos
      await fetchAppointments();
      
      toast({
        title: 'Agendamento atualizado',
        description: 'O agendamento foi atualizado com sucesso',
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao atualizar agendamento'));
      toast({
        title: 'Erro ao atualizar agendamento',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAppointments, toast]);

  // Função para deletar um agendamento
  const deleteAppointment = useCallback(async (id: number) => {
    try {
      setLoading(true);
      
      // Como temos ON DELETE CASCADE na tabela appointment_services,
      // só precisamos deletar o registro na tabela appointments
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Erro ao deletar agendamento: ${error.message}`);
      }
      
      // Atualizar a lista local de agendamentos
      await fetchAppointments();
      
      toast({
        title: 'Agendamento removido',
        description: 'O agendamento foi removido com sucesso',
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao deletar agendamento'));
      toast({
        title: 'Erro ao remover agendamento',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAppointments, toast]);

  // Função para bloquear um horário para um profissional
  const blockProfessionalTime = useCallback(async (
    professionalId: number, 
    startDate: Date, 
    endDate: Date,
    reason?: string
  ) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('professional_blocked_dates')
        .insert({
          professional_id: professionalId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          reason: reason || 'Horário bloqueado'
        });
      
      if (error) {
        throw new Error(`Erro ao bloquear horário: ${error.message}`);
      }
      
      toast({
        title: 'Horário bloqueado',
        description: 'O horário foi bloqueado com sucesso',
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao bloquear horário'));
      toast({
        title: 'Erro ao bloquear horário',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Referência para o canal de tempo real
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  
  // Configurar inscrições de tempo real
  useEffect(() => {
    // Iniciar buscando os agendamentos
    fetchAppointments();
    
    // Configurar canal de tempo real para tabela de agendamentos
    const appointmentsChannel = supabase
      .channel('appointments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Mudança em tempo real detectada:', payload);
          // Atualizar a lista de agendamentos automaticamente
          fetchAppointments();
          
          // Mostrar notificação de alteração
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'Novo agendamento',
              description: 'Um novo agendamento foi adicionado.',
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: 'Agendamento atualizado',
              description: 'Um agendamento foi modificado.',
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: 'Agendamento removido',
              description: 'Um agendamento foi cancelado ou removido.',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_services'
        },
        () => {
          // Quando os serviços de um agendamento mudam, atualizamos os agendamentos
          fetchAppointments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_blocked_dates'
        },
        (payload) => {
          // Quando há mudanças em datas bloqueadas, notificar e atualizar
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'Novo horário bloqueado',
              description: 'Um novo horário foi bloqueado.',
            });
          }
          // Podemos opcionalmente atualizar os agendamentos se necessário
        }
      )
      .subscribe();
      
    // Armazenar a referência do canal
    realtimeChannelRef.current = appointmentsChannel;
    
    // Limpar inscrição quando o componente for desmontado
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [fetchAppointments, toast]);

  return {
    appointments,
    loading,
    error,
    filters,
    updateFilters,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    blockProfessionalTime,
  };
}
