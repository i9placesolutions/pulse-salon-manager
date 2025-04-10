import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { formatCurrency } from "@/utils/currency";
import { Expense, AccountReceivable, CashFlow } from "@/types/financial";
import { addDays, format, startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinancialProjectionsProps {
  expenses: Expense[];
  accountsReceivable: AccountReceivable[];
  cashFlow: CashFlow[];
  forecastDays?: number;
}

export function FinancialProjections({ 
  expenses, 
  accountsReceivable, 
  cashFlow,
  forecastDays = 90 
}: FinancialProjectionsProps) {
  const [projectionPeriod, setProjectionPeriod] = useState<"30" | "60" | "90">("30");
  
  // Função para processar datas em diferentes formatos
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Formatos possíveis: dd/MM/yyyy ou yyyy-MM-dd
    let date;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    } else {
      date = parseISO(dateStr);
    }
    
    return isValid(date) ? date : null;
  };
  
  // Calcular projeções para o período selecionado
  const projectionData = useMemo(() => {
    const today = new Date();
    const days = parseInt(projectionPeriod);
    const projectionEnd = addDays(today, days);
    
    // Criar um mapa de datas para o período de projeção
    const dateMap = new Map();
    for (let i = 0; i <= days; i++) {
      const date = addDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      dateMap.set(dateKey, {
        date: format(date, 'dd/MM'),
        timestamp: date.getTime(),
        income: 0,
        expense: 0,
        balance: 0,
        cumulativeBalance: 0
      });
    }
    
    // Calcular saldo inicial com base no fluxo de caixa realizado
    const initialBalance = cashFlow
      .filter(cf => cf.status === 'realizado')
      .reduce((acc, cf) => {
        return cf.type === 'entrada' ? acc + cf.value : acc - cf.value;
      }, 0);
    
    // Adicionar despesas futuras
    expenses.forEach(expense => {
      if (expense.status === 'Pago') return;
      
      const expenseDate = parseDate(expense.date);
      if (!expenseDate) return;
      
      // Verificar se a despesa está dentro do período de projeção
      if (isWithinInterval(expenseDate, { start: today, end: projectionEnd })) {
        const dateKey = format(expenseDate, 'yyyy-MM-dd');
        if (dateMap.has(dateKey)) {
          const dayData = dateMap.get(dateKey);
          dayData.expense += expense.value;
        }
      }
    });
    
    // Adicionar contas a receber futuras
    accountsReceivable.forEach(account => {
      if (account.status === 'Pago') return;
      
      const receiveDate = parseDate(account.dueDate);
      if (!receiveDate) return;
      
      // Verificar se o recebimento está dentro do período de projeção
      if (isWithinInterval(receiveDate, { start: today, end: projectionEnd })) {
        const dateKey = format(receiveDate, 'yyyy-MM-dd');
        if (dateMap.has(dateKey)) {
          const dayData = dateMap.get(dateKey);
          dayData.income += account.value;
        }
      }
    });
    
    // Adicionar entradas e saídas previstas do fluxo de caixa
    cashFlow.forEach(flow => {
      if (flow.status !== 'previsto') return;
      
      const flowDate = parseDate(flow.date);
      if (!flowDate) return;
      
      // Verificar se o fluxo está dentro do período de projeção
      if (isWithinInterval(flowDate, { start: today, end: projectionEnd })) {
        const dateKey = format(flowDate, 'yyyy-MM-dd');
        if (dateMap.has(dateKey)) {
          const dayData = dateMap.get(dateKey);
          if (flow.type === 'entrada') {
            dayData.income += flow.value;
          } else {
            dayData.expense += flow.value;
          }
        }
      }
    });
    
    // Calcular saldo diário e saldo acumulado
    let runningBalance = initialBalance;
    
    // Converter o Map para array e ordenar por data
    const result = Array.from(dateMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(day => {
        day.balance = day.income - day.expense;
        runningBalance += day.balance;
        day.cumulativeBalance = runningBalance;
        return day;
      });
    
    return result;
  }, [projectionPeriod, expenses, accountsReceivable, cashFlow]);
  
  // Calcular estatísticas das projeções
  const projectionStats = useMemo(() => {
    if (!projectionData.length) return { totalIncome: 0, totalExpense: 0, finalBalance: 0 };
    
    const totalIncome = projectionData.reduce((sum, day) => sum + day.income, 0);
    const totalExpense = projectionData.reduce((sum, day) => sum + day.expense, 0);
    const finalBalance = projectionData[projectionData.length - 1].cumulativeBalance;
    
    return { totalIncome, totalExpense, finalBalance };
  }, [projectionData]);
  
  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Projeções Financeiras</CardTitle>
          <Tabs 
            value={projectionPeriod} 
            onValueChange={(v) => setProjectionPeriod(v as "30" | "60" | "90")}
            className="w-auto"
          >
            <TabsList className="grid w-[180px] grid-cols-3">
              <TabsTrigger value="30">30 dias</TabsTrigger>
              <TabsTrigger value="60">60 dias</TabsTrigger>
              <TabsTrigger value="90">90 dias</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-white border shadow-sm">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Receitas Previstas</h4>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(projectionStats.totalIncome)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white border shadow-sm">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Despesas Previstas</h4>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(projectionStats.totalExpense)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white border shadow-sm">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Saldo Projetado</h4>
            <p className={`text-2xl font-bold ${projectionStats.finalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(projectionStats.finalBalance)}
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="balance">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="balance" className="flex-1">Saldo Acumulado</TabsTrigger>
            <TabsTrigger value="cashflow" className="flex-1">Fluxo Diário</TabsTrigger>
          </TabsList>
          
          <TabsContent value="balance" className="mt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={projectionData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickCount={6}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value.toLocaleString('pt-BR')}`}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), 'Saldo']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeBalance"
                    name="Saldo Acumulado"
                    stroke="#1D4ED8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="cashflow" className="mt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projectionData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickCount={6}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value.toLocaleString('pt-BR')}`}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), '']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Receitas"
                    stroke="#10B981"
                    fill="#D1FAE5"
                    strokeWidth={2}
                    stackId="1"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Despesas"
                    stroke="#EF4444"
                    fill="#FEE2E2"
                    strokeWidth={2}
                    stackId="2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 