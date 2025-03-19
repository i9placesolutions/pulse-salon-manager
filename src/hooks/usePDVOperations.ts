
import { useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { Sale } from "@/types/pdv";
import { useToast } from "./use-toast";

export function usePDVOperations() {
  const { toast } = useToast();
  const { pdvState, setPdvState } = useAppState();
  
  // Cashier dialogs states
  const [isOpeningDialogOpen, setIsOpeningDialogOpen] = useState(false);
  const [isClosingDialogOpen, setIsClosingDialogOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  
  // Cash operation dialog states
  const [isCashOperationDialogOpen, setIsCashOperationDialogOpen] = useState(false);
  const [cashOperationType, setCashOperationType] = useState<"withdrawal" | "supply">("withdrawal");
  
  // Payment dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  // Client dialog state
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  
  // Order dialog states
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);
  
  // Report dialog state
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  // Determine if cashier is closed
  const isCashierClosed = !pdvState.cashierSession || pdvState.cashierSession.status === "closed";
  
  // Handle cancelling an order
  const handleCancelOrder = (orderId: string) => {
    // Find the order
    const pendingOrder = pdvState.pendingSales.find(order => order.id === orderId);
    const completedOrder = pdvState.completedSales.find(order => order.id === orderId);
    
    if (!pendingOrder && !completedOrder) {
      toast({
        variant: "destructive",
        title: "Pedido não encontrado",
        description: "O pedido que você está tentando cancelar não foi encontrado.",
      });
      return;
    }
    
    const order = pendingOrder || completedOrder;
    
    if (!order) return;
    
    if (order.status === "cancelled") {
      toast({
        variant: "destructive",
        title: "Pedido já cancelado",
        description: "Este pedido já foi cancelado anteriormente.",
      });
      return;
    }
    
    // Update order status
    const cancelledOrder = {
      ...order,
      status: "cancelled" as const,
      updatedAt: new Date().toISOString(),
    };
    
    // Update state
    setPdvState(prev => {
      if (pendingOrder) {
        return {
          ...prev,
          pendingSales: prev.pendingSales.map(order =>
            order.id === orderId ? cancelledOrder : order
          ),
        };
      } else {
        return {
          ...prev,
          completedSales: prev.completedSales.map(order =>
            order.id === orderId ? cancelledOrder : order
          ),
        };
      }
    });
    
    setIsOrderDialogOpen(false);
    
    toast({
      title: "Pedido cancelado",
      description: `Pedido ${orderId} foi cancelado com sucesso.`,
    });
  };
  
  // Handle printing receipt
  const handlePrintReceipt = (order: Sale) => {
    // Mock function for printing receipt
    console.log("Printing receipt for order:", order);
    
    toast({
      title: "Recibo impresso",
      description: `Recibo do pedido ${order.id} foi enviado para impressão.`,
    });
  };

  return {
    // State
    isCashierClosed,
    isOpeningDialogOpen,
    setIsOpeningDialogOpen,
    isClosingDialogOpen,
    setIsClosingDialogOpen,
    openingAmount,
    setOpeningAmount,
    isCashOperationDialogOpen,
    setIsCashOperationDialogOpen,
    cashOperationType,
    setCashOperationType,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isClientDialogOpen, 
    setIsClientDialogOpen,
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    selectedOrder,
    setSelectedOrder,
    isReportDialogOpen,
    setIsReportDialogOpen,
    
    // Methods
    handleCancelOrder,
    handlePrintReceipt
  };
}
