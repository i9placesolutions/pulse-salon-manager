
// Create or update the professional.ts file to include all required types
export interface Professional {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  specialties: ProfessionalSpecialty[];
  hiringDate: string;
  experienceLevel: "junior" | "mid" | "senior" | "expert" | "beginner" | "intermediate";
  status: "active" | "inactive";
  totalAppointments?: number;
  totalCommission?: number;
  averageMonthlyRevenue?: number;
  paymentModel?: string;
  commissionRate?: number;
  fixedSalary?: number;
  lastAppointmentDate?: string;
  averageAppointmentDuration?: number;
  monthRanking?: number;
  clientAttendanceRate?: number;
  workingDays?: string[];
  history?: {
    id: string;
    date: string;
    service: string;
    client: string;
    description: string;
  }[];
  workingHours?: WorkingHours;
  blockedDates?: BlockedDate[];
  rating?: number;
  avatar?: string;
  services?: string[];
}

export interface ProfessionalSpecialty {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface ProfessionalAppointment {
  id: number;
  date: string;
  clientName: string;
  serviceName: string;
  value: number;
  commission: number;
  status: "confirmed" | "pending" | "canceled" | "completed";
  notes?: string;
}

export interface ProfessionalCommission {
  id: number;
  paymentDate: string;
  value: number;
  referenceType: string;
  referenceName: string;
  status: "paid" | "pending";
}

export interface ProfessionalPayment {
  id: number;
  professionalId?: number;
  value: number;
  referenceMonth: string;
  status: "paid" | "pending" | "canceled" | "partial" | "completed";
  paymentDate?: string;
  type: "commission" | "salary";
  notes?: string;
}

export interface WorkingHours {
  [key: string]: {
    isWorking: boolean;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  };
}

export interface BlockedDate {
  id: string | number;
  date?: string;
  startDate?: string;
  endDate?: string;
  reason: string;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
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
