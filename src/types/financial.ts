export interface Payment {
  id: number;
  client: string;
  service: string;
  value: number;
  method: 'Pix' | 'Cartão' | 'Dinheiro' | 'Boleto';
  date: string;
  status: 'Pago' | 'Pendente' | 'Cancelado';
  taxes?: number;
  fees?: number;
  pixKey?: string;
  cardBrand?: string;
  installments?: number;
}

export interface Professional {
  id: number;
  name: string;
  commission: number;
  services: number;
  status: 'A Pagar' | 'Pago';
}

export interface RevenueData {
  date: string;
  revenue: number;
  expenses: number;
  forecast?: {
    revenue: number;
    expenses: number;
  };
}

export interface AccountReceivable {
  id: number;
  client: string;
  value: number;
  dueDate: string;
  status: 'Em Aberto' | 'Atrasado' | 'Pago';
  installment: string;
}

export interface Expense {
  id: number;
  name: string;
  value: number;
  date: string;
  category: 'Fixo' | 'Variável';
  status: 'Pago' | 'Pendente' | 'Vencido';
  isRecurring: boolean;
  costCenter?: string;
  taxRate?: number;
  taxValue?: number;
  taxDueDate?: string;
  split?: ExpenseSplit[];
}

export interface ExpenseSplit {
  department: string;
  percentage: number;
  value: number;
}

export interface Supplier {
  id: number;
  name: string;
  document: string;
  phone: string;
  email: string;
  paymentMethods: ('Pix' | 'Cartão' | 'Boleto')[];
  status: 'Ativo' | 'Inativo';
  bankInfo?: {
    bank: string;
    agency: string;
    account: string;
    pixKey?: string;
  };
}

export interface CommissionConfig {
  id: number;
  name: string;
  type: 'service' | 'product';
  commissionType: 'fixed' | 'percentage';
  defaultValue: number;
  customValues?: {
    professionalId: number;
    value: number;
  }[];
}

export interface CashFlow {
  id: number;
  date: string;
  type: 'entrada' | 'saida';
  category: string;
  description: string;
  value: number;
  status: 'realizado' | 'previsto';
  paymentMethod?: string;
  relatedDocument?: string;
  isRecurring?: boolean;
}

export interface TaxRecord {
  id: number;
  name: string;
  type: string;
  value: number;
  baseValue: number;
  rate: number;
  dueDate: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  paymentDate?: string;
  attachments?: string[];
}

export interface PaymentMethodConfig {
  type: 'Pix' | 'Cartão' | 'Boleto';
  enabled: boolean;
  fees: {
    fixed?: number;
    percentage?: number;
  };
  pixKeys?: {
    key: string;
    type: 'CPF' | 'CNPJ' | 'Email' | 'Telefone' | 'Aleatória';
  }[];
  cardBrands?: {
    name: string;
    enabled: boolean;
    maxInstallments: number;
    minValue: number;
    fees: {
      fixed?: number;
      percentage?: number;
    };
  }[];
}
