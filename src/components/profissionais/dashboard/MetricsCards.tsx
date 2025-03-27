import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, ChartBar } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Professional, ProfessionalPerformance } from "@/types/professional";
import { cn } from "@/lib/utils";

interface MetricsCardsProps {
  professional: Professional;
  performance: ProfessionalPerformance;
}

export function MetricsCards({ professional, performance }: MetricsCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card de Atendimentos - Cor Roxo (appointments) */}
      <Card className="border-purple-200 shadow-sm hover:shadow transition-all group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
          <CardTitle className="text-sm font-medium text-purple-700">
            Total de Atendimentos
          </CardTitle>
          <div className="bg-purple-100 p-2 rounded-full group-hover:bg-purple-200 transition-colors">
            <Users className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-purple-700">{performance.totalAppointments}</div>
          <p className="text-xs text-purple-600">
            +20% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Card de Comissões - Cor Verde (financeiro) */}
      <Card className="border-green-200 shadow-sm hover:shadow transition-all group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
          <CardTitle className="text-sm font-medium text-green-700">
            {professional.paymentModel === 'fixed' ? 'Salário Fixo' : 'Comissões do Mês'}
          </CardTitle>
          <div className="bg-green-100 p-2 rounded-full group-hover:bg-green-200 transition-colors">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(professional.paymentModel === 'fixed' 
              ? professional.fixedSalary || 0 
              : 3500)}
          </div>
          <p className="text-xs text-green-600">
            {professional.paymentModel === 'fixed' 
              ? 'Salário base mensal'
              : '+15% em relação ao mês anterior'}
          </p>
        </CardContent>
      </Card>

      {/* Card de Próximos Atendimentos - Cor Azul (dashboard) */}
      <Card className="border-blue-200 shadow-sm hover:shadow transition-all group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
          <CardTitle className="text-sm font-medium text-blue-700">
            Próximos Atendimentos
          </CardTitle>
          <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-blue-700">8</div>
          <p className="text-xs text-blue-600">
            Agendamentos para hoje
          </p>
        </CardContent>
      </Card>

      {/* Card de Taxa de Retorno - Cor Amber (serviços) */}
      <Card className="border-amber-200 shadow-sm hover:shadow transition-all group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-50 to-amber-100 rounded-t-lg">
          <CardTitle className="text-sm font-medium text-amber-700">
            Taxa de Retorno
          </CardTitle>
          <div className="bg-amber-100 p-2 rounded-full group-hover:bg-amber-200 transition-colors">
            <ChartBar className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-amber-700">{(performance.clientReturnRate * 100)}%</div>
          <p className="text-xs text-amber-600">
            Clientes que retornam
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
