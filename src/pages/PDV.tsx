import { useState } from "react";
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
  Receipt
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface CartItem extends Product {
  cartQuantity: number;
  discount?: number;
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  cpf: string;
}

interface CashierOperation {
  type: 'open' | 'close' | 'withdrawal' | 'supply';
  amount: number;
  date: Date;
  reason?: string;
}

interface Sale {
  id: number;
  items: CartItem[];
  total: number;
  discount: number;
  finalTotal: number;
  paymentMethod: string[];
  paymentValues: number[];
  client?: Client;
  date: Date;
  status: 'completed' | 'canceled';
}

const mockProducts: Product[] = [
  { id: 1, name: "Corte Masculino", price: 45.00, category: "Serviço", quantity: -1 },
  { id: 2, name: "Shampoo Profissional", price: 89.90, category: "Produto", quantity: 15 },
  { id: 3, name: "Hidratação", price: 120.00, category: "Serviço", quantity: -1 },
  { id: 4, name: "Tintura", price: 150.00, category: "Serviço", quantity: -1 },
];

const mockClients: Client[] = [
  { id: 1, name: "João Silva", phone: "(11) 99999-9999", email: "joao@email.com", cpf: "123.456.789-00" },
  { id: 2, name: "Maria Santos", phone: "(11) 88888-8888", email: "maria@email.com", cpf: "987.654.321-00" },
];

