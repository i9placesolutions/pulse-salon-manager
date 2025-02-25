import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DashboardMetric, ServiceDistribution, TopProduct } from "@/types/dashboard";
import { formatCurrency } from "@/utils/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const COLORS = ['#dc8c95', '#f3a0a7', '#f7b9be', '#fbd2d6', '#ffebed'];

export default function Dashboard() {
  const [period, setPeriod] = useState<string>("daily");
  
  const handleExportReport = () => {
    // Aqui seria implementada a lógica de exportação
    console.log("Exportando relatório...");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header com Ações Rápidas */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-neutral">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
          <Button variant="outline" size="sm">
            <DollarSign className="mr-2 h-4 w-4" />
            Registrar Pagamento
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <MetricsGrid metrics={metrics} />

      {/* Gráficos e Métricas de Serviços */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Receita */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Receita x Despesas
              <div className="flex items-center gap-2">
                <Button
                  variant={period === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod("daily")}
                >
                  Diário
                </Button>
                <Button
                  variant={period === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod("weekly")}
                >
                  Semanal
                </Button>
                <Button
                  variant={period === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod("monthly")}
                >
                  Mensal
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value)]}
                    labelStyle={{ color: '#666' }}
                  />
                  <Bar dataKey="revenue" name="Receita" fill="#dc8c95" />
                  <Bar dataKey="expenses" name="Despesas" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Serviços */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Serviços Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{product.quantity} atendimentos</span>
                      <span>•</span>
                      <span>{formatCurrency(product.revenue)}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    index < 2 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {index < 2 ? <TrendingUp className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agendamentos do Dia */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 1, client: "Maria Silva", service: "Corte", professional: "Ana", time: "10:00", status: "confirmed" },
                  { id: 2, client: "João Santos", service: "Barba", professional: "Carlos", time: "11:30", status: "pending" },
                  { id: 3, client: "Ana Oliveira", service: "Coloração", professional: "Patricia", time: "14:00", status: "confirmed" }
                ].map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.client}</TableCell>
                    <TableCell>{appointment.service}</TableCell>
                    <TableCell>{appointment.professional}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-50 text-green-700' 
                          : appointment.status === 'canceled'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmado' 
                          : appointment.status === 'canceled' ? 'Cancelado'
                          : 'Pendente'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Alertas de Estoque */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Alertas de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade Atual</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Última Reposição</TableHead>
                  <TableHead>Fornecedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 1, name: "Shampoo Premium", quantity: 2, minQuantity: 5, lastRestock: "28/02/2024", supplier: "Distribuidora A" },
                  { id: 2, name: "Condicionador", quantity: 3, minQuantity: 5, lastRestock: "28/02/2024", supplier: "Distribuidora A" }
                ].map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-red-600 font-medium">{item.quantity}</TableCell>
                    <TableCell>{item.minQuantity}</TableCell>
                    <TableCell>{item.lastRestock}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
