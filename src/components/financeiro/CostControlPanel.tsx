import { useState, useMemo } from "react";
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
import { Expense } from "@/types/financial";
import { formatCurrency } from "@/utils/currency";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CHART_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28"];
const CATEGORIES = ["Fixo", "Variável"];

interface CostControlPanelProps {
  expenses: Expense[];
}

export function CostControlPanel({ expenses }: CostControlPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Filtrar despesas com base na categoria selecionada
  const filteredExpenses = useMemo(() => {
    if (!categoryFilter) return expenses;
    return expenses.filter(expense => expense.category === categoryFilter);
  }, [expenses, categoryFilter]);

  // Processar dados para o gráfico
  const pieData = useMemo(() => {
    // Agrupar por costCenter ou criar uma categoria "Outros" se não existir
    const costCenters = filteredExpenses.reduce((acc, expense) => {
      const center = expense.costCenter || "Outros";
      if (!acc[center]) {
        acc[center] = 0;
      }
      acc[center] += expense.value;
      return acc;
    }, {} as Record<string, number>);

    // Converter para o formato do gráfico
    return Object.entries(costCenters).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredExpenses]);

  // Calcular totais
  const totalFixo = useMemo(() => {
    return expenses
      .filter(expense => expense.category === "Fixo")
      .reduce((sum, expense) => sum + expense.value, 0);
  }, [expenses]);

  const totalVariavel = useMemo(() => {
    return expenses
      .filter(expense => expense.category === "Variável")
      .reduce((sum, expense) => sum + expense.value, 0);
  }, [expenses]);

  const totalGeral = totalFixo + totalVariavel;

  // Recorrentes vs. Não Recorrentes
  const recorrentesData = useMemo(() => {
    const recorrentes = filteredExpenses
      .filter(e => e.isRecurring)
      .reduce((sum, e) => sum + e.value, 0);
    
    const naoRecorrentes = filteredExpenses
      .filter(e => !e.isRecurring)
      .reduce((sum, e) => sum + e.value, 0);
    
    return [
      { name: "Recorrentes", value: recorrentes },
      { name: "Não Recorrentes", value: naoRecorrentes }
    ];
  }, [filteredExpenses]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Controle de Custos</h2>
        <div className="flex items-center gap-2">
          <Select
            value={categoryFilter || "all"}
            onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todas Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">Exportar</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Despesas Fixas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFixo)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalFixo / totalGeral) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Despesas Variáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVariavel)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalVariavel / totalGeral) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGeral)}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} despesas registradas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Centro de Custo</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas Recorrentes vs. Não Recorrentes</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recorrentesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  <Cell fill="#8884d8" />
                  <Cell fill="#82ca9d" />
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise Mensal de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-10">
            {filteredExpenses.length === 0 ? (
              "Nenhuma despesa encontrada para os filtros aplicados."
            ) : (
              "A análise mensal detalhada estará disponível em breve."
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
