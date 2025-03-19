
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, parseCurrency } from "@/utils/currency";
import { Search, Plus, ShoppingCart, User, PackageOpen, Lock, CreditCard, DollarSign, Clock, Ban } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { ProductCard } from "./ProductCard";
import { CartItem } from "./CartItem";
import { ClientSelectDialog } from "./ClientSelectDialog";
import { CashierOpenDialog } from "./CashierOpenDialog";
import { CashierCloseDialog } from "./CashierCloseDialog";
import { PaymentDialog } from "./PaymentDialog";
import { CashOperationDialog } from "./CashOperationDialog";
import { OrderList } from "./OrderList";
import { OrderDialog } from "./OrderDialog";
import { ReportDialog } from "./ReportDialog";
import { Sale, SaleItem, Payment, CashierOperation } from "@/types/pdv";
import { useToast } from "@/hooks/use-toast";

// Define interfaces for the mock data to ensure type compatibility
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
}

// Mock data for illustration - with string IDs
const mockProducts: Product[] = [
  { id: "1", name: "Corte de Cabelo", price: 50, category: "Serviço", quantity: -1 },
  { id: "2", name: "Barba", price: 30, category: "Serviço", quantity: -1 },
  { id: "3", name: "Hidratação", price: 70, category: "Serviço", quantity: -1 },
  { id: "4", name: "Tintura", price: 120, category: "Serviço", quantity: -1 },
  { id: "5", name: "Shampoo Profissional", price: 45, category: "Produto", quantity: 25 },
  { id: "6", name: "Condicionador", price: 40, category: "Produto", quantity: 18 },
  { id: "7", name: "Cera para Cabelo", price: 35, category: "Produto", quantity: 12 },
  { id: "8", name: "Gel", price: 25, category: "Produto", quantity: 30 },
  { id: "9", name: "Óleo para Barba", price: 38, category: "Produto", quantity: 15 },
  { id: "10", name: "Kit Barba", price: 85, category: "Produto", quantity: 7 },
];

// Mock clients with string IDs
const mockClients: Client[] = [
  { id: "1", name: "João Silva", phone: "(11) 98765-4321", email: "joao@example.com" },
  { id: "2", name: "Maria Oliveira", phone: "(11) 91234-5678", email: "maria@example.com" },
  { id: "3", name: "Pedro Santos", phone: "(11) 99876-5432", email: "pedro@example.com" },
  { id: "4", name: "Ana Souza", phone: "(11) 92345-6789", email: "ana@example.com" },
  { id: "5", name: "Carlos Ferreira", phone: "(11) 98765-1234", email: "carlos@example.com" },
  { id: "6", name: "Lucia Pereira", phone: "(11) 94567-8901", email: "lucia@example.com" },
  { id: "7", name: "Fernando Costa", phone: "(11) 93456-7890", email: "fernando@example.com" },
  { id: "8", name: "Patricia Lima", phone: "(11) 92345-6789", email: "patricia@example.com" },
  { id: "9", name: "Roberto Alves", phone: "(11) 99876-5432", email: "roberto@example.com" },
  { id: "10", name: "Camila Gomes", phone: "(11) 98765-4321", email: "camila@example.com" },
];

