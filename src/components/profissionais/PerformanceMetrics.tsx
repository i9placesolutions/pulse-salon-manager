
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { ProfessionalPerformance } from "@/types/professional";
import { formatCurrency } from "@/utils/currency";

interface PerformanceMetricsProps {
  performance: ProfessionalPerformance;
}

export const PerformanceMetrics = ({ performance }: PerformanceMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Faturamento Mensal</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performance.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Bar dataKey="revenue" fill="#dc8c95" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Serviços Mais Realizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.topServices.map((service) => (
              <div key={service.serviceName} className="flex justify-between items-center">
                <span>{service.serviceName}</span>
                <span className="font-medium">{service.count}x</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Avaliação Média</p>
              <p className="text-2xl font-bold">
                {performance.rating.toFixed(1)} / 5.0
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Retorno</p>
              <p className="text-2xl font-bold">
                {(performance.clientReturnRate * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Atendimentos</p>
              <p className="text-2xl font-bold">{performance.totalAppointments}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
