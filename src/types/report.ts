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

export interface CommissionReport {
  professionalId: number;
  professionalName: string;
  totalEarnings: number;
  servicesCount: number;
  commissions: {
    serviceId: number;
    serviceName: string;
    commissionsEarned: number;
    quantity: number;
  }[];
}

export interface ServiceReport {
  serviceId: number;
  serviceName: string;
  totalRevenue: number;
  totalCommissions: number;
  serviceCost: number;
  netProfit: number;
  quantity: number;
}
