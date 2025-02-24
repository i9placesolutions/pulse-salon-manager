import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingCart, User, CircleDollarSign, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import type { PDVState, Sale, SaleItem, Payment, CashierSession } from "@/types/pdv";

import { CashierOpenDialog } from "@/components/pdv/CashierOpenDialog";
import { ProductCard } from "@/components/pdv/ProductCard";
import { CartItem } from "@/components/pdv/CartItem";
import { PaymentDialog } from "@/components/pdv/PaymentDialog";
import { CashierCloseDialog } from "@/components/pdv/CashierCloseDialog";
import { ClientSelectDialog } from "@/components/pdv/ClientSelectDialog";

const mockProducts = [
  { id: 1, name: "Corte Masculino", price: 45.00, category: "Serviço", quantity: -1 },
  { id: 2, name: "Shampoo Profissional", price: 89.90, category: "Produto", quantity: 15 },
  { id: 3, name: "Hidratação", price: 120.00, category: "Serviço", quantity: -1 },
  { id: 4, name: "Tintura", price: 150.00, category: "Serviço", quantity: -1 },
];

const mockClients = [
  { id: 1, name: "João Silva", phone: "(11) 99999-9999", email: "joao@email.com", cpf: "123.456.789-00" },
  { id: 2, name: "Maria Santos", phone: "(11) 88888-8888", email: "maria@email.com", cpf: "987.654.321-00" },
];

