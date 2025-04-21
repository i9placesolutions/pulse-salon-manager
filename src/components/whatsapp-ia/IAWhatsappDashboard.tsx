import React, { useState, useEffect } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivitySquare, MessageSquare, Clock, Users, CheckCircle2, XCircle } from 'lucide-react';

export const IAWhatsappDashboard: React.FC = () => {
  const { user } = useAppState();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalConversations: 0,
    totalClients: 0,
    scheduledAppointments: 0,
    confirmedAppointments: 0,
    canceledAppointments: 0,
    averageResponseTime: 0,
    isConfigured: false,
    isActive: false,
  });
  
  const [weeklyData, setWeeklyData] = useState<{ name: string; mensagens: number }[]>([]);

  useEffect(() => {
    if (user.currentUser?.id) {
      fetchData();
    }
  }, [user.currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Verifica se a configuração existe e está ativa
      const { data: configData, error: configError } = await supabase
        .from('whatsapp_ia_config')
        .select('active, openai_key, uazapi_instance, uazapi_token')
        .eq('establishment_id', user.currentUser?.id)
        .single();
      
      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }
      
      const isConfigured = configData && 
        configData.openai_key && 
        configData.uazapi_instance && 
        configData.uazapi_token;
      
      // Para demonstração, vamos criar dados mockados
      // Em produção, esses dados viriam de tabelas reais no banco
      
      // Gera dados para o gráfico semanal (últimos 7 dias)
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const today = new Date();
      const weeklyDataMock = Array.from({ length: 7 }, (_, i) => {
        const day = new Date();
        day.setDate(today.getDate() - (6 - i));
        return {
          name: days[day.getDay()],
          mensagens: Math.floor(Math.random() * 40) + 10,
        };
      });
      
      setWeeklyData(weeklyDataMock);
      
      // Atualiza as estatísticas
      setStats({
        totalMessages: 352,
        totalConversations: 87,
        totalClients: 42,
        scheduledAppointments: 28,
        confirmedAppointments: 22,
        canceledAppointments: 5,
        averageResponseTime: 35, // segundos
        isConfigured: !!isConfigured,
        isActive: configData?.active || false,
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12">Carregando estatísticas...</div>;
  }

  if (!stats.isConfigured) {
    return (
      <Alert className="mb-8">
        <AlertTitle>Configuração necessária</AlertTitle>
        <AlertDescription>
          Você precisa configurar sua integração com OpenAI e Uazapi para começar a usar a IA do WhatsApp. 
          Vá para a aba de Configuração para completar a instalação.
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats.isActive) {
    return (
      <Alert className="mb-8">
        <AlertTitle>Serviço inativo</AlertTitle>
        <AlertDescription>
          Sua integração está configurada, mas não está ativa. 
          Vá para a aba de Configuração e ative o serviço para começar a usar a IA do WhatsApp.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Mensagens processadas pela IA</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversas</CardTitle>
            <ActivitySquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">Conversas únicas iniciadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime}s</div>
            <p className="text-xs text-muted-foreground">Tempo médio de resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Clientes únicos que usaram o serviço</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Confirmados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedAppointments}</div>
            <p className="text-xs text-muted-foreground">De {stats.scheduledAppointments} agendamentos totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Cancelados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.canceledAppointments}</div>
            <p className="text-xs text-muted-foreground">De {stats.scheduledAppointments} agendamentos totais</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Atividade Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mensagens" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
