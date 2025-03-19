
import { useState } from "react";
import { ClientSelectDialog } from "./ClientSelectDialog";
import { CashierOpenDialog } from "./CashierOpenDialog";
import { CashierCloseDialog } from "./CashierCloseDialog";
import { PaymentDialog } from "./PaymentDialog";
import { CashOperationDialog } from "./CashOperationDialog";
import { OrderDialog } from "./OrderDialog";
import { ReportDialog } from "./ReportDialog";
import { useAppState } from "@/contexts/AppStateContext";
import { usePDVOperations } from "@/hooks/usePDVOperations";
import { useCartState } from "@/hooks/useCartState";
import { formatCurrency, parseCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import { Sale, Payment } from "@/types/pdv";
import { usePDVData } from "@/hooks/usePDVData";

export function DialogsProvider() {
  const { pdvState, setPdvState } = useAppState();
  const { toast } = useToast();
  const {
    isOpeningDialogOpen,
    setIsOpeningDialogOpen,
    isClosingDialogOpen,
    setIsClosingDialogOpen,
    openingAmount,
    setOpeningAmount,
    isCashOperationDialogOpen,
    setIsCashOperationDialogOpen,
    cashOperationType,
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    selectedOrder,
    isReportDialogOpen,
    setIsReportDialogOpen,
    handleCancelOrder,
    handlePrintReceipt
  } = usePDVOperations();

  const { selectedClient, setSelectedClient, isClientDialogOpen, setIsClientDialogOpen } = useCartState();
  const { mockClients } = usePDVData();
  
  // Payment dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cash" | "credit" | "debit" | "pix">("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<Payment[]>([]);
  const { cartItems, cartTotal, setCartItems } = useCartState();

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
      } de ${formatCurrency(operation.amount)} realizado com sucesso.`,
    });
  };

  // Calculate remaining amount to be paid
  const calculateRemainingAmount = () => {
    const totalPaid = paymentMethods.reduce((sum, payment) => sum + payment.amount, 0);
    return cartTotal - totalPaid;
  };
  
  // Calculate change amount (if paid more than total)
  const calculateChangeAmount = () => {
    const totalPaid = paymentMethods.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.max(0, totalPaid - cartTotal);
  };
  
  // Handle adding payment method
  const handleAddPayment = () => {
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
    const remaining = calculateRemainingAmount() - amount;
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

  // Handle finalizing sale
  const handleFinalizeSale = () => {
    if (!selectedClient) {
      toast({
        variant: "destructive",
        title: "Cliente não selecionado",
        description: "Selecione um cliente antes de finalizar a venda.",
      });
      return;
    }
    
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
      });
      return;
    }
    
    if (calculateRemainingAmount() > 0) {
      toast({
        variant: "destructive",
        title: "Pagamento incompleto",
        description: "O valor pago deve ser igual ou maior que o total da venda.",
      });
      return;
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
    setCartItems([]);
    setSelectedClient(null);
    setPaymentMethods([]);
    setIsPaymentDialogOpen(false);
    
    toast({
      title: "Venda finalizada",
      description: `Venda ${newSale.id} foi finalizada com sucesso.`,
    });
  };

  // Handle generating report
  const handleGenerateReport = (data: any) => {
    // Mock function for generating report
    console.log("Generating report with data:", data);
    
    setIsReportDialogOpen(false);
    
    toast({
      title: "Relatório gerado",
      description: "O relatório foi gerado com sucesso.",
    });
  };

  // Handle select client
  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    toast({
      title: "Cliente selecionado",
      description: `${client.name} foi selecionado para este pedido.`,
    });
  };

  return (
    <>
      <ClientSelectDialog
        isOpen={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        clients={mockClients as any}
        onSelect={handleSelectClient as any}
        isRequired={!selectedClient}
      />
      
      <CashierOpenDialog
        isOpen={isOpeningDialogOpen}
        onOpenChange={setIsOpeningDialogOpen}
        openingAmount={openingAmount}
        onOpeningAmountChange={setOpeningAmount}
        onConfirm={handleOpenCashier}
      />
      
      <CashierCloseDialog
        isOpen={isClosingDialogOpen}
        onOpenChange={setIsClosingDialogOpen}
        initialAmount={pdvState.cashierSession?.initialAmount || 0}
        sales={pdvState.cashierSession?.sales || []}
        onConfirm={handleCloseCashier}
      />
      
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        cartTotal={cartTotal}
        selectedPaymentMethod={selectedPaymentMethod}
        onSelectPaymentMethod={setSelectedPaymentMethod}
        paymentAmount={paymentAmount}
        onPaymentAmountChange={setPaymentAmount}
        onAddPayment={handleAddPayment}
        paymentMethods={paymentMethods}
        remainingAmount={calculateRemainingAmount()}
        changeAmount={calculateChangeAmount()}
        onFinalize={handleFinalizeSale}
      />
      
      <CashOperationDialog
        isOpen={isCashOperationDialogOpen}
        onOpenChange={setIsCashOperationDialogOpen}
        type={cashOperationType}
        onConfirm={handleCashOperation}
      />
      
      <OrderDialog
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        order={selectedOrder}
        onPrintReceipt={handlePrintReceipt}
        onCancel={handleCancelOrder}
      />
      
      <ReportDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onGenerateReport={handleGenerateReport}
      />
    </>
  );
}
