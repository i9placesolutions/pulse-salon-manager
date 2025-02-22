
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  AlertTriangle, 
  Search, 
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit,
  Trash2,
  FileText
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Product } from "@/types/stock";
import { useToast } from "@/hooks/use-toast";
import { EstoqueMetrics } from "@/components/estoque/EstoqueMetrics";
import { ProductForm } from "@/components/estoque/ProductForm";
import { StockMovementForm } from "@/components/estoque/StockMovementForm";

// Mock data - Replace with real data from your backend
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Shampoo Professional",
    description: "Shampoo para cabelos normais",
    quantity: 15,
    minQuantity: 20,
    price: 45.90,
    category: "Cabelo",
    lastUpdated: "2024-03-07"
  },
  {
    id: 2,
    name: "Condicionador Hidratante",
    description: "Condicionador para cabelos secos",
    quantity: 25,
    minQuantity: 15,
    price: 39.90,
    category: "Cabelo",
    lastUpdated: "2024-03-07"
  },
  {
    id: 3,
    name: "Máscara Capilar",
    description: "Máscara de tratamento intensivo",
    quantity: 8,
    minQuantity: 10,
    price: 59.90,
    category: "Tratamento",
    lastUpdated: "2024-03-06"
  }
];

const Estoque = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products] = useState<Product[]>(mockProducts);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [isSaidaOpen, setIsSaidaOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [activeTab, setActiveTab] = useState("produtos");
  const { toast } = useToast();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(
    product => product.quantity < product.minQuantity
  );

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsNewProductOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    toast({
      title: "Produto excluído",
      description: "O produto foi excluído com sucesso!",
    });
  };

  const handleProductSubmit = (product: Partial<Product>) => {
    toast({
      title: selectedProduct ? "Produto atualizado" : "Produto cadastrado",
      description: selectedProduct
        ? "O produto foi atualizado com sucesso!"
        : "O novo produto foi cadastrado com sucesso!",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Gestão de Estoque</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus produtos, movimentações e fornecedores
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => {
            setSelectedProduct(undefined);
            setIsNewProductOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
          <Button variant="outline" onClick={() => setIsEntradaOpen(true)}>
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Entrada
          </Button>
          <Button variant="outline" onClick={() => setIsSaidaOpen(true)}>
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Saída
          </Button>
          <Button variant="secondary" onClick={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento" })}>
            <FileText className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
        </div>
      </div>

      <EstoqueMetrics
        totalProducts={products.length}
        inStockProducts={products.filter(p => p.quantity > 0).length}
        lowStockProducts={lowStockProducts.length}
        totalSuppliers={5} // Mock value
      />

      {lowStockProducts.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              {lowStockProducts.length} produto(s) com estoque baixo
            </span>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{product.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{product.quantity}</span>
                        <span className="text-sm text-muted-foreground">unidades</span>
                      </div>
                      <p className={`text-sm ${
                        product.quantity < product.minQuantity ? "text-red-500" : "text-muted-foreground"
                      }`}>
                        Mínimo: {product.minQuantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movimentacoes">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                O histórico de movimentações estará disponível em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fornecedores">
          <Card>
            <CardHeader>
              <CardTitle>Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                O módulo de fornecedores estará disponível em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductForm
        open={isNewProductOpen}
        onOpenChange={setIsNewProductOpen}
        onSubmit={handleProductSubmit}
        product={selectedProduct}
      />

      <StockMovementForm
        open={isEntradaOpen}
        onOpenChange={setIsEntradaOpen}
        type="entrada"
      />

      <StockMovementForm
        open={isSaidaOpen}
        onOpenChange={setIsSaidaOpen}
        type="saida"
      />
    </div>
  );
};

export default Estoque;
