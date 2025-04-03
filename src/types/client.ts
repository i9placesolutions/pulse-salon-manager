
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  firstVisit: string;
  cpf?: string;
  address?: string;
  photo?: string;
  status: 'active' | 'vip' | 'inactive';
  points: number;
  cashback: number;
  totalSpent: number;
  visitsCount: number;
  lastVisit: string;
  observations?: string;
  tags?: string[];
  benefits?: { type: string; value: number }[];
}

export interface ClientService {
  id: string | number;
  clientId?: number | string;
  name?: string;
  date: string;
  professional: string;
  service: string;
  price: number;
  value: number;
  status: string;
  cashbackGenerated?: number;
  pointsGenerated?: number;
  paymentMethod?: string;
}

export interface ClientPreference {
  id: number;
  clientId: number | string;
  category: string;
  description: string;
}

export interface ClientCoupon {
  id: number;
  clientId: number | string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  date: string;
  service: string;
  description: string;
  expirationDate: string;
  isUsed: boolean;
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
  clientId: number | string;
}

export interface ClientFilters {
  status: string[];
  tags?: string[];
  dateRange: string | null;
  spendingRange: [number | null, number | null];
  lastVisitRange: [Date | null, Date | null];
  minVisits?: number;
  hasCashback?: boolean;
  hasWhatsApp?: boolean;
  hasBirthday?: boolean;
  usedCoupons?: boolean;
  joinedCampaigns?: boolean;
}

export interface ClientExportOptions {
  includeContact: boolean;
  includeAddress: boolean;
  includeServices: boolean;
  includeSpending: boolean;
  includePreferences: boolean;
  includeBirthday: boolean;
  includeTags: boolean;
  includeVisitHistory: boolean;
  includeCashbackHistory: boolean;
  includeAverageTicket: boolean;
  includeCharts: boolean;
  groupBy: 'none' | 'status' | 'lastVisit' | 'totalSpent';
  sortBy: 'name' | 'lastVisit' | 'totalSpent' | 'visitsCount';
  timeRange: string;
  exportFormat: string;
  includeAnalytics: boolean;
  format: 'excel' | 'pdf' | 'csv' | 'summary' | 'analytics';
  dateFrom?: Date;
  dateTo?: Date;
}
