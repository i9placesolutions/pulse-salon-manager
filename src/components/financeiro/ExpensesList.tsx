import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Expense } from "@/types/financial";
import { formatCurrency } from "@/utils/currency";
import { Repeat, Search, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NewCashFlowEntryDialog } from "./NewCashFlowEntryDialog";

interface ExpensesListProps {
  expenses: Expense[];
  onUpdateExpense?: (updatedExpense: Expense) => void;
  onNewEntry?: (entry: any) => void;
}

export function ExpensesList({ expenses, onUpdateExpense, onNewEntry }: ExpensesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { toast } = useToast();

  // Filtrar despesas
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calcular paginação
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Função para marcar despesa como paga
  const handleMarkAsPaid = (expense: Expense) => {
    if (!onUpdateExpense) {
      toast({
        title: "Funcionalidade limitada",
        description: "A atualização de despesas não está disponível na versão demo.",
      });
      return;
    }
    
    const updatedExpense: Expense = {
      ...expense,
      status: "Pago" as const
    };
    
    onUpdateExpense(updatedExpense);
    
    toast({
      title: "Despesa atualizada",
      description: `${expense.name} foi marcada como paga.`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Despesas</CardTitle>
          <div className="flex flex-wrap gap-2">
            {onNewEntry && (
              <div className="flex space-x-2 mr-2">
                <NewCashFlowEntryDialog
                  type="entrada"
                  onNewEntry={onNewEntry}
                />
                <NewCashFlowEntryDialog
                  type="saida"
                  onNewEntry={onNewEntry}
                />
              </div>
            )}
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar despesas..."
                className="pl-8 w-full md:w-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Fixo">Fixas</SelectItem>
                <SelectItem value="Variável">Variáveis</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pendente">Pendentes</SelectItem>
                <SelectItem value="Pago">Pagas</SelectItem>
                <SelectItem value="Vencido">Vencidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedExpenses.length > 0 ? (
            paginatedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-1 mb-2 md:mb-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{expense.name}</h3>
                    {expense.isRecurring && (
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">{expense.category}</Badge>
                    <span className="text-muted-foreground">
                      Vencimento: {expense.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(expense.value)}
                    </div>
                    <Badge
                      className={`
                        ${expense.status === "Pago" ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                          expense.status === "Vencido" ? "bg-red-100 text-red-800 hover:bg-red-100" : 
                          "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}
                      `}
                    >
                      {expense.status === "Pago" ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : expense.status === "Vencido" ? (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {expense.status}
                    </Badge>
                  </div>
                  
                  {expense.status !== "Pago" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMarkAsPaid(expense)}
                    >
                      Marcar como Pago
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Nenhuma despesa encontrada com os filtros selecionados.
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * itemsPerPage + 1}-
                {Math.min(page * itemsPerPage, filteredExpenses.length)} de{" "}
                {filteredExpenses.length} despesas
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
