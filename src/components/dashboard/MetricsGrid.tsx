
import { DashboardMetric } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus, TrendingUp, DollarSign, Users, ShoppingBag, Clock } from "lucide-react";

interface MetricsGridProps {
  metrics: DashboardMetric[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const defaultMetrics: DashboardMetric[] = [
    {
      id: "revenue",
      title: "Faturamento",
      value: "R$ 45.980",
      change: 12.3,
      trend: "up",
      description: "em relação ao mês passado",
      icon: DollarSign
    },
    {
      id: "ticket",
      title: "Ticket Médio",
      value: "R$ 120",
      change: 8.5,
      trend: "up",
      description: "em relação ao mês passado",
      icon: TrendingUp
    },
    {
      id: "clients",
      title: "Clientes Atendidos",
      value: "382",
      change: 5.2,
      trend: "up",
      description: "este mês",
      icon: Users
    },
    {
      id: "services",
      title: "Serviços Realizados",
      value: "456",
      change: 7.8,
      trend: "up",
      description: "este mês",
      icon: ShoppingBag
    },
    {
      id: "waiting",
      title: "Tempo Médio Espera",
      value: "12min",
      change: -2.5,
      trend: "down",
      description: "em relação a ontem",
      icon: Clock
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const metricsToShow = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {metricsToShow.map((metric) => (
        <Card key={metric.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            {metric.icon && <metric.icon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metric.prefix}{metric.value}{metric.suffix}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="flex items-center mr-1">
                {getTrendIcon(metric.trend)}
                <span className={`ml-1 ${
                  metric.trend === 'up' ? 'text-green-500' : 
                  metric.trend === 'down' ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {Math.abs(metric.change)}%
                </span>
              </span>
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
