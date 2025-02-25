
import { ProductCard } from "./ProductCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductGridProps {
  products: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onProductClick: (product: any) => void;
}

export function ProductGrid({
  products,
  searchTerm,
  onSearchChange,
  onProductClick
}: ProductGridProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input 
          className="pl-10 w-full max-w-md" 
          placeholder="Buscar produtos ou serviços..." 
          value={searchTerm} 
          onChange={e => onSearchChange(e.target.value)} 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onClick={() => onProductClick(product)} 
          />
        ))}
      </div>
    </div>
  );
}
