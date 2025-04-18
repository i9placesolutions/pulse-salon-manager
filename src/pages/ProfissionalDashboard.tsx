import { useState, useEffect } from "react";
import { WorkingHoursForm } from "@/components/profissionais/WorkingHoursForm";
import { DashboardHeader } from "@/components/profissionais/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/profissionais/dashboard/MetricsCards";
import { DashboardTabs } from "@/components/profissionais/dashboard/DashboardTabs";
import { ProfessionalHeader } from "@/components/profissionais/dashboard/ProfessionalHeader";
import { PageLayout } from "@/components/shared/PageLayout";
import { Professional, ProfessionalCommission, ProfessionalAppointment } from "@/types/professional";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function ProfissionalDashboard() {
  const [isWorkingHoursOpen, setIsWorkingHoursOpen] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [professionalData, setProfessionalData] = useState<Professional | null>(null);
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);
  const [metrics, setMetrics] = useState({
    totalAppointments: 0,
    topServices: [] as { serviceName: string; count: number }[],
    monthlyRevenue: [] as { month: string; revenue: number }[],
    rating: 0,
    clientReturnRate: 0,
    newClientsPerMonth: 0,
    scheduleOccupancy: 0,
    quoteConversionRate: 0,
    additionalSalesRate: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfessionalData();
    
    // Configurar assinatura em tempo real para agendamentos
    const appointmentsSubscription = supabase
      .channel('appointments-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: `professional_id=eq.${professionalData?.id}`
        }, 
        () => {
          // Atualizar dados quando houver mudanças
          fetchAppointments(professionalData?.id);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(appointmentsSubscription);
    };
  }, [professionalData?.id]);

  const fetchProfessionalData = async () => {
    setIsLoading(true);
    try {
      // Obter ID do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Usuário não autenticado. Por favor, faça login novamente."
        });
        return;
      }

      // Buscar dados do profissional
      const { data: professionalData, error } = await supabase
        .from("professionals")
        .select("*, professional_specialties(*)")
        .eq("auth_id", user.id)
        .single();

      if (error) throw error;

      if (professionalData) {
        // Formatar os dados conforme a interface Professional
        const formattedProfessional: Professional = {
          id: professionalData.id,
          name: professionalData.name,
          email: professionalData.email,
          phone: professionalData.phone || "",
          specialty: professionalData.specialty || "",
          specialties: professionalData.professional_specialties.map((spec: any) => ({
            id: spec.id,
            name: spec.name,
            color: spec.color,
            isActive: spec.is_active
          })),
          hiringDate: professionalData.hiring_date || "",
          experienceLevel: professionalData.experience_level || "intermediate",
          status: professionalData.status || "active",
          totalAppointments: 0, // Será calculado
          totalCommission: 0, // Será calculado
          averageMonthlyRevenue: 0, // Será calculado
          paymentModel: professionalData.payment_model || "commission",
          commissionRate: professionalData.commission_rate || 0,
          fixedSalary: professionalData.fixed_salary || 0,
          profileImage: professionalData.profile_image || ""
        };

        setProfessionalData(formattedProfessional);
        setAgendaOpen(professionalData.is_agenda_open);
        
        // Buscar agendamentos e métricas
        await fetchAppointments(professionalData.id);
        await fetchMetrics(professionalData.id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do profissional:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar seus dados. Por favor, tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async (professionalId: string) => {
    if (!professionalId) return;
    
    try {
      // Buscar os próximos agendamentos do profissional
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("professional_id", professionalId)
        .gte("start_time", today)
        .order("start_time", { ascending: true })
        .limit(10);

      if (error) throw error;

      if (data) {
        // Formatar os dados conforme a interface ProfessionalAppointment
        const formattedAppointments: ProfessionalAppointment[] = data.map((apt: any) => ({
          id: apt.id,
          date: new Date(apt.start_time).toISOString(),
          clientName: apt.client_name,
          serviceName: apt.service_name,
          value: apt.value || 0,
          commission: apt.commission || 0,
          notes: apt.notes,
          status: apt.status
        }));

        setAppointments(formattedAppointments);
        
        // Atualizar total de agendamentos no professionalData
        if (professionalData) {
          setProfessionalData({
            ...professionalData,
            totalAppointments: data.length
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    }
  };

  const fetchMetrics = async (professionalId: string) => {
    if (!professionalId) return;
    
    try {
      // Buscar métricas do mês atual
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      
      // Buscar métricas no banco de dados
      const { data: metricsData, error: metricsError } = await supabase
        .from("professional_metrics")
        .select("*")
        .eq("professional_id", professionalId)
        .gte("reference_month", firstDayOfMonth.split('T')[0])
        .lte("reference_month", lastDayOfMonth.split('T')[0])
        .order("reference_month", { ascending: false })
        .limit(1);

      if (metricsError) throw metricsError;

      // Se temos métricas armazenadas, use-as
      if (metricsData && metricsData.length > 0) {
        const metric = metricsData[0];
        
        setMetrics({
          totalAppointments: metric.total_appointments || 0,
          topServices: [], // Precisamos buscar em outra chamada
          monthlyRevenue: [], // Precisamos buscar em outra chamada
          rating: metric.average_rating || 0,
          clientReturnRate: metric.client_return_rate || 0,
          newClientsPerMonth: metric.new_clients_count || 0,
          scheduleOccupancy: metric.schedule_occupancy || 0,
          quoteConversionRate: metric.quote_conversion_rate || 0,
          additionalSalesRate: metric.additional_sales_rate || 0
        });
        
        if (professionalData) {
          setProfessionalData({
            ...professionalData,
            totalAppointments: metric.total_appointments || 0,
            totalCommission: metric.total_commission || 0,
            averageMonthlyRevenue: metric.total_revenue || 0
          });
        }
      } else {
        // Se não temos métricas armazenadas, calcule-as a partir dos agendamentos
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("professional_id", professionalId)
          .gte("start_time", firstDayOfMonth)
          .lte("start_time", lastDayOfMonth);

        if (appointmentsError) throw appointmentsError;

        if (appointmentsData) {
          // Calcular total de agendamentos e comissões
          const totalAppointments = appointmentsData.length;
          const completedAppointments = appointmentsData.filter(a => a.status === 'completed').length;
          const totalCommission = appointmentsData.reduce((sum, apt) => sum + (apt.commission || 0), 0);
          const totalRevenue = appointmentsData.reduce((sum, apt) => sum + (apt.value || 0), 0);
          
          // Calcular serviços mais frequentes
          const servicesCount: Record<string, number> = {};
          appointmentsData.forEach(apt => {
            if (!servicesCount[apt.service_name]) {
              servicesCount[apt.service_name] = 0;
            }
            servicesCount[apt.service_name] += 1;
          });
          
          const topServices = Object.entries(servicesCount)
            .map(([serviceName, count]) => ({ serviceName, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
          
          // Atualizar métricas
          setMetrics({
            totalAppointments,
            topServices,
            monthlyRevenue: [
              { month: "Atual", revenue: totalRevenue }
            ],
            rating: 4.5, // Valor padrão
            clientReturnRate: 0.75, // Valor padrão
            newClientsPerMonth: 5, // Valor padrão
            scheduleOccupancy: 0.8, // Valor padrão
            quoteConversionRate: 0.6, // Valor padrão
            additionalSalesRate: 0.25 // Valor padrão
          });
          
          if (professionalData) {
            setProfessionalData({
              ...professionalData,
              totalAppointments,
              totalCommission,
              averageMonthlyRevenue: totalRevenue
            });
          }
          
          // Criar ou atualizar métricas no banco de dados
          await supabase.from("professional_metrics").upsert({
            professional_id: professionalId,
            reference_month: firstDayOfMonth.split('T')[0],
            total_appointments: totalAppointments,
            completed_appointments: completedAppointments,
            total_revenue: totalRevenue,
            total_commission: totalCommission,
            client_return_rate: 0.75,
            new_clients_count: 5,
            schedule_occupancy: 0.8,
            quote_conversion_rate: 0.6,
            additional_sales_rate: 0.25,
            average_rating: 4.5
          });
        }
      }
      
      // Buscar dados históricos de receita
      const { data: historicalData, error: historicalError } = await supabase
        .from("professional_metrics")
        .select("reference_month, total_revenue")
        .eq("professional_id", professionalId)
        .order("reference_month", { ascending: false })
        .limit(3);
        
      if (!historicalError && historicalData && historicalData.length > 0) {
        const monthlyRevenue = historicalData.map(item => {
          const date = new Date(item.reference_month);
          const month = date.toLocaleDateString('pt-BR', { month: 'short' });
          return {
            month: month.charAt(0).toUpperCase() + month.slice(1, 3),
            revenue: item.total_revenue || 0
          };
        });
        
        setMetrics(prev => ({
          ...prev,
          monthlyRevenue
        }));
      }
      
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
    }
  };

  const handleToggleAgenda = async () => {
    try {
      if (!professionalData?.id) return;
      
      // Atualizar status da agenda no banco de dados
      const newStatus = !agendaOpen;
      const { error } = await supabase
        .from("professionals")
        .update({ is_agenda_open: newStatus })
        .eq("id", professionalData.id);
        
      if (error) throw error;
      
      setAgendaOpen(newStatus);
      
      toast({
        title: newStatus ? "Agenda aberta" : "Agenda fechada",
        description: newStatus 
          ? "Sua agenda está aberta para receber novos agendamentos." 
          : "Sua agenda está fechada para novos agendamentos.",
        variant: "success"
      });
    } catch (error) {
      console.error("Erro ao atualizar status da agenda:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status da sua agenda."
      });
    }
  };

  const handleSaveWorkingHours = async (workingHours: any, blockedDates: any) => {
    try {
      if (!professionalData?.id) return;
      
      // Salvar horários de trabalho
      for (const [day, schedule] of Object.entries(workingHours)) {
        const dayData = schedule as any;
        if (dayData) {
          await supabase.from("professional_working_hours").upsert({
            professional_id: professionalData.id,
            day_of_week: day,
            is_working: dayData.isWorking,
            start_time: dayData.startTime,
            end_time: dayData.endTime,
            break_start: dayData.breakStart,
            break_end: dayData.breakEnd
          });
        }
      }
      
      // Salvar datas bloqueadas
      for (const blockDate of blockedDates) {
        await supabase.from("professional_blocked_dates").insert({
          professional_id: professionalData.id,
          start_date: blockDate.startDate,
          end_date: blockDate.endDate,
          reason: blockDate.reason
        });
      }
      
      toast({
        title: "Horários salvos",
        description: "Seus horários de trabalho foram atualizados com sucesso.",
        variant: "success"
      });
      
      setIsWorkingHoursOpen(false);
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar seus horários de trabalho."
      });
    }
  };

  if (isLoading) {
    return (
      <PageLayout variant="blue">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </PageLayout>
    );
  }

  if (!professionalData) {
    return (
      <PageLayout variant="blue">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Perfil não encontrado</h2>
          <p className="text-blue-600">
            Não foi possível encontrar seus dados de profissional. Por favor, entre em contato com o administrador.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout variant="blue">
      <ProfessionalHeader />
      <DashboardHeader
        agendaOpen={agendaOpen}
        onToggleAgenda={handleToggleAgenda}
        onManageHours={() => setIsWorkingHoursOpen(true)}
      />

      <MetricsCards 
        professional={professionalData}
        performance={metrics}
      />

      <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
        <DashboardTabs
          professional={professionalData}
          performance={metrics}
          appointments={appointments}
          commissions={[]} // Implementar busca de comissões quando necessário
        />
      </div>

      <WorkingHoursForm
        open={isWorkingHoursOpen}
        onOpenChange={setIsWorkingHoursOpen}
        onSave={handleSaveWorkingHours}
      />
    </PageLayout>
  );
}
