
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
  FileText,
  TrendingUp
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Product, StockMovement, Supplier } from "@/types/stock";
import { useToast } from "@/hooks/use-toast";
import { EstoqueMetrics } from "@/components/estoque/EstoqueMetrics";
import { ProductForm } from "@/components/estoque/ProductForm";
import { StockMovementForm } from "@/components/estoque/StockMovementForm";
import { FornecedorList } from "@/components/estoque/FornecedorList";
import { FornecedorForm } from "@/components/estoque/FornecedorForm";
import { EstoqueCharts } from "@/components/estoque/EstoqueCharts";

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Shampoo Professional",
    description: "Shampoo para cabelos normais",
    barcode: "7891234567890",
    category: "Cabelo",
    measurementUnit: "unit",
    supplierId: 1,
    purchasePrice: 30.90,
    salePrice: 45.90,
    quantity: 15,
    minQuantity: 20,
    lastUpdated: "2024-03-07",
    commission: {
      type: "percentage",
      defaultValue: 10
    }
  },
  {
    id: 2,
    name: "Condicionador Hidratante",
    description: "Condicionador para cabelos secos",
    category: "Cabelo",
    measurementUnit: "unit",
    supplierId: 1,
    purchasePrice: 25.90,
    salePrice: 39.90,
    quantity: 25,
    minQuantity: 15,
    lastUpdated: "2024-03-07",
    commission: {
      type: "percentage",
      defaultValue: 10
    }
  },
  {
    id: 3,
    name: "Máscara Capilar",
    description: "Máscara de tratamento intensivo",
    category: "Tratamento",
    measurementUnit: "grams",
    measurementValue: 500,
    supplierId: 2,
    purchasePrice: 40.90,
    salePrice: 59.90,
    quantity: 8,
    minQuantity: 10,
    lastUpdated: "2024-03-06",
    commission: {
      type: "percentage",
      defaultValue: 12
    }
  }
];

const mockMovements: StockMovement[] = [
  {
    id: 1,
    productId: 1,
    type: "in",
    quantity: 50,
    date: "2024-03-07",
    supplierId: 1,
    unitCost: 25.90,
    totalCost: 1295.00,
    invoiceNumber: "NF-001"
  },
  {
    id: 2,
    productId: 1,
    type: "out",
    quantity: 5,
    date: "2024-03-07",
    reason: "sale"
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Distribuidora Beauty",
    document: "12.345.678/0001-90",
    phone: "(11) 99999-9999",
    email: "contato@beauty.com",
    address: "Rua das Flores, 123",
    status: "active"
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
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
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

  const handleSupplierSubmit = (supplier: Partial<Supplier>) => {
    toast({
      title: selectedSupplier ? "Fornecedor atualizado" : "Fornecedor cadastrado",
      description: selectedSupplier
        ? "O fornecedor foi atualizado com sucesso!"
        : "O novo fornecedor foi cadastrado com sucesso!",
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
        topSellingProducts={5}
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
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
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
                        <span className="text-sm font-medium">{formatCurrency(product.salePrice)}</span>
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

        <TabsContent value="movimentacoes" className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setIsEntradaOpen(true)}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Nova Entrada
            </Button>
            <Button variant="outline" onClick={() => setIsSaidaOpen(true)}>
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Nova Saída
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {movement.type === "in" ? "Entrada" : "Saída"} de Estoque
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {movement.quantity} unidades •{" "}
                      {new Date(movement.date).toLocaleDateString()}
                    </p>
                  </div>
                  {movement.type === "in" && (
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(movement.totalCost || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        NF: {movement.invoiceNumber}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-4">
          <Button onClick={() => setIsNewSupplierOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>

          <FornecedorList
            suppliers={mockSuppliers}
            onEdit={(supplier) => {
              setSelectedSupplier(supplier);
              setIsNewSupplierOpen(true);
            }}
            onDelete={(id) =>
              toast({
                title: "Fornecedor excluído",
                description: "O fornecedor foi excluído com sucesso!",
              })
            }
          />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <EstoqueCharts products={products} movements={mockMovements} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Relatórios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    toast({
                      title: "Relatório exportado",
                      description: "O relatório foi exportado com sucesso!",
                    })
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório de Produtos
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    toast({
                      title: "Relatório exportado",
                      description: "O relatório foi exportado com sucesso!",
                    })
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório de Movimentações
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    toast({
                      title: "Relatório exportado",
                      description: "O relatório foi exportado com sucesso!",
                    })
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório de Fornecedores
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Desempenho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Valor total em estoque
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      products.reduce(
                        (total, product) =>
                          total + product.purchasePrice * product.quantity,
                        0
                      )
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Produtos com estoque crítico
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      products.filter(
                        (product) => product.quantity < product.minQuantity
                      ).length
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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

      <FornecedorForm
        open={isNewSupplierOpen}
        onOpenChange={setIsNewSupplierOpen}
        onSubmit={handleSupplierSubmit}
        supplier={selectedSupplier}
      />
    </div>
  );
};

export default Estoque;
