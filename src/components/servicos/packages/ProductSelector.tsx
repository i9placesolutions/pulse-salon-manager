
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

interface PackageProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ProductSelectorProps {
  availableProducts: Product[];
  selectedProducts: PackageProduct[];
  onAddProduct: (productId: string, quantity: number) => void;
  onRemoveProduct: (productId: string) => void;
}

export function ProductSelector({
  availableProducts,
  selectedProducts,
  onAddProduct,
  onRemoveProduct
}: ProductSelectorProps) {
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productQuantity, setProductQuantity] = useState<number>(1);

  const handleAddProduct = () => {
    if (!selectedProductId || productQuantity <= 0) return;
    
    // Evita adicionar produto duplicado
    if (selectedProducts.some(p => p.id === selectedProductId)) {
      toast({
        title: "Produto já adicionado",
        description: "Este produto já está incluído no pacote.",
        variant: "destructive",
      });
      return;
    }
    
    onAddProduct(selectedProductId, productQuantity);
    setSelectedProductId("");
    setProductQuantity(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={selectedProductId} onValueChange={(value) => setSelectedProductId(value)}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {availableProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - {formatCurrency(product.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min="1"
          value={productQuantity}
          onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
          className="w-[80px]"
          placeholder="Qtd"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAddProduct}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      
      {selectedProducts.length > 0 ? (
        <div className="space-y-2">
          {selectedProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-2 bg-background rounded border">
              <div>
                <span>{product.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (Qtd: {product.quantity})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{formatCurrency(product.price * product.quantity)}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveProduct(product.id)}
                  className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Nenhum produto adicionado ao pacote.
        </div>
      )}
    </div>
  );
}
