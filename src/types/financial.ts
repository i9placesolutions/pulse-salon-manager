
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

export interface AccountReceivable {
  id: number;
  client: string;
  value: number;
  dueDate: string;
  status: "Pendente" | "Pago" | "Atrasado" | "Cancelado" | "Em Aberto";
  installment?: string;
  description?: string;
}

export interface Expense {
  id: number;
  description: string;
  value: number;
  dueDate: string;
  category: string;
  status: string;
  recurring: boolean;  // Corrigido de isRecurring para recurring
  costCenter?: string;
  name?: string;
  date?: string;
}

export interface CashFlow {
  id: number;
  date: string;
  type: "entrada" | "saida" | "income" | "expense";
  category: string;
  description: string;
  value: number;
  status?: "realizado" | "previsto";
  paymentMethod: string;
  relatedDocument?: string;
  recurring?: boolean;
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

export interface PaymentMethodConfig {
  id?: number;
  type: "credit" | "debit" | "cash" | "pix" | "transfer" | "other";
  name?: string;
  enabled: boolean;
  fee: number;
  maxInstallments?: number;
  pixKeys?: {
    key: string;
    type: string;
  }[];
  cardBrands?: {
    name: string;
    enabled: boolean;
    maxInstallments: number;
    minValue: number;
    fee: number;
  }[];
}

export interface CommissionConfig {
  id?: number;
  name?: string;
  professionalId?: number;
  type?: string;
  commissionType?: 'percentage' | 'fixed';
  defaultValue: number;
  serviceSpecific?: {
    [serviceId: string]: {
      type: 'percentage' | 'fixed';
      value: number;
    };
  }[];
  customValues?: {
    type: string;
    value: number;
    professionalId?: number;
  }[];
}

export interface Alert {
  id: number;
  type: string;
  title: string;
  description: string;
  date: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  related?: {
    type: string;
    id: number;
  };
  // Campos adicionados para resolver erros
  severity?: string;
  message?: string;
  value?: number;
}
