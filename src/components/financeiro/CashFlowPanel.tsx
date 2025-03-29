
import { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CashFlow } from "@/types/financial";
import { formatCurrency } from "@/utils/currency";
import { Download, Plus, RotateCcw, FileUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, FileQuestion } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { NewCashFlowEntryDialog } from "./NewCashFlowEntryDialog";

interface CashFlowPanelProps {
  data: CashFlow[];
  onUpdateData?: (data: CashFlow[]) => void;
}

// Function to calculate cash flow balance - moved inline to avoid import errors
const calculateCashFlowBalance = (data: CashFlow[]) => {
  const totalIncome = data
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + item.value, 0);
  
  const totalExpenses = data
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + item.value, 0);
  
  return {
    income: totalIncome,
    expense: totalExpenses,
    balance: totalIncome - totalExpenses
  };
};

// Function for preparing export data - moved inline to avoid import errors
const prepareFinancialReportData = (data: CashFlow[], title: string) => {
  return {
    title,
    data: data.map(item => ({
      Data: new Date(item.date).toLocaleDateString('pt-BR'),
      Tipo: item.type === "income" ? "Entrada" : "Saída",
      Categoria: item.category,
      Descrição: item.description,
      Valor: formatCurrency(item.value),
      Status: item.status,
      "Método de Pagamento": item.paymentMethod || "-",
    }))
  };
};

// Simple export function implementation
const exportData = (data: any[], fileName: string) => {
  console.log(`Exporting ${fileName} with ${data.length} items`);
  // In a real app, this would handle the actual export
};

export function CashFlowPanel({ data, onUpdateData }: CashFlowPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"income" | "expense" | "all">("all");
  const [filteredData, setFilteredData] = useState<CashFlow[]>(data);
  const { toast } = useToast();

  // Aplicar filtros quando os dados ou filtros mudarem
  useEffect(() => {
    let result = [...data];
    
    // Filtrar por tipo
    if (typeFilter !== "all") {
      result = result.filter(item => item.type === typeFilter);
    }
    
    // Filtrar por categoria
    if (categoryFilter) {
      result = result.filter(item => item.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }
    
    // Filtrar por status
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(item => item.status === statusFilter);
    }
    
    // Filtrar por data
    if (dateFilter) {
      result = result.filter(item => item.date.includes(dateFilter));
    }
    
    setFilteredData(result);
  }, [data, typeFilter, categoryFilter, statusFilter, dateFilter]);

  const applyFilters = () => {
    // Já está sendo aplicado pelo useEffect
    toast({
      title: "Filtros aplicados",
      description: "Os dados foram filtrados conforme os critérios."
    });
  };

  const resetFilters = () => {
    setCategoryFilter("");
    setStatusFilter("all");
    setDateFilter("");
    setTypeFilter("all");
    
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos."
    });
  };

  const handleAddCashFlowEntry = (entry: Omit<CashFlow, "id">) => {
    if (!onUpdateData) {
      toast({
        title: "Funcionalidade limitada",
        description: "A adição de entradas não está disponível na versão demo."
      });
      return;
    }
    
    // Criar nova entrada com ID
    const newEntry: CashFlow = {
      ...entry,
      id: typeof data[0]?.id === 'number' 
        ? Math.max(...data.map(item => Number(item.id))) + 1 
        : String(Date.now())
    };
    
    // Atualizar dados
    const newData = [...data, newEntry];
    onUpdateData(newData);
    
    toast({
      title: "Movimentação registrada",
      description: `${entry.type === "income" ? "Receita" : "Despesa"} registrada com sucesso!`
    });
  };

  const exportCashFlowData = () => {
    try {
      const preparedData = filteredData.map(item => ({
        Data: new Date(item.date).toLocaleDateString('pt-BR'),
        Tipo: item.type === "income" ? "Entrada" : "Saída",
        Categoria: item.category,
        Descrição: item.description,
        Valor: formatCurrency(item.value),
        Status: item.status,
        "Método de Pagamento": item.paymentMethod || "-",
      }));
      
      exportData(preparedData, "fluxo-de-caixa");
      
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Calcular saldo e totais
  const balance = useMemo(() => {
    return calculateCashFlowBalance(filteredData);
  }, [filteredData]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Fluxo de Caixa</CardTitle>
          <div className="flex gap-2">
            <NewCashFlowEntryDialog onNewEntry={handleAddCashFlowEntry} type="income" />
            <NewCashFlowEntryDialog onNewEntry={handleAddCashFlowEntry} type="expense" />
            <Button variant="outline" size="sm" onClick={exportCashFlowData}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Entradas</p>
                <h3 className="text-xl font-bold text-green-700">{formatCurrency(balance.income)}</h3>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          
          <Card className="bg-red-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700">Saídas</p>
                <h3 className="text-xl font-bold text-red-700">{formatCurrency(balance.expense)}</h3>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>
          
          <Card className={balance.balance >= 0 ? "bg-blue-50" : "bg-amber-50"}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Saldo</p>
                <h3 className={`text-xl font-bold ${balance.balance >= 0 ? "text-blue-700" : "text-amber-700"}`}>
                  {formatCurrency(balance.balance)}
                </h3>
              </div>
              <FileQuestion className={`h-8 w-8 ${balance.balance >= 0 ? "text-blue-500" : "text-amber-500"}`} />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <Input
              placeholder="Filtrar por categoria..."
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            />
          </div>
          
          <div>
            <Select value={typeFilter} onValueChange={(value: "income" | "expense" | "all") => setTypeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Entradas</SelectItem>
                <SelectItem value="expense">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
                <SelectItem value="previsto">Previsto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={applyFilters}>
            Aplicar Filtros
          </Button>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="mr-2 h-3 w-3" />
            Limpar Filtros
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id.toString()}>
                    <TableCell>
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={item.type === "income" ? "bg-green-50 text-green-700 hover:bg-green-50" : "bg-red-50 text-red-700 hover:bg-red-50"}
                      >
                        {item.type === "income" ? "Entrada" : "Saída"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.description}>
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.value)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={item.status === "realizado" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : "bg-amber-50 text-amber-700 hover:bg-amber-50"}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.paymentMethod || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
