
import { useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "./use-toast";

export function useCashOperationDialog() {
  const { pdvState, setPdvState } = useAppState();
  const { toast } = useToast();
  
  const [isCashOperationDialogOpen, setIsCashOperationDialogOpen] = useState(false);
  const [cashOperationType, setCashOperationType] = useState<"withdrawal" | "supply">("withdrawal");
  
  // Handle cash operation (withdrawal or supply)
  const handleCashOperation = (operation: { type: "withdrawal" | "supply", amount: number, reason: string }) => {
    if (!pdvState.cashierSession || pdvState.cashierSession.status !== "open") {
      toast({
        variant: "destructive",
        title: "Caixa não aberto",
        description: "Abra o caixa antes de realizar operações.",
      });
      return;
    }
    
    const newOperation = {
      ...operation,
      id: Date.now(),
      date: new Date(),
      userId: "user-1", // Mock user ID
    };
    
    // Update state
    setPdvState(prev => {
      if (!prev.cashierSession) return prev;
      
      return {
        ...prev,
        cashierSession: {
          ...prev.cashierSession,
          [operation.type === "withdrawal" ? "withdrawals" : "supplies"]: [
            ...prev.cashierSession[operation.type === "withdrawal" ? "withdrawals" : "supplies"],
            newOperation,
          ],
        },
      };
    });
    
    setIsCashOperationDialogOpen(false);
    
    toast({
      title: operation.type === "withdrawal" ? "Retirada realizada" : "Suprimento realizado",
      description: `${
        operation.type === "withdrawal" ? "Retirada" : "Suprimento"
      } de ${operation.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} realizado com sucesso.`,
    });
  };

  return {
    isCashOperationDialogOpen,
    setIsCashOperationDialogOpen,
    cashOperationType,
    setCashOperationType,
    handleCashOperation,
  };
}