export function PDV() {
  const { toast } = useToast();
  const { pdvState, setPdvState } = useAppState();
  
  // Client selection
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  
  // Cart state
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Cashier dialogs
  const [isOpeningDialogOpen, setIsOpeningDialogOpen] = useState(false);
  const [isClosingDialogOpen, setIsClosingDialogOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  
  // Payment dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cash" | "credit" | "debit" | "pix">("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<Payment[]>([]);
  
  // Cash operation dialog
  const [isCashOperationDialogOpen, setIsCashOperationDialogOpen] = useState(false);
  const [cashOperationType, setCashOperationType] = useState<"withdrawal" | "supply">("withdrawal");
  
  // Order dialog
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);
  
  // Report dialog
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  // Current view tab
  const [currentTab, setCurrentTab] = useState("terminal");
  
  // Filtered products based on search
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  // Handle client selection
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    toast({
      title: "Cliente selecionado",
      description: `${client.name} foi selecionado para este pedido.`,
    });
  };
  
  // Handle adding product to cart
  const handleAddToCart = (product: Product) => {
    if (!selectedClient) {
      setIsClientDialogOpen(true);
      toast({
        variant: "destructive",
        title: "Cliente não selecionado",
        description: "Selecione um cliente antes de adicionar produtos ao pedido.",
      });
      return;
    }
    
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            category: product.category,
          },
        ];
      }
    });
  };
  
  // Handle removing product from cart
  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  // Handle changing product quantity in cart
  const handleChangeQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
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
  
  // Handle payment dialog
  const handleOpenPaymentDialog = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
      });
      return;
    }
    
    setPaymentMethods([]);
    setSelectedPaymentMethod("cash");
    setPaymentAmount(cartTotal.toString());
    setIsPaymentDialogOpen(true);
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
  const handleCashOperation = (operation: Omit<CashierOperation, "id" | "date" | "userId">) => {
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
  
  // Handle cancelling an order
  const handleCancelOrder = (orderId: string) => {
    // Find the order
    const pendingOrder = pdvState.pendingSales.find(order => order.id === orderId);
    const completedOrder = pdvState.completedSales.find(order => order.id === orderId);
    
    if (!pendingOrder && !completedOrder) {
      toast({
        variant: "destructive",
        title: "Pedido não encontrado",
        description: "O pedido que você está tentando cancelar não foi encontrado.",
      });
      return;
    }
    
    const order = pendingOrder || completedOrder;
    
    if (!order) return;
    
    if (order.status === "cancelled") {
      toast({
        variant: "destructive",
        title: "Pedido já cancelado",
        description: "Este pedido já foi cancelado anteriormente.",
      });
      return;
    }
    
    // Update order status
    const cancelledOrder = {
      ...order,
      status: "cancelled" as const,
      updatedAt: new Date().toISOString(),
    };
    
    // Update state
    setPdvState(prev => {
      if (pendingOrder) {
        return {
          ...prev,
          pendingSales: prev.pendingSales.map(order =>
            order.id === orderId ? cancelledOrder : order
          ),
        };
      } else {
        return {
          ...prev,
          completedSales: prev.completedSales.map(order =>
            order.id === orderId ? cancelledOrder : order
          ),
        };
      }
    });
    
    setIsOrderDialogOpen(false);
    
    toast({
      title: "Pedido cancelado",
      description: `Pedido ${orderId} foi cancelado com sucesso.`,
    });
  };
  
  // Handle printing receipt
  const handlePrintReceipt = (order: Sale) => {
    // Mock function for printing receipt
    console.log("Printing receipt for order:", order);
    
    toast({
      title: "Recibo impresso",
      description: `Recibo do pedido ${order.id} foi enviado para impressão.`,
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
  
  // Determine if cashier is closed
  const isCashierClosed = !pdvState.cashierSession || pdvState.cashierSession.status === "closed";
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">PDV</h1>
          <div className="flex gap-2">
            {isCashierClosed ? (
              <Button 
                variant="outline" 
                onClick={() => setIsOpeningDialogOpen(true)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Abrir Caixa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCashOperationType("withdrawal");
                    setIsCashOperationDialogOpen(true);
                  }}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Retirada
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCashOperationType("supply");
                    setIsCashOperationDialogOpen(true);
                  }}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Suprimento
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600"
                  onClick={() => setIsClosingDialogOpen(true)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Fechar Caixa
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(true)}
            >
              <Clock className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
          </div>
        </div>
      </div>
      
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
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
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        <Button variant="outline" onClick={() => setCurrentTab("orders")}>
                          Ver Pedidos
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onClick={() => handleAddToCart(product)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Cliente</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsClientDialogOpen(true)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {selectedClient ? "Trocar" : "Selecionar"}
                      </Button>
                    </div>
                    
                    {selectedClient ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedClient.name}</span>
                        </div>
                        {selectedClient.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{selectedClient.phone}</span>
                          </div>
                        )}
                        {selectedClient.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{selectedClient.email}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md">
                        <User className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground text-sm mb-2">
                          Nenhum cliente selecionado
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setIsClientDialogOpen(true)}
                        >
                          Selecionar Cliente
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="flex flex-col h-[calc(100vh-20rem)]">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-medium">Carrinho</h3>
                    <div className="text-muted-foreground text-sm">
                      {cartItems.length} {cartItems.length === 1 ? "item" : "itens"}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    {cartItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground text-sm">
                          O carrinho está vazio
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {cartItems.map((item) => (
                          <CartItem
                            key={item.id}
                            item={item}
                            onIncrement={() => handleChangeQuantity(item.id, item.quantity + 1)}
                            onDecrement={() => handleChangeQuantity(item.id, item.quantity - 1)}
                            onRemove={() => handleRemoveFromCart(item.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-xl font-bold">{formatCurrency(cartTotal)}</span>
                    </div>
                    
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={cartItems.length === 0 || !selectedClient || isCashierClosed}
                      onClick={handleOpenPaymentDialog}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Finalizar Venda
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
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
      
      {/* Dialogs */}
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
        onSelectPaymentMethod={setSelectedPaymentMethod as any}
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
        onPrintReceipt={handlePrintReceipt as any}
        onCancel={handleCancelOrder as any}
      />
      
      <ReportDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onGenerateReport={handleGenerateReport}
      />
    </div>
  );
}