const PDV = () => {
  const { toast } = useToast();
  const [state, setState] = useState<PDVState>({
    cashierSession: null,
    currentSale: null,
    recentSales: [],
    isDayStarted: false,
    isProcessingPayment: false
  });

  const [isOpenCashierDialog, setIsOpenCashierDialog] = useState(false);
  const [isCloseCashierDialog, setIsCloseCashierDialog] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<Payment[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("cash");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [cartTotal, setCartTotal] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);

  const addToCart = (product: any) => {
    const newItem: SaleItem = {
      id: Date.now(),
      type: product.category.toLowerCase() === "serviço" ? "service" : "product",
      name: product.name,
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price
    };

    setCart(prev => [...prev, newItem]);
    updateCartTotal([...cart, newItem]);
  };

  const updateCartTotal = (items: SaleItem[]) => {
    const total = items.reduce((acc, item) => acc + item.totalPrice, 0);
    setCartTotal(total);
    setRemainingAmount(total);
  };

  const removeFromCart = (itemId: number) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    updateCartTotal(updatedCart);
  };

  const applyDiscount = (itemId: number, discountValue: number, discountType: 'percentage' | 'fixed') => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        const discount = discountType === 'percentage' 
          ? (item.unitPrice * discountValue) / 100
          : discountValue;
        
        return {
          ...item,
          discount: discountValue,
          discountType: discountType,
          totalPrice: item.unitPrice - discount
        };
      }
      return item;
    });

    setCart(updatedCart);
    updateCartTotal(updatedCart);
  };

  const applySurcharge = (itemId: number, surchargeValue: number, surchargeType: 'percentage' | 'fixed') => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        const surcharge = surchargeType === 'percentage' 
          ? (item.unitPrice * surchargeValue) / 100
          : surchargeValue;
        
        return {
          ...item,
          surcharge: surchargeValue,
          surchargeType: surchargeType,
          totalPrice: item.unitPrice + surcharge
        };
      }
      return item;
    });

    setCart(updatedCart);
    updateCartTotal(updatedCart);
  };

  const addPayment = () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;

    const amount = Number(paymentAmount);
    const newPayment: Payment = {
      id: Date.now(),
      method: selectedPaymentMethod as any,
      amount,
      status: 'completed',
      date: new Date()
    };

    if (selectedPaymentMethod === 'cash' && amount > remainingAmount) {
      setChangeAmount(amount - remainingAmount);
    }

    setPaymentMethods(prev => [...prev, newPayment]);
    setRemainingAmount(prev => Math.max(0, prev - amount));
    setPaymentAmount("");
  };

  const finalizeSale = () => {
    if (remainingAmount > 0) {
      toast({
        title: "Erro ao finalizar venda",
        description: "Ainda há valor pendente para pagamento",
        variant: "destructive"
      });
      return;
    }

    const newSale: Sale = {
      id: Date.now(),
      items: cart,
      total: cartTotal,
      subtotal: cartTotal,
      payments: paymentMethods,
      status: 'completed',
      date: new Date(),
      cashierSessionId: state.cashierSession?.id || 0,
      client: selectedClient
    };

    setState(prev => ({
      ...prev,
      recentSales: [...prev.recentSales, newSale]
    }));

    setCart([]);
    setPaymentMethods([]);
    setSelectedClient(null);
    setCartTotal(0);
    setRemainingAmount(0);
    setChangeAmount(0);
    setIsCheckoutOpen(false);

    toast({
      title: "Venda finalizada",
      description: "Venda realizada com sucesso!",
    });
  };

  useEffect(() => {
    setState(prev => ({ ...prev, isDayStarted: false }));
  }, []);

  const handleOpenCashier = () => {
    if (!openingAmount || Number(openingAmount) <= 0) {
      toast({
        title: "Erro ao abrir caixa",
        description: "Informe um valor inicial válido.",
        variant: "destructive",
      });
      return;
    }

    const newSession: CashierSession = {
      id: Date.now(),
      openingDate: new Date(),
      initialAmount: Number(openingAmount),
      status: 'open',
      userId: 1, // Mock user ID
      sales: [],
      withdrawals: [],
      supplies: [],
    };

    setState(prev => ({
      ...prev,
      cashierSession: newSession,
      isDayStarted: true
    }));

    setIsOpenCashierDialog(false);
    toast({
      title: "Caixa aberto",
      description: `Caixa aberto com saldo inicial de ${formatCurrency(Number(openingAmount))}`,
    });
  };

  const handleCloseCashier = () => {
    if (!state.cashierSession) return;

    const totalSales = state.recentSales.reduce((acc, sale) => acc + sale.total, 0);
    const finalAmount = state.cashierSession.initialAmount + totalSales;

    setState(prev => ({
      ...prev,
      cashierSession: {
        ...prev.cashierSession!,
        status: 'closed',
        closingDate: new Date(),
        finalAmount,
        differences: {
          expected: finalAmount,
          actual: finalAmount,
          difference: 0
        }
      },
      isDayStarted: false
    }));

    setIsCloseCashierDialog(false);
    toast({
      title: "Caixa fechado",
      description: "O caixa foi fechado com sucesso!",
    });
  };

  if (!state.isDayStarted) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Caixa Fechado
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              É necessário abrir o caixa para iniciar as operações do dia.
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setIsOpenCashierDialog(true)}
            >
              Abrir Caixa
            </Button>
          </CardContent>
        </Card>

        <CashierOpenDialog
          isOpen={isOpenCashierDialog}
          onOpenChange={setIsOpenCashierDialog}
          openingAmount={openingAmount}
          onOpeningAmountChange={setOpeningAmount}
          onConfirm={handleOpenCashier}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Buscar produtos ou serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsClientDialogOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              {selectedClient ? selectedClient.name : "Selecionar Cliente"}
            </Button>
            <Button variant="outline" onClick={() => setIsCloseCashierDialog(true)}>
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Fechar Caixa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => addToCart(product)}
            />
          ))}
        </div>
      </div>

      <div className="w-96 border-l bg-secondary/50">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
              </h2>
              {selectedClient && (
                <span className="text-sm text-muted-foreground">
                  Cliente: {selectedClient.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={removeFromCart}
                onDiscount={applyDiscount}
                onSurcharge={applySurcharge}
              />
            ))}
          </div>

          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-bold">{formatCurrency(cartTotal)}</span>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
            >
              Finalizar Venda
            </Button>
          </div>
        </div>
      </div>

      <PaymentDialog
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartTotal={cartTotal}
        selectedPaymentMethod={selectedPaymentMethod}
        onSelectPaymentMethod={setSelectedPaymentMethod}
        paymentAmount={paymentAmount}
        onPaymentAmountChange={setPaymentAmount}
        onAddPayment={addPayment}
        paymentMethods={paymentMethods}
        remainingAmount={remainingAmount}
        changeAmount={changeAmount}
        onFinalize={finalizeSale}
      />

      <ClientSelectDialog
        isOpen={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        clients={mockClients}
        onSelect={setSelectedClient}
      />

      <CashierCloseDialog
        isOpen={isCloseCashierDialog}
        onOpenChange={setIsCloseCashierDialog}
        initialAmount={state.cashierSession?.initialAmount || 0}
        sales={state.recentSales}
        onConfirm={handleCloseCashier}
      />
    </div>
  );
};

export default PDV;
