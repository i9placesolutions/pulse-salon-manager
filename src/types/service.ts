export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  status: 'active' | 'inactive';
  commission: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  professionals: number[];
  products: {
    productId: number;
    quantity: number;
  }[];
}

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface ProfessionalCommission {
  professionalId: number;
  serviceId: number;
  type: 'fixed' | 'percentage';
  value: number;
}

export interface ServicePackage {
  id: number;
  name: string;
  description: string;
  services: number[];
  products?: {
    productId: number;
    quantity: number;
  }[];
  discount: number;
  status: 'active' | 'inactive';
}

export interface ProfessionalGoal {
  id: number;
  professionalId: number;
  month: string; // formato YYYY-MM
  serviceTarget: number; // meta de quantidade de serviços
  revenueTarget: number; // meta de faturamento
  commissionsTarget: number; // meta de comissões
}

export interface ProfessionalPerformance {
  id: number;
  professionalId: number;
  serviceId: number;
  date: string;
  revenue: number;
  commission: number;
  clientSatisfaction: number; // 0-5
}
