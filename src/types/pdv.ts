
export interface CashierSession {
  id: string;
  openingDate: string;
  closingDate: string | null;
  initialAmount: number;
  finalAmount: number;
  status: 'open' | 'closed';
  userId: string;
  sales: Sale[];
  withdrawals: CashierOperation[];
  supplies: CashierOperation[];
}

export interface CashierOperation {
  id: number;
  type: 'withdrawal' | 'supply';
  amount: number;
  date: Date;
  reason: string;
  userId: number;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName?: string;
  clientPhone?: string;
  items: SaleItem[];
  total: number;
  payments: Payment[];
  status: 'draft' | 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Payment {
  id?: string;
  method: 'cash' | 'credit' | 'debit' | 'pix';
  amount: number;
}

export interface PDVState {
  cashierSession: CashierSession | null;
  currentSale: Sale | null;
  draftSales: Sale[];
  pendingSales: Sale[];
  completedSales: Sale[];
  filters: SaleFilters;
}

export interface SaleFilters {
  startDate: Date | null;
  endDate: Date | null;
  status: string | null;
  clientId: string | null;
  minAmount: number | null;
  maxAmount: number | null;
}

export interface PaymentFormData {
  method: 'cash' | 'credit' | 'debit' | 'pix';
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}
