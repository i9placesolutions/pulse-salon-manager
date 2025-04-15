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
  TrendingUp,
  Settings,
  X
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Product, StockMovement, Supplier } from "@/types/stock";
import { useToast } from "@/hooks/use-toast";
import { EstoqueMetrics } from "@/components/estoque/EstoqueMetrics";
import { ProductForm } from "@/components/estoque/ProductForm";
import { StockMovementForm } from "@/components/estoque/StockMovementForm";
import { FornecedorList } from "@/components/estoque/FornecedorList";
import { FornecedorForm } from "@/components/estoque/FornecedorForm";
import { CommissionDialog } from "@/components/estoque/CommissionDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useStockManagement } from "@/hooks/useStockManagement";

// Lista de profissionais para comissões - pode vir do banco de dados no futuro
const mockProfessionals = [
  { id: 1, name: "João Silva" },
  { id: 2, name: "Maria Santos" },
  { id: 3, name: "Pedro Oliveira" },
];

const Estoque = () => {
  const {
    products,
    suppliers,
    stockMovements,
    metrics,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    registerStockMovement
  } = useStockManagement();
  
  const [searchTerm, setSearchTerm] = useState("");
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
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockProducts = products.filter(
    product => product.quantity < product.minQuantity
  );

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsNewProductOpen(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId);
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleProductSubmit = async (product: Partial<Product>) => {
    try {
      if (selectedProduct) {
        await updateProduct({ ...selectedProduct, ...product } as Product);
        setSelectedProduct(undefined);
        setIsNewProductOpen(false);
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso!",
        });
      } else {
        await addProduct(product as Omit<Product, "id">);
        setIsNewProductOpen(false);
        toast({
          title: "Produto cadastrado",
          description: "O novo produto foi cadastrado com sucesso!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSupplierSubmit = async (supplier: Partial<Supplier>) => {
    try {
      if (selectedSupplier) {
        await updateSupplier({ ...selectedSupplier, ...supplier } as Supplier);
        setSelectedSupplier(undefined);
        setIsNewSupplierOpen(false);
        toast({
          title: "Fornecedor atualizado",
          description: "O fornecedor foi atualizado com sucesso!",
        });
      } else {
        await addSupplier(supplier as Omit<Supplier, "id">);
        setIsNewSupplierOpen(false);
        toast({
          title: "Fornecedor cadastrado",
          description: "O novo fornecedor foi cadastrado com sucesso!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header e Métricas */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-800">
              Estoque
            </h1>
            <p className="text-sm text-blue-700/70">
              Gerencie produtos, fornecedores e controle seu estoque
            </p>
          </div>
        </div>
        
        <EstoqueMetrics 
          totalProducts={metrics.totalProducts}
          inStockProducts={metrics.inStockProducts}
          lowStockProducts={metrics.lowStockProducts}
          topSellingProducts={metrics.topSellingProducts?.length || 0}
        />
      </div>

      {/* Ações rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="dashboard" 
            size="sm" 
            onClick={() => setIsNewProductOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
          <Button 
            variant="dashboard-outline" 
            size="sm" 
            onClick={() => setIsEntradaOpen(true)}
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Entrada
          </Button>
          <Button 
            variant="dashboard-outline" 
            size="sm" 
            onClick={() => setIsSaidaOpen(true)}
          >
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Saída
          </Button>
        </div>
        
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar produtos, fornecedores..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs e Conteúdo Principal */}
      <Tabs 
        defaultValue="produtos" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 border border-blue-200 p-1 rounded-lg">
          <TabsTrigger 
            value="produtos" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded"
          >
            <Package className="mr-2 h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger 
            value="fornecedores" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Fornecedores
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo Produtos */}
        <TabsContent value="produtos" className="space-y-4">
          <Card className="border-blue-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-100 via-blue-50 to-indigo-100 rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-full shadow-md">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-indigo-800 font-bold">Lista de Produtos</CardTitle>
                </div>
                
                {/* Alertas para produtos com estoque baixo */}
                {products.some(p => p.quantity < p.minQuantity) && (
                  <div className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-sm">
                    <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
                    {products.filter(p => p.quantity < p.minQuantity).length} produtos com estoque baixo
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      <th className="text-xs font-medium text-indigo-800 uppercase tracking-wider py-3 px-4 text-left">Produto</th>
                      <th className="text-xs font-medium text-indigo-800 uppercase tracking-wider py-3 px-4 text-left">Categoria</th>
                      <th className="text-xs font-medium text-indigo-800 uppercase tracking-wider py-3 px-4 text-right">Estoque</th>
                      <th className="text-xs font-medium text-indigo-800 uppercase tracking-wider py-3 px-4 text-right">Mínimo</th>
                      <th className="text-xs font-medium text-indigo-800 uppercase tracking-wider py-3 px-4 text-right">Preço Compra</th>
                      <th className="text-xs font-medium text-indigo-800 uppercase tracking-wider py-3 px-4 text-right">Preço Venda</th>
                      <th className="text-xs font-medium text-indigo-800 uppercase tracking-wider py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {products
                      .filter(product => 
                        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        product.category.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((product, idx) => (
                        <tr key={product.id} className={idx % 2 === 0 ? "bg-white hover:bg-blue-50/60" : "bg-gradient-to-r from-blue-50/30 to-indigo-50/30 hover:bg-blue-50/80"}>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-indigo-800">{product.name}</div>
                              <div className="text-xs text-blue-600">{product.description}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-medium px-2 py-1 rounded-md ${
                              product.quantity < product.minQuantity 
                                ? 'bg-red-50 text-red-700 border border-red-200' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {product.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-indigo-700">{product.minQuantity}</td>
                          <td className="py-4 px-4 text-right font-medium text-blue-700">{formatCurrency(product.purchasePrice)}</td>
                          <td className="py-4 px-4 text-right font-medium text-emerald-700">{formatCurrency(product.salePrice)}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="dashboard-ghost" size="sm" onClick={() => handleEditProduct(product)} className="hover:bg-blue-100">
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button variant="dashboard-ghost" size="sm" onClick={() => setSelectedProduct(product)} className="hover:bg-indigo-100">
                                <Settings className="h-4 w-4 text-indigo-600" />
                              </Button>
                              <Button variant="dashboard-ghost" size="sm" onClick={() => handleDeleteProduct(product.id)} className="hover:bg-red-100">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo Fornecedores */}
        <TabsContent value="fornecedores" className="space-y-4">
          <Card className="border-emerald-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-full shadow-md">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-emerald-800 font-bold">Fornecedores</CardTitle>
                </div>
                <Button 
                  variant="dashboard-outline" 
                  size="sm" 
                  onClick={() => setIsNewSupplierOpen(true)}
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Fornecedor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FornecedorList 
                suppliers={suppliers.filter(supplier => 
                  supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (supplier.document && supplier.document.includes(searchTerm))
                )} 
                onEdit={(supplier) => setSelectedSupplier(supplier)}
                onDelete={async (id) => {
                  try {
                    await deleteSupplier(id);
                    toast({
                      title: "Fornecedor removido",
                      description: "O fornecedor foi removido com sucesso."
                    });
                  } catch (error: any) {
                    toast({
                      title: "Erro ao remover fornecedor",
                      description: error.message,
                      variant: "destructive"
                    });
                  }
                }}
              />
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
        onSubmit={(movement) => {
          registerStockMovement({
            ...movement,
            type: "in"
          });
          setIsEntradaOpen(false);
          toast({
            title: "Entrada registrada",
            description: `${movement.quantity} unidades foram adicionadas ao estoque.`
          });
        }}
      />

      <StockMovementForm
        open={isSaidaOpen}
        onOpenChange={setIsSaidaOpen}
        type="saida"
        onSubmit={(movement) => {
          registerStockMovement({
            ...movement,
            type: "out"
          });
          setIsSaidaOpen(false);
          toast({
            title: "Saída registrada",
            description: `${movement.quantity} unidades foram retiradas do estoque.`
          });
        }}
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
