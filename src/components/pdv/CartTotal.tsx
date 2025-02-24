
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CartTotalProps {
  cartSubtotal: number;
  cartTotal: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  surcharge: number;
  surchargeType: 'fixed' | 'percentage';
  onDiscountClick: () => void;
  onSurchargeClick: () => void;
  onRemoveDiscount: () => void;
  onRemoveSurcharge: () => void;
  isEmpty: boolean;
}

export function CartTotal({
  cartSubtotal,
  cartTotal,
  discount,
  discountType,
  surcharge,
  surchargeType,
  onDiscountClick,
  onSurchargeClick,
  onRemoveDiscount,
  onRemoveSurcharge,
  isEmpty
}: CartTotalProps) {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span>Subtotal</span>
        <span>{formatCurrency(cartSubtotal)}</span>
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full" disabled={isEmpty}>
              <Minus className="w-4 h-4 mr-2" />
              Desconto
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-slate-50">
            <DropdownMenuItem onClick={onDiscountClick}>
              Adicionar Desconto
            </DropdownMenuItem>
            {discount > 0 && (
              <DropdownMenuItem 
                onClick={onRemoveDiscount}
                className="text-red-500"
              >
                Remover Desconto
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full" disabled={isEmpty}>
              <Plus className="w-4 h-4 mr-2" />
              Acréscimo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-slate-50">
            <DropdownMenuItem onClick={onSurchargeClick}>
              Adicionar Acréscimo
            </DropdownMenuItem>
            {surcharge > 0 && (
              <DropdownMenuItem 
                onClick={onRemoveSurcharge}
                className="text-red-500"
              >
                Remover Acréscimo
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {discount > 0 && (
        <div className="flex justify-between items-center text-sm text-green-500 bg-green-50 p-2 rounded-md">
          <span>Desconto {discountType === 'percentage' ? `(${discount}%)` : ''}</span>
          <span>-{formatCurrency(discountType === 'percentage' ? cartSubtotal * discount / 100 : discount)}</span>
        </div>
      )}

      {surcharge > 0 && (
        <div className="flex justify-between items-center text-sm text-red-500 bg-red-50 p-2 rounded-md">
          <span>Acréscimo {surchargeType === 'percentage' ? `(${surcharge}%)` : ''}</span>
          <span>+{formatCurrency(surchargeType === 'percentage' ? cartSubtotal * surcharge / 100 : surcharge)}</span>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t">
        <span className="font-medium">Total</span>
        <span className="text-2xl font-bold">{formatCurrency(cartTotal)}</span>
      </div>
    </div>
  );
}
