
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, FileText, Calendar, Users, UserCheck, Package,
  TrendingUp, Star, Clock, Activity, Scissors, ShoppingBag,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { RevenueChart } from "@/components/financeiro/RevenueChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Dados mockados para demonstração
const salesData = [
  { date: "01/03", revenue: 3200, expenses: 1800, services: 28, clients: 22 },
  { date: "02/03", revenue: 2800, expenses: 1600, services: 24, clients: 20 },
  { date: "03/03", revenue: 3600, expenses: 2000, services: 32, clients: 25 },
  { date: "04/03", revenue: 4200, expenses: 2200, services: 38, clients: 30 },
  { date: "05/03", revenue: 3800, expenses: 1900, services: 34, clients: 28 },
  { date: "06/03", revenue: 4500, expenses: 2400, services: 40, clients: 32 },
  { date: "07/03", revenue: 5000, expenses: 2600, services: 45, clients: 36 },
];

const metrics = [
  {
    title: "Faturamento do Mês",
    value: formatCurrency(27100),
    change: 12.5,
    icon: FileText,
    description: "vs. mês anterior"
  },
  {
    title: "Atendimentos",
    value: "241",
    change: 8.2,
    icon: Calendar,
    description: "neste mês"
  },
  {
    title: "Clientes Atendidos",
    value: "193",
    change: 5.3,
    icon: Users,
    description: "clientes únicos"
  },
  {
    title: "Novos Clientes",
    value: "28",
    change: -2.1,
    icon: UserCheck,
    description: "este mês"
  },
];

// Dados para relatório de atendimentos
const appointmentsData = {
  occupationRate: [
    { professional: "Ana Silva", rate: 85 },
    { professional: "João Santos", rate: 75 },
    { professional: "Maria Oliveira", rate: 90 },
  ],
  servicesDuration: [
    { service: "Corte Feminino", avgDuration: 45 },
    { service: "Coloração", avgDuration: 120 },
    { service: "Manicure", avgDuration: 60 },
  ],
  hourlyDistribution: Array.from({ length: 12 }, (_, i) => ({
    hour: `${i + 8}:00`,
    appointments: Math.floor(Math.random() * 8) + 1,
  })),
};

// Dados para relatório de clientes
const clientsData = {
  visitFrequency: [
    { frequency: "Semanal", clients: 45 },
    { frequency: "Quinzenal", clients: 78 },
    { frequency: "Mensal", clients: 125 },
    { frequency: "Ocasional", clients: 89 },
  ],
  topServices: [
    { name: "Corte Feminino", count: 156 },
    { name: "Coloração", count: 98 },
    { name: "Manicure", count: 87 },
    { name: "Corte Masculino", count: 76 },
  ],
  retention: Array.from({ length: 6 }, (_, i) => ({
    month: format(subDays(new Date(), i * 30), "MMM", { locale: ptBR }),
    rate: 70 + Math.floor(Math.random() * 20),
  })),
};

// Dados para relatório de profissionais
const professionalsData = {
  performance: [
    { name: "Ana Silva", revenue: 8500, clients: 85, rating: 4.8 },
    { name: "João Santos", revenue: 7200, clients: 72, rating: 4.6 },
    { name: "Maria Oliveira", revenue: 9100, clients: 91, rating: 4.9 },
  ],
  serviceDistribution: [
    { professional: "Ana Silva", services: [
      { name: "Corte", count: 45 },
      { name: "Coloração", count: 28 },
      { name: "Hidratação", count: 15 },
    ]},
    { professional: "João Santos", services: [
      { name: "Corte", count: 52 },
      { name: "Barba", count: 38 },
      { name: "Hidratação", count: 12 },
    ]},
  ],
};

// Dados para relatório de estoque
const stockData = {
  topProducts: [
    { name: "Shampoo Pro", sold: 45, revenue: 2250 },
    { name: "Condicionador Pro", sold: 38, revenue: 1900 },
    { name: "Máscara Capilar", sold: 32, revenue: 1600 },
  ],
  lowStock: [
    { name: "Shampoo Pro", current: 5, minimum: 10 },
    { name: "Tintura #7", current: 3, minimum: 8 },
    { name: "Óleo Capilar", current: 4, minimum: 12 },
  ],
  stockTurnover: Array.from({ length: 6 }, (_, i) => ({
    month: format(subDays(new Date(), i * 30), "MMM", { locale: ptBR }),
    turnover: 2 + Math.random(),
  })),
};

const CHART_COLORS = ["#dc8c95", "#8b5cf6", "#22c55e", "#eab308"];

export default function Relatorios() {
  const [period, setPeriod] = useState("daily");

  const handleExport = () => {
    // Implementar exportação de relatórios
    console.log("Exportando relatório...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o desempenho do seu negócio
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className={`mr-1 ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                </span>
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos e tabelas */}
      <Tabs defaultValue="financeiro" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-4">
          <RevenueChart data={salesData} period={period} setPeriod={setPeriod} />
        </TabsContent>

        <TabsContent value="atendimentos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Taxa de Ocupação */}
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Ocupação</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsData.occupationRate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="professional" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" fill="#dc8c95" name="Taxa de Ocupação" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Duração Média dos Serviços */}
            <Card>
              <CardHeader>
                <CardTitle>Duração Média dos Serviços</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsData.servicesDuration}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" />
                    <YAxis unit="min" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgDuration" fill="#8b5cf6" name="Duração Média" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Horário */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Distribuição de Atendimentos por Horário</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentsData.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#dc8c95" 
                      name="Atendimentos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Frequência de Visitas */}
            <Card>
              <CardHeader>
                <CardTitle>Frequência de Visitas</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientsData.visitFrequency}
                      dataKey="clients"
                      nameKey="frequency"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {clientsData.visitFrequency.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Serviços Mais Utilizados */}
            <Card>
              <CardHeader>
                <CardTitle>Serviços Mais Utilizados</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientsData.topServices}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#dc8c95" name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Taxa de Retenção */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Taxa de Retenção de Clientes</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clientsData.retention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#22c55e" 
                      name="Taxa de Retenção" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profissionais" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance dos Profissionais */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Performance dos Profissionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {professionalsData.performance.map((prof) => (
                    <div key={prof.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{prof.name}</h3>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            {formatCurrency(prof.revenue)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-blue-500" />
                            {prof.clients} clientes
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {prof.rating}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(prof.clients / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {professionalsData.serviceDistribution.map((prof) => (
              <Card key={prof.professional}>
                <CardHeader>
                  <CardTitle>Serviços - {prof.professional}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prof.services}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {prof.services.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="estoque" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Produtos Mais Vendidos */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockData.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#dc8c95" />
                    <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sold" fill="#dc8c95" name="Unidades Vendidas" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#8b5cf6" name="Receita" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Produtos com Estoque Baixo */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockData.lowStock.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.current}/{item.minimum} unidades
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Giro de Estoque */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Giro de Estoque</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockData.stockTurnover}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="turnover" 
                      stroke="#22c55e" 
                      name="Giro de Estoque" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
