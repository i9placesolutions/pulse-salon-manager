
export interface Expense {
  id: string | number;
  name: string;
  value: number;
  date: string;
  status: string;
  category?: string;
  description?: string;
  costCenter?: string;
  isRecurring?: boolean;
}

export interface AccountReceivable {
  id: string | number;
  client: string;
  value: number;
  dueDate: string;
  installment?: string | number;
  status: string;
  description?: string;
}

export interface Alert {
  id: string;
  type: 'expense' | 'receivable';
  title: string;
  message: string;
  value: number;
  date: string;
  severity: 'high' | 'medium' | 'low';
  item: Expense | AccountReceivable;
}

// Add missing interfaces needed by components
export interface Payment {
  id: string | number;
  date: string;
  value: number;
  client?: string;
  method: string;
  description?: string;
  status: string;
}

export interface CashFlow {
  id: string | number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  value: number;
}

export interface RevenueData {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface TaxRecord {
  id: string | number;
  name: string;
  description?: string;
  value: number;
  dueDate: string;
  paymentDate?: string;
  status: string;
}

export interface PaymentMethodConfig {
  id: string | number;
  name: string;
  description?: string;
  fee: number;
  isActive: boolean;
  processingTime: number;
}

export interface CommissionConfig {
  id: string | number;
  serviceType: string;
  rate: number;
  description?: string;
}

// Reference to professional for financial modules
export interface Professional {
  id: string | number;
  name: string;
  role?: string;
  commission?: number;
  commissionType?: string;
}
