import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Search, MoreVertical, Edit, Printer, Send, Eye, FileDown, FolderOpen, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RelatorioModal } from "./RelatorioModal";

// Definição de tipos
interface Pedido {
  id: string;
  data: Date;
  cliente: {
    id: string;
    nome: string;
  };
  itens: {
    id: string;
    nome: string;
    quantidade: number;
    preco: number;
  }[];
  formaPagamento: string;
  status: "pago" | "pendente" | "cancelado" | "salvo";
  total: number;
}

// Dados mockados para simulação
const pedidosMock: Pedido[] = [
  {
    id: "PDV-20240326-1234",
    data: new Date(2024, 2, 26, 10, 30),
    cliente: {
      id: "c1",
      nome: "Maria Silva"
    },
    itens: [
      { id: "s1", nome: "Corte Feminino", quantidade: 1, preco: 80 },
      { id: "p1", nome: "Shampoo Profissional", quantidade: 1, preco: 75 }
    ],
    formaPagamento: "cartão",
    status: "pago",
    total: 155
  },
  {
    id: "PDV-20240326-2345",
    data: new Date(2024, 2, 26, 14, 15),
    cliente: {
      id: "c2",
      nome: "João Pereira"
    },
    itens: [
      { id: "s2", nome: "Corte Masculino", quantidade: 1, preco: 50 }
    ],
    formaPagamento: "dinheiro",
    status: "pago",
    total: 50
  },
  {
    id: "PDV-20240326-3456",
    data: new Date(2024, 2, 26, 16, 0),
    cliente: {
      id: "c3",
      nome: "Ana Souza"
    },
    itens: [
      { id: "s3", nome: "Coloração", quantidade: 1, preco: 150 },
      { id: "s4", nome: "Escova", quantidade: 1, preco: 60 }
    ],
    formaPagamento: "pix",
    status: "pendente",
    total: 210
  },
  {
    id: "PDV-20240325-4567",
    data: new Date(2024, 2, 25, 11, 45),
    cliente: {
      id: "c4",
      nome: "Carlos Oliveira"
    },
    itens: [
      { id: "s2", nome: "Corte Masculino", quantidade: 1, preco: 50 },
      { id: "p2", nome: "Condicionador", quantidade: 1, preco: 65 }
    ],
    formaPagamento: "cartão",
    status: "pago",
    total: 115
  },
  {
    id: "PDV-20240325-5678",
    data: new Date(2024, 2, 25, 17, 30),
    cliente: {
      id: "c5",
      nome: "Amanda Costa"
    },
    itens: [
      { id: "s5", nome: "Manicure", quantidade: 1, preco: 40 }
    ],
    formaPagamento: "pendente",
    status: "salvo",
    total: 40
  },
  {
    id: "PDV-20240324-6789",
    data: new Date(2024, 2, 24, 9, 15),
    cliente: {
      id: "c6",
      nome: "Paulo Santos"
    },
    itens: [
      { id: "s3", nome: "Coloração", quantidade: 1, preco: 150 }
    ],
    formaPagamento: "dinheiro",
    status: "cancelado",
    total: 150
  }
];

// Componente de carregamento
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
    <p className="text-gray-500">Carregando pedidos...</p>
  </div>
);

export function ListaPedidos() {
  const [data, setData] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState<string>("");
  const [formaPagamento, setFormaPagamento] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showRelatorioModal, setShowRelatorioModal] = useState(false);
  
  // Simulando carregamento dos dados
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simula um atraso na carga para garantir que a interface renderize corretamente
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoading(false);
      } catch (e) {
        console.error("Erro ao carregar pedidos:", e);
        setError(true);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filtragem de pedidos - agora com tratamento de erro
  const pedidosFiltrados = useCallback(() => {
    try {
      return pedidosMock.filter(pedido => {
        const matchesDate = !data || 
          (pedido.data.getDate() === data.getDate() && 
           pedido.data.getMonth() === data.getMonth() && 
           pedido.data.getFullYear() === data.getFullYear());
        
        const matchesStatus = !status || status === "todos" || pedido.status === status;
        const matchesPayment = !formaPagamento || formaPagamento === "todas" || pedido.formaPagamento === formaPagamento;
        const matchesSearch = !searchTerm || 
          pedido.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pedido.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesDate && matchesStatus && matchesPayment && matchesSearch;
      });
    } catch (e) {
      console.error("Erro ao filtrar pedidos:", e);
      setError(true);
      return [];
    }
  }, [data, status, formaPagamento, searchTerm]);

  // Lista filtrada
  const listaFiltrada = useMemo(() => pedidosFiltrados(), [pedidosFiltrados]);

  // Calculando o total dos pedidos exibidos
  const totalVendas = listaFiltrada
    .filter(p => p.status === "pago")
    .reduce((sum, pedido) => sum + pedido.total, 0);

  // Formatando valores como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Renderiza badges para status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Pago</Badge>;
      case "pendente":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pendente</Badge>;
      case "cancelado":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelado</Badge>;
      case "salvo":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Salvo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Função para gerar relatório
  const gerarRelatorio = () => {
    setShowRelatorioModal(true);
  };

  // Mostrar mensagem de erro
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Ocorreu um erro ao carregar os pedidos.</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  // Mostrar carregamento
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? (
                      format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    initialFocus
                    locale={ptBR}
                  />
                  <div className="p-3 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => setData(undefined)}
                    >
                      Limpar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="salvo">Salvo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartão">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cliente ou número do pedido..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de Pedidos */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Pedidos {data && `- ${format(data, "dd/MM/yyyy")}`}
          </CardTitle>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={gerarRelatorio}
          >
            <FileDown className="h-4 w-4" />
            Gerar Relatório
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listaFiltrada.length > 0 ? (
                  listaFiltrada.map(pedido => (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">{pedido.id}</TableCell>
                      <TableCell>
                        {format(pedido.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{pedido.cliente.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          pedido.formaPagamento === "cartão" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          pedido.formaPagamento === "dinheiro" ? "bg-green-50 text-green-700 border-green-200" :
                          pedido.formaPagamento === "pix" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          "bg-gray-50 text-gray-700 border-gray-200"
                        }>
                          {pedido.formaPagamento}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          pedido.status === "pago" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                          pedido.status === "pendente" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" :
                          pedido.status === "cancelado" ? "bg-red-100 text-red-700 hover:bg-red-200" :
                          "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }>
                          {pedido.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(pedido.total)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Opções</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => console.log(`Ver detalhes do pedido ${pedido.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {pedido.status === "pendente" && (
                              <DropdownMenuItem onClick={() => console.log(`Marcar como pago ${pedido.id}`)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar como Pago
                              </DropdownMenuItem>
                            )}
                            {pedido.status !== "cancelado" && (
                              <DropdownMenuItem onClick={() => console.log(`Cancelar pedido ${pedido.id}`)} className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum pedido encontrado com esses filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between p-4 bg-gray-50">
          <div>
            <p className="text-sm text-gray-500">
              {listaFiltrada.length} {listaFiltrada.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total de vendas</p>
            <p className="font-medium text-lg text-emerald-600">
              {formatCurrency(totalVendas)}
            </p>
          </div>
        </CardFooter>
      </Card>
      
      {/* Modal de Relatórios */}
      <RelatorioModal 
        isOpen={showRelatorioModal} 
        onClose={() => setShowRelatorioModal(false)} 
      />
    </div>
  );
} 