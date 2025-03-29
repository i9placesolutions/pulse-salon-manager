
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
}
