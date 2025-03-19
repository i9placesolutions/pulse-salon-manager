
import { useState } from "react";
import { usePDVOperations } from "./usePDVOperations";
import { useToast } from "./use-toast";
import { SaleItem } from "@/types/pdv";

// Define interfaces for the local types
interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

export function useCartState() {
  const { toast } = useToast();
  
  // Client selection
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  
  // Cart state
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Payment dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  // Handle adding product to cart
  const handleAddToCart = (product: Product) => {
    if (!selectedClient) {
      setIsClientDialogOpen(true);
      toast({
        variant: "destructive",
        title: "Cliente não selecionado",
        description: "Selecione um cliente antes de adicionar produtos ao pedido.",
      });
      return;
    }
    
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            category: product.category,
          },
        ];
      }
    });
  };
  
  // Handle removing product from cart
  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  // Handle changing product quantity in cart
  const handleChangeQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  // Handle payment dialog
  const handleOpenPaymentDialog = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
      });
      return;
    }
    
    setIsPaymentDialogOpen(true);
  };

  return {
    // State
    selectedClient,
    setSelectedClient,
    isClientDialogOpen,
    setIsClientDialogOpen,
    cartItems,
    setCartItems,
    searchTerm,
    setSearchTerm,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    cartTotal,
    
    // Methods
    handleAddToCart,
    handleRemoveFromCart,
    handleChangeQuantity,
    handleOpenPaymentDialog
  };
}
