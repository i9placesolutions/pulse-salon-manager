import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Users, ArrowUp, ArrowDown, Wallet, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { 
  calculateTotalRevenue,
  calculateTotalExpenses,
  calculateAverageTicket,
  calculateTotalCommissions 
} from "@/utils/financial";
import { Payment, Expense, Professional } from "@/types/financial";

interface SummaryCardsProps {
  payments: Payment[];
  expenses: Expense[];
  professionals: Professional[];
}

export const SummaryCards = ({ payments, expenses, professionals }: SummaryCardsProps) => {
  // Filtra pagamentos de hoje
  const today = new Date().toISOString().split('T')[0];
  const todayPayments = payments.filter(p => p.date === today && p.status === "Pago");
  const todayRevenue = calculateTotalRevenue(todayPayments);
  
  // Cálculo de receita mensal
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  
  const monthlyRevenue = calculateTotalRevenue(payments, monthStart, monthEnd);
  const monthlyExpenses = calculateTotalExpenses(expenses, monthStart, monthEnd);
  
  // Cálculo para comparações com período anterior
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthEnd = new Date(currentYear, currentMonth, 0);
  const lastMonthRevenue = calculateTotalRevenue(payments, lastMonthStart, lastMonthEnd);
  const lastMonthExpenses = calculateTotalExpenses(expenses, lastMonthStart, lastMonthEnd);
  
  // Cálculo de percentuais de variação
  const revenueChange = lastMonthRevenue > 0 
    ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;
  
  const expensesChange = lastMonthExpenses > 0 
    ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0;
    
  // Ticket médio
  const ticketMedio = calculateAverageTicket(payments);
  
  // Comissões a pagar
  const comissoes = calculateTotalCommissions(professionals);
  const professionaisComComissao = professionals.filter(p => p.status === "A Pagar").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-green-700">
            Faturamento Hoje
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(todayRevenue)}</div>
          <p className="text-xs text-green-600 flex items-center">
            {todayPayments.length} pagamentos hoje
          </p>
        </CardContent>
      </Card>

      <Card className="bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">
            Faturamento Mensal
          </CardTitle>
          <Calendar className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(monthlyRevenue)}</div>
          <p className="text-xs text-blue-600 flex items-center">
            {revenueChange >= 0 ? (
              <>
                <ArrowUp className="h-3 w-3 mr-1" />
                +{revenueChange.toFixed(1)}% em relação ao mês passado
              </>
            ) : (
              <>
                <ArrowDown className="h-3 w-3 mr-1" />
                {revenueChange.toFixed(1)}% em relação ao mês passado
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-purple-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">
            Ticket Médio
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">{formatCurrency(ticketMedio)}</div>
          <p className="text-xs text-purple-600 flex items-center">
            {payments.filter(p => p.status === "Pago").length} pagamentos processados
          </p>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">
            Comissões a Pagar
          </CardTitle>
          <Users className="h-4 w-4 text-yellow-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">{formatCurrency(comissoes)}</div>
          <p className="text-xs text-yellow-600">
            {professionaisComComissao} profissionais
          </p>
        </CardContent>
      </Card>

      <Card className="bg-red-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-700">
            Despesas Mensais
          </CardTitle>
          <Wallet className="h-4 w-4 text-red-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">{formatCurrency(monthlyExpenses)}</div>
          <p className="text-xs text-red-600 flex items-center">
            {expensesChange <= 0 ? (
              <>
                <ArrowDown className="h-3 w-3 mr-1" />
                {Math.abs(expensesChange).toFixed(1)}% em relação ao mês passado
              </>
            ) : (
              <>
                <ArrowUp className="h-3 w-3 mr-1" />
                +{expensesChange.toFixed(1)}% em relação ao mês passado
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
