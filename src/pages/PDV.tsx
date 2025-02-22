
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
  AlertTriangle
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
  const [cart, setCart] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isCashierOpen, setIsCashierOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [cashierOperation, setCashierOperation] = useState<any | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [paymentValues, setPaymentValues] = useState<number[]>([]);
  const [installments, setInstallments] = useState(1);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [dailySales, setDailySales] = useState<any[]>([]);

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
            <Button variant="outline" onClick={() => setIsCloseCashierDialog(true)}>
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Fechar Caixa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:bg-secondary/50 transition-colors">
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
            </div>
          </div>
        </div>
      </div>

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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;
