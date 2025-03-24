
import { useState } from "react";
import { useCartState } from "@/hooks/useCartState";
import { usePDVData } from "@/hooks/usePDVData";
import { usePDVDialogs } from "@/hooks/usePDVDialogs";
import { PDVHeader } from "./PDVHeader";
import { PDVContent } from "./PDVContent";
import { CashierOpenDialog } from "./CashierOpenDialog";
import { CashierCloseDialog } from "./CashierCloseDialog";
import { CashOperationDialog } from "./CashOperationDialog";
import { ReportDialog } from "./ReportDialog";
import { ClientSelectDialog } from "./ClientSelectDialog";
import { PaymentDialog } from "./PaymentDialog";
import { OrderDialog } from "./OrderDialog";
import { Client } from "@/types/pdv";

export function PDV() {
  // Core states
  const [currentTab, setCurrentTab] = useState("terminal");
  
  // PDV data hook
  const { mockClients } = usePDVData();
  
  // Cart state 
  const { 
    cartItems, 
    cartTotal, 
    searchTerm,
    setSearchTerm,
    setCartItems, 
    selectedClient, 
    setSelectedClient,
    handleAddToCart,
    handleRemoveFromCart,
    handleChangeQuantity,
  } = useCartState();

  // Dialogs and operations state
  const {
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
    completedSales,
    pendingSales
  } = usePDVDialogs();

  // Handler for payment dialog
  const handleOpenPaymentDialog = () => {
    if (cartItems.length === 0) {
      return;
    }
    
    if (!selectedClient) {
      setIsClientDialogOpen(true);
      return;
    }
    
    setIsPaymentDialogOpen(true);
  };

  // Handle finalize sale
  const finalizeSale = () => {
    const sale = handleFinalizeSaleWrapper(cartItems, cartTotal, selectedClient);
    if (sale) {
      setCartItems([]);
      setSelectedClient(null);
      setPaymentMethods([]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PDVHeader 
        isCashierClosed={isCashierClosed}
        onOpenCashier={() => setIsOpeningDialogOpen(true)}
        onCloseCashier={() => setIsClosingDialogOpen(true)}
        onWithdrawal={() => {
          setCashOperationType("withdrawal");
          setIsCashOperationDialogOpen(true);
        }}
        onSupply={() => {
          setCashOperationType("supply");
          setIsCashOperationDialogOpen(true);
        }}
        onReports={() => setIsReportDialogOpen(true)}
      />
      
      <PDVContent 
        isCashierClosed={isCashierClosed}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedClient={selectedClient}
        cartItems={cartItems}
        cartTotal={cartTotal}
        handleAddToCart={handleAddToCart}
        handleChangeQuantity={handleChangeQuantity}
        handleRemoveFromCart={handleRemoveFromCart}
        handleOpenPaymentDialog={handleOpenPaymentDialog}
        setIsClientDialogOpen={setIsClientDialogOpen}
        setIsOpeningDialogOpen={setIsOpeningDialogOpen}
        completedSales={completedSales}
        pendingSales={pendingSales}
        onViewOrder={handleViewOrder}
        onCancelOrder={handleCancelOrder}
        onPrintReceipt={handlePrintReceipt}
      />
      
      {/* All Dialogs */}
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
        initialAmount={openingAmount ? parseFloat(openingAmount) : 0}
        sales={completedSales}
        onConfirm={handleCloseCashier}
      />
      
      <CashOperationDialog
        isOpen={isCashOperationDialogOpen}
        onOpenChange={setIsCashOperationDialogOpen}
        type={cashOperationType}
        onConfirm={handleCashOperation}
      />
      
      <ReportDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onGenerateReport={handleGenerateReport}
      />
      
      <ClientSelectDialog
        isOpen={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        clients={mockClients}
        onSelect={(client: Client) => {
          handleSelectClient(client);
          setSelectedClient(client);
        }}
        isRequired={!selectedClient}
      />
      
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        cartTotal={cartTotal}
        selectedPaymentMethod={selectedPaymentMethod}
        onSelectPaymentMethod={setSelectedPaymentMethod}
        paymentAmount={paymentAmount}
        onPaymentAmountChange={setPaymentAmount}
        onAddPayment={() => handleAddPaymentWrapper(cartTotal)}
        paymentMethods={paymentMethods}
        remainingAmount={calculateRemainingAmount(cartTotal)}
        changeAmount={calculateChangeAmount(cartTotal)}
        onFinalize={finalizeSale}
      />
      
      <OrderDialog
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        order={selectedOrder}
        onPrintReceipt={handlePrintReceipt}
        onCancel={handleCancelOrder}
      />
    </div>
  );
}
