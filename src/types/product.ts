export interface Product {
  id: number;
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
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface ProductMovement {
  id: number;
  productId: number;
  quantity: number;
  type: 'entrada' | 'saida' | 'ajuste';
  date: string;
  notes?: string;
} 