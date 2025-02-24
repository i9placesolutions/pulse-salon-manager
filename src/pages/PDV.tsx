import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, CircleDollarSign, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PDVState, Sale, SaleItem, Payment, CashierSession } from "@/types/pdv";
import { CashierOpenDialog } from "@/components/pdv/CashierOpenDialog";
import { PaymentDialog } from "@/components/pdv/PaymentDialog";
import { CashierCloseDialog } from "@/components/pdv/CashierCloseDialog";
import { ClientSelectDialog } from "@/components/pdv/ClientSelectDialog";
import { ProductGrid } from "@/components/pdv/ProductGrid";
import { Cart } from "@/components/pdv/Cart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const mockProducts = [{
  id: 1,
  name: "Corte Masculino",
  price: 45.00,
  category: "Serviço",
  quantity: -1
}, {
  id: 2,
  name: "Shampoo Profissional",
  price: 89.90,
  category: "Produto",
  quantity: 15
}, {
  id: 3,
  name: "Hidratação",
  price: 120.00,
  category: "Serviço",
  quantity: -1
}, {
  id: 4,
  name: "Tintura",
  price: 150.00,
  category: "Serviço",
  quantity: -1
}];

const mockClients = [{
  id: 1,
  name: "João Silva",
  phone: "(11) 99999-9999",
  email: "joao@email.com",
  cpf: "123.456.789-00"
}, {
  id: 2,
  name: "Maria Santos",
  phone: "(11) 88888-8888",
  email: "maria@email.com",
  cpf: "987.654.321-00"
}];

