
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ban, Lock, Clock } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "@/hooks/use-toast";
import { Sale, CashierOperation } from "@/types/pdv";
import { PDVHeader } from "./PDVHeader";
import { PDVTerminal } from "./PDVTerminal";
import { OrderList } from "./OrderList";
import { DialogsProvider } from "./DialogsProvider";
import { usePDVOperations } from "@/hooks/usePDVOperations";
import { useCashierDialog } from "@/hooks/useCashierDialog";

export function PDV() {
  const { toast } = useToast();
  const { pdvState } = useAppState();
  const [currentTab, setCurrentTab] = useState("terminal");
  
  const {
    isCashierClosed,
    setIsCashOperationDialogOpen,
    setCashOperationType,
    setIsReportDialogOpen,
    handleCancelOrder,
    handlePrintReceipt
  } = usePDVOperations();

  const {
    isOpeningDialogOpen,
    setIsOpeningDialogOpen,
    isClosingDialogOpen,
    setIsClosingDialogOpen
  } = useCashierDialog();

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
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <DialogsProvider />
    </div>
  );
}
