
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { Tag, Clock } from "lucide-react";

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
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-medium truncate group-hover:text-blue-600">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  product.category === "Serviço" 
                    ? "bg-purple-100 text-purple-700" 
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {product.category === "Serviço" ? (
                    <Clock className="h-3 w-3 mr-1" />
                  ) : (
                    <Tag className="h-3 w-3 mr-1" />
                  )}
                  {product.category}
                </span>
                {product.category === "Produto" && product.quantity >= 0 && (
                  <span className={`text-xs font-medium ${
                    product.quantity <= 5 ? "text-red-600" : "text-gray-500"
                  }`}>
                    {product.quantity} em estoque
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold">
              {formatCurrency(product.price)}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Adicionar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
