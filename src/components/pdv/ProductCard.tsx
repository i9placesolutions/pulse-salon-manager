
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
      className="group cursor-pointer transition-all hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium line-clamp-1">
          {product.name}
        </CardTitle>
        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
