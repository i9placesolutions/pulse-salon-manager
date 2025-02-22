
import { Calendar, Loader2, Plus, Users, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DayPicker } from "react-day-picker";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ptBR } from "date-fns/locale";
import "react-day-picker/dist/style.css";

// Temporary mock data
const revenueData = [
  { month: "Jan", value: 12400 },
  { month: "Fev", value: 14800 },
  { month: "Mar", value: 13200 },
  { month: "Abr", value: 15600 },
  { month: "Mai", value: 16800 },
  { month: "Jun", value: 19200 },
];

const appointments = [
  { id: 1, client: "Maria Silva", service: "Corte", time: "10:00" },
  { id: 2, client: "João Santos", service: "Barba", time: "11:30" },
  { id: 3, client: "Ana Oliveira", service: "Coloração", time: "14:00" },
];

const lowStockItems = [
  { id: 1, name: "Shampoo Premium", quantity: 2 },
  { id: 2, name: "Condicionador", quantity: 3 },
];

const Dashboard = () => {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-neutral">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
          <Button size="sm" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
          <Button size="sm" variant="outline">
            <DollarSign className="mr-2 h-4 w-4" />
            Registrar Pagamento
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-soft">Faturamento do Dia</p>
              <h3 className="text-2xl font-semibold text-neutral">{formatCurrency(1250)}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-soft">Clientes Atendidos</p>
              <h3 className="text-2xl font-semibold text-neutral">8</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-yellow-100 p-3">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-soft">Itens Baixo Estoque</p>
              <h3 className="text-2xl font-semibold text-neutral">{lowStockItems.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-soft">Agendamentos Hoje</p>
              <h3 className="text-2xl font-semibold text-neutral">{appointments.length}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Calendar Section */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="col-span-2 p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral">Faturamento Mensal</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value/1000}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#666' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#dc8c95"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Calendar */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral">Calendário</h3>
          <DayPicker
            locale={ptBR}
            mode="single"
            selected={new Date()}
            className="mx-auto"
            classNames={{
              day_selected: "bg-primary text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
            }}
          />
        </Card>
      </div>

      {/* Today's Appointments and Low Stock */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral">Agendamentos de Hoje</h3>
            <Button variant="ghost" size="sm">
              Ver todos
            </Button>
          </div>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary-soft"
              >
                <div>
                  <p className="font-medium text-neutral">{appointment.client}</p>
                  <p className="text-sm text-neutral-soft">{appointment.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{appointment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral">Itens em Baixo Estoque</h3>
            <Button variant="ghost" size="sm">
              Ver estoque
            </Button>
          </div>
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary-soft"
              >
                <p className="font-medium text-neutral">{item.name}</p>
                <p className="text-sm font-medium text-yellow-600">
                  Restam {item.quantity} unidades
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
