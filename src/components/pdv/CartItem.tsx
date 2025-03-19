import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  };
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartItem({ item, onIncrement, onDecrement, onRemove }: CartItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500">
            {formatCurrency(item.price)} un
          </span>
          <span className="text-sm font-medium">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-lg">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-r-none hover:bg-gray-100"
            onClick={onDecrement}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-medium">
            {item.quantity}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-l-none hover:bg-gray-100"
            onClick={onIncrement}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
