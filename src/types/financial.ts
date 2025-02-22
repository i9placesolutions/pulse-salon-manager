
export interface Payment {
  id: number;
  client: string;
  service: string;
  value: number;
  method: string;
  date: string;
}

export interface Professional {
  id: number;
  name: string;
  commission: number;
  services: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}
