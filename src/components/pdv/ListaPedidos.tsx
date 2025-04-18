import { useState, useEffect, useCallback, useMemo } from "react";
import { usePDVManagement } from "@/hooks/usePDVManagement";
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

// Utilizando o tipo do hook
import { Pedido } from "@/hooks/usePDVManagement";

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
  const [termoBusca, setTermoBusca] = useState<string>("");
  
  // Hook para gerenciamento do PDV
  const {
    loading,
    pedidos,
    buscarPedidos
  } = usePDVManagement();
  
  // Simulando carregamento dos dados
  const loadData = useCallback(async () => {
    if (data) {
      const dataFormatada = format(data, 'yyyy-MM-dd');
      await buscarPedidos(dataFormatada);
    }
  }, [buscarPedidos, data]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Filtrando a lista com base nos filtros e termo de busca
  const listaFiltrada = useMemo(() => {
    return pedidos.filter(pedido => {
      // Filtro por data (se selecionada)
      if (data) {
        const pedidoData = new Date(pedido.data);
        const filtroData = new Date(data);
        
        if (
          pedidoData.getDate() !== filtroData.getDate() ||
          pedidoData.getMonth() !== filtroData.getMonth() ||
          pedidoData.getFullYear() !== filtroData.getFullYear()
        ) {
          return false;
        }
      }
      
      // Filtro por status (se selecionado)
      if (status && status !== 'todos' && pedido.status !== status) {
        return false;
      }
      
      // Filtro por termo de busca
      if (termoBusca) {
        const termo = termoBusca.toLowerCase();
        const matchID = pedido.id.toLowerCase().includes(termo);
        const matchCliente = pedido.cliente.nome.toLowerCase().includes(termo);
        const matchItens = pedido.itens.some(item => 
          item.nome.toLowerCase().includes(termo)
        );
        
        if (!matchID && !matchCliente && !matchItens) {
          return false;
        }
      }
      
      return true;
    });
  }, [pedidos, data, status, termoBusca]);
  
  // Calculando o total de vendas realizadas
  const totalVendas = useMemo(() => {
    return listaFiltrada
      .filter(p => p.status === "pago")
      .reduce((total, pedido) => total + pedido.total, 0);
  }, [listaFiltrada]);

  // Formatando valores como moeda brasileira
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

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
    // Funcionalidade de relatório removida
    console.log('Funcionalidade de relatório removida');
  };

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
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cliente ou número do pedido..."
                  className="pl-10"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
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
                        {format(new Date(pedido.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
                            <DropdownMenuItem onClick={() => window.open(`/pdv/detalhes/${pedido.id}`, '_blank')}>
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

    </div>
  );
} 