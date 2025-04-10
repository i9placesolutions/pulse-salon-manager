
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  barcode?: string;
  status?: 'active' | 'inactive';
  cost?: number;
  supplier?: string;
  imageUrl?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface ProductMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'entrada' | 'saida' | 'ajuste';
  date: string;
  notes?: string;
} 
