
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { Search, User, ShoppingCart, CreditCard } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { CartItem } from "./CartItem";
import { usePDVData } from "@/hooks/usePDVData";

interface PDVTerminalProps {
  onViewOrders: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClient: any;
  cartItems: any[];
  cartTotal: number;
  handleAddToCart: (product: any) => void;
  handleChangeQuantity: (id: string, quantity: number) => void;
  handleRemoveFromCart: (id: string) => void;
  handleOpenPaymentDialog: () => void;
  setIsClientDialogOpen: (isOpen: boolean) => void;
}

export function PDVTerminal({ 
  onViewOrders,
  searchTerm,
  setSearchTerm,
  selectedClient,
  cartItems,
  cartTotal,
  handleAddToCart,
  handleChangeQuantity,
  handleRemoveFromCart,
  handleOpenPaymentDialog,
  setIsClientDialogOpen
}: PDVTerminalProps) {
  const { filteredProducts } = usePDVData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={onViewOrders}>
              Ver Pedidos
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleAddToCart(product)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Cliente</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClientDialogOpen(true)}
              >
                <User className="mr-2 h-4 w-4" />
                {selectedClient ? "Trocar" : "Selecionar"}
              </Button>
            </div>
            
            {selectedClient ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedClient.name}</span>
                </div>
                {selectedClient.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedClient.phone}</span>
                  </div>
                )}
                {selectedClient.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedClient.email}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md">
                <User className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground text-sm mb-2">
                  Nenhum cliente selecionado
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsClientDialogOpen(true)}
                >
                  Selecionar Cliente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
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
                    onIncrement={() => handleChangeQuantity(item.id, item.quantity + 1)}
                    onDecrement={() => handleChangeQuantity(item.id, item.quantity - 1)}
                    onRemove={() => handleRemoveFromCart(item.id)}
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
              onClick={handleOpenPaymentDialog}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Finalizar Venda
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
