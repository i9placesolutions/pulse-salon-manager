
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  cpf?: string;
  address?: string;
  firstVisit: string;
  status: 'active' | 'vip' | 'inactive';
  photo?: string;
  points: number;
  lastVisit?: string;
  balance: {
    cashback: number;
    vipBonus: number;
  };
  campaignHistory: CampaignHistory[];
  appointmentHistory: AppointmentHistory[];
  paymentHistory: PaymentHistory[];
  couponHistory: CouponHistory[];
}

export interface ClientPreference {
  id: number;
  clientId: number;
  category: string;
  description: string;
}

export interface ClientService {
  id: number;
  clientId: number;
  date: string;
  professional: string;
  service: string;
  value: number;
  paymentMethod: string;
  observations?: string;
}

export interface CampaignHistory {
  id: number;
  clientId: number;
  campaignId: number;
  campaignType: string;
  date: string;
  description: string;
  value: number;
  status: 'active' | 'used' | 'expired';
  expirationDate?: string;
  usedDate?: string;
}

export interface AppointmentHistory {
  id: number;
  clientId: number;
  date: string;
  time: string;
  service: string;
  professional: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  value: number;
  couponUsed?: string;
  paymentMethod: string;
}

export interface PaymentHistory {
  id: number;
  clientId: number;
  date: string;
  method: string;
  value: number;
  discount?: number;
  cashbackUsed?: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface CouponHistory {
  id: number;
  clientId: number;
  code: string;
  usedDate: string;
  discount: number;
  service: string;
}
