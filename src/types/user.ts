
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'professional' | 'receptionist';
  birthDate: string;
  address?: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
  settings: {
    twoFactorEnabled: boolean;
    emailNotifications: boolean;
    whatsappNotifications: boolean;
    systemNotifications: boolean;
  };
}

export interface Activity {
  id: number;
  userId: number;
  action: string;
  details?: string;
  ip?: string;
  device?: string;
  createdAt: string;
}

export interface UserSession {
  id: number;
  userId: number;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrentSession: boolean;
}
