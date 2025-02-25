
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    category: string;
    quantity: number;
  };
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:bg-secondary/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {product.name}
        </CardTitle>
        <Button size="icon" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm text-muted-foreground">
            {product.category}
          </span>
        </div>
        {product.quantity >= 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Em estoque: {product.quantity}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
