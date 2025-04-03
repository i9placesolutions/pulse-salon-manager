
export interface Client {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  birthdate?: string;  // Mantenho birthdate como está na interface
  birthDate?: string;  // Adicionando para compatibilidade com código existente
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gender?: string;
  status: "active" | "inactive" | "vip"; // Adicionando "vip" como status possível
  note?: string;
  lastVisit?: string;
  photo?: string; // Adicionando para compatibilidade
  cpf?: string; // Adicionando para compatibilidade
  firstVisit?: string; // Adicionando para compatibilidade
  observations?: string; // Adicionando para compatibilidade
  totalSpent?: number; // Adicionando para compatibilidade
  visitsCount?: number; // Adicionando para compatibilidade
  points?: number; // Adicionando para compatibilidade
  cashback?: number; // Adicionando para compatibilidade
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
  commission?: number;
  notes?: string;
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

// Adicionando interfaces que faltam, referenciadas em vários componentes
export interface ClientPreference {
  id: number;
  clientId: number;
  category: string;
  description: string;
}

export interface ClientCoupon {
  id: number;
  clientId: number;
  code: string;
  discount: number;
  discountType: string;
  date: string;
  expirationDate: string;
  isUsed: boolean;
  service?: string;
  description?: string;
}

export interface ClientFilters {
  status: string[];
  tags?: string[];
  dateRange: Date[] | null;
  spendingRange: [number | null, number | null];
  lastVisitRange: [Date | null, Date | null];
  minVisits?: number;
  hasCashback: boolean;
  hasWhatsApp: boolean;
  hasBirthday: boolean;
  usedCoupons: boolean;
  joinedCampaigns: boolean;
}

export interface ClientExportOptions {
  format: "excel" | "pdf";
  timeRange: "last30" | "last90" | "last180" | "last365" | "all" | "custom";
  dateFrom?: Date;
  dateTo?: Date;
  exportFormat: "summary" | "detailed" | "analytics";
  includeContact: boolean;
  includeServices: boolean;
  includeSpending: boolean;
  includeTags: boolean;
  includeBirthday: boolean;
  includePreferences: boolean;
  includeVisitHistory: boolean;
  includeAnalytics: boolean;
}

export interface ClientCampaign {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targetClients: string;
  discount: number;
  discountType: string;
  clientId: number;
}
