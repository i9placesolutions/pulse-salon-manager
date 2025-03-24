
import { useState } from "react";
import { useCartState } from "@/hooks/useCartState";
import { usePDVData } from "@/hooks/usePDVData";
import { usePDVDialogs } from "@/hooks/usePDVDialogs";
import { PDVHeader } from "./PDVHeader";
import { PDVContent } from "./PDVContent";
import { DialogsProvider } from "./DialogsProvider";
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
    // Cashier state
    isCashierClosed,
    setIsOpeningDialogOpen,
    setIsClosingDialogOpen,
    
    // Cash operation state
    setCashOperationType,
    setIsCashOperationDialogOpen,
    
    // Report state
    setIsReportDialogOpen,
    
    // Client state
    setIsClientDialogOpen,
    
    // Order state
    handleViewOrder,
    handleCancelOrder,
    handlePrintReceipt,
    
    // Completed and pending sales
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
      
      <DialogsProvider
        cartItems={cartItems}
        cartTotal={cartTotal}
        selectedClient={selectedClient}
        setCartItems={setCartItems}
        setSelectedClient={setSelectedClient}
      />
    </div>
  );
}
