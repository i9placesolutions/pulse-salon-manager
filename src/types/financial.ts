
export interface Expense {
  id: string | number;
  name: string;
  value: number;
  date: string;
  status: string;
  category?: string;
  description?: string;
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
