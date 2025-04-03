
export interface Professional {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string[];
  avatar?: string;
  bio?: string;
  status: 'active' | 'inactive';
  since: string;
  level: 'beginner' | 'junior' | 'mid' | 'intermediate' | 'senior' | 'expert';
  schedule?: {
    [day: string]: {
      start: string;
      end: string;
      isWorking: boolean;
      breakStart?: string;
      breakEnd?: string;
    };
  };
  workingHours?: WorkingHours;
  blockedDates?: BlockedDate[];
  commission?: CommissionConfig;
  rating?: number;
  totalAppointments?: number;
  services?: number[];
  finishedServices?: number;
}

export interface WorkingHours {
  monday: { isWorking: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string; };
  tuesday: { isWorking: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string; };
  wednesday: { isWorking: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string; };
  thursday: { isWorking: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string; };
  friday: { isWorking: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string; };
  saturday: { isWorking: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string; };
  sunday: { isWorking: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string; };
}

export interface BlockedDate {
  id?: number;
  start: string;
  end: string;
  reason?: string;
}

export interface CommissionConfig {
  type: 'percentage' | 'fixed';
  value: number;
  customValues?: {
    [serviceId: string]: {
      type: 'percentage' | 'fixed';
      value: number;
    };
  };
}

export interface ProfessionalPerformance {
  totalAppointments: number;
  topServices: { serviceName: string; count: number; }[];
  monthlyRevenue: { month: string; revenue: number; }[];
  rating: number;
  clientReturnRate: number;
  newClientsPerMonth: number;
  scheduleOccupancy: number;
  quoteConversionRate: number;
  additionalSalesRate: number;
}
