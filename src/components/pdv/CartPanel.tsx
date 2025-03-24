
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { ShoppingCart, CreditCard } from "lucide-react";
import { CartItem } from "./CartItem";
import { SaleItem, Client } from "@/types/pdv";

interface CartPanelProps {
  cartItems: SaleItem[];
  cartTotal: number;
  selectedClient: Client | null;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onFinalizeSale: () => void;
}

export function CartPanel({
  cartItems,
  cartTotal,
  selectedClient,
  onIncrement,
  onDecrement,
  onRemove,
  onFinalizeSale
}: CartPanelProps) {
  return (
    <Card className="flex flex-col h-[calc(100vh-20rem)]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Carrinho</h3>
        <div className="text-muted-foreground text-sm">
          {cartItems.length} {cartItems.length === 1 ? "item" : "itens"}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <ShoppingCart className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground text-sm">
              O carrinho está vazio
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrement={() => onIncrement(item.id)}
                onDecrement={() => onDecrement(item.id)}
                onRemove={() => onRemove(item.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">Total</span>
          <span className="text-xl font-bold">{formatCurrency(cartTotal)}</span>
        </div>
        
        <Button
          className="w-full"
          size="lg"
          disabled={cartItems.length === 0 || !selectedClient}
          onClick={onFinalizeSale}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Finalizar Venda
        </Button>
      </div>
    </Card>
  );
}
