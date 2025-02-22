
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
  discount: number;
  status: 'active' | 'inactive';
}
