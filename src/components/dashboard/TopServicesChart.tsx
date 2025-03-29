
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Cores para os gráficos (usando as cores do sidebar)
const COLORS = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopServicesChartProps {
  products: TopProduct[];
}

export const TopServicesChart = React.memo(({ products }: TopServicesChartProps) => {
  return (
    <Card className="border-amber-200 shadow-sm hover:shadow transition-all">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-100 p-2 rounded-full">
            <BarChart3 className="h-4 w-4 text-amber-600" />
          </div>
          <CardTitle className="text-amber-700">Serviços Mais Populares</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {products.map((product, index) => (
            <div key={product.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-800">{product.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-600 font-medium">{product.quantity}x</span>
                  <span className="text-xs font-medium text-amber-600">{formatCurrency(product.revenue)}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full" 
                  style={{ 
                    width: `${(product.revenue / products[0].revenue) * 100}%`,
                    backgroundColor: COLORS[index % COLORS.length]
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

TopServicesChart.displayName = "TopServicesChart";
