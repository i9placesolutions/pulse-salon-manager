
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
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  value: number;
  dueDate: string;
  paymentDate?: string;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  recurring?: boolean;
  recurrenceInterval?: 'monthly' | 'weekly' | 'yearly';
  attachments?: string[];
  notes?: string;
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
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
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
  maxInstallments?: number;
  minValue?: number;
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
}

export type CashFlowType = 'entrada' | 'saida';
export type ExpenseCategory = 'Aluguel' | 'Fornecedores' | 'Salários' | 'Impostos' | 'Utilidades' | 'Marketing' | 'Equipamentos' | 'Outros';
export type RevenueCategory = 'Serviços' | 'Produtos' | 'Pacotes' | 'Vouchers' | 'Outros';
