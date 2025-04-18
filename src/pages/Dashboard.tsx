import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Plus, 
  Users, 
  Package, 
  DollarSign,
  Clock,
  ShoppingCart,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Filter,
  ChevronRight,
  Gift,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DashboardMetric, TopProduct } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/client";
import { useDashboardData } from "@/hooks/useDashboardData";

// Cores para os gráficos (usando as cores do sidebar)
const COLORS = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

export default function Dashboard() {
  const [period, setPeriod] = useState<string>("daily");
  const [periodoFilter, setPeriodoFilter] = useState<string>("30dias");
  const navigate = useNavigate();
  
  // Usar o hook de dados do dashboard
  const {
    isLoading,
    error,
    metrics,
    revenueData,
    topProducts,
    birthdayClients,
    upcomingAppointments,
    refreshData
  } = useDashboardData();
  
  // Lista de períodos para filtro
  const periodos = [
    { id: "7dias", nome: "Últimos 7 dias" },
    { id: "30dias", nome: "Últimos 30 dias" },
    { id: "90dias", nome: "Últimos 90 dias" },
    { id: "mesAtual", nome: "Mês atual" },
    { id: "mesAnterior", nome: "Mês anterior" }
  ];

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-blue-900">Dashboard</h1>
          <p className="text-sm text-blue-700/70">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white mr-2" 
            onClick={() => navigate("/appointments")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Agendamentos
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={() => refreshData()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-lg border border-blue-100">
            <Filter className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Filtrar por:</span>
          </div>
          
          <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
            <SelectTrigger className="h-9 w-[160px] border-blue-200 text-blue-700 hover:border-blue-300 focus:ring-blue-500">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {periodos.map((periodo) => (
                <SelectItem key={periodo.id} value={periodo.id}>
                  {periodo.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Aviso de erro se houver */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <p>{error}</p>
        </div>
      )}

      {/* Métricas Principais */}
      {isLoading ? (
        <div className="grid gap-4">
          {/* Loading primeira linha: 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, index) => (
              <Card key={`top-${index}`} className="border border-gray-200 animate-pulse">
                <CardHeader className="bg-gray-100 pb-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Loading segunda linha: 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <Card key={`bottom-${index}`} className="border border-gray-200 animate-pulse">
                <CardHeader className="bg-gray-100 pb-2">
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : metrics && metrics.length > 0 ? (
        <MetricsGrid metrics={metrics} />
      ) : (
        <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
          <p className="text-blue-600">Nenhum dado de métricas encontrado.</p>
        </div>
      )}

      {/* Gráficos e Métricas de Serviços */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Receita */}
        <Card className="border-blue-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-blue-700">Receita e Despesas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
              </div>
            ) : revenueData && revenueData.length > 0 ? (
              <RevenueChart data={revenueData} period={period} setPeriod={setPeriod} />
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-blue-600">Nenhum dado de receita disponível.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Serviços Populares */}
        <Card className="border-amber-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <BarChart3 className="h-4 w-4 text-amber-600" />
              </div>
              <CardTitle className="text-amber-700">Serviços Mais Populares</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-[200px]">
                <RefreshCw className="h-6 w-6 text-amber-400 animate-spin" />
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-6">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-neutral-800">{product.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-600 font-medium">{product.quantity}x</span>
                        <span className="text-xs font-medium text-amber-600">{formatCurrency(product.revenue)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full" 
                        style={{ 
                          width: `${(product.revenue / (topProducts[0]?.revenue || 1)) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px]">
                <p className="text-amber-600">Nenhum serviço encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aniversariantes do Mês */}
        <Card className="border-purple-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Gift className="h-4 w-4 text-purple-600" />
                </div>
                <CardTitle className="text-purple-700">Aniversariantes do Mês</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                className="text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                onClick={() => navigate('/clientes', { state: { filter: 'birthday' } })}
              >
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-[200px]">
                <RefreshCw className="h-6 w-6 text-purple-400 animate-spin" />
              </div>
            ) : birthdayClients && birthdayClients.length > 0 ? (
              <Table>
                <TableHeader className="bg-purple-50">
                  <TableRow className="hover:bg-purple-100/50">
                    <TableHead className="text-purple-700">Cliente</TableHead>
                    <TableHead className="text-purple-700">Data</TableHead>
                    <TableHead className="text-right text-purple-700">Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {birthdayClients.slice(0, 5).map((client) => {
                    // Formatar a data de aniversário
                    const birthDate = new Date(client.birthDate);
                    const day = birthDate.getDate().toString().padStart(2, '0');
                    const month = (birthDate.getMonth() + 1).toString().padStart(2, '0');
                    const formattedDate = `${day}/${month}`;
                    
                    return (
                      <TableRow key={client.id} className="hover:bg-purple-50/50">
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {formattedDate}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{client.phone}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-purple-600">Nenhum aniversariante no mês atual</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="border-green-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-green-700">Próximos Agendamentos</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                className="text-green-700 hover:bg-green-100 hover:text-green-800"
                onClick={() => navigate('/appointments')}
              >
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-[200px]">
                <RefreshCw className="h-6 w-6 text-green-400 animate-spin" />
              </div>
            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
              <Table>
                <TableHeader className="bg-green-50">
                  <TableRow className="hover:bg-green-100/50">
                    <TableHead className="text-green-700">Cliente</TableHead>
                    <TableHead className="text-green-700">Serviço</TableHead>
                    <TableHead className="text-green-700">Horário</TableHead>
                    <TableHead className="text-right text-green-700">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-green-50/50">
                      <TableCell className="font-medium">{appointment.client_name}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>{appointment.start_time}</TableCell>
                      <TableCell className="text-right">{formatCurrency(appointment.total_value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-green-600">Nenhum agendamento próximo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
