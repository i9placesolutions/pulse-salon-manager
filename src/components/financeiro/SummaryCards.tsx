
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Users, ArrowUp, ArrowDown, Wallet } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

export const SummaryCards = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-green-700">
            Faturamento Hoje
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(2890)}</div>
          <p className="text-xs text-green-600 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            +20.1% em relação a ontem
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
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(45980)}</div>
          <p className="text-xs text-blue-600 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            +12.3% em relação ao mês passado
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
          <div className="text-2xl font-bold text-yellow-700">{formatCurrency(3630)}</div>
          <p className="text-xs text-yellow-600">
            3 profissionais
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
          <div className="text-2xl font-bold text-red-700">{formatCurrency(12580)}</div>
          <p className="text-xs text-red-600 flex items-center">
            <ArrowDown className="h-3 w-3 mr-1" />
            -8.1% em relação ao mês passado
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
