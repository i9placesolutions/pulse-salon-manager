
export interface Payment {
  id: number;
  client: string;
  service: string;
  value: number;
  method: 'Pix' | 'Cartão' | 'Dinheiro' | 'Boleto';
  date: string;
  status: 'Pago' | 'Pendente' | 'Cancelado';
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
}

export interface Supplier {
  id: number;
  name: string;
  document: string;
  phone: string;
  email: string;
  paymentMethods: ('Pix' | 'Cartão' | 'Boleto')[];
  status: 'Ativo' | 'Inativo';
}