const PDV = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isCashierOpen, setIsCashierOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [cashierOperation, setCashierOperation] = useState<CashierOperation | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [paymentValues, setPaymentValues] = useState<number[]>([]);
  const [installments, setInstallments] = useState(1);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [dailySales, setDailySales] = useState<Sale[]>([]);
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };

  const updateItemDiscount = (productId: number, discount: number) => {
    setCart(currentCart => 
      currentCart.map(item => 
        item.id === productId
          ? { ...item, discount }
          : item
      )
    );
  };

  const subtotal = cart.reduce((total, item) => {
    const itemTotal = item.price * item.cartQuantity;
    const itemDiscount = item.discount || 0;
    return total + (itemTotal - (itemTotal * itemDiscount / 100));
  }, 0);

  const total = subtotal - (subtotal * cartDiscount / 100);

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCashier = () => {
    setCashierOperation({
      type: 'open',
      amount: 0,
      date: new Date(),
    });
    setIsCashierOpen(true);
  };

  const handleCloseCashier = () => {
    setCashierOperation({
      type: 'close',
      amount: total,
      date: new Date(),
    });
    setIsCashierOpen(true);
  };

  const handleCashierOperation = (type: 'withdrawal' | 'supply', amount: number, reason: string) => {
    setCashierOperation({
      type,
      amount,
      date: new Date(),
      reason,
    });
    toast({
      title: type === 'withdrawal' ? "Sangria realizada" : "Suprimento realizado",
      description: `Operação no valor de ${formatCurrency(amount)} registrada com sucesso.`,
    });
    setIsCashierOpen(false);
  };

  const handlePayment = () => {
    const newSale: Sale = {
      id: dailySales.length + 1,
      items: [...cart],
      total: subtotal,
      discount: cartDiscount,
      finalTotal: total,
      paymentMethod: paymentMethods,
      paymentValues: paymentValues,
      client: selectedClient || undefined,
      date: new Date(),
      status: 'completed'
    };

    setDailySales([...dailySales, newSale]);
    
    toast({
      title: "Venda finalizada",
      description: `Venda no valor de ${formatCurrency(total)} realizada com sucesso!`,
    });
    
    // Reset cart state
    setCart([]);
    setSelectedClient(null);
    setPaymentMethods([]);
    setPaymentValues([]);
    setCartDiscount(0);
    setInstallments(1);
    setChangeAmount(0);
    setIsCheckoutOpen(false);
  };

  const handlePrintReceipt = (sale?: Sale) => {
    const saleData = sale || {
      items: cart,
      total: subtotal,
      discount: cartDiscount,
      finalTotal: total,
      paymentMethod: paymentMethods,
      paymentValues,
      client: selectedClient,
      date: new Date()
    };

    toast({
      title: "Imprimindo comprovante",
      description: "O comprovante será impresso em breve.",
    });
  };

  const handleSendWhatsApp = () => {
    if (!selectedClient) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para enviar o comprovante.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Enviando comprovante",
      description: "O comprovante será enviado por WhatsApp.",
    });
  };

  const handleCancelSale = (saleId: number) => {
    setDailySales(sales => 
      sales.map(sale => 
        sale.id === saleId
          ? { ...sale, status: 'canceled' }
          : sale
      )
    );

    toast({
      title: "Venda cancelada",
      description: "A venda foi cancelada com sucesso.",
    });
  };

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
            <Button variant="outline" onClick={() => setIsHistoryOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              Histórico
            </Button>
            <Button variant="outline" onClick={handleOpenCashier}>
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Abrir Caixa
            </Button>
            <Button variant="outline" onClick={handleCloseCashier}>
              <ArrowDownUp className="mr-2 h-4 w-4" />
              Fechar Caixa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:bg-secondary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {product.name}
                </CardTitle>
                <Button size="icon" variant="ghost" onClick={() => addToCart(product)}>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsNewClientOpen(true)}
              >
                <User className="mr-2 h-4 w-4" />
                {selectedClient ? "Trocar Cliente" : "Selecionar Cliente"}
              </Button>
            </div>
            {selectedClient && (
              <div className="text-sm text-muted-foreground">
                Cliente: {selectedClient.name}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {item.cartQuantity}x {formatCurrency(item.price)}
                    </p>
                    <Input
                      type="number"
                      placeholder="Desconto %"
                      value={item.discount || ""}
                      onChange={(e) => updateItemDiscount(item.id, Number(e.target.value))}
                      className="w-20 h-6 text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {formatCurrency(
                      (item.price * item.cartQuantity) * 
                      (1 - ((item.discount || 0) / 100))
                    )}
                  </p>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Desconto Geral</span>
                <Input
                  type="number"
                  value={cartDiscount}
                  onChange={(e) => setCartDiscount(Number(e.target.value))}
                  className="w-20"
                />
                <span>%</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span className="text-2xl text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Finalizar Venda
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Cliente */}
      <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Cliente</DialogTitle>
            <DialogDescription>
              Selecione um cliente existente ou cadastre um novo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Buscar cliente..."
              className="mb-4"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer"
                  onClick={() => {
                    setSelectedClient(client);
                    setIsNewClientOpen(false);
                  }}
                >
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                  <ChevronsRight className="h-4 w-4" />
                </div>
              ))}
            </div>
            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Checkout */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Selecione a forma de pagamento e confirme a venda.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Tabs defaultValue="payment" className="space-y-4">
              <TabsList>
                <TabsTrigger value="payment">Pagamento</TabsTrigger>
                <TabsTrigger value="preview">Pré-visualizar</TabsTrigger>
              </TabsList>

              <TabsContent value="payment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={paymentMethods.includes("pix") ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => {
                      setPaymentMethods(["pix"]);
                      setPaymentValues([total]);
                      setInstallments(1);
                    }}
                  >
                    <QrCode className="h-8 w-8 mb-2" />
                    PIX
                  </Button>
                  <Button
                    variant={paymentMethods.includes("cartao") ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => {
                      setPaymentMethods(["cartao"]);
                      setPaymentValues([total]);
                    }}
                  >
                    <CreditCard className="h-8 w-8 mb-2" />
                    Cartão
                  </Button>
                  <Button
                    variant={paymentMethods.includes("dinheiro") ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => {
                      setPaymentMethods(["dinheiro"]);
                      setPaymentValues([total]);
                      setInstallments(1);
                    }}
                  >
                    <BanknoteIcon className="h-8 w-8 mb-2" />
                    Dinheiro
                  </Button>
                  <Button
                    variant={paymentMethods.includes("boleto") ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => {
                      setPaymentMethods(["boleto"]);
                      setPaymentValues([total]);
                      setInstallments(1);
                    }}
                  >
                    <FileText className="h-8 w-8 mb-2" />
                    Boleto
                  </Button>
                </div>

                {paymentMethods.includes("cartao") && (
                  <div className="space-y-2">
                    <Label>Número de Parcelas</Label>
                    <select
                      className="w-full rounded-md border border-input px-3 py-2"
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}x de {formatCurrency(total / n)}
                          {n === 1 ? " à vista" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {paymentMethods.includes("dinheiro") && (
                  <div className="space-y-2">
                    <Label>Valor Recebido</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={total + changeAmount}
                      onChange={(e) => setChangeAmount(Number(e.target.value) - total)}
                    />
                    {changeAmount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Troco: {formatCurrency(changeAmount)}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Dividir Pagamento</Label>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const newMethod = paymentMethods.length < 2 ? "dinheiro" : "";
                      if (newMethod) {
                        setPaymentMethods([...paymentMethods, newMethod]);
                        setPaymentValues([...paymentValues, 0]);
                      }
                    }}
                  >
                    Adicionar Forma de Pagamento
                  </Button>
                </div>

                {paymentMethods.length > 1 && (
                  <div className="space-y-2">
                    {paymentMethods.map((method, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <select
                          className="flex-1 rounded-md border border-input px-3 py-2"
                          value={method}
                          onChange={(e) => {
                            const newMethods = [...paymentMethods];
                            newMethods[index] = e.target.value;
                            setPaymentMethods(newMethods);
                          }}
                        >
                          <option value="dinheiro">Dinheiro</option>
                          <option value="cartao">Cartão</option>
                          <option value="pix">PIX</option>
                        </select>
                        <Input
                          type="number"
                          step="0.01"
                          value={paymentValues[index]}
                          onChange={(e) => {
                            const newValues = [...paymentValues];
                            newValues[index] = Number(e.target.value);
                            setPaymentValues(newValues);
                          }}
                          className="w-32"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setPaymentMethods(methods => methods.filter((_, i) => i !== index));
                            setPaymentValues(values => values.filter((_, i) => i !== index));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Cupom Não Fiscal</h3>
                    {selectedClient && (
                      <div className="text-sm mb-4">
                        <p>Cliente: {selectedClient.name}</p>
                        <p>CPF: {selectedClient.cpf}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="text-sm flex justify-between">
                          <span>{item.name} x{item.cartQuantity}</span>
                          <span>{formatCurrency(item.price * item.cartQuantity)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {cartDiscount > 0 && (
                          <div className="flex justify-between text-red-500">
                            <span>Desconto ({cartDiscount}%):</span>
                            <span>-{formatCurrency(subtotal * (cartDiscount / 100))}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold mt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={() => handlePrintReceipt()}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={handleSendWhatsApp}
              disabled={!selectedClient}
            >
              <Send className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button 
              className="sm:flex-1"
              onClick={handlePayment}
              disabled={paymentMethods.length === 0}
            >
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Operações do Caixa */}
      <Dialog open={isCashierOpen} onOpenChange={setIsCashierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {cashierOperation?.type === 'open' ? 'Abrir Caixa' :
               cashierOperation?.type === 'close' ? 'Fechar Caixa' :
               cashierOperation?.type === 'withdrawal' ? 'Sangria' : 'Suprimento'}
            </DialogTitle>
            <DialogDescription>
              {cashierOperation?.type === 'open' 
                ? 'Informe o valor inicial do caixa'
                : cashierOperation?.type === 'close'
                ? 'Confira os valores e finalize o caixa'
                : 'Informe o valor e o motivo da operação'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {cashierOperation?.type === 'open' ? 'Valor Inicial' :
                 cashierOperation?.type === 'close' ? 'Valor em Caixa' :
                 'Valor da Operação'}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={cashierOperation?.amount || 0}
                onChange={(e) => setCashierOperation(current => 
                  current ? { ...current, amount: Number(e.target.value) } : null
                )}
              />
            </div>

            {(cashierOperation?.type === 'withdrawal' || cashierOperation?.type === 'supply') && (
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Input
                  value={cashierOperation?.reason || ""}
                  onChange={(e) => setCashierOperation(current =>
                    current ? { ...current, reason: e.target.value } : null
                  )}
                />
              </div>
            )}

            {cashierOperation?.type === 'close' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total em Vendas:</span>
                  <span>{formatCurrency(
                    dailySales
                      .filter(sale => 
                        sale.status === 'completed' && 
                        sale.date.toDateString() === new Date().toDateString()
                      )
                      .reduce((acc, sale) => acc + sale.finalTotal, 0)
                  )}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sangrias:</span>
                  <span className="text-red-500">-{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Suprimentos:</span>
                  <span className="text-green-500">+{formatCurrency(0)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {cashierOperation?.type === 'open' || cashierOperation?.type === 'close' ? (
              <Button onClick={() => {
                toast({
                  title: cashierOperation?.type === 'open' ? "Caixa aberto" : "Caixa fechado",
                  description: cashierOperation?.type === 'open' 
                    ? "O caixa foi aberto com sucesso!"
                    : "O caixa foi fechado com sucesso!",
                });
                setIsCashierOpen(false);
              }}>
                {cashierOperation?.type === 'open' ? 'Abrir Caixa' : 'Fechar Caixa'}
              </Button>
            ) : (
              <Button onClick={() => {
                if (cashierOperation?.type && cashierOperation.amount > 0) {
                  handleCashierOperation(
                    cashierOperation.type === 'withdrawal' ? 'withdrawal' : 'supply',
                    cashierOperation.amount,
                    cashierOperation.reason || ""
                  );
                }
              }}>
                Confirmar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Vendas</DialogTitle>
            <DialogDescription>
              Vendas realizadas hoje
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {dailySales.map((sale) => (
              <Card key={sale.id} className={
                sale.status === 'canceled' ? "opacity-75 bg-red-50" : ""
              }>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        Venda #{sale.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {sale.date.toLocaleString()}
                      </p>
                      {sale.client && (
                        <p className="text-sm text-muted-foreground">
                          Cliente: {sale.client.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {formatCurrency(sale.finalTotal)}
                      </span>
                      {sale.status === 'completed' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleCancelSale(sale.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-red-500 text-sm">Cancelada</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sale.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.name} x{item.cartQuantity}
                          {item.discount && item.discount > 0 && (
                            <span className="text-red-500 ml-1">
                              (-{item.discount}%)
                            </span>
                          )}
                        </span>
                        <span>
                          {formatCurrency(
                            item.price * 
                            item.cartQuantity * 
                            (1 - ((item.discount || 0) / 100))
                          )}
                        </span>
                      </div>
                    ))}
                    {sale.discount > 0 && (
                      <div className="flex justify-between text-sm text-red-500">
                        <span>Desconto geral ({sale.discount}%)</span>
                        <span>
                          -{formatCurrency(sale.total * (sale.discount / 100))}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t flex justify-between font-medium">
                      <span>Formas de Pagamento:</span>
                      <div className="text-right">
                        {sale.paymentMethod.map((method, index) => (
                          <div key={method}>
                            {method}: {formatCurrency(sale.paymentValues[index])}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintReceipt(sale)}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Reimprimir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;
