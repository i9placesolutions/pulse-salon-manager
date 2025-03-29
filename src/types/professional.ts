
export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty?: string;
  specialties?: {
    id: string;
    name: string;
    color: string;
    isActive: boolean;
  }[];
  hiringDate: string;
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'expert';
  status: 'active' | 'inactive' | 'vacation' | 'sick_leave';
  totalAppointments?: number;
  totalCommission?: number;
  averageMonthlyRevenue?: number;
  paymentModel: 'commission' | 'fixed';
  commissionRate?: number;
  fixedSalary?: number;
}

export interface ProfessionalPerformance {
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

export interface ProfessionalCommission {
  id: number;
  paymentDate: string;
  value: number;
  referenceType: 'service' | 'product' | 'package';
  referenceName: string;
  status: 'paid' | 'pending' | 'canceled';
}

export interface ProfessionalAppointment {
  id: number;
  date: string;
  clientName: string;
  serviceName: string;
  value: number;
  commission: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
}

export interface ProfessionalWorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

// Para corrigir problemas com arquivos existentes
export interface ProfessionalSpecialty {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface ProfessionalPayment {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'canceled';
  type: 'commission' | 'salary' | 'bonus';
  description?: string;
}

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface DaySchedule {
  id: number;
  day: string;
  isActive: boolean;
  timeSlots: {
    start: string;
    end: string;
  }[];
}
