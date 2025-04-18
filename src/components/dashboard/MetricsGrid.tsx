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
    }
  ];

  // Cores para os diferentes tipos de métricas baseados no menu sidebar
  const metricColors = {
    "revenue": { bg: "from-green-50 to-green-100", border: "border-green-200", text: "text-green-700", icon: "text-green-600", iconBg: "bg-green-100", iconHover: "group-hover:bg-green-200" },
    "ticket": { bg: "from-blue-50 to-blue-100", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-600", iconBg: "bg-blue-100", iconHover: "group-hover:bg-blue-200" },
    "clients": { bg: "from-emerald-50 to-emerald-100", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-600", iconBg: "bg-emerald-100", iconHover: "group-hover:bg-emerald-200" },
    "services": { bg: "from-amber-50 to-amber-100", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-600", iconBg: "bg-amber-100", iconHover: "group-hover:bg-amber-200" },
    "monthly-revenue": { bg: "from-green-50 to-green-100", border: "border-green-200", text: "text-green-700", icon: "text-green-600", iconBg: "bg-green-100", iconHover: "group-hover:bg-green-200" },
    "ticket-medio": { bg: "from-blue-50 to-blue-100", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-600", iconBg: "bg-blue-100", iconHover: "group-hover:bg-blue-200" },
    "appointments": { bg: "from-purple-50 to-purple-100", border: "border-purple-200", text: "text-purple-700", icon: "text-purple-600", iconBg: "bg-purple-100", iconHover: "group-hover:bg-purple-200" },
    "new_clients": { bg: "from-emerald-50 to-emerald-100", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-600", iconBg: "bg-emerald-100", iconHover: "group-hover:bg-emerald-200" },
    "products": { bg: "from-indigo-50 to-indigo-100", border: "border-indigo-200", text: "text-indigo-700", icon: "text-indigo-600", iconBg: "bg-indigo-100", iconHover: "group-hover:bg-indigo-200" },
    "avg-time": { bg: "from-rose-50 to-rose-100", border: "border-rose-200", text: "text-rose-700", icon: "text-rose-600", iconBg: "bg-rose-100", iconHover: "group-hover:bg-rose-200" }
  };

  // Função para obter cores do card com fallback para cores padrão
  const getCardColors = (metricId: string) => {
    return metricColors[metricId as keyof typeof metricColors] || {
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      text: "text-blue-700",
      icon: "text-blue-600",
      iconBg: "bg-blue-100",
      iconHover: "group-hover:bg-blue-200"
    };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-rose-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const metricsToShow = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className="grid gap-4">
      {/* Primeira linha: 2 cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metricsToShow.slice(0, 2).map((metric) => {
          const colors = getCardColors(metric.id);
          
          return (
            <Card 
              key={metric.id} 
              className={`${colors.border} shadow-sm hover:shadow-md transition-all group`}
            >
              <CardHeader className={`flex flex-row items-center justify-between pb-2 bg-gradient-to-r ${colors.bg} rounded-t-lg`}>
                <CardTitle className={`text-base font-medium ${colors.text}`}>
                  {metric.title}
                </CardTitle>
                {metric.icon && (
                  <div className={`p-2 rounded-full ${colors.iconBg} ${colors.iconHover} transition-colors`}>
                    <metric.icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-5 pb-5">
                <div className={`text-3xl font-bold ${colors.text}`}>
                  {metric.prefix}{metric.value}{metric.suffix}
                </div>
                <p className="text-sm flex items-center mt-2">
                  <span className="flex items-center mr-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`ml-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-rose-600' : 
                      'text-gray-500'
                    }`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </span>
                  <span className={`text-${colors.text.split('-')[1]}-600/70`}>{metric.description}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Segunda linha: 3 cards menores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricsToShow.slice(2).map((metric) => {
          const colors = getCardColors(metric.id);
          
          return (
            <Card 
              key={metric.id} 
              className={`${colors.border} shadow-sm hover:shadow-md transition-all group`}
            >
              <CardHeader className={`flex flex-row items-center justify-between pb-2 bg-gradient-to-r ${colors.bg} rounded-t-lg`}>
                <CardTitle className={`text-sm font-medium ${colors.text}`}>
                  {metric.title}
                </CardTitle>
                {metric.icon && (
                  <div className={`p-2 rounded-full ${colors.iconBg} ${colors.iconHover} transition-colors`}>
                    <metric.icon className={`h-4 w-4 ${colors.icon}`} />
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <div className={`text-2xl font-bold ${colors.text}`}>
                  {metric.prefix}{metric.value}{metric.suffix}
                </div>
                <p className="text-xs flex items-center mt-1">
                  <span className="flex items-center mr-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`ml-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-rose-600' : 
                      'text-gray-500'
                    }`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </span>
                  <span className={`text-${colors.text.split('-')[1]}-600/70`}>{metric.description}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
