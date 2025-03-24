
import { useState } from "react";
import { Sale, Client } from "@/types/pdv";
import { useOrderDialog } from "@/hooks/useOrderDialog";
import { useClientDialog } from "@/hooks/useClientDialog";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import { useReportDialog } from "@/hooks/useReportDialog";
import { useCashOperationDialog } from "@/hooks/useCashOperationDialog";
import { useCashierDialog } from "@/hooks/useCashierDialog";
import { useToast } from "@/hooks/use-toast";
import { useAppState } from "@/contexts/AppStateContext";

export function usePDVDialogs() {
  const { toast } = useToast();
  const { pdvState } = useAppState();
  
  // Cashier dialog hooks
  const {
    isOpeningDialogOpen,
    setIsOpeningDialogOpen,
    isClosingDialogOpen,
    setIsClosingDialogOpen,
    openingAmount,
    setOpeningAmount,
    handleOpenCashier,
    handleCloseCashier
  } = useCashierDialog();

  // Cash operation dialog hooks
  const {
    isCashOperationDialogOpen,
    setIsCashOperationDialogOpen,
    cashOperationType,
    setCashOperationType,
    handleCashOperation
  } = useCashOperationDialog();

  // Report dialog hooks
  const {
    isReportDialogOpen,
    setIsReportDialogOpen,
    handleGenerateReport
  } = useReportDialog();

  // Client dialog hooks
  const {
    isClientDialogOpen,
    setIsClientDialogOpen,
    handleSelectClient
  } = useClientDialog();

  // Order dialog hooks
  const {
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    selectedOrder,
    setSelectedOrder,
    handleCancelOrder,
    handlePrintReceipt
  } = useOrderDialog();

  // Payment dialog hooks
  const {
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
    handleFinalizeSale
  } = usePaymentDialog();
  
  // Determine if cashier is closed
  const isCashierClosed = !pdvState.cashierSession || pdvState.cashierSession.status === "closed";
  
  // Wrap payment handling
  const handleAddPaymentWrapper = (cartTotal: number) => {
    handleAddPayment(cartTotal);
  };

  // Wrap sale finalization
  const handleFinalizeSaleWrapper = (cartItems: any[], cartTotal: number, selectedClient: Client | null) => {
    const sale = handleFinalizeSale(cartItems, cartTotal, selectedClient);
    if (sale) {
      toast({
        title: "Venda finalizada",
        description: `Venda ${sale.id} foi finalizada com sucesso.`,
      });
    }
    return sale;
  };

  // View order handler
  const handleViewOrder = (order: Sale) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  return {
    // Cashier
    isOpeningDialogOpen,
    setIsOpeningDialogOpen,
    isClosingDialogOpen,
    setIsClosingDialogOpen,
    openingAmount,
    setOpeningAmount,
    handleOpenCashier,
    handleCloseCashier,
    isCashierClosed,
    
    // Cash operation
    isCashOperationDialogOpen,
    setIsCashOperationDialogOpen,
    cashOperationType,
    setCashOperationType,
    handleCashOperation,
    
    // Report
    isReportDialogOpen,
    setIsReportDialogOpen,
    handleGenerateReport,
    
    // Client
    isClientDialogOpen,
    setIsClientDialogOpen,
    handleSelectClient,
    
    // Order
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    selectedOrder,
    setSelectedOrder,
    handleCancelOrder,
    handlePrintReceipt,
    handleViewOrder,
    
    // Payment
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
    handleAddPaymentWrapper,
    handleFinalizeSaleWrapper,
    
    // State data
    completedSales: pdvState.completedSales,
    pendingSales: pdvState.pendingSales
  };
}
