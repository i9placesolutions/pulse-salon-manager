
export interface Professional {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  profileImage?: string;
  hiringDate: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  status: 'active' | 'inactive';
  totalAppointments: number;
  totalCommission: number;
  averageMonthlyRevenue: number;
  workingHours?: WorkingHours;
  blockedDates?: BlockedDate[];
  paymentModel: 'commission' | 'fixed';
  fixedSalary?: number;
  commissionRate?: number;
  benefits?: ProfessionalBenefit[];
}

export interface ProfessionalBenefit {
  id: number;
  name: string;
  value: number;
  type: 'monthly' | 'yearly' | 'one-time';
  description?: string;
}

export interface WorkingHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface BlockedDate {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
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

export interface ProfessionalCommission {
  id: number;
  paymentDate: string;
  value: number;
  referenceType: 'service' | 'product';
  referenceName: string;
  status: 'pending' | 'paid';
}

export interface ProfessionalPayment {
  id: number;
  professionalId: number;
  value: number;
  referenceMonth: string;
  status: 'pending' | 'partial' | 'paid';
  paymentDate?: string;
  notes?: string;
  type: 'salary' | 'commission' | 'benefit';
}

export interface ProfessionalPerformance {
  totalAppointments: number;
  topServices: {
    serviceName: string;
    count: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
  rating: number;
  clientReturnRate: number;
}
