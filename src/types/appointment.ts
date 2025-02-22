
export interface Appointment {
  id: number;
  clientId: number;
  clientName: string;
  professionalId: number;
  professionalName: string;
  services: Service[];
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid';
  notes?: string;
  totalValue: number;
  history?: AppointmentHistory[];
  recurrence?: AppointmentRecurrence;
}

export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

export interface Professional {
  id: number;
  name: string;
  specialties: string[];
  schedule: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
  blockedTimes?: BlockedTime[];
}

export interface BlockedTime {
  id: number;
  professionalId: number;
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface AppointmentHistory {
  id: number;
  appointmentId: number;
  action: 'created' | 'updated' | 'cancelled' | 'rescheduled' | 'confirmed';
  timestamp: Date;
  details: string;
}

export interface AppointmentRecurrence {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Date;
  occurrences?: number;
}

export interface WaitingList {
  id: number;
  clientId: number;
  clientName: string;
  serviceIds: number[];
  preferredProfessionalId?: number;
  requestDate: Date;
  status: 'waiting' | 'contacted' | 'scheduled' | 'cancelled';
}
