
export interface CashierSession {
  id: number;
  openingDate: Date;
  closingDate?: Date;
  initialAmount: number;
  finalAmount?: number;
  status: 'open' | 'closed';
  userId: number;
  sales: Sale[];
  withdrawals: CashierOperation[];
  supplies: CashierOperation[];
  differences?: {
    expected: number;
    actual: number;
    difference: number;
  };
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
  id: number;
  items: SaleItem[];
  total: number;
  subtotal: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  client?: {
    id: number;
    name: string;
  };
  professional?: {
    id: number;
    name: string;
  };
  payments: Payment[];
  status: 'pending' | 'completed' | 'canceled';
  date: Date;
  cashierSessionId: number;
}

export interface SaleItem {
  id: number;
  type: 'service' | 'product';
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  surcharge?: number;
  surchargeType?: 'percentage' | 'fixed';
  professional?: {
    id: number;
    name: string;
    commission: number;
  };
}

export interface Payment {
  id: number;
  method: 'credit' | 'debit' | 'pix' | 'cash';
  amount: number;
  installments?: number;
  change?: number;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
}

export interface PDVState {
  cashierSession: CashierSession | null;
  currentSale: Sale | null;
  recentSales: Sale[];
  isDayStarted: boolean;
  isProcessingPayment: boolean;
}
