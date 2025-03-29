
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
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'expert' | 'beginner' | 'intermediate';
  status: 'active' | 'inactive' | 'vacation' | 'sick_leave';
  totalAppointments?: number;
  totalCommission?: number;
  averageMonthlyRevenue?: number;
  paymentModel: 'commission' | 'fixed';
  commissionRate?: number;
  fixedSalary?: number;
  
  // Additional properties used in components:
  avatar?: string;
  monthRanking?: number;
  workingDays?: string[];
  averageAppointmentDuration?: number;
  clientAttendanceRate?: number;
  lastAppointmentDate?: string;
  workingHours?: WorkingHours;
  blockedDates?: BlockedDate[];
  history?: {
    id: string;
    date: string;
    service?: string;
    client?: string;
    description: string;
  }[];
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

export interface ProfessionalPayment {
  id: string | number;
  professionalId?: number;
  date?: string;
  amount?: number;
  value: number;
  status: 'pending' | 'paid' | 'canceled' | 'partial';
  type: 'commission' | 'salary' | 'bonus';
  description?: string;
  notes?: string;
  referenceMonth: string;
  paymentDate?: string;
}

export interface WorkingHours {
  dayOfWeek?: number;
  monday?: { isWorking: boolean; startTime?: string; endTime?: string; breakStart?: string; breakEnd?: string; };
  tuesday?: { isWorking: boolean; startTime?: string; endTime?: string; breakStart?: string; breakEnd?: string; };
  wednesday?: { isWorking: boolean; startTime?: string; endTime?: string; breakStart?: string; breakEnd?: string; };
  thursday?: { isWorking: boolean; startTime?: string; endTime?: string; breakStart?: string; breakEnd?: string; };
  friday?: { isWorking: boolean; startTime?: string; endTime?: string; breakStart?: string; breakEnd?: string; };
  saturday?: { isWorking: boolean; startTime?: string; endTime?: string; breakStart?: string; breakEnd?: string; };
  sunday?: { isWorking: boolean; startTime?: string; endTime?: string; breakStart?: string; breakEnd?: string; };
}

export interface ProfessionalWorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BlockedDate {
  id: string | number;
  date?: string;
  reason: string;
  startDate?: string;
  endDate?: string;
}

// Para corrigir problemas com arquivos existentes
export interface ProfessionalSpecialty {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface DaySchedule {
  id?: number;
  day?: string;
  isWorking?: boolean;
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
  timeSlots?: {
    start: string;
    end: string;
  }[];
}
