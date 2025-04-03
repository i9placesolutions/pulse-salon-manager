
export interface Professional {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string[];
  specialties?: { id: string; name: string; color: string; isActive: boolean }[];
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
  
  // Campos adicionais que são referenciados no código
  experienceLevel?: string;
  hiringDate?: string;
  paymentModel?: string;
  fixedSalary?: number;
  commissionRate?: number;
  totalCommission?: number;
  averageMonthlyRevenue?: number;
  workingDays?: number;
  monthRanking?: {
    position?: number;
    total?: number;
  };
  averageAppointmentDuration?: number;
  clientAttendanceRate?: number;
  history?: any[];
  lastAppointmentDate?: string;
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
  startDate?: string; // Para compatibilidade com componentes existentes
  endDate?: string; // Para compatibilidade com componentes existentes
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

// Tipos adicionais necessários para componentes
export interface ProfessionalAppointment {
  id: number;
  date: string;
  time?: string;
  clientName: string;
  serviceName: string;
  value: number;
  commission: number;
  notes?: string;
  status: string;
}

export interface ProfessionalCommission {
  id: number;
  paymentDate: string;
  value: number;
  referenceType?: string;
  referenceName?: string;
  status: string;
}

export interface ProfessionalPayment {
  id: number;
  date: string;
  value: number;
  description: string;
  status: string;
}

export interface ProfessionalSpecialty {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}
