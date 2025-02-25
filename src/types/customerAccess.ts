
export interface CustomerAccessInfo {
  id: number;
  name: string;
  registrationDate: string;
  cashbackBalance: number;
  totalAppointments: number;
  nextAppointment?: Appointment;
  pendingReviews: Review[];
}

export interface Appointment {
  id: number;
  date: string;
  time: string;
  service: string;
  professional: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  value: number;
  paymentMethod: string;
}

export interface Review {
  id: number;
  appointmentId: number;
  serviceId: number;
  serviceName: string;
  professionalName: string;
  date: string;
  rating?: number;
  comment?: string;
  status: 'pending' | 'completed';
}

export interface CustomerBenefit {
  id: number;
  type: 'cashback' | 'coupon' | 'promotion';
  title: string;
  description: string;
  value: number;
  expirationDate: string;
  status: 'active' | 'used' | 'expired';
  usedDate?: string;
}

export type PaymentMethod = 'credit' | 'debit' | 'cash' | 'pix' | 'cashback';

export interface CustomerPayment {
  id: number;
  date: string;
  value: number;
  method: PaymentMethod;
  couponUsed?: string;
  cashbackUsed?: number;
  receiptUrl?: string;
}
