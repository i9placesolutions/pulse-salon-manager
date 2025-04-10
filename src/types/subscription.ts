
export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
  features: string[];
  maxUsers: number;
  maxAppointments: number | 'unlimited';
  supportType: string;
  highlight?: boolean;
};

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

export type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

export type Invoice = {
  id: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: PaymentMethod;
  downloadUrl?: string;
};

export type SubscriptionDetails = {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialEndsAt: string;
  paymentMethod: PaymentMethod;
  autoRenew: boolean;
  lastPayment?: {
    date: string;
    amount: number;
    status: 'success' | 'failed';
  };
};
