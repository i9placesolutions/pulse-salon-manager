
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Product } from "@/types/stock";

interface StockAlertsProps {
  products: Product[];
}

export function StockAlerts({ products }: StockAlertsProps) {
  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.minQuantity
  );

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {lowStockProducts.map((product) => (
        <Alert key={product.id} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Estoque Baixo</AlertTitle>
          <AlertDescription>
            O produto {product.name} está com estoque baixo. Quantidade atual:{" "}
            {product.quantity} (mínimo: {product.minQuantity})
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
