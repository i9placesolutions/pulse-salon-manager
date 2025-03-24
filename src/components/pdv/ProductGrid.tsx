
import { ProductCard } from "./ProductCard";
import { Product } from "@/types/pdv";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onAddToCart(product)}
        />
      ))}
    </div>
  );
}
