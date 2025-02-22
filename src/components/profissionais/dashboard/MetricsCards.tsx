
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, ChartBar } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Professional, ProfessionalPerformance } from "@/types/professional";

interface MetricsCardsProps {
  professional: Professional;
  performance: ProfessionalPerformance;
}

export function MetricsCards({ professional, performance }: MetricsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Atendimentos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{performance.totalAppointments}</div>
          <p className="text-xs text-muted-foreground">
            +20% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {professional.paymentModel === 'fixed' ? 'Salário Fixo' : 'Comissões do Mês'}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(professional.paymentModel === 'fixed' 
              ? professional.fixedSalary || 0 
              : 3500)}
          </div>
          <p className="text-xs text-muted-foreground">
            {professional.paymentModel === 'fixed' 
              ? 'Salário base mensal'
              : '+15% em relação ao mês anterior'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Próximos Atendimentos
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-muted-foreground">
            Agendamentos para hoje
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa de Retorno
          </CardTitle>
          <ChartBar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(performance.clientReturnRate * 100)}%</div>
          <p className="text-xs text-muted-foreground">
            Clientes que retornam
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
