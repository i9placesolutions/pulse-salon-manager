
import { Button } from "@/components/ui/button";
import { CartItem } from "./CartItem";
import { CartTotal } from "./CartTotal";
import { ShoppingCart } from "lucide-react";
import type { SaleItem } from "@/types/pdv";

interface CartProps {
  items: SaleItem[];
  selectedClient: any;
  cartSubtotal: number;
  cartTotal: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  surcharge: number;
  surchargeType: 'fixed' | 'percentage';
  onRemoveItem: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onDiscountClick: () => void;
  onSurchargeClick: () => void;
  onRemoveDiscount: () => void;
  onRemoveSurcharge: () => void;
  onCheckout: () => void;
}

export function Cart({
  items,
  selectedClient,
  cartSubtotal,
  cartTotal,
  discount,
  discountType,
  surcharge,
  surchargeType,
  onRemoveItem,
  onUpdateQuantity,
  onDiscountClick,
  onSurchargeClick,
  onRemoveDiscount,
  onRemoveSurcharge,
  onCheckout
}: CartProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho
          </h2>
          {selectedClient && (
            <span className="text-sm text-muted-foreground">
              Cliente: {selectedClient.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onRemove={onRemoveItem}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>

      <div className="border-t p-4 space-y-4">
        <CartTotal
          cartSubtotal={cartSubtotal}
          cartTotal={cartTotal}
          discount={discount}
          discountType={discountType}
          surcharge={surcharge}
          surchargeType={surchargeType}
          onDiscountClick={onDiscountClick}
          onSurchargeClick={onSurchargeClick}
          onRemoveDiscount={onRemoveDiscount}
          onRemoveSurcharge={onRemoveSurcharge}
          isEmpty={items.length === 0}
        />

        <Button 
          className="w-full" 
          size="lg" 
          disabled={items.length === 0} 
          onClick={onCheckout}
        >
          Finalizar Venda
        </Button>
      </div>
    </div>
  );
}
