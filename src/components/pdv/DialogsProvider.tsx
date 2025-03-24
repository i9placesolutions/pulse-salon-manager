
import { ClientSelectDialog } from "./ClientSelectDialog";
import { CashierOpenDialog } from "./CashierOpenDialog";
import { CashierCloseDialog } from "./CashierCloseDialog";
import { PaymentDialog } from "./PaymentDialog";
import { CashOperationDialog } from "./CashOperationDialog";
import { OrderDialog } from "./OrderDialog";
import { ReportDialog } from "./ReportDialog";
import { usePDVDialogs } from "@/hooks/usePDVDialogs";
import { useCartState } from "@/hooks/useCartState";
import { Client, Sale } from "@/types/pdv";

interface DialogsProviderProps {
  cartItems: any[];
  cartTotal: number;
  selectedClient: Client | null;
  setCartItems: (items: any[]) => void;
  setSelectedClient: (client: Client | null) => void;
}

export function DialogsProvider({
  cartItems,
  cartTotal,
  selectedClient,
  setCartItems,
  setSelectedClient
}: DialogsProviderProps) {
  // Use all dialog related hooks from usePDVDialogs
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
    
    // Cash operation
    isCashOperationDialogOpen,
    setIsCashOperationDialogOpen,
    cashOperationType,
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
  } = usePDVDialogs();

  // Wrap the finalize sale handler to reset cart items and selected client
  const handleFinalizeSale = () => {
    const sale = handleFinalizeSaleWrapper(cartItems, cartTotal, selectedClient);
    if (sale) {
      setCartItems([]);
      setSelectedClient(null);
      setPaymentMethods([]);
    }
  };

  return (
    <>
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
        sales={[]} // Will be filled from the cashier session
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
        clients={[]} // Will be provided from mock data
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
        onFinalize={handleFinalizeSale}
      />
      
      <OrderDialog
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        order={selectedOrder}
        onPrintReceipt={handlePrintReceipt}
        onCancel={handleCancelOrder}
      />
    </>
  );
}
