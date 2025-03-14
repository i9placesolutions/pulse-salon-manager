import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { ProfessionalPerformance } from "@/types/professional";
import { formatCurrency } from "@/utils/currency";
import { Clock, Star, Calendar, Repeat, RefreshCw, TrendingUp, Users } from "lucide-react";

interface PerformanceMetricsProps {
  performance: ProfessionalPerformance;
}

export const PerformanceMetrics = ({ performance }: PerformanceMetricsProps) => {
  // Dados para o gráfico de pizza (distribuição de serviços)
  const pieData = performance.topServices.map(service => ({
    name: service.serviceName,
    value: service.count
  }));
  
  // Cores para o gráfico de pizza
  const COLORS = ['#dc8c95', '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="p-2 rounded-full bg-primary/10 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">
              {performance.totalAppointments}
            </p>
            <p className="text-xs text-muted-foreground">
              Total de Atendimentos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="p-2 rounded-full bg-primary/10 mb-2">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">
              {performance.rating.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              Avaliação Média
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="p-2 rounded-full bg-primary/10 mb-2">
              <Repeat className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">
              {(performance.clientReturnRate * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">
              Taxa de Retorno
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="p-2 rounded-full bg-primary/10 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(performance.monthlyRevenue.reduce((acc, curr) => acc + curr.revenue, 0) / performance.monthlyRevenue.length)}
            </p>
            <p className="text-xs text-muted-foreground">
              Faturamento Médio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Faturamento Mensal</CardTitle>
            <div className="text-sm text-muted-foreground">
              Últimos 3 meses
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar dataKey="revenue" fill="#dc8c95" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Serviços</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} atendimentos`, 'Quantidade']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {performance.topServices.map((service, index) => (
                <div key={service.serviceName} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{service.serviceName}</span>
                    <span className="text-sm font-medium">{service.count}x</span>
                  </div>
                  <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${(service.count / performance.topServices[0].count) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Avaliação dos Clientes</span>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= Math.round(performance.rating) 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{performance.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Repeat className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Taxa de Retorno de Clientes</span>
                </div>
                <span className="text-sm font-medium">
                  {(performance.clientReturnRate * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Pontualidade</span>
                </div>
                <span className="text-sm font-medium">
                  95% (no horário)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Novos Clientes</span>
                </div>
                <span className="text-sm font-medium">
                  12 (último mês)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Taxa de Cancelamentos</span>
                </div>
                <span className="text-sm font-medium">
                  8%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Atendimentos</span>
                  <span className="text-xs font-medium text-green-600">+12% último mês</span>
                </div>
                <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '72%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Faturamento</span>
                  <span className="text-xs font-medium text-green-600">+8% último mês</span>
                </div>
                <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '65%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Avaliações</span>
                  <span className="text-xs font-medium text-green-600">+5% último mês</span>
                </div>
                <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '85%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Taxa de Retorno</span>
                  <span className="text-xs font-medium text-red-600">-2% último mês</span>
                </div>
                <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '75%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Novos Clientes</span>
                  <span className="text-xs font-medium text-green-600">+15% último mês</span>
                </div>
                <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
