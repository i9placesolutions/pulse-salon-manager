
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ban, Lock, Printer, Clock } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "@/hooks/use-toast";
import { Sale, Client } from "@/types/pdv";
import { PDVHeader } from "./PDVHeader";
import { PDVTerminal } from "./PDVTerminal";
import { OrderList } from "./OrderList";
import { CashierOpenDialog } from "./CashierOpenDialog";
import { CashierCloseDialog } from "./CashierCloseDialog";
import { CashOperationDialog } from "./CashOperationDialog";
import { OrderDialog } from "./OrderDialog";
import { ReportDialog } from "./ReportDialog";
import { ClientSelectDialog } from "./ClientSelectDialog";
import { PaymentDialog } from "./PaymentDialog";
import { useCartState } from "@/hooks/useCartState";
import { useCashierDialog } from "@/hooks/useCashierDialog";
import { useCashOperationDialog } from "@/hooks/useCashOperationDialog";
import { useReportDialog } from "@/hooks/useReportDialog";
import { useOrderDialog } from "@/hooks/useOrderDialog";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import { useClientDialog } from "@/hooks/useClientDialog";
import { usePDVData } from "@/hooks/usePDVData";

export function PDV() {
  // Core states
  const { toast } = useToast();
  const { pdvState } = useAppState();
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
  const handleAddPaymentWrapper = () => {
    handleAddPayment(cartTotal);
  };

  // Wrap sale finalization
  const handleFinalizeSaleWrapper = () => {
    const sale = handleFinalizeSale(cartItems, cartTotal, selectedClient);
    if (sale) {
      setCartItems([]);
      setSelectedClient(null);
      setPaymentMethods([]);
      toast({
        title: "Venda finalizada",
        description: `Venda ${sale.id} foi finalizada com sucesso.`,
      });
    }
  };

  // View order handler
  const handleViewOrder = (order: Sale) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
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
      
      <Tabs 
        defaultValue="terminal" 
        className="flex-1"
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <div className="container mx-auto py-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="terminal">Terminal de Vendas</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="terminal" className="flex-1">
          <div className="container mx-auto py-4">
            {isCashierClosed ? (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <Ban className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Terminal bloqueado</h3>
                  <p className="text-muted-foreground mb-4">
                    O caixa está fechado. Abra o caixa para iniciar as vendas.
                  </p>
                  <Button onClick={() => setIsOpeningDialogOpen(true)}>
                    <Lock className="mr-2 h-4 w-4" />
                    Abrir Caixa
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <PDVTerminal 
                onViewOrders={() => setCurrentTab("orders")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedClient={selectedClient}
                cartItems={cartItems}
                cartTotal={cartTotal}
                handleAddToCart={handleAddToCart}
                handleChangeQuantity={handleChangeQuantity}
                handleRemoveFromCart={handleRemoveFromCart}
                handleOpenPaymentDialog={() => {
                  if (cartItems.length === 0) {
                    toast({
                      variant: "destructive",
                      title: "Carrinho vazio",
                      description: "Adicione produtos ao carrinho antes de finalizar a venda.",
                    });
                    return;
                  }
                  
                  if (!selectedClient) {
                    setIsClientDialogOpen(true);
                    toast({
                      variant: "destructive", 
                      title: "Cliente não selecionado",
                      description: "Selecione um cliente antes de finalizar a venda.",
                    });
                    return;
                  }
                  
                  setIsPaymentDialogOpen(true);
                }}
                setIsClientDialogOpen={setIsClientDialogOpen}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="flex-1">
          <div className="container mx-auto py-4">
            <OrderList
              orders={[...pdvState.completedSales, ...pdvState.pendingSales]}
              onCancel={handleCancelOrder}
              onPrintReceipt={handlePrintReceipt}
              onViewOrder={handleViewOrder}
            />
          </div>
        </TabsContent>
      </Tabs>
      
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
        initialAmount={pdvState.cashierSession?.initialAmount || 0}
        sales={pdvState.cashierSession?.sales || []}
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
        onAddPayment={handleAddPaymentWrapper}
        paymentMethods={paymentMethods}
        remainingAmount={calculateRemainingAmount(cartTotal)}
        changeAmount={calculateChangeAmount(cartTotal)}
        onFinalize={handleFinalizeSaleWrapper}
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
