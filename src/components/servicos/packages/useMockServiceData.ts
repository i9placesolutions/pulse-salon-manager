
import { useMemo } from "react";
import { Service } from "@/types/service";
import { Product } from "@/types/product";

export function useMockServiceData() {
  // Mock de serviços para seleção
  const mockAvailableServices: Service[] = useMemo(() => [
    {
      id: 1,
      name: "Corte Feminino",
      description: "Corte feminino tradicional",
      category: "Corte",
      duration: 60,
      price: 80,
      status: "active",
      commission: {
        type: "percentage",
        value: 50
      },
      professionals: [1, 2],
      products: []
    },
    {
      id: 2,
      name: "Coloração",
      description: "Coloração completa",
      category: "Tintura",
      duration: 120,
      price: 150,
      status: "active",
      commission: {
        type: "percentage",
        value: 40
      },
      professionals: [1, 3],
      products: []
    },
    {
      id: 3,
      name: "Manicure",
      description: "Esmaltação simples",
      category: "Manicure",
      duration: 45,
      price: 50,
      status: "active",
      commission: {
        type: "percentage",
        value: 60
      },
      professionals: [3],
      products: []
    },
  ], []);

  // Mock de produtos para seleção
  const mockAvailableProducts: Product[] = useMemo(() => [
    {
      id: "1",
      name: "Shampoo Profissional",
      price: 45,
      stock: 10,
      category: "Cabelo",
    },
    {
      id: "2",
      name: "Condicionador",
      price: 40,
      stock: 15,
      category: "Cabelo",
    },
    {
      id: "3",
      name: "Máscara Capilar",
      price: 60,
      stock: 8,
      category: "Tratamento",
    },
  ], []);

  return {
    mockAvailableServices,
    mockAvailableProducts
  };
}
