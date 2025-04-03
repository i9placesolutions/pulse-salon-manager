
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
  name: string;
  date: string;
  professional: string;
  price: number;
  status: string;
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
}
