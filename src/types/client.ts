
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
