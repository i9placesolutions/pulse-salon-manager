
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  LucideIcon
} from "lucide-react";
import { DashboardMetric } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface MetricsGridProps {
  metrics: DashboardMetric[];
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  // Helper para renderizar ícones de tendência
  const renderTrendIcon = (trend: 'up' | 'down' | 'neutral', size = 16) => {
    switch (trend) {
      case 'up':
        return <ArrowUp size={size} className="text-emerald-500" />;
      case 'down':
        return <ArrowDown size={size} className="text-rose-500" />;
      case 'neutral':
        return <Minus size={size} className="text-gray-400" />;
    }
  };

  // Função para garantir que temos um ícone para cada métrica
  const getMetricIcon = (iconName?: LucideIcon | string) => {
    if (!iconName) return <DollarSign className="h-5 w-5 text-blue-600" />;
    
    // Se for um ícone Lucide já passado, retornar ele mesmo
    if (typeof iconName !== 'string') {
      return React.createElement(iconName, { className: "h-5 w-5 text-blue-600" });
    }

    // Se for string, mapear para o ícone correspondente
    const iconMap: Record<string, LucideIcon> = {
      "dollar": DollarSign,
      "trending-up": TrendingUp,
      "users": Users,
      "shopping-bag": ShoppingBag,
      "clock": Clock,
      "calendar": Calendar,
      "money": DollarSign
    };

    const IconComponent = iconMap[iconName] || DollarSign;
    return <IconComponent className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className="border-blue-100 overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-blue-700">{metric.title}</h3>
                <div className="text-2xl font-bold text-slate-800">
                  {metric.prefix}
                  {typeof metric.value === 'number' 
                    ? new Intl.NumberFormat('pt-BR').format(metric.value)
                    : metric.value}
                  {metric.suffix}
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                {getMetricIcon(metric.icon)}
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm">
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1 px-1.5 font-normal border-0",
                  metric.trend === 'up' ? "bg-emerald-50 text-emerald-700" : 
                  metric.trend === 'down' ? "bg-rose-50 text-rose-700" : 
                  "bg-gray-50 text-gray-700"
                )}
              >
                {renderTrendIcon(metric.trend)}
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </Badge>
              <span className="ml-2 text-muted-foreground text-xs">{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
