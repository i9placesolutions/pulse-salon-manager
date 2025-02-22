
export interface ReportMetric {
  label: string;
  value: number;
  change?: number;
  prefix?: string;
  suffix?: string;
}

export interface SalesData {
  date: string;
  revenue: number;
  expenses: number;
  services: number;
  clients: number;
}

export interface PaymentDistribution {
  method: string;
  amount: number;
  percentage: number;
}

export interface ServicePerformance {
  service: string;
  revenue: number;
  quantity: number;
  avgRating: number;
}
