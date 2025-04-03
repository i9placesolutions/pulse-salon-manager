import { LucideIcon } from "lucide-react";

export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  color?: string;
  period?: string;
  formatter?: (value: number) => string;
}

export interface AppointmentSummary {
  id: number;
  client: string;
  service: string;
  professional: string;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  duration?: number;
  price?: number;
}

export interface StockAlert {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
  lastRestock: string;
  supplier: string;
  category?: string;
  daysUntilStockout?: number;
}

export interface ServiceDistribution {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  id?: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface CashFlowEntry {
  id?: string | number;
  type: 'income' | 'expense' | 'entrada' | 'saida';
  category: string;
  amount: number;
  date: string;
  description?: string;
  paymentMethod?: string;
  recurring?: boolean;
  status?: 'realizado' | 'previsto';
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  income?: number;
  expense?: number;
  previousPeriodIncome?: number;
  previousPeriodExpenses?: number;
  previousPeriodBalance?: number;
  incomeChange?: number;
  expensesChange?: number;
  balanceChange?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface ClientsMetrics {
  total: number;
  active: number;
  new: number;
  returning: number;
  change: number;
  retention: number;
  averageValue: number;
}

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'summary' | 'analytics';
