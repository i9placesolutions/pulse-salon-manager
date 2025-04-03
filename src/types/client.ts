
export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gender?: string;
  status: "active" | "inactive";
  note?: string;
  lastVisit?: string;
  loyalty?: {
    points?: number;
    cashback?: number;
    level?: string;
  };
  services?: ClientService[];
  tags?: string[];
}

export interface ClientService {
  id: number;
  clientId: number;
  date: string;
  professional: string;
  service: string;
  value: number;
  price: number; // Campo obrigatório
  paymentMethod: string;
  status: string;
  cashbackGenerated: number;
  pointsGenerated: number;
}

export interface ClientTag {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface ClientNote {
  id: number;
  clientId: number;
  content: string;
  date: string;
  author: string;
}
