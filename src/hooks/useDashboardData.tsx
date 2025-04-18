import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/types/client';
import { formatCurrency } from '@/lib/utils';
import { DashboardMetric, TopProduct } from '@/types/dashboard';
import { DollarSign, TrendingUp, Calendar, Users, ShoppingBag, Clock } from 'lucide-react';

export interface RevenueData {
  date: string;
  revenue: number;
  expenses: number;
}

export interface Appointment {
  id: number;
  client_name: string;
  professional_name: string;
  date: string;
  start_time: string;
  total_value: number;
  service: string;
}

export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [birthdayClients, setBirthdayClients] = useState<Client[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Função auxiliar para formatar data
  const formatDate = (date: string): string => {
    try {
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return date;
    }
  };

  // Buscar métricas (indicadores) 
  const fetchMetrics = async () => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      // Valores padrão em caso de tabelas vazias
      let totalRevenue = 0;
      let revenueChange = 0;
      let appointmentsCount = 0;
      let uniqueClientsCount = 0;
      let productsSoldCount = 0;
      let ticketMedio = 0;
      
      try {
        // Buscar faturamento mensal
        const { data: revenueData, error: revenueError } = await supabase
          .from('revenue_data')
          .select('revenue')
          .gte('date', firstDayOfMonth.toISOString())
          .lte('date', lastDayOfMonth.toISOString());
        
        if (!revenueError && revenueData && revenueData.length > 0) {
          // Calcular soma do faturamento mensal
          totalRevenue = revenueData.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0);
          
          // Buscar faturamento do mês anterior para calcular variação
          const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          
          const { data: lastMonthRevenueData } = await supabase
            .from('revenue_data')
            .select('revenue')
            .gte('date', firstDayLastMonth.toISOString())
            .lte('date', lastDayLastMonth.toISOString());
          
          // Calcular soma do faturamento do mês anterior
          const lastMonthTotalRevenue = (lastMonthRevenueData && lastMonthRevenueData.length > 0) 
            ? lastMonthRevenueData.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0) 
            : 0;
          
          // Calcular variação percentual
          revenueChange = lastMonthTotalRevenue > 0 
            ? ((totalRevenue - lastMonthTotalRevenue) / lastMonthTotalRevenue) * 100 
            : 0;
        }
      } catch (error) {
        console.error('Erro ao buscar dados de receita:', error);
      }
      
      try {
        // Buscar agendamentos de hoje
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        
        const { data: todayAppointmentsData } = await supabase
          .from('appointments')
          .select('id')
          .gte('date', todayStart.toISOString())
          .lte('date', todayEnd.toISOString());
        
        appointmentsCount = (todayAppointmentsData && todayAppointmentsData.length) || 0;
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
      }
      
      try {
        // Buscar total de clientes atendidos no mês
        const { data: clientsServed } = await supabase
          .from('appointments')
          .select('client_id')
          .gte('date', firstDayOfMonth.toISOString())
          .lte('date', lastDayOfMonth.toISOString())
          .eq('status', 'completed');
        
        // Contar clientes únicos
        const uniqueClients = new Set();
        if (clientsServed && clientsServed.length > 0) {
          clientsServed.forEach(a => a.client_id && uniqueClients.add(a.client_id));
        }
        uniqueClientsCount = uniqueClients.size;
        
        // Calcular ticket médio
        ticketMedio = uniqueClientsCount > 0 ? totalRevenue / uniqueClientsCount : 0;
      } catch (error) {
        console.error('Erro ao buscar clientes atendidos:', error);
      }
      
      try {
        // Buscar produtos vendidos no mês
        const { data: orders } = await supabase
          .from('orders')
          .select('id, created_at')
          .gte('created_at', firstDayOfMonth.toISOString())
          .lte('created_at', lastDayOfMonth.toISOString());
        
        if (orders && orders.length > 0) {
          const orderIds = orders.map(order => order.id);
          
          const { data: productsSold } = await supabase
            .from('order_items')
            .select('id')
            .in('order_id', orderIds)
            .is('product_id', 'not.null');
          
          productsSoldCount = (productsSold && productsSold.length) || 0;
        }
      } catch (error) {
        console.error('Erro ao buscar produtos vendidos:', error);
      }
      
      // Construir array de métricas
      const dashboardMetrics: DashboardMetric[] = [
        {
          id: "monthly-revenue",
          title: "Faturamento Mensal",
          value: formatCurrency(totalRevenue),
          change: Number(revenueChange.toFixed(1)),
          trend: revenueChange >= 0 ? "up" : "down",
          description: "vs. mês anterior",
          icon: DollarSign
        },
        {
          id: "ticket-medio",
          title: "Ticket Médio",
          value: formatCurrency(ticketMedio),
          change: 0,
          trend: "neutral",
          description: "vs. mês anterior",
          icon: TrendingUp
        },
        {
          id: "appointments",
          title: "Agendamentos Hoje",
          value: appointmentsCount,
          change: 0,
          trend: "neutral",
          description: "vs. ontem",
          icon: Calendar
        },
        {
          id: "clients",
          title: "Clientes Atendidos",
          value: uniqueClientsCount,
          change: 0,
          trend: "neutral",
          description: "este mês",
          icon: Users
        },
        {
          id: "products",
          title: "Produtos Vendidos",
          value: productsSoldCount,
          change: 0,
          trend: "neutral",
          description: "este mês",
          icon: ShoppingBag
        }
      ];
      
      setMetrics(dashboardMetrics);
      
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      setError('Falha ao carregar os indicadores do dashboard');
    }
  };

  // Buscar dados de receita e despesas para o gráfico
  const fetchRevenueData = async () => {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const { data, error } = await supabase
        .from('revenue_data')
        .select('date, revenue, expenses')
        .gte('date', sevenDaysAgo.toISOString())
        .lte('date', today.toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Se não houver dados, criar dados fictícios para evitar erros
      if (!data || data.length === 0) {
        const emptyData: RevenueData[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          emptyData.unshift({
            date: formatDate(date.toISOString()),
            revenue: 0,
            expenses: 0
          });
        }
        setRevenueData(emptyData);
        return;
      }
      
      const formattedData: RevenueData[] = data.map(item => ({
        date: formatDate(item.date),
        revenue: Number(item.revenue || 0),
        expenses: Number(item.expenses || 0)
      }));
      
      setRevenueData(formattedData);
      
    } catch (error) {
      console.error('Erro ao buscar dados de receita:', error);
      
      // Criar dados vazios em caso de erro
      const emptyData: RevenueData[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        emptyData.unshift({
          date: formatDate(date.toISOString()),
          revenue: 0,
          expenses: 0
        });
      }
      setRevenueData(emptyData);
      setError('Falha ao carregar os dados de receita e despesas');
    }
  };

  // Buscar serviços mais populares
  const fetchTopServices = async () => {
    try {
      // Primeiro, busque todos os serviços de agendamentos
      const { data: appointmentServices, error: servicesError } = await supabase
        .from('appointment_services')
        .select(`
          service_id,
          price
        `);
      
      if (servicesError) throw servicesError;
      
      if (!appointmentServices || appointmentServices.length === 0) {
        // Se não houver dados, retornar um array vazio
        setTopProducts([]);
        return;
      }
      
      // Buscar informações de todos os serviços
      const { data: services, error: allServicesError } = await supabase
        .from('services')
        .select('id, name');
      
      if (allServicesError) throw allServicesError;
      
      // Criar um mapa de id -> nome do serviço
      const serviceMap = services.reduce((acc, service) => {
        acc[service.id] = service.name;
        return acc;
      }, {});
      
      // Agrupar e contar os serviços manualmente
      const serviceStats = {};
      appointmentServices.forEach(item => {
        if (!serviceStats[item.service_id]) {
          serviceStats[item.service_id] = {
            quantity: 0,
            revenue: 0
          };
        }
        serviceStats[item.service_id].quantity += 1;
        serviceStats[item.service_id].revenue += Number(item.price || 0);
      });
      
      // Converter para array e ordenar
      const topServicesList = Object.keys(serviceStats).map(serviceId => ({
        id: serviceId,
        name: serviceMap[serviceId] || 'Serviço Desconhecido',
        quantity: serviceStats[serviceId].quantity,
        revenue: serviceStats[serviceId].revenue
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
      
      setTopProducts(topServicesList);
      
    } catch (error) {
      console.error('Erro ao buscar serviços populares:', error);
      // Em caso de erro, definir um array vazio
      setTopProducts([]);
      // Não definimos setError aqui para não exibir a mensagem de erro global
    }
  };

  // Buscar clientes aniversariantes
  const fetchBirthdayClients = async () => {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      
      // Consulta para buscar aniversariantes do mês atual
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .filter('birth_date', 'not.is', null);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setBirthdayClients([]);
        return;
      }
      
      // Filtrar pelo mês atual manualmente
      const birthdayClientsInCurrentMonth = data.filter(client => {
        if (!client.birth_date) return false;
        try {
          const birthDate = new Date(client.birth_date);
          return birthDate.getMonth() + 1 === currentMonth;
        } catch (err) {
          console.error('Erro ao processar data de nascimento:', err);
          return false;
        }
      });
      
      // Ordenar por dia
      birthdayClientsInCurrentMonth.sort((a, b) => {
        try {
          const dateA = new Date(a.birth_date);
          const dateB = new Date(b.birth_date);
          return dateA.getDate() - dateB.getDate();
        } catch (err) {
          return 0;
        }
      });
      
      // Mapear para o formato esperado pelo componente
      const formattedClients: Client[] = birthdayClientsInCurrentMonth.map(client => ({
        id: client.id,
        name: client.name || 'Cliente sem nome',
        email: client.email || '',
        phone: client.phone || '',
        birthDate: client.birth_date,
        firstVisit: client.first_visit || '',
        cpf: client.cpf || '',
        address: client.address || '',
        photo: client.photo || '',
        status: client.status as 'active' | 'vip' | 'inactive',
        points: client.points || 0,
        cashback: client.cashback || 0,
        totalSpent: client.total_spent || 0,
        visitsCount: client.visits_count || 0,
        lastVisit: client.last_visit || '',
        observations: client.observations || '',
        tags: client.tags || [],
      }));
      
      setBirthdayClients(formattedClients);
      
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error);
      setBirthdayClients([]);
    }
  };

  // Buscar próximos agendamentos
  const fetchUpcomingAppointments = async () => {
    try {
      const today = new Date();
      
      // Buscar os próximos agendamentos
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          client_name,
          professional_name,
          date,
          start_time,
          total_value
        `)
        .gte('date', today.toISOString())
        .eq('status', 'scheduled')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);
      
      if (appointmentsError) throw appointmentsError;
      
      if (!appointments || appointments.length === 0) {
        setUpcomingAppointments([]);
        return;
      }
      
      // Buscar os serviços de cada agendamento
      const appointmentIds = appointments.map(a => a.id);
      
      let servicesMap = {};
      
      try {
        // Segundo query para buscar os serviços de cada agendamento
        const { data: appointmentServices } = await supabase
          .from('appointment_services')
          .select(`
            appointment_id,
            service_id,
            services:service_id(name)
          `)
          .in('appointment_id', appointmentIds);
        
        if (appointmentServices && appointmentServices.length > 0) {
          // Criar um mapa de serviços por agendamento
          servicesMap = {};
          appointmentServices.forEach(service => {
            if (!servicesMap[service.appointment_id]) {
              servicesMap[service.appointment_id] = [];
            }
            servicesMap[service.appointment_id].push({
              service_id: service.service_id,
              name: service.services ? service.services[0].name : 'Serviço não especificado'
            });
          });
        }
      } catch (error) {
        console.error('Erro ao buscar serviços de agendamentos:', error);
      }
      
      // Formatar os dados para o componente
      const formattedAppointments: Appointment[] = appointments.map(appt => ({
        id: appt.id,
        client_name: appt.client_name || 'Cliente não especificado',
        professional_name: appt.professional_name || 'Profissional não especificado',
        date: appt.date,
        start_time: appt.start_time || '',
        total_value: Number(appt.total_value || 0),
        service: servicesMap[appt.id]?.[0]?.name || 'Serviço não especificado'
      }));
      
      setUpcomingAppointments(formattedAppointments);
      
    } catch (error) {
      console.error('Erro ao buscar próximos agendamentos:', error);
      setUpcomingAppointments([]);
    }
  };

  // Função principal para carregar todos os dados do dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Executar todas as consultas em paralelo
      await Promise.all([
        fetchMetrics(),
        fetchRevenueData(),
        fetchTopServices(),
        fetchBirthdayClients(),
        fetchUpcomingAppointments()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Ocorreu um erro ao carregar os dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchDashboardData();
    
    // Configurar inscrição para atualizações em tempo real
    const appointmentsSubscription = supabase
      .channel('appointments-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'appointments' 
      }, () => {
        fetchUpcomingAppointments();
      })
      .subscribe();
      
    // Limpar as inscrições quando o componente desmontar
    return () => {
      supabase.removeChannel(appointmentsSubscription);
    };
  }, []);

  return {
    isLoading,
    error,
    metrics,
    revenueData,
    topProducts,
    birthdayClients,
    upcomingAppointments,
    refreshData: fetchDashboardData
  };
}
