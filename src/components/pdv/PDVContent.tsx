
import { Ban, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PDVTerminal } from "./PDVTerminal";
import { OrderList } from "./OrderList";
import { useToast } from "@/hooks/use-toast";
import { Sale, Client } from "@/types/pdv";
import { SaleItem } from "@/types/pdv";

interface PDVContentProps {
  isCashierClosed: boolean;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClient: Client | null;
  cartItems: SaleItem[];
  cartTotal: number;
  handleAddToCart: (product: any) => void;
  handleChangeQuantity: (id: string, quantity: number) => void;
  handleRemoveFromCart: (id: string) => void;
  handleOpenPaymentDialog: () => void;
  setIsClientDialogOpen: (isOpen: boolean) => void;
  setIsOpeningDialogOpen: (isOpen: boolean) => void;
  completedSales: Sale[];
  pendingSales: Sale[];
  onViewOrder: (order: Sale) => void;
  onCancelOrder: (orderId: string) => void;
  onPrintReceipt: (order: Sale) => void;
}

export function PDVContent({
  isCashierClosed,
  currentTab,
  setCurrentTab,
  searchTerm,
  setSearchTerm,
  selectedClient,
  cartItems,
  cartTotal,
  handleAddToCart,
  handleChangeQuantity,
  handleRemoveFromCart,
  handleOpenPaymentDialog,
  setIsClientDialogOpen,
  setIsOpeningDialogOpen,
  completedSales,
  pendingSales,
  onViewOrder,
  onCancelOrder,
  onPrintReceipt
}: PDVContentProps) {
  const { toast } = useToast();
  
  return (
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
              handleOpenPaymentDialog={handleOpenPaymentDialog}
              setIsClientDialogOpen={setIsClientDialogOpen}
            />
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="orders" className="flex-1">
        <div className="container mx-auto py-4">
          <OrderList
            orders={[...completedSales, ...pendingSales]}
            onCancel={onCancelOrder}
            onPrintReceipt={onPrintReceipt}
            onViewOrder={onViewOrder}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
