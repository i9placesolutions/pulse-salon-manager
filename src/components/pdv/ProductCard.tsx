
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import { Package, Tag, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border p-4 flex flex-col h-full">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            {product.category === "Serviço" ? (
              <Tag className="h-4 w-4" />
            ) : (
              <Package className="h-4 w-4" />
            )}
          </div>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
            {product.category}
          </span>
        </div>
        <h3 className="font-medium truncate">{product.name}</h3>
        <p className="mt-1 text-lg font-bold text-primary">
          {formatCurrency(product.price)}
        </p>
        
        {product.category === "Produto" && (
          <div className="mt-2 text-xs text-muted-foreground">
            Estoque: {product.quantity}
          </div>
        )}
      </div>
      <Button 
        className="mt-4 w-full"
        variant="secondary"
        onClick={onClick}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Adicionar
      </Button>
    </div>
  );
}
