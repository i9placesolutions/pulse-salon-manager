
import { useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "./use-toast";
import { formatCurrency, parseCurrency } from "@/utils/currency";

export function useCashierDialog() {
  const { pdvState, setPdvState } = useAppState();
  const { toast } = useToast();
  
  const [isOpeningDialogOpen, setIsOpeningDialogOpen] = useState(false);
  const [isClosingDialogOpen, setIsClosingDialogOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");

  // Handle opening cashier
  const handleOpenCashier = () => {
    // Check if there's a cashier session already open
    if (pdvState.cashierSession && pdvState.cashierSession.status === "open") {
      toast({
        title: "Caixa já aberto",
        description: "Já existe um caixa aberto. Feche o caixa atual antes de abrir um novo.",
      });
      return;
    }
    
    // Parse opening amount
    const initialAmount = parseCurrency(openingAmount);
    
    if (initialAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "O valor inicial do caixa deve ser maior que zero.",
      });
      return;
    }
    
    // Create new cashier session
    const newSession = {
      id: `session-${Date.now()}`,
      openingDate: new Date().toISOString(),
      closingDate: null,
      initialAmount,
      finalAmount: initialAmount,
      status: "open" as const,
      userId: "user-1", // Mock user ID
      sales: [],
      withdrawals: [],
      supplies: [],
    };
    
    // Update state
    setPdvState(prev => ({
      ...prev,
      cashierSession: newSession,
    }));
    
    setIsOpeningDialogOpen(false);
    
    toast({
      title: "Caixa aberto",
      description: `Caixa aberto com valor inicial de ${formatCurrency(initialAmount)}.`,
    });
  };
  
  // Handle closing cashier
  const handleCloseCashier = () => {
    if (!pdvState.cashierSession) {
      toast({
        variant: "destructive",
        title: "Caixa não aberto",
        description: "Não há caixa aberto para fechar.",
      });
      return;
    }
    
    // Calculate final amount
    const { initialAmount, sales, withdrawals, supplies } = pdvState.cashierSession;
    
    const totalSales = sales.reduce((sum, sale) => {
      // Only count cash payments
      const cashPayments = sale.payments
        .filter(payment => payment.method === "cash")
        .reduce((total, payment) => total + payment.amount, 0);
      
      return sum + cashPayments;
    }, 0);
    
    const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
    const totalSupplies = supplies.reduce((sum, supply) => sum + supply.amount, 0);
    
    const finalAmount = initialAmount + totalSales - totalWithdrawals + totalSupplies;
    
    // Update cashier session
    const closedSession = {
      ...pdvState.cashierSession,
      closingDate: new Date().toISOString(),
      finalAmount,
      status: "closed" as const,
    };
    
    // Update state
    setPdvState(prev => ({
      ...prev,
      cashierSession: closedSession,
    }));
    
    setIsClosingDialogOpen(false);
    
    toast({
      title: "Caixa fechado",
      description: `Caixa fechado com sucesso. Valor final: ${formatCurrency(finalAmount)}.`,
    });
  };

  return {
    isOpeningDialogOpen,
    setIsOpeningDialogOpen,
    isClosingDialogOpen,
    setIsClosingDialogOpen,
    openingAmount,
    setOpeningAmount,
    handleOpenCashier,
    handleCloseCashier,
  };
}