const PDV = () => {
  const {
    toast
  } = useToast();
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
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [surcharge, setSurcharge] = useState(0);
  const [surchargeType, setSurchargeType] = useState<'fixed' | 'percentage'>('fixed');
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isSurchargeDialogOpen, setIsSurchargeDialogOpen] = useState(false);
  const [tempValue, setTempValue] = useState("");
  const [tempType, setTempType] = useState<'fixed' | 'percentage'>('fixed');
  const [tempOperation, setTempOperation] = useState<'discount' | 'surcharge'>('discount');

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
    updateCartTotals([...cart, newItem]);
  };

  const updateCartTotals = (items: SaleItem[]) => {
    const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
    setCartSubtotal(subtotal);
    
    let total = subtotal;
    
    if (discount > 0) {
      const discountValue = discountType === 'percentage' 
        ? (subtotal * discount) / 100 
        : discount;
      total = total - discountValue;
    }
    
    if (surcharge > 0) {
      const surchargeValue = surchargeType === 'percentage'
        ? (subtotal * surcharge) / 100
        : surcharge;
      total = total + surchargeValue;
    }
    
    total = Math.max(0, total);
    
    setCartTotal(total);
    setRemainingAmount(total);
  };

  const updateItemQuantity = (itemId: number, newQuantity: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        };
      }
      return item;
    });
    setCart(updatedCart);
    updateCartTotals(updatedCart);
  };

  const removeFromCart = (itemId: number) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    updateCartTotals(updatedCart);
  };

  const handleDiscount = (type: 'fixed' | 'percentage') => {
    const value = prompt(`Digite o valor do desconto ${type === 'percentage' ? 'em porcentagem' : 'em reais'}:`);
    if (!value) return;
    setDiscount(Number(value));
    setDiscountType(type);
    updateCartTotals(cart);
  };

  const handleSurcharge = (type: 'fixed' | 'percentage') => {
    const value = prompt(`Digite o valor do acréscimo ${type === 'percentage' ? 'em porcentagem' : 'em reais'}:`);
    if (!value) return;
    setSurcharge(Number(value));
    setSurchargeType(type);
    updateCartTotals(cart);
  };

  const handleValueDialog = (operation: 'discount' | 'surcharge') => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de aplicar desconto ou acréscimo.",
        variant: "destructive"
      });
      return;
    }
    
    setTempOperation(operation);
    setTempValue("");
    if (operation === 'discount') {
      setIsDiscountDialogOpen(true);
    } else {
      setIsSurchargeDialogOpen(true);
    }
  };

  const handleConfirmValue = () => {
    const value = Number(tempValue);
    
    if (tempOperation === 'discount') {
      if (tempType === 'percentage') {
        if (value > 100) {
          toast({
            title: "Desconto inválido",
            description: "O desconto não pode ser maior que 100%",
            variant: "destructive"
          });
          return;
        }
        const discountAmount = (cartSubtotal * value) / 100;
        if (discountAmount >= cartSubtotal) {
          toast({
            title: "Desconto inválido",
            description: "O desconto não pode ser maior que o valor total dos produtos",
            variant: "destructive"
          });
          return;
        }
      } else {
        if (value >= cartSubtotal) {
          toast({
            title: "Desconto inválido",
            description: "O desconto não pode ser maior que o valor total dos produtos",
            variant: "destructive"
          });
          return;
        }
      }
      setDiscount(value);
      setDiscountType(tempType);
    } else {
      setSurcharge(value);
      setSurchargeType(tempType);
    }
    
    setTimeout(() => updateCartTotals(cart), 0);
    
    setIsDiscountDialogOpen(false);
    setIsSurchargeDialogOpen(false);
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
      description: "Venda realizada com sucesso!"
    });
  };

  useEffect(() => {
    setState(prev => ({
      ...prev,
      isDayStarted: false
    }));
  }, []);

  const handleOpenCashier = () => {
    if (!openingAmount || Number(openingAmount) <= 0) {
      toast({
        title: "Erro ao abrir caixa",
        description: "Informe um valor inicial válido.",
        variant: "destructive"
      });
      return;
    }
    const newSession: CashierSession = {
      id: Date.now(),
      openingDate: new Date(),
      initialAmount: Number(openingAmount),
      status: 'open',
      userId: 1,
      // Mock user ID
      sales: [],
      withdrawals: [],
      supplies: []
    };
    setState(prev => ({
      ...prev,
      cashierSession: newSession,
      isDayStarted: true
    }));
    setIsOpenCashierDialog(false);
    toast({
      title: "Caixa aberto",
      description: `Caixa aberto com saldo inicial de ${formatCurrency(Number(openingAmount))}`
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
      description: "O caixa foi fechado com sucesso!"
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
            <Button className="w-full" onClick={() => setIsOpenCashierDialog(true)}>
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
          <ProductGrid
            products={mockProducts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onProductClick={addToCart}
          />
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
      </div>

      <div className="w-96 border-l bg-secondary/50">
        <Cart
          items={cart}
          selectedClient={selectedClient}
          cartSubtotal={cartSubtotal}
          cartTotal={cartTotal}
          discount={discount}
          discountType={discountType}
          surcharge={surcharge}
          surchargeType={surchargeType}
          onRemoveItem={removeFromCart}
          onUpdateQuantity={updateItemQuantity}
          onDiscountClick={() => handleValueDialog('discount')}
          onSurchargeClick={() => handleValueDialog('surcharge')}
          onRemoveDiscount={() => {
            setDiscount(0);
            updateCartTotals(cart);
          }}
          onRemoveSurcharge={() => {
            setSurcharge(0);
            updateCartTotals(cart);
          }}
          onCheckout={() => setIsCheckoutOpen(true)}
        />
      </div>

      <PaymentDialog isOpen={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} cartTotal={cartTotal} selectedPaymentMethod={selectedPaymentMethod} onSelectPaymentMethod={setSelectedPaymentMethod} paymentAmount={paymentAmount} onPaymentAmountChange={setPaymentAmount} onAddPayment={addPayment} paymentMethods={paymentMethods} remainingAmount={remainingAmount} changeAmount={changeAmount} onFinalize={finalizeSale} />

      <ClientSelectDialog isOpen={isClientDialogOpen} onOpenChange={setIsClientDialogOpen} clients={mockClients} onSelect={setSelectedClient} />

      <CashierCloseDialog isOpen={isCloseCashierDialog} onOpenChange={setIsCloseCashierDialog} initialAmount={state.cashierSession?.initialAmount || 0} sales={state.recentSales} onConfirm={handleCloseCashier} />

      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Desconto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant={tempType === 'fixed' ? "default" : "outline"} onClick={() => setTempType('fixed')} className="flex-1">
                Valor Fixo (R$)
              </Button>
              <Button variant={tempType === 'percentage' ? "default" : "outline"} onClick={() => setTempType('percentage')} className="flex-1">
                Porcentagem (%)
              </Button>
            </div>
            <Input type="number" placeholder={tempType === 'fixed' ? "Valor em R$" : "Valor em %"} value={tempValue} onChange={e => setTempValue(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiscountDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmValue}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSurchargeDialogOpen} onOpenChange={setIsSurchargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Acréscimo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant={tempType === 'fixed' ? "default" : "outline"} onClick={() => setTempType('fixed')} className="flex-1">
                Valor Fixo (R$)
              </Button>
              <Button variant={tempType === 'percentage' ? "default" : "outline"} onClick={() => setTempType('percentage')} className="flex-1">
                Porcentagem (%)
              </Button>
            </div>
            <Input type="number" placeholder={tempType === 'fixed' ? "Valor em R$" : "Valor em %"} value={tempValue} onChange={e => setTempValue(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSurchargeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmValue}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;
