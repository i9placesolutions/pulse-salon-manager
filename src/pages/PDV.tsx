import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  ShoppingCart,
  Plus,
  Trash2,
  CreditCard,
  User,
  QrCode,
  FileText,
  BanknoteIcon,
  ChevronsRight,
  Printer,
  Send,
  CircleDollarSign,
  ArrowDownUp,
  Ban,
  History,
  Receipt,
  AlertTriangle,
  Percent,
  X
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import type { PDVState, Sale, SaleItem, Payment, CashierSession } from "@/types/pdv";

// Mock data para demonstração
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

    // Limpar o carrinho e estados relacionados
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

  // Efeito para verificar se o caixa está aberto ao carregar a página
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

        <Dialog open={isOpenCashierDialog} onOpenChange={setIsOpenCashierDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abrir Caixa</DialogTitle>
              <DialogDescription>
                Informe o valor inicial do caixa para começar as operações do dia.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Valor Inicial</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpenCashierDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleOpenCashier}>
                Abrir Caixa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Produtos/Serviços */}
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
            <Card 
              key={product.id} 
              className="cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => addToCart(product)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {product.name}
                </CardTitle>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {product.category}
                  </span>
                </div>
                {product.quantity >= 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Em estoque: {product.quantity}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Carrinho */}
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
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </p>
                      {item.discount && (
                        <p className="text-sm text-green-500">
                          Desconto: {item.discountType === 'percentage' ? `${item.discount}%` : formatCurrency(item.discount)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => {
                          const value = prompt("Digite o valor do desconto:");
                          const type = confirm("Desconto em porcentagem?") ? 'percentage' : 'fixed';
                          if (value) applyDiscount(item.id, Number(value), type);
                        }}
                      >
                        <Percent className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

      {/* Dialog de Pagamento */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Total a pagar: {formatCurrency(cartTotal)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Formas de Pagamento */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setSelectedPaymentMethod('cash')}
                >
                  <BanknoteIcon className="mr-2 h-4 w-4" />
                  Dinheiro
                </Button>
                <Button
                  variant={selectedPaymentMethod === 'credit' ? 'default' : 'outline'}
                  onClick={() => setSelectedPaymentMethod('credit')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Crédito
                </Button>
                <Button
                  variant={selectedPaymentMethod === 'debit' ? 'default' : 'outline'}
                  onClick={() => setSelectedPaymentMethod('debit')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Débito
                </Button>
                <Button
                  variant={selectedPaymentMethod === 'pix' ? 'default' : 'outline'}
                  onClick={() => setSelectedPaymentMethod('pix')}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  PIX
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Valor do Pagamento</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={formatCurrency(remainingAmount)}
                />
              </div>

              <Button 
                className="w-full"
                onClick={addPayment}
                disabled={!paymentAmount || Number(paymentAmount) <= 0}
              >
                Adicionar Pagamento
              </Button>
            </div>

            {/* Lista de Pagamentos */}
            {paymentMethods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pagamentos Registrados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {paymentMethods.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center">
                      <span className="capitalize">{payment.method}</span>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                  {changeAmount > 0 && (
                    <div className="flex justify-between items-center text-primary">
                      <span>Troco</span>
                      <span>{formatCurrency(changeAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center font-medium">
                      <span>Restante</span>
                      <span>{formatCurrency(remainingAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={() => setIsCheckoutOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="sm:flex-1"
              onClick={finalizeSale}
              disabled={remainingAmount > 0}
            >
              Finalizar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Seleção de Cliente */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              placeholder="Buscar cliente..."
              className="w-full"
            />
            
            <div className="space-y-2">
              {mockClients.map((client) => (
                <Card 
                  key={client.id}
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => {
                    setSelectedClient(client);
                    setIsClientDialogOpen(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                      <Button size="icon" variant="ghost">
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Fechamento de Caixa */}
      <Dialog open={isCloseCashierDialog} onOpenChange={setIsCloseCashierDialog}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Fechar Caixa</DialogTitle>
            <DialogDescription>
              Confira o resumo das operações do dia antes de fechar o caixa.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Vendas Totais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      state.recentSales.reduce((acc, sale) => acc + sale.total, 0)
                    )}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Saldo Final</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      (state.cashierSession?.initialAmount || 0) +
                      state.recentSales.reduce((acc, sale) => acc + sale.total, 0)
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resumo por forma de pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Dinheiro</span>
                  <span>{formatCurrency(
                    state.recentSales.reduce((acc, sale) => 
                      acc + sale.payments
                        .filter(p => p.method === 'cash')
                        .reduce((sum, p) => sum + p.amount, 0)
                    , 0)
                  )}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartão de Crédito</span>
                  <span>{formatCurrency(
                    state.recentSales.reduce((acc, sale) => 
                      acc + sale.payments
                        .filter(p => p.method === 'credit')
                        .reduce((sum, p) => sum + p.amount, 0)
                    , 0)
                  )}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartão de Débito</span>
                  <span>{formatCurrency(
                    state.recentSales.reduce((acc, sale) => 
                      acc + sale.payments
                        .filter(p => p.method === 'debit')
                        .reduce((sum, p) => sum + p.amount, 0)
                    , 0)
                  )}</span>
                </div>
                <div className="flex justify-between">
                  <span>PIX</span>
                  <span>{formatCurrency(
                    state.recentSales.reduce((acc, sale) => 
                      acc + sale.payments
                        .filter(p => p.method === 'pix')
                        .reduce((sum, p) => sum + p.amount, 0)
                    , 0)
                  )}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={() => setIsCloseCashierDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="sm:flex-1"
              onClick={handleCloseCashier}
            >
              Confirmar Fechamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;
