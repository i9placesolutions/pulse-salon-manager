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
import { calculateCashFlowBalance, filterCashFlowData, prepareFinancialReportData } from "@/utils/financial";
import { exportData } from "@/utils/export";
import { useToast } from "@/hooks/use-toast";
import { NewCashFlowEntryDialog } from "./NewCashFlowEntryDialog";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, FileQuestion } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CashFlowPanelProps {
  data: CashFlow[];
  onUpdateData?: (data: CashFlow[]) => void;
}

export function CashFlowPanel({ data, onUpdateData }: CashFlowPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"entrada" | "saida" | "all">("all");
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
      id: data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
    };
    
    // Atualizar dados
    const newData = [...data, newEntry];
    onUpdateData(newData);
    
    toast({
      title: "Movimentação registrada",
      description: `${entry.type === "entrada" ? "Receita" : "Despesa"} registrada com sucesso!`
    });
  };

  const exportCashFlowData = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      // Preparar dados para exportação
      const dataToExport = filteredData.map(item => ({
        Data: item.date,
        Descrição: item.description,
        Categoria: item.category,
        Tipo: item.type === 'entrada' ? 'Entrada' : 'Saída',
        Valor: item.value,
        Status: item.status === 'realizado' ? 'Realizado' : 'Previsto'
      }));
      
      // Exportar usando a função global (agora assíncrona)
      const titulo = "Relatório de Fluxo de Caixa";
      await exportData(dataToExport, format, "fluxo-de-caixa", titulo);
      
      toast({
        title: "Exportação concluída",
        description: `Dados exportados com sucesso no formato ${format.toUpperCase()}.`
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível completar a exportação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Calcular totais
  const totals = useMemo(() => {
    const totalIncome = filteredData
      .filter(item => item.type === "entrada")
      .reduce((sum, item) => sum + item.value, 0);
    
    const totalExpense = filteredData
      .filter(item => item.type === "saida")
      .reduce((sum, item) => sum + item.value, 0);
    
    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [filteredData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Fluxo de Caixa</h2>
          <p className="text-muted-foreground">Gerenciamento de entradas e saídas</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <NewCashFlowEntryDialog
            type="entrada"
            onNewEntry={handleAddCashFlowEntry}
          />
          <NewCashFlowEntryDialog
            type="saida"
            onNewEntry={handleAddCashFlowEntry}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totals.income)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totals.expense)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.balance)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Movimentações</CardTitle>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="entrada">Entradas</SelectItem>
                    <SelectItem value="saida">Saídas</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input 
                  placeholder="Categoria" 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full md:w-28"
                />
                
                <Input 
                  placeholder="Data" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full md:w-28"
                />
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="realizado">Realizado</SelectItem>
                    <SelectItem value="previsto">Previsto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={resetFilters} size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileUp className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40">
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={async () => await exportCashFlowData('excel')}
                      >
                        Excel
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={async () => await exportCashFlowData('csv')}
                      >
                        CSV
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={async () => await exportCashFlowData('pdf')}
                      >
                        PDF
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${
                    item.type === 'entrada' 
                      ? 'border-green-100 bg-green-50' 
                      : 'border-red-100 bg-red-50'
                  }`}
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex items-start gap-2">
                      <div className={`rounded-full p-2 ${
                        item.type === 'entrada' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {item.type === 'entrada' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.description}</h3>
                        <div className="flex flex-wrap text-sm text-muted-foreground gap-2">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <Badge variant="outline">
                            {item.status === 'realizado' ? 'Realizado' : 'Previsto'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right font-medium">
                    <span className={`text-lg ${
                      item.type === 'entrada' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {item.type === 'entrada' ? '+' : '-'} {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileQuestion className="mb-2 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">Nenhuma movimentação encontrada</h3>
                <p className="text-muted-foreground">
                  Adicione uma nova movimentação ou ajuste os filtros para ver resultados.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
