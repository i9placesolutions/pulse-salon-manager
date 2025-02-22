
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingCart, Plus, Trash2, CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface CartItem extends Product {
  cartQuantity: number;
}

// Mock data - será substituído pela integração com o backend
const mockProducts: Product[] = [
  { id: 1, name: "Corte Masculino", price: 45.00, category: "Serviço", quantity: -1 },
  { id: 2, name: "Shampoo Profissional", price: 89.90, category: "Produto", quantity: 15 },
  { id: 3, name: "Hidratação", price: 120.00, category: "Serviço", quantity: -1 },
  { id: 4, name: "Tintura", price: 150.00, category: "Serviço", quantity: -1 },
];

const PDV = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Produtos/Serviços */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Buscar produtos ou serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:bg-secondary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {product.name}
                </CardTitle>
                <Button size="icon" variant="ghost" onClick={() => addToCart(product)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {product.category}
                  </span>
                </div>
                {product.quantity >= 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Em estoque: {product.quantity}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Carrinho */}
      <div className="w-96 border-l bg-secondary/50">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.cartQuantity}x {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {formatCurrency(item.price * item.cartQuantity)}
                  </p>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            <Button className="w-full" size="lg" disabled={cart.length === 0}>
              <CreditCard className="mr-2 h-4 w-4" />
              Finalizar Venda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDV;
