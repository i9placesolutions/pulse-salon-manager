import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { exportarRelatorio, FiltrosRelatorio, DadosPedido, DadosCaixa } from "@/utils/exportRelatorio";

// Dados mockados para teste de relatório de pedidos
const pedidosMock: DadosPedido[] = [
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

// Dados mockados para teste de relatório de caixa
const caixasMock: DadosCaixa[] = [
  {
    id: "CX-20240326-001",
    data: new Date(2024, 2, 26, 8, 0),
    responsavel: "João Silva",
    valorAbertura: 500,
    valorFechamento: 2150,
    divergencia: 0,
    observacoes: "Abertura normal",
    entradas: [
      { tipo: "vendas", valor: 1650, descricao: "Vendas do dia" },
      { tipo: "outros", valor: 100, descricao: "Crédito de cliente" }
    ],
    saidas: [
      { tipo: "fornecedor", valor: 100, descricao: "Pagamento produtos" }
    ]
  },
  {
    id: "CX-20240325-001",
    data: new Date(2024, 2, 25, 8, 0),
    responsavel: "Maria Souza",
    valorAbertura: 500,
    valorFechamento: 1980,
    divergencia: -20,
    observacoes: "Divergência no fechamento",
    entradas: [
      { tipo: "vendas", valor: 1500, descricao: "Vendas do dia" }
    ],
    saidas: [
      { tipo: "fornecedor", valor: 200, descricao: "Pagamento produtos" }
    ]
  }
];

interface RelatorioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RelatorioModal({ isOpen, onClose }: RelatorioModalProps) {
  const { toast } = useToast();
  const [tipoRelatorio, setTipoRelatorio] = useState<string>("pedidos");
  const [dataInicio, setDataInicio] = useState<Date | undefined>(new Date());
  const [dataFim, setDataFim] = useState<Date | undefined>(new Date());
  const [cliente, setCliente] = useState<string>("");
  const [status, setStatus] = useState<string>("todos");
  const [formaPagamento, setFormaPagamento] = useState<string>("todas");
  const [incluirDescontos, setIncluirDescontos] = useState<boolean>(true);
  const [incluirBeneficios, setIncluirBeneficios] = useState<boolean>(true);
  const [incluirCanais, setIncluirCanais] = useState<boolean>(true);
  const [formatoExportacao, setFormatoExportacao] = useState<string>("pdf");
  const [gerando, setGerando] = useState<boolean>(false);

  const handleGerarRelatorio = async () => {
    setGerando(true);
    
    try {
      const filtros: FiltrosRelatorio = {
        tipoRelatorio,
        dataInicio,
        dataFim,
        cliente: cliente || undefined,
        status: status === "todos" ? undefined : status,
        formaPagamento: formaPagamento === "todas" ? undefined : formaPagamento,
        incluirDescontos,
        incluirBeneficios,
        incluirCanais,
        formatoExportacao: formatoExportacao as "pdf" | "excel"
      };
      
      // Preparando os dados mockados para incluir benefícios e descontos
      const pedidosComExtraInfo = pedidosMock.map(pedido => ({
        ...pedido,
        desconto: Math.random() > 0.7 ? Math.floor(pedido.total * 0.1) : 0,
        beneficioAplicado: Math.random() > 0.8 ? {
          tipo: ["cashback", "cupom", "desconto"][Math.floor(Math.random() * 3)],
          valor: Math.floor(pedido.total * 0.05),
          motivo: "Promoção"
        } : undefined
      }));
      
      const resultado = await exportarRelatorio(
        filtros,
        pedidosComExtraInfo,
        caixasMock
      );
      
      if (resultado) {
        toast({
          title: "Relatório gerado com sucesso",
          description: `O relatório foi exportado no formato ${formatoExportacao.toUpperCase()}.`,
          variant: "default",
        });
      } else {
        throw new Error("Falha ao gerar relatório");
      }
      
      setGerando(false);
      onClose();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um problema na geração do relatório. Tente novamente.",
        variant: "destructive",
      });
      setGerando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gerar Relatório</DialogTitle>
          <DialogDescription>
            Configure os filtros desejados para gerar o relatório personalizado.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pedidos" value={tipoRelatorio} onValueChange={setTipoRelatorio} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pedidos">Relatório de Pedidos</TabsTrigger>
            <TabsTrigger value="caixa">Relatório de Caixa</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="dataInicio"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? (
                        format(dataInicio, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">Data de Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="dataFim"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? (
                        format(dataFim, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={setDataFim}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente (opcional)</Label>
              <Input
                id="cliente"
                placeholder="Nome do cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
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
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger id="formaPagamento">
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
            </div>

            <div className="space-y-3 mt-2">
              <Label>Incluir no relatório:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="descontos" 
                    checked={incluirDescontos}
                    onCheckedChange={(checked) => setIncluirDescontos(checked as boolean)}
                  />
                  <Label htmlFor="descontos" className="font-normal">Total de vendas e descontos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="beneficios" 
                    checked={incluirBeneficios}
                    onCheckedChange={(checked) => setIncluirBeneficios(checked as boolean)}
                  />
                  <Label htmlFor="beneficios" className="font-normal">Benefícios utilizados</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canais" 
                    checked={incluirCanais}
                    onCheckedChange={(checked) => setIncluirCanais(checked as boolean)}
                  />
                  <Label htmlFor="canais" className="font-normal">Recebimentos por canal</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="caixa" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicioCaixa">Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="dataInicioCaixa"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? (
                        format(dataInicio, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFimCaixa">Data de Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="dataFimCaixa"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? (
                        format(dataFim, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={setDataFim}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-3 mt-2">
              <Label>Incluir no relatório:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="entradas" 
                    checked={true}
                    disabled
                  />
                  <Label htmlFor="entradas" className="font-normal">Valores de entrada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="saidas" 
                    checked={true}
                    disabled
                  />
                  <Label htmlFor="saidas" className="font-normal">Valores de saída</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="divergencias" 
                    checked={true}
                    disabled
                  />
                  <Label htmlFor="divergencias" className="font-normal">Divergências de caixa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="observacoes" 
                    checked={true}
                    disabled
                  />
                  <Label htmlFor="observacoes" className="font-normal">Observações de abertura/fechamento</Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 mt-4">
          <Label>Formato de Exportação</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={formatoExportacao === "pdf" ? "default" : "outline"}
              className={cn(
                "flex items-center justify-center",
                formatoExportacao === "pdf" && "bg-emerald-600 hover:bg-emerald-700"
              )}
              onClick={() => setFormatoExportacao("pdf")}
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button
              type="button"
              variant={formatoExportacao === "excel" ? "default" : "outline"}
              className={cn(
                "flex items-center justify-center",
                formatoExportacao === "excel" && "bg-emerald-600 hover:bg-emerald-700"
              )}
              onClick={() => setFormatoExportacao("excel")}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={gerando}>
            Cancelar
          </Button>
          <Button onClick={handleGerarRelatorio} disabled={gerando} className="bg-emerald-600 hover:bg-emerald-700">
            {gerando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar Relatório"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 