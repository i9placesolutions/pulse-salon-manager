
import { useState } from "react";
import { useToast } from "./use-toast";
import { useAppState } from "@/contexts/AppStateContext";
import { Payment, Sale, Client, SaleItem } from "@/types/pdv";
import { parseCurrency } from "@/utils/currency";

export function usePaymentHandling() {
  const { pdvState, setPdvState } = useAppState();
  const { toast } = useToast();
  
  // Payment dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cash" | "credit" | "debit" | "pix">("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<Payment[]>([]);

  // Calculate remaining amount to be paid
  const calculateRemainingAmount = (cartTotal: number) => {
    const totalPaid = paymentMethods.reduce((sum, payment) => sum + payment.amount, 0);
    return cartTotal - totalPaid;
  };
  
  // Calculate change amount (if paid more than total)
  const calculateChangeAmount = (cartTotal: number) => {
    const totalPaid = paymentMethods.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.max(0, totalPaid - cartTotal);
  };
  
  // Handle adding payment method
  const handleAddPayment = (cartTotal: number) => {
    const amount = parseCurrency(paymentAmount);
    
    if (amount <= 0) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "O valor do pagamento deve ser maior que zero.",
      });
      return;
    }
    
    setPaymentMethods(prev => [
      ...prev,
      { 
        method: selectedPaymentMethod, 
        amount 
      },
    ]);
    
    // Calculate remaining amount for the next payment
    const remaining = calculateRemainingAmount(cartTotal) - amount;
    setPaymentAmount(remaining > 0 ? remaining.toString() : "");
  };

  // Generate a new order ID
  const generateOrderId = () => {
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10).replace(/-/g, "");
    
    // Get the number of orders from today
    const todayOrders = [...pdvState.completedSales, ...pdvState.pendingSales]
      .filter(order => order.createdAt.includes(today.toISOString().slice(0, 10)))
      .length;
    
    // Format the count with leading zeros
    const count = String(todayOrders + 1).padStart(5, "0");
    
    return `PDV-${dateString}-${count}`;
  };

  // Reset payment state
  const resetPaymentState = () => {
    setPaymentMethods([]);
    setIsPaymentDialogOpen(false);
    setPaymentAmount("");
  };

  // Handle finalizing sale
  const handleFinalizeSale = (cartItems: SaleItem[], cartTotal: number, selectedClient: Client | null) => {
    if (!selectedClient) {
      toast({
        variant: "destructive",
        title: "Cliente não selecionado",
        description: "Selecione um cliente antes de finalizar a venda.",
      });
      return null;
    }
    
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
      });
      return null;
    }
    
    if (calculateRemainingAmount(cartTotal) > 0) {
      toast({
        variant: "destructive",
        title: "Pagamento incompleto",
        description: "O valor pago deve ser igual ou maior que o total da venda.",
      });
      return null;
    }
    
    // Create new sale
    const newSale: Sale = {
      id: generateOrderId(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientPhone: selectedClient.phone,
      items: [...cartItems],
      total: cartTotal,
      payments: [...paymentMethods],
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add sale to completed sales
    setPdvState(prev => ({
      ...prev,
      completedSales: [...prev.completedSales, newSale],
      cashierSession: prev.cashierSession ? {
        ...prev.cashierSession,
        sales: [...prev.cashierSession.sales, newSale]
      } : null
    }));
    
    // Reset state
    resetPaymentState();
    
    toast({
      title: "Venda finalizada",
      description: `Venda ${newSale.id} foi finalizada com sucesso.`,
    });

    return newSale;
  };

  // Handle opening payment dialog
  const handleOpenPaymentDialog = (cartItems: SaleItem[], selectedClient: Client | null) => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
      });
      return false;
    }
    
    if (!selectedClient) {
      toast({
        variant: "destructive",
        title: "Cliente não selecionado",
        description: "Selecione um cliente antes de finalizar a venda.",
      });
      return false;
    }
    
    setIsPaymentDialogOpen(true);
    return true;
  };

  return {
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentAmount,
    setPaymentAmount,
    paymentMethods,
    setPaymentMethods,
    calculateRemainingAmount,
    calculateChangeAmount,
    handleAddPayment,
    handleFinalizeSale,
    handleOpenPaymentDialog,
    resetPaymentState
  };
}
