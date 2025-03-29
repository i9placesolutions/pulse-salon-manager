
export interface ProfessionalGoal {
  id?: string | number;
  month: string;
  serviceTarget: number;
  revenueTarget: number;
  commissionsTarget: number;
}

export interface ProfessionalPerformance {
  id?: number;
  professionalId?: number;
  date?: string;
  revenue?: number;
  commission?: number;
  totalAppointments: number;
  topServices: { serviceName: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  rating: number;
  clientReturnRate: number;
  newClientsPerMonth: number;
  scheduleOccupancy: number;
  quoteConversionRate: number;
  additionalSalesRate: number;
  serviceId?: number;
  clientSatisfaction?: number;
}

// Add Service and ServicePackage interfaces
export interface Service {
  id: number | string;
  name: string;
  description?: string;
  category: string;
  duration: number;
  price: number;
  status: 'active' | 'inactive';
  commission: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  professionals?: number[];
  products?: { productId: number; quantity: number }[];
}

export interface ServicePackage {
  id: number | string;
  name: string;
  description?: string;
  services: {
    serviceId: number | string;
    discount: number;
  }[];
  price: number;
  status: 'active' | 'inactive';
  expirationDays?: number;
}

// Extended service interface to include performance data
export interface ExtendedService extends Service {
  performanceData?: {
    appointmentsLastMonth: number;
    rating: number;
    popularityRank: number;
    avgDuration: number;
    priceHistory: { date: string; price: number }[];
    trend: 'up' | 'down' | 'stable';
  };
}
