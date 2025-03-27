import React, { useMemo } from "react";
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
  Tooltip as RechartsTooltip,
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

// Componente para o gráfico de barras, memoizado para evitar renderizações desnecessárias
const BarChartComponent = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
      <RechartsTooltip 
        formatter={(value: any) => formatCurrency(Number(value))}
        labelFormatter={(label) => `Mês: ${label}`}
        contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}
      />
      <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
));

// Componente para o gráfico de pizza, memoizado para evitar renderizações desnecessárias
const PieChartComponent = React.memo(({ data, colors }: { data: any[], colors: string[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <RechartsTooltip formatter={(value: any) => [`${value} atendimentos`, 'Quantidade']} contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
));

// Componente principal memoizado
export const PerformanceMetrics = React.memo(({ performance }: PerformanceMetricsProps) => {
  // Memoizando dados para o gráfico de pizza
  const pieData = useMemo(() => performance.topServices.map(service => ({
    name: service.serviceName,
    value: service.count
  })), [performance.topServices]);
  
  // Cores para o gráfico de pizza (memoizadas, embora sejam constantes)
  const COLORS = useMemo(() => ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'], []);

  // Memoizando o cálculo do faturamento médio
  const averageRevenue = useMemo(() => 
    performance.monthlyRevenue.reduce((acc, curr) => acc + curr.revenue, 0) / 
    performance.monthlyRevenue.length, 
  [performance.monthlyRevenue]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {/* Card de Atendimentos - Roxo (appointments) */}
        <Card className="border-purple-200 shadow-sm hover:shadow transition-all group">
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="p-2 rounded-full bg-purple-100 mb-2 group-hover:bg-purple-200 transition-colors">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {performance.totalAppointments}
            </p>
            <p className="text-xs text-purple-600">
              Total de Atendimentos
            </p>
          </CardContent>
        </Card>
        
        {/* Card de Avaliação - Amber (serviços) */}
        <Card className="border-amber-200 shadow-sm hover:shadow transition-all group">
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="p-2 rounded-full bg-amber-100 mb-2 group-hover:bg-amber-200 transition-colors">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-700">
              {performance.rating.toFixed(1)}
            </p>
            <p className="text-xs text-amber-600">
              Avaliação Média
            </p>
          </CardContent>
        </Card>
        
        {/* Card de Taxa de Retorno - Verde (clientes) */}
        <Card className="border-emerald-200 shadow-sm hover:shadow transition-all group">
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="p-2 rounded-full bg-emerald-100 mb-2 group-hover:bg-emerald-200 transition-colors">
              <Repeat className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {(performance.clientReturnRate * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-emerald-600">
              Taxa de Retorno
            </p>
          </CardContent>
        </Card>
        
        {/* Card de Faturamento - Verde (financeiro) */}
        <Card className="border-green-200 shadow-sm hover:shadow transition-all group">
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="p-2 rounded-full bg-green-100 mb-2 group-hover:bg-green-200 transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(averageRevenue)}
            </p>
            <p className="text-xs text-green-600">
              Faturamento Médio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2 border-blue-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-blue-700">Faturamento Mensal</CardTitle>
            <div className="text-sm text-blue-600">
              Últimos 3 meses
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <BarChartComponent data={performance.monthlyRevenue} />
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
            <CardTitle className="text-purple-700">Distribuição de Serviços</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <PieChartComponent data={pieData} colors={COLORS} />
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-t-lg">
            <CardTitle className="text-amber-700">Serviços Mais Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {performance.topServices.map((service, index) => (
                <div key={service.serviceName} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-800">{service.serviceName}</span>
                    <span className="text-sm font-medium text-amber-600">{service.count}x</span>
                  </div>
                  <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full" 
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
        <Card className="border-cyan-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-t-lg">
            <CardTitle className="text-cyan-700">Indicadores de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-1.5 rounded-full bg-amber-100 mr-2">
                    <Star className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm text-neutral-800">Avaliação dos Clientes</span>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= Math.round(performance.rating) 
                        ? 'text-amber-500 fill-amber-500' 
                        : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-amber-700">{performance.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-1.5 rounded-full bg-emerald-100 mr-2">
                    <Repeat className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm text-neutral-800">Taxa de Retorno de Clientes</span>
                </div>
                <span className="text-sm font-medium text-emerald-700">
                  {(performance.clientReturnRate * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-1.5 rounded-full bg-blue-100 mr-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-neutral-800">Pontualidade</span>
                </div>
                <span className="text-sm font-medium text-blue-700">
                  95% (no horário)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-1.5 rounded-full bg-rose-100 mr-2">
                    <Users className="h-4 w-4 text-rose-600" />
                  </div>
                  <span className="text-sm text-neutral-800">Novos Clientes</span>
                </div>
                <span className="text-sm font-medium text-rose-700">
                  {performance.newClientsPerMonth} / mês
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-t-lg">
            <CardTitle className="text-indigo-700">Eficiência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-800">Ocupação da Agenda</span>
                  <span className="text-sm font-medium text-indigo-700">{performance.scheduleOccupancy}%</span>
                </div>
                <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600" 
                    style={{ width: `${performance.scheduleOccupancy}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-800">Conversão de Orçamentos</span>
                  <span className="text-sm font-medium text-indigo-700">{performance.quoteConversionRate}%</span>
                </div>
                <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600" 
                    style={{ width: `${performance.quoteConversionRate}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-800">Venda Adicional</span>
                  <span className="text-sm font-medium text-indigo-700">{performance.additionalSalesRate}%</span>
                </div>
                <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600" 
                    style={{ width: `${performance.additionalSalesRate}%` }} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
