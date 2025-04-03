
export interface Professional {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  specialty: string[] | string;
  specialties?: ProfessionalSpecialty[]; // Adicionado para compatibilidade
  photo?: string;
  avatar?: string; // Adicionado para compatibilidade
  status: "active" | "inactive" | "vacation";
  commission?: number;
  hiringDate?: string;
  experienceLevel?: string;
  workingDays?: string[];
  paymentModel?: string;
  fixedSalary?: number;
  commissionRate?: number;
  totalCommission?: number;
  monthRanking?: { position?: number; total?: number } | number;
  averageMonthlyRevenue?: number;
  averageAppointmentDuration?: number;
  clientAttendanceRate?: number;
  lastAppointmentDate?: string;
  history?: {
    id?: string | number;
    date: string;
    event?: string;
    service?: string;
    client?: string;
    description: string;
  }[];
  
  // Campos adicionados para resolver erros de tipo
  totalAppointments?: number;
  workingHours?: WorkingHours;
  blockedDates?: BlockedDate[];
  since?: string;
  level?: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface BlockedDate {
  id: number;
  start: string;
  end: string;
  reason: string;
  startDate?: string;
  endDate?: string;
}

export interface ProfessionalAppointment {
  id: number;
  clientName: string;
  serviceName: string;
  date: string;
  time?: string;
  duration?: number;
  status: string;
  value: number;
  
  // Propriedades adicionadas para resolver erros
  commission?: number;
  notes?: string;
}

export interface ProfessionalCommission {
  id: number;
  month?: string;
  totalValue?: number;
  servicesCount?: number;
  status: string;
  details?: {
    serviceName: string;
    value: number;
    date: string;
  }[];
  
  // Propriedades adicionadas para resolver erros
  value?: number;
  referenceType?: string;
  referenceName?: string;
  paymentDate?: string;
}

export interface ProfessionalPayment {
  id: number;
  date: string;
  value: number;
  status: string;
  description: string;
  referenceMonth?: string;
  paymentDate?: string;
  type?: string;
  professionalId?: number;
  notes?: string;
}

export interface ProfessionalSpecialty {
  id: number | string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  services?: number[];
  isActive?: boolean;
}

// Interface adicionada para resolver erros
export interface ProfessionalPerformance {
  id?: number | string;
  name?: string;
  totalAppointments?: number;
  topServices?: {
    serviceName: string;
    count: number;
  }[];
  monthlyRevenue?: {
    month: string;
    revenue: number;
  }[];
  rating?: number;
  clientReturnRate?: number;
  newClientsPerMonth?: number;
  scheduleOccupancy?: number;
  quoteConversionRate?: number;
  additionalSalesRate?: number;
  metrics?: any[];
  goals?: ProfessionalGoal[];
  avgSatisfaction?: number;
  count?: number;
  revenue?: number;
  commission?: number;
  clientSatisfaction?: number;
  date?: string;
  professionalId?: number;
  serviceId?: number;
}

export interface ProfessionalGoal {
  id: number | string;
  name: string;
  target: number;
  current: number;
  period: string;
  type: string;
  month?: string;
  serviceTarget?: number;
  revenueTarget?: number;
  commissionsTarget?: number;
}
