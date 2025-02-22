
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Percent, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { SaleItem } from "@/types/pdv";

interface CartItemProps {
  item: SaleItem;
  onRemove: (id: number) => void;
  onDiscount: (id: number, value: number, type: 'percentage' | 'fixed') => void;
}

export function CartItem({ item, onRemove, onDiscount }: CartItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(item.unitPrice)} x {item.quantity}
            </p>
            {item.discount && (
              <p className="text-sm text-green-500">
                Desconto: {item.discountType === 'percentage' ? `${item.discount}%` : formatCurrency(item.discount)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => {
                const value = prompt("Digite o valor do desconto:");
                const type = confirm("Desconto em porcentagem?") ? 'percentage' : 'fixed';
                if (value) onDiscount(item.id, Number(value), type);
              }}
            >
              <Percent className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
