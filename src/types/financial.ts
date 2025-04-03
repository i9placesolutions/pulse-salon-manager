
export interface CashFlow {
  id: string;
  type: 'entrada' | 'saida';
  category: string;
  description: string;
  value: number;
  date: string;
  paymentMethod: string;
  installments?: number;
  reference?: string;
  recurring?: boolean;
  status?: 'realizado' | 'previsto';
  relatedDocument?: string;
}

export interface Expense {
  id: string;
  description: string;
  name: string;
  category: string;
  value: number;
  dueDate: string;
  date: string;
  paymentDate?: string;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado' | 'Vencido';
  recurring?: boolean;
  isRecurring?: boolean; // Para compatibilidade com código legado
  recurrenceInterval?: 'monthly' | 'weekly' | 'yearly';
  attachments?: string[];
  notes?: string;
  costCenter?: string;
}

export interface Revenue {
  id: string;
  description: string;
  clientId?: string;
  clientName?: string;
  value: number;
  date: string;
  category: string;
  paymentMethod: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  reference?: string;
}

export interface AccountReceivable {
  id: string;
  description: string;
  client: string;
  clientId?: string;
  value: number;
  originalValue?: number;
  dueDate: string;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado' | 'Em Aberto';
  installment?: string;
  totalInstallments?: string;
  paymentDate?: string;
  paymentMethod?: string;
  reference?: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'credit' | 'debit' | 'cash' | 'pix' | 'transfer' | 'other';
  enabled: boolean;
  fee: number;
  fees?: number; // Para compatibilidade com código legado
  maxInstallments?: number;
  minValue?: number;
  pixKeys?: Array<{
    key: string;
    type: string;
  }>;
  cardBrands?: Array<{
    name: string;
    enabled: boolean;
    maxInstallments: number;
    minValue: number;
    fees?: {
      percentage: number;
    };
  }>;
}

export interface Commission {
  id: string;
  professionalId: number;
  professionalName: string;
  period: string;
  baseValue: number;
  bonusValue?: number;
  totalValue: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentDate?: string;
  services: {
    serviceId: number;
    serviceName: string;
    quantity: number;
    value: number;
  }[];
}

export interface Alert {
  id: string;
  type: 'expense' | 'receivable';
  title: string;
  message: string;
  value: number;
  date: string;
  severity: string;
  item: Expense | AccountReceivable;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  income?: number;
  expense?: number;
}

export type CashFlowType = 'entrada' | 'saida';
export type ExpenseCategory = 'Aluguel' | 'Fornecedores' | 'Salários' | 'Impostos' | 'Utilidades' | 'Marketing' | 'Equipamentos' | 'Outros';
export type RevenueCategory = 'Serviços' | 'Produtos' | 'Pacotes' | 'Vouchers' | 'Outros';

// Tipos adicionais necessários para componentes financeiros
export interface Payment {
  id: number;
  client: string;
  service: string;
  value: number;
  method: string;
  date: string;
  status: string;
}

export interface Professional {
  id: number;
  name: string;
  commission: number;
  services: number;
  status: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  expenses: number;
}

export interface TaxRecord {
  id: number;
  name: string;
  type: string;
  value: number;
  baseValue: number;
  rate: number;
  dueDate: string;
  status: string;
}

export interface CommissionConfig {
  type: string;
  value: number;
  customValues?: Record<string, {
    type: string;
    value: number;
  }>;
}

// Tipo para opções de exportação do cliente
export interface ClientExportOptions {
  includeContact: boolean;
  includeAddress: boolean;
  includeServices: boolean;
  includeSpending: boolean;
  includePreferences: boolean;
  includeBirthday: boolean;
  includeTags: boolean;
  includeVisitHistory: boolean;
  includeCashbackHistory: boolean;
  includeAverageTicket: boolean;
  includeCharts: boolean;
  groupBy: string;
  sortBy: string;
  timeRange: string;
  exportFormat: string;
  includeAnalytics: boolean;
  format: 'excel' | 'pdf' | 'csv' | 'summary' | 'analytics';
}

// Para compatibilidade com utils/pdfReport.ts e outras utilidades
export interface CashFlowEntry {
  id?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description?: string;
  paymentMethod?: string;
  recurring?: boolean;
}
