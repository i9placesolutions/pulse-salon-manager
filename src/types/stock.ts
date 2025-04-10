
export interface Product {
  id: number;
  name: string;
  barcode?: string;
  description: string;
  category: string;
  measurementUnit: 'unit' | 'grams' | 'milliliters' | 'package';
  measurementValue?: number;
  supplierId: number;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  minQuantity: number;
  expirationDate?: string;
  lastUpdated: string;
  linkedServices?: number[];
  commission: {
    type: 'percentage' | 'fixed';
    defaultValue: number;
    customValues?: {
      [professionalId: number]: number;
    };
  };
}

export interface StockMovement {
  id: number;
  productId: number;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason?: 'sale' | 'service' | 'expiration' | 'loss';
  responsibleId?: number;
  supplierId?: number;
  invoiceNumber?: string;
  invoiceFile?: string;
  unitCost?: number;
  totalCost?: number;
  notes?: string;
}

export interface Supplier {
  id: number;
  name: string;
  document: string;
  phone: string;
  email: string;
  address?: string;
  status: 'active' | 'inactive';
  paymentTerms?: string;
  notes?: string;
}

export interface StockMetrics {
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  topSellingProducts: Product[];
}
