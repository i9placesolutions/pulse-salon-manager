
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingCart, Plus, Trash2, CreditCard, User, QrCode, FileText, BanknoteIcon, ChevronsRight, Printer, Send } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  cpf: string;
}

interface CashierOperation {
  type: 'open' | 'close';
  initialAmount?: number;
  finalAmount?: number;
  difference?: number;
  date: Date;
}

// Mock data - será substituído pela integração com o backend
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
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [cashierOperation, setCashierOperation] = useState<CashierOperation | null>(null);
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

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);

  const handleOpenCashier = () => {
    setCashierOperation({
      type: 'open',
      initialAmount: 0,
      date: new Date(),
    });
    setIsCashierOpen(true);
  };

  const handleCloseCashier = () => {
    setCashierOperation({
      type: 'close',
      finalAmount: cartTotal,
      difference: 0,
      date: new Date(),
    });
    setIsCashierOpen(true);
  };

  const handlePayment = () => {
    toast({
      title: "Venda finalizada",
      description: `Venda no valor de ${formatCurrency(cartTotal)} realizada com sucesso!`,
    });
    setCart([]);
    setSelectedClient(null);
    setIsCheckoutOpen(false);
  };

  const handlePrintReceipt = () => {
    toast({
      title: "Imprimindo comprovante",
      description: "O comprovante será impresso em breve.",
    });
  };

  const handleSendWhatsApp = () => {
    toast({
      title: "Enviando comprovante",
      description: "O comprovante será enviado por WhatsApp.",
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
            <Button variant="outline" onClick={handleOpenCashier}>Abrir Caixa</Button>
            <Button variant="outline" onClick={handleCloseCashier}>Fechar Caixa</Button>
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
                  <p className="text-sm text-muted-foreground">
                    {item.cartQuantity}x {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {formatCurrency(item.price * item.cartQuantity)}
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
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(cartTotal)}
              </span>
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
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={paymentMethod === "pix" ? "default" : "outline"}
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => setPaymentMethod("pix")}
              >
                <QrCode className="h-8 w-8 mb-2" />
                PIX
              </Button>
              <Button
                variant={paymentMethod === "cartao" ? "default" : "outline"}
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => setPaymentMethod("cartao")}
              >
                <CreditCard className="h-8 w-8 mb-2" />
                Cartão
              </Button>
              <Button
                variant={paymentMethod === "dinheiro" ? "default" : "outline"}
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => setPaymentMethod("dinheiro")}
              >
                <BanknoteIcon className="h-8 w-8 mb-2" />
                Dinheiro
              </Button>
              <Button
                variant={paymentMethod === "boleto" ? "default" : "outline"}
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => setPaymentMethod("boleto")}
              >
                <FileText className="h-8 w-8 mb-2" />
                Boleto
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-primary text-xl">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={handlePrintReceipt}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={handleSendWhatsApp}
            >
              <Send className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button 
              className="sm:flex-1"
              onClick={handlePayment}
              disabled={!paymentMethod}
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
              {cashierOperation?.type === 'open' ? 'Abrir Caixa' : 'Fechar Caixa'}
            </DialogTitle>
            <DialogDescription>
              {cashierOperation?.type === 'open' 
                ? 'Informe o valor inicial do caixa'
                : 'Confira os valores e finalize o caixa'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {cashierOperation?.type === 'open' ? (
              <div className="space-y-2">
                <label htmlFor="initialAmount">Valor Inicial</label>
                <Input
                  id="initialAmount"
                  type="number"
                  placeholder="0,00"
                  step="0.01"
                />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total em Vendas:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dinheiro em Caixa:</span>
                    <Input
                      type="number"
                      placeholder="0,00"
                      step="0.01"
                      className="w-32"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;
