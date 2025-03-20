
import { ClientSelectDialog } from "./ClientSelectDialog";
import { CashierOpenDialog } from "./CashierOpenDialog";
import { CashierCloseDialog } from "./CashierCloseDialog";
import { PaymentDialog } from "./PaymentDialog";
import { CashOperationDialog } from "./CashOperationDialog";
import { OrderDialog } from "./OrderDialog";
import { ReportDialog } from "./ReportDialog";
import { useAppState } from "@/contexts/AppStateContext";
import { useCartState } from "@/hooks/useCartState";
import { usePDVData } from "@/hooks/usePDVData";
import { useClientDialog } from "@/hooks/useClientDialog";
import { useCashierDialog } from "@/hooks/useCashierDialog";
import { useCashOperationDialog } from "@/hooks/useCashOperationDialog";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import { useOrderDialog } from "@/hooks/useOrderDialog";
import { useReportDialog } from "@/hooks/useReportDialog";

export function DialogsProvider() {
  const { pdvState } = useAppState();
  const { cartItems, cartTotal, setCartItems, setSelectedClient } = useCartState();
  const { mockClients } = usePDVData();
  
  // Use refactored hooks
  const {
    selectedClient,
    isClientDialogOpen,
    setIsClientDialogOpen,
    handleSelectClient
  } = useClientDialog();

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

  const {
    isCashOperationDialogOpen,
    setIsCashOperationDialogOpen,
    cashOperationType,
    handleCashOperation
  } = useCashOperationDialog();

  const {
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentAmount,
    setPaymentAmount,
    paymentMethods,
    calculateRemainingAmount,
    calculateChangeAmount,
    handleAddPayment,
    handleFinalizeSale
  } = usePaymentDialog();

  const {
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    selectedOrder,
    handleCancelOrder,
    handlePrintReceipt
  } = useOrderDialog();

  const {
    isReportDialogOpen,
    setIsReportDialogOpen,
    handleGenerateReport
  } = useReportDialog();

  // Wrap the finalize sale handler to reset cart items and selected client
  const handleFinalizeSaleWrapper = () => {
    const sale = handleFinalizeSale(cartItems, cartTotal, selectedClient);
    if (sale) {
      setCartItems([]);
      setSelectedClient(null);
    }
  };

  // Wrap the add payment handler for the specific cart total
  const handleAddPaymentWrapper = () => {
    handleAddPayment(cartTotal);
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
        onAddPayment={handleAddPaymentWrapper}
        paymentMethods={paymentMethods}
        remainingAmount={calculateRemainingAmount(cartTotal)}
        changeAmount={calculateChangeAmount(cartTotal)}
        onFinalize={handleFinalizeSaleWrapper}
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
