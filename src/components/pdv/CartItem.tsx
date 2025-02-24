
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { SaleItem } from "@/types/pdv";

interface CartItemProps {
  item: SaleItem;
  onRemove: (id: number) => void;
}

export function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(item.unitPrice)} x {item.quantity}
            </p>
          </div>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
