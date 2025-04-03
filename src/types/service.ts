
export interface Service {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  status: "active" | "inactive";
  professionals?: number[];
  tags?: string[];
  images?: string[];
  discount?: number;
  performanceData?: {
    totalSold?: number;
    revenue?: number;
    growth?: number;
    averageRating?: number;
    popularTimes?: string[];
    clientRetention?: number;
  };
  
  // Campos adicionados para resolver erros
  commission?: number;
  products?: any[];
}

export interface ServicePackage {
  id: string | number;
  name: string;
  description: string;
  services: { serviceId: string | number; discount: number }[];
  products?: { productId: number; quantity: number; }[];
  discount: number;
  status: "active" | "inactive";
  price: number;
  expirationDays: number;
}

export interface PerformanceData {
  totalSold?: number;
  revenue?: number;
  growth?: number;
  averageRating?: number;
  popularTimes?: string[];
  clientRetention?: number;
}

export type ServiceCategory = {
  id: string | number;
  name: string;
  description: string;
  color?: string;
  icon?: string;
  services?: number;
};

export type ServiceTag = {
  id: string | number;
  name: string;
  color?: string;
};

// Interfaces adicionadas para resolver erros
export interface ProfessionalGoal {
  id: number | string;
  name: string;
  target: number;
  current: number;
  period: string;
  type: string;
}

export interface ProfessionalPerformance {
  id?: number | string;
  name?: string;
  metrics?: any[];
  goals?: ProfessionalGoal[];
  avgSatisfaction?: number;
  count?: number;
}

export interface PackageService {
  serviceId: string | number;
  discount: number;
  name?: string;
  price?: number;
}
