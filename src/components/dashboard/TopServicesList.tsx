
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopProduct } from "@/types/dashboard";
import { formatCurrency } from "@/utils/currency";
import { TrendingUp, BarChart3 } from "lucide-react";

interface TopServicesListProps {
  services: TopProduct[];
}

export function TopServicesList({ services }: TopServicesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Serviços Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((product, index) => (
            <div key={product.name} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{product.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{product.quantity} atendimentos</span>
                  <span>•</span>
                  <span>{formatCurrency(product.revenue)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                index < 2 ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                {index < 2 ? <TrendingUp className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
