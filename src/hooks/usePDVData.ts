
import { useState, useMemo } from "react";
import { useCartState } from "./useCartState";

// Mock data interfaces
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
}

export function usePDVData() {
  const { searchTerm } = useCartState();

  // Mock products with string IDs
  const mockProducts: Product[] = [
    { id: "1", name: "Corte de Cabelo", price: 50, category: "Serviço", quantity: -1 },
    { id: "2", name: "Barba", price: 30, category: "Serviço", quantity: -1 },
    { id: "3", name: "Hidratação", price: 70, category: "Serviço", quantity: -1 },
    { id: "4", name: "Tintura", price: 120, category: "Serviço", quantity: -1 },
    { id: "5", name: "Shampoo Profissional", price: 45, category: "Produto", quantity: 25 },
    { id: "6", name: "Condicionador", price: 40, category: "Produto", quantity: 18 },
    { id: "7", name: "Cera para Cabelo", price: 35, category: "Produto", quantity: 12 },
    { id: "8", name: "Gel", price: 25, category: "Produto", quantity: 30 },
    { id: "9", name: "Óleo para Barba", price: 38, category: "Produto", quantity: 15 },
    { id: "10", name: "Kit Barba", price: 85, category: "Produto", quantity: 7 },
  ];

  // Mock clients with string IDs
  const mockClients: Client[] = [
    { id: "1", name: "João Silva", phone: "(11) 98765-4321", email: "joao@example.com" },
    { id: "2", name: "Maria Oliveira", phone: "(11) 91234-5678", email: "maria@example.com" },
    { id: "3", name: "Pedro Santos", phone: "(11) 99876-5432", email: "pedro@example.com" },
    { id: "4", name: "Ana Souza", phone: "(11) 92345-6789", email: "ana@example.com" },
    { id: "5", name: "Carlos Ferreira", phone: "(11) 98765-1234", email: "carlos@example.com" },
    { id: "6", name: "Lucia Pereira", phone: "(11) 94567-8901", email: "lucia@example.com" },
    { id: "7", name: "Fernando Costa", phone: "(11) 93456-7890", email: "fernando@example.com" },
    { id: "8", name: "Patricia Lima", phone: "(11) 92345-6789", email: "patricia@example.com" },
    { id: "9", name: "Roberto Alves", phone: "(11) 99876-5432", email: "roberto@example.com" },
    { id: "10", name: "Camila Gomes", phone: "(11) 98765-4321", email: "camila@example.com" },
  ];

  // Filtered products based on search
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mockProducts, searchTerm]);

  return {
    mockProducts,
    mockClients,
    filteredProducts
  };
}
