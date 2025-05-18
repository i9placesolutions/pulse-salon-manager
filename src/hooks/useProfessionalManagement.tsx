import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Professional, ProfessionalSpecialty } from '@/types/professional';
import { useToast } from '@/components/ui/use-toast';

export function useProfessionalManagement() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar todos os profissionais
  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (error) throw error;

      // Para cada profissional, buscar suas especialidades
      const professionalsWithDetails = await Promise.all(
        data.map(async (professional) => {
          // Buscar especialidades com join na tabela specialties
          const { data: specialtiesData, error: specialtiesError } = await supabase
            .from('professional_specialties')
            .select(`
              specialty_id,
              specialties:specialty_id(*)
            `)
            .eq('professional_id', professional.id);

          if (specialtiesError) {
            console.error('Erro ao buscar especialidades:', specialtiesError);
            return {
              ...professional,
              specialties: []
            };
          }
          
          // Verificar dados de especialidades recebidos
          console.log('Dados de especialidades recebidos:', specialtiesData);

          // Buscar informações detalhadas das especialidades diretamente da tabela specialties
          const specialtyIds = specialtiesData.map(s => s.specialty_id).filter(Boolean);
          
          let specialties: ProfessionalSpecialty[] = [];
          
          if (specialtyIds.length > 0) {
            const { data: specialtiesDetails, error: detailsError } = await supabase
              .from('specialties')
              .select('id, name, color')
              .in('id', specialtyIds);
              
            if (!detailsError && specialtiesDetails) {
              // Mapear para o formato esperado pela interface
              specialties = specialtiesDetails.map(s => ({
                id: s.id.toString(),
                name: s.name,
                color: s.color || '#cccccc',
                isActive: true
              }));
            } else {
              console.error('Erro ao buscar detalhes das especialidades:', detailsError);
            }
          }

          // Buscar dias de trabalho
          const { data: workingDaysData, error: workingDaysError } = await supabase
            .from('professional_working_days')
            .select('*')
            .eq('professional_id', professional.id);
          
          const workingDays = workingDaysError ? [] : workingDaysData.map(wd => wd.day_name);

          // Buscar histórico
          const { data: historyData, error: historyError } = await supabase
            .from('professional_history')
            .select('*')
            .eq('professional_id', professional.id)
            .order('date', { ascending: false })
            .limit(5);
          
          const history = historyError ? [] : historyData.map(h => ({
            id: h.id.toString(),
            date: h.date,
            service: h.service,
            client: h.client,
            description: h.description
          }));

          // Agora retorna o profissional com todos os dados relacionados
          return {
            ...professional,
            specialties,
            workingDays,
            history
          } as Professional;
        })
      );

      setProfessionals(professionalsWithDetails);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar profissionais');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os profissionais.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar profissional
  const addProfessional = async (professional: Omit<Professional, 'id'>) => {
    try {
      setLoading(true);
      
      // 1. Inserir o profissional básico
      const { data, error } = await supabase
        .from('professionals')
        .insert([{
          name: professional.name,
          email: professional.email,
          phone: professional.phone,
          specialty: professional.specialty,
          status: professional.status,
          hiring_date: professional.hiringDate,
          experience_level: professional.experienceLevel,
          commission: professional.commissionRate || 0,
          services: professional.totalAppointments || 0,
          payment_model: professional.paymentModel,
          fixed_salary: professional.fixedSalary || 0,
          commission_rate: professional.commissionRate || 0,
          average_monthly_revenue: professional.averageMonthlyRevenue || 0,
          total_commission: professional.totalCommission || 0,
          profile_image: professional.avatar || null
        }])
        .select()
        .single();

      if (error) throw error;
      
      // 2. Inserir especialidades
      if (professional.specialties && professional.specialties.length > 0) {
        const specialtiesToInsert = professional.specialties.map(specialty => ({
          professional_id: data.id,
          specialty_id: specialty.id,
          name: specialty.name,
          color: specialty.color,
          is_active: specialty.isActive
        }));
        
        const { error: specialtiesError } = await supabase
          .from('professional_specialties')
          .insert(specialtiesToInsert);
          
        if (specialtiesError) {
          console.error('Erro ao inserir especialidades:', specialtiesError);
        }
      }
      
      // 3. Inserir dias de trabalho
      if (professional.workingDays && professional.workingDays.length > 0) {
        const workingDaysToInsert = professional.workingDays.map(day => ({
          professional_id: data.id,
          day_name: day
        }));
        
        const { error: workingDaysError } = await supabase
          .from('professional_working_days')
          .insert(workingDaysToInsert);
          
        if (workingDaysError) {
          console.error('Erro ao inserir dias de trabalho:', workingDaysError);
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Profissional adicionado com sucesso!',
      });

      // Recarregar a lista de profissionais
      await fetchProfessionals();
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar profissional');
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o profissional.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar profissional
  const updateProfessional = async (id: string, updates: Partial<Professional>) => {
    try {
      setLoading(true);
      
      // 1. Atualizar dados básicos do profissional
      const { error } = await supabase
        .from('professionals')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          specialty: updates.specialty,
          status: updates.status,
          hiring_date: updates.hiringDate,
          experience_level: updates.experienceLevel,
          payment_model: updates.paymentModel,
          fixed_salary: updates.fixedSalary || null,
          commission_rate: updates.commissionRate || null,
          profile_image: updates.avatar || null
        })
        .eq('id', id);

      if (error) throw error;
      
      // 2. Atualizar especialidades (remover todas e adicionar novamente)
      if (updates.specialties) {
        // Primeiro remover as especialidades existentes
        const { error: deleteError } = await supabase
          .from('professional_specialties')
          .delete()
          .eq('professional_id', id);
          
        if (deleteError) {
          console.error('Erro ao remover especialidades:', deleteError);
        } else {
          // Adicionar as novas especialidades
          const specialtiesToInsert = updates.specialties.map(specialty => ({
            professional_id: id,
            specialty_id: specialty.id,
            name: specialty.name,
            color: specialty.color,
            is_active: specialty.isActive
          }));
          
          if (specialtiesToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('professional_specialties')
              .insert(specialtiesToInsert);
              
            if (insertError) {
              console.error('Erro ao inserir novas especialidades:', insertError);
            }
          }
        }
      }
      
      // 3. Atualizar dias de trabalho
      if (updates.workingDays) {
        // Remover dias de trabalho existentes
        const { error: deleteDaysError } = await supabase
          .from('professional_working_days')
          .delete()
          .eq('professional_id', id);
          
        if (deleteDaysError) {
          console.error('Erro ao remover dias de trabalho:', deleteDaysError);
        } else {
          // Adicionar novos dias de trabalho
          const workingDaysToInsert = updates.workingDays.map(day => ({
            professional_id: id,
            day_name: day
          }));
          
          if (workingDaysToInsert.length > 0) {
            const { error: insertDaysError } = await supabase
              .from('professional_working_days')
              .insert(workingDaysToInsert);
              
            if (insertDaysError) {
              console.error('Erro ao inserir novos dias de trabalho:', insertDaysError);
            }
          }
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Profissional atualizado com sucesso!',
      });

      // Recarregar a lista de profissionais
      await fetchProfessionals();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar profissional');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o profissional.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Deletar profissional
  const deleteProfessional = async (id: string) => {
    try {
      setLoading(true);
      
      // Remover registros relacionados primeiro
      await supabase.from('professional_specialties').delete().eq('professional_id', id);
      await supabase.from('professional_working_days').delete().eq('professional_id', id);
      await supabase.from('professional_history').delete().eq('professional_id', id);
      
      // Remover o profissional
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Profissional removido com sucesso!',
      });

      // Atualizar a lista local
      setProfessionals(professionals.filter(p => p.id !== id));
    } catch (error: any) {
      setError(error.message || 'Erro ao deletar profissional');
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o profissional.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar detalhes de um profissional específico
  const getProfessionalDetails = async (id: string): Promise<Professional | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Buscar especialidades com join na tabela specialties
      const { data: specialtiesData, error: specialtiesError } = await supabase
        .from('professional_specialties')
        .select(`
          specialty_id,
          specialties:specialty_id(*)
        `)
        .eq('professional_id', id);
        
      let specialties: ProfessionalSpecialty[] = [];
      
      if (!specialtiesError && specialtiesData) {
        // Buscar informações detalhadas das especialidades
        const specialtyIds = specialtiesData.map(s => s.specialty_id).filter(Boolean);
        
        if (specialtyIds.length > 0) {
          const { data: specialtiesDetails, error: detailsError } = await supabase
            .from('specialties')
            .select('id, name, color')
            .in('id', specialtyIds);
            
          if (!detailsError && specialtiesDetails) {
            // Mapear para o formato esperado pela interface
            specialties = specialtiesDetails.map(s => ({
              id: s.id.toString(),
              name: s.name,
              color: s.color || '#cccccc',
              isActive: true
            }));
          } else {
            console.error('Erro ao buscar detalhes das especialidades:', detailsError);
          }
        }
      } else {
        console.error('Erro ao buscar relações de especialidades:', specialtiesError);
      }

      // Buscar dias de trabalho
      const { data: workingDaysData } = await supabase
        .from('professional_working_days')
        .select('*')
        .eq('professional_id', id);
      
      const workingDays = workingDaysData?.map(wd => wd.day_name) || [];

      // Buscar histórico
      const { data: historyData } = await supabase
        .from('professional_history')
        .select('*')
        .eq('professional_id', id)
        .order('date', { ascending: false });
      
      const history = historyData?.map(h => ({
        id: h.id.toString(),
        date: h.date,
        service: h.service,
        client: h.client,
        description: h.description
      })) || [];

      // Buscar agendamentos
      const { data: appointmentsData } = await supabase
        .from('professional_appointments')
        .select('*')
        .eq('professional_id', id)
        .order('date', { ascending: false })
        .limit(10);
      
      const appointments = appointmentsData?.map(a => ({
        id: a.id,
        date: a.date,
        clientName: a.client_name,
        serviceName: a.service_name,
        value: a.value,
        commission: a.commission,
        status: a.status
      })) || [];

      // Buscar comissões
      const { data: commissionsData } = await supabase
        .from('professional_commissions')
        .select('*')
        .eq('professional_id', id)
        .order('payment_date', { ascending: false })
        .limit(10);
      
      const commissions = commissionsData?.map(c => ({
        id: c.id,
        paymentDate: c.payment_date,
        value: c.value,
        referenceType: c.reference_type,
        referenceName: c.reference_name,
        status: c.status
      })) || [];

      // Buscar pagamentos
      const { data: paymentsData } = await supabase
        .from('professional_payments')
        .select('*')
        .eq('professional_id', id)
        .order('payment_date', { ascending: false })
        .limit(10);
      
      const payments = paymentsData?.map(p => ({
        id: p.id,
        professionalId: p.professional_id,
        value: p.value,
        referenceMonth: p.reference_month,
        status: p.status,
        paymentDate: p.payment_date,
        notes: p.notes,
        type: p.type
      })) || [];

      // Formatar o profissional com todos os dados relacionados
      const professionalDetails: Professional = {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        specialty: data.specialty || '',
        specialties,
        profileImage: data.profile_image,
        hiringDate: data.hiring_date,
        experienceLevel: data.experience_level || 'beginner',
        status: data.status,
        totalAppointments: data.services || 0,
        totalCommission: data.total_commission || 0,
        averageMonthlyRevenue: data.average_monthly_revenue || 0,
        paymentModel: data.payment_model || 'commission',
        fixedSalary: data.fixed_salary,
        commissionRate: data.commission_rate,
        lastAppointmentDate: data.last_appointment_date,
        averageAppointmentDuration: data.average_appointment_duration,
        monthRanking: data.month_ranking,
        clientAttendanceRate: data.client_attendance_rate,
        workingDays,
        history,
        avatar: data.profile_image,
        rating: data.rating,
        completedAppointments: data.completed_appointments,
        canceledAppointments: data.canceled_appointments,
        revenue: data.revenue,
      };

      return professionalDetails;
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do profissional:', error);
      setError(error.message || 'Erro ao buscar detalhes do profissional');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Adicionar item de histórico
  const addHistoryItem = async (professionalId: string, historyItem: Omit<any, 'id'>) => {
    try {
      const { error } = await supabase
        .from('professional_history')
        .insert([{
          professional_id: professionalId,
          date: historyItem.date,
          service: historyItem.service,
          client: historyItem.client,
          description: historyItem.description
        }]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Histórico adicionado com sucesso!',
      });

      await fetchProfessionals();
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar histórico');
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o histórico.',
        variant: 'destructive',
      });
    }
  };

  // Carregar profissionais ao montar o componente
  useEffect(() => {
    fetchProfessionals();
  }, []);

  return {
    professionals,
    loading,
    error,
    fetchProfessionals,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    getProfessionalDetails,
    addHistoryItem
  };
}
