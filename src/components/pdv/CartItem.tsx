
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Percent, Trash2, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { SaleItem } from "@/types/pdv";

interface CartItemProps {
  item: SaleItem;
  onRemove: (id: number) => void;
  onDiscount: (id: number, value: number, type: 'percentage' | 'fixed') => void;
  onSurcharge: (id: number, value: number, type: 'percentage' | 'fixed') => void;
}

export function CartItem({ item, onRemove, onDiscount, onSurcharge }: CartItemProps) {
  const handleValueChange = (action: 'discount' | 'surcharge') => {
    const actionText = action === 'discount' ? 'desconto' : 'acréscimo';
    const value = prompt(`Digite o valor do ${actionText}:`);
    if (!value) return;

    const typeConfirm = confirm(`${actionText} em porcentagem? Clique OK para porcentagem ou Cancelar para valor fixo`);
    const type = typeConfirm ? 'percentage' : 'fixed';

    if (action === 'discount') {
      onDiscount(item.id, Number(value), type);
    } else {
      onSurcharge(item.id, Number(value), type);
    }
  };

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
            {item.surcharge && (
              <p className="text-sm text-red-500">
                Acréscimo: {item.surchargeType === 'percentage' ? `${item.surcharge}%` : formatCurrency(item.surcharge)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => handleValueChange('surcharge')}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => handleValueChange('discount')}
            >
              <Minus className="h-4 w-4" />
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
