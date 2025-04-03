
export interface Professional {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  specialty: string[] | string;
  photo?: string;
  status: "active" | "inactive" | "vacation";
  commission?: number;
  hiringDate?: string;
  experienceLevel?: string;
  workingDays?: string[];
  paymentModel?: string;
  fixedSalary?: number;
  totalCommission?: number;
  monthRanking?: { position?: number; total?: number } | number;
  averageMonthlyRevenue?: number;
  averageAppointmentDuration?: number;
  clientAttendanceRate?: number;
  lastAppointmentDate?: string;
  history?: {
    date: string;
    event: string;
    description: string;
  }[];
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
  time: string;
  duration: number;
  status: string;
  value: number;
}

export interface ProfessionalCommission {
  id: number;
  month: string;
  totalValue: number;
  servicesCount: number;
  status: string;
  details?: {
    serviceName: string;
    value: number;
    date: string;
  }[];
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
}

export interface ProfessionalSpecialty {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  services?: number[];
}
