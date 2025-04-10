
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
}

export interface AppointmentSummary {
  id: number;
  client: string;
  service: string;
  professional: string;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled';
}

export interface StockAlert {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
  lastRestock: string;
  supplier: string;
}

export interface ServiceDistribution {
  name: string;
  value: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface CashFlowEntry {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description?: string;
  paymentMethod?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}
