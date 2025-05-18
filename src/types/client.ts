export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  firstVisit?: string;
  cpf?: string;
  address?: string;
  photo?: string;
  status: 'active' | 'vip' | 'inactive';
  points: number;
  cashback: number;
  availableCashback?: number;
  totalSpent: number;
  visitsCount: number;
  lastVisit?: string;
  lastService?: string;
  observations?: string;
  tags?: string[];
  updatedAt?: string;
  benefits?: Array<{
    type: string;
    value: number;
  }>;
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
  status?: 'scheduled' | 'completed' | 'canceled';
  cashbackGenerated?: number;
  pointsGenerated?: number;
}

export interface ClientExportOptions {
  includeContact: boolean;
  includeAddress: boolean;
  includeServices: boolean;
  includeSpending: boolean;
  includePreferences: boolean;
  includeBirthday: boolean;
  format: 'pdf' | 'excel';
  includeTags: boolean;
  includeVisitHistory: boolean;
  includeCashbackHistory: boolean;
  includeAverageTicket: boolean;
  includeCharts: boolean;
  groupBy: string;
  sortBy: string;
  timeRange: string;
  exportFormat: string;
  includeAnalytics: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ClientFilters {
  status: string[];
  minVisits?: number;
  hasCashback?: boolean;
  usedCoupons?: boolean;
  joinedCampaigns?: boolean;
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  } | null;
  lastVisitRange?: [Date | null, Date | null];
  spendingRange?: [number | null, number | null];
  hasWhatsApp?: boolean;
  hasBirthday?: boolean;
}

export interface ClientCoupon {
  id: number;
  clientId: number;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  service?: string;
  description?: string;
  date?: string;
  expirationDate: string;
  isUsed: boolean;
}

export interface ClientCampaign {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targetClients: 'all' | 'vip' | 'new' | 'inactive';
  discount: number;
  discountType: 'percentage' | 'fixed';
  clientId?: number;
}
