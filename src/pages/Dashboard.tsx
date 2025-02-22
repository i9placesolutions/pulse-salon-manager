
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
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DashboardMetric } from "@/types/dashboard";
import { formatCurrency } from "@/utils/currency";

// Dados mockados para demonstração
const metrics: DashboardMetric[] = [
  {
    id: "monthly-revenue",
    title: "Faturamento Mensal",
    value: formatCurrency(45980),
    change: 12.5,
    trend: "up",
    description: "vs. mês anterior"
  },
  {
    id: "net-profit",
    title: "Lucro Líquido",
    value: formatCurrency(23450),
    change: 8.2,
    trend: "up",
    description: "vs. mês anterior"
  },
  {
    id: "appointments",
    title: "Agendamentos Hoje",
    value: 24,
    change: 4.1,
    trend: "up",
    description: "vs. ontem"
  },
  {
    id: "clients",
    title: "Clientes Atendidos",
    value: 193,
    change: 2.3,
    trend: "up",
    description: "este mês"
  },
  {
    id: "products",
    title: "Produtos Vendidos",
    value: 78,
    change: -5.2,
    trend: "down",
    description: "este mês"
  },
  {
    id: "avg-time",
    title: "Tempo Médio",
    value: 45,
    suffix: "min",
    change: 0,
    trend: "neutral",
    description: "por atendimento"
  }
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

const appointments = [
  { id: 1, client: "Maria Silva", service: "Corte", professional: "Ana", time: "10:00", status: "confirmed" },
  { id: 2, client: "João Santos", service: "Barba", professional: "Carlos", time: "11:30", status: "pending" },
  { id: 3, client: "Ana Oliveira", service: "Coloração", professional: "Patricia", time: "14:00", status: "confirmed" }
];

const lowStockItems = [
  { id: 1, name: "Shampoo Premium", quantity: 2, minQuantity: 5, lastRestock: "2024-02-28", supplier: "Distribuidora A" },
  { id: 2, name: "Condicionador", quantity: 3, minQuantity: 5, lastRestock: "2024-02-28", supplier: "Distribuidora A" }
];

export default function Dashboard() {
  const [period, setPeriod] = useState<string>("daily");

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
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <MetricsGrid metrics={metrics} />

      {/* Gráficos e Calendário */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <RevenueChart 
          data={revenueData} 
          period={period} 
          setPeriod={setPeriod}
        />
        
        {/* Agendamentos do Dia */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{appointment.client}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{appointment.service}</span>
                      <span>•</span>
                      <span>{appointment.professional}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {appointment.time}
                    </p>
                    <p className={`text-xs ${
                      appointment.status === 'confirmed' ? 'text-green-500' : 
                      appointment.status === 'canceled' ? 'text-red-500' : 
                      'text-yellow-500'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmado' :
                       appointment.status === 'canceled' ? 'Cancelado' : 
                       'Pendente'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Última reposição: {item.lastRestock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-600">
                    {item.quantity} unidades
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mínimo: {item.minQuantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
