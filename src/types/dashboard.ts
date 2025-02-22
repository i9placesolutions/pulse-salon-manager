
export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
  prefix?: string;
  suffix?: string;
}

export interface AppointmentSummary {
  id: number;
  client: string;
  service: string;
  professional: string;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled';
}

export interface StockAlert {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
  lastRestock: string;
  supplier: string;
}

export interface ClientReview {
  id: number;
  client: string;
  rating: number;
  comment: string;
  service: string;
  professional: string;
  date: string;
}

export interface Birthday {
  id: number;
  client: string;
  date: string;
  lastService: string;
  couponCode?: string;
}

export interface ServiceDistribution {
  name: string;
  value: number;
}

export interface PaymentMethod {
  method: string;
  value: number;
  percentage: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}
