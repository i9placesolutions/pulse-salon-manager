
import { formatCurrency } from "@/utils/currency";

interface PackagePriceSummaryProps {
  totalPrice: number;
  discountedPrice: number;
  discount: number;
}

export function PackagePriceSummary({
  totalPrice,
  discountedPrice,
  discount
}: PackagePriceSummaryProps) {
  return (
    <div className="flex items-center justify-between pt-2 border-t mt-2">
      <div>
        <div className="text-sm font-medium">Valor Total</div>
        <div className="text-sm text-muted-foreground">Desconto de {discount}%</div>
      </div>
      <div className="text-right">
        <div className="text-sm line-through text-muted-foreground">{formatCurrency(totalPrice)}</div>
        <div className="font-medium text-primary">{formatCurrency(discountedPrice)}</div>
      </div>
    </div>
  );
}
