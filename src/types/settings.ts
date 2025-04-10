
export interface SalonSettings {
  name: string;
  logo?: string;
  currency: 'BRL' | 'USD' | 'EUR';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  theme: 'light' | 'dark' | 'system';
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      enabled: boolean;
    };
  };
}

export interface WhatsAppConfig {
  apiToken?: string;
  status: 'connected' | 'disconnected' | 'error';
  phoneNumber?: string;
  lastConnection?: string;
  emailAlerts: boolean;
}

export interface UserPermissions {
  viewFinancial: boolean;
  editAppointments: boolean;
  manageStock: boolean;
  sendMessages: boolean;
  manageUsers: boolean;
  viewReports: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'professional' | 'receptionist';
  lastLogin?: string;
  active: boolean;
  permissions: UserPermissions;
}

export interface PaymentConfig {
  methods: {
    pix: boolean;
    credit: boolean;
    debit: boolean;
    cash: boolean;
    installments: boolean;
  };
  fees: {
    credit: number;
    installments: number;
  };
  maxInstallments: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'appointment' | 'thanks' | 'birthday' | 'inactive' | 'promotion';
  content: string;
  variables: string[];
  enabled: boolean;
  timing?: {
    before?: number;
    after?: number;
    time?: string;
  };
}
