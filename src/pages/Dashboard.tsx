import { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DashboardMetric, ServiceDistribution, TopProduct } from "@/types/dashboard";
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
  Cell
} from "recharts";
import { Badge } from "@/components/ui/badge";

// Mock data
const metrics: DashboardMetric[] = [
  {
    id: "monthly-revenue",
    title: "Faturamento Mensal",
    value: formatCurrency(45980),
    change: 12.5,
    trend: "up",
    description: "vs. mês anterior",
    icon: DollarSign
  },
  {
    id: "ticket-medio",
    title: "Ticket Médio",
    value: formatCurrency(120),
    change: 8.5,
    trend: "up",
    description: "vs. mês anterior",
    icon: TrendingUp
  },
  {
    id: "appointments",
    title: "Agendamentos Hoje",
    value: 24,
    change: 4.1,
    trend: "up",
    description: "vs. ontem",
    icon: Calendar
  },
  {
    id: "clients",
    title: "Clientes Atendidos",
    value: 193,
    change: 2.3,
    trend: "up",
    description: "este mês",
    icon: Users
  },
  {
    id: "products",
    title: "Produtos Vendidos",
    value: 78,
    change: -5.2,
    trend: "down",
    description: "este mês",
    icon: ShoppingBag
  },
  {
    id: "avg-time",
    title: "Tempo Médio",
    value: 45,
    suffix: "min",
    change: 0,
    trend: "neutral",
    description: "por atendimento",
    icon: Clock
  }
];

const serviceDistribution: ServiceDistribution[] = [
  { name: "Cortes", value: 35 },
  { name: "Coloração", value: 25 },
  { name: "Tratamentos", value: 20 },
  { name: "Manicure", value: 15 },
  { name: "Outros", value: 5 }
];

const topProducts: TopProduct[] = [
  { name: "Corte Feminino", quantity: 145, revenue: 11600 },
  { name: "Coloração", quantity: 89, revenue: 13350 },
  { name: "Escova", quantity: 120, revenue: 7200 },
  { name: "Hidratação", quantity: 78, revenue: 5460 },
  { name: "Manicure", quantity: 156, revenue: 4680 }
];

const revenueData = [
  { date: "01/03", revenue: 3200, expenses: 1800 },
  { date: "02/03", revenue: 2800, expenses: 1600 },
  { date: "03/03", revenue: 3600, expenses: 2000 },
  { date: "04/03", revenue: 4200, expenses: 2200 },
  { date: "05/03", revenue: 3800, expenses: 1900 },
  { date: "06/03", revenue: 4500, expenses: 2400 },
  { date: "07/03", revenue: 5000, expenses: 2600 }
];

// Cores para os gráficos (usando as cores do sidebar)
const COLORS = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

export default function Dashboard() {
  const [period, setPeriod] = useState<string>("daily");
  const [periodoFilter, setPeriodoFilter] = useState<string>("30dias");
  const navigate = useNavigate();
  
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
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <ChevronRight className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-800">
                Dashboard
              </h1>
              <Badge variant="outline" className="bg-blue-500 text-white border-blue-600 uppercase text-xs font-semibold">
                Principal
              </Badge>
            </div>
            <p className="text-sm text-blue-700/70">
              Visão geral do seu negócio
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white mr-2" 
            onClick={() => navigate("/appointments")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Agendamentos
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

      {/* Métricas Principais */}
      <MetricsGrid metrics={metrics} />

      {/* Gráficos e Métricas de Serviços */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Receita é renderizado pelo componente RevenueChart */}
        <RevenueChart data={revenueData} period={period} setPeriod={setPeriod} />

        {/* Distribuição de Serviços */}
        <Card className="border-purple-200 shadow-sm hover:shadow transition-all">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <ShoppingBag className="h-4 w-4 text-purple-600" />
              </div>
              <CardTitle className="text-purple-700">Distribuição de Serviços</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Percentual']} 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
                        width: `${(product.revenue / topProducts[0].revenue) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
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
              <Button variant="ghost" className="text-green-700 hover:bg-green-100 hover:text-green-800">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
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
                <TableRow className="hover:bg-green-50/50">
                  <TableCell className="font-medium">Ana Silva</TableCell>
                  <TableCell>Corte Feminino</TableCell>
                  <TableCell>14:00</TableCell>
                  <TableCell className="text-right">{formatCurrency(80)}</TableCell>
                </TableRow>
                <TableRow className="bg-green-50/30 hover:bg-green-100/40">
                  <TableCell className="font-medium">Carlos Mendes</TableCell>
                  <TableCell>Barba e Cabelo</TableCell>
                  <TableCell>15:30</TableCell>
                  <TableCell className="text-right">{formatCurrency(65)}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-green-50/50">
                  <TableCell className="font-medium">Patricia Santos</TableCell>
                  <TableCell>Coloração</TableCell>
                  <TableCell>16:45</TableCell>
                  <TableCell className="text-right">{formatCurrency(150)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
