
import { DashboardMetric, ServiceDistribution, TopProduct } from "@/types/dashboard";
import { formatCurrency } from "@/utils/currency";
import { Calendar, DollarSign, Users, Clock, ShoppingCart, TrendingUp } from "lucide-react";

export const metrics: DashboardMetric[] = [
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
    icon: ShoppingCart
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

export const serviceDistribution: ServiceDistribution[] = [
  { name: "Cortes", value: 35 },
  { name: "Coloração", value: 25 },
  { name: "Tratamentos", value: 20 },
  { name: "Manicure", value: 15 },
  { name: "Outros", value: 5 }
];

export const topProducts: TopProduct[] = [
  { name: "Corte Feminino", quantity: 145, revenue: 11600 },
  { name: "Coloração", quantity: 89, revenue: 13350 },
  { name: "Escova", quantity: 120, revenue: 7200 },
  { name: "Hidratação", quantity: 78, revenue: 5460 },
  { name: "Manicure", quantity: 156, revenue: 4680 }
];

export const revenueData = [
  { date: "01/03", revenue: 3200, expenses: 1800 },
  { date: "02/03", revenue: 2800, expenses: 1600 },
  { date: "03/03", revenue: 3600, expenses: 2000 },
  { date: "04/03", revenue: 4200, expenses: 2200 },
  { date: "05/03", revenue: 3800, expenses: 1900 },
  { date: "06/03", revenue: 4500, expenses: 2400 },
  { date: "07/03", revenue: 5000, expenses: 2600 }
];
