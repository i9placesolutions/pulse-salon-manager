
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
  value: number;  // Valor do desconto/cashback/bônus
  status: 'active' | 'used' | 'expired';
  expirationDate?: string;
  usedDate?: string;
}
