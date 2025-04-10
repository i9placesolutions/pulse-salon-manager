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
  TrendingUp,
  Settings,
  Calendar,
  Download,
  X,
  FileSpreadsheet,
  BarChart3
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

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

const mockProfessionals = [
  { id: 1, name: "João Silva" },
  { id: 2, name: "Maria Santos" },
  { id: 3, name: "Pedro Oliveira" },
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
  
  // Estados para filtros de data e modais de relatórios
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isProdutoReportOpen, setIsProdutoReportOpen] = useState(false);
  const [isMovimentacaoReportOpen, setIsMovimentacaoReportOpen] = useState(false);
  const [isFornecedorReportOpen, setIsFornecedorReportOpen] = useState(false);
  const [produtoReportFormat, setProdutoReportFormat] = useState("pdf");
  const [movimentacaoReportFormat, setMovimentacaoReportFormat] = useState("pdf");
  const [fornecedorReportFormat, setFornecedorReportFormat] = useState("pdf");
  // Estado para filtros específicos de cada relatório
  const [produtoFilters, setProdutoFilters] = useState({
    includeQuantity: true,
    includePrice: true,
    includeCategory: true
  });
  const [movimentacaoFilters, setMovimentacaoFilters] = useState({
    includeIn: true,
    includeOut: true,
    includeSupplier: true
  });
  const [fornecedorFilters, setFornecedorFilters] = useState({
    includeActive: true,
    includeInactive: false,
    includeContact: true
  });
  
  // Estado para o modal principal de relatórios
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('all');
  const [reportType, setReportType] = useState('complete');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({from: undefined, to: undefined});
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [fileName, setFileName] = useState("Relatório de Estoque");

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

  const handleCommissionUpdate = (
    productId: number,
    commissions: { professionalId: number; type: 'fixed' | 'percentage'; value: number }[]
  ) => {
    toast({
      title: "Comissões atualizadas",
      description: "As comissões do produto foram atualizadas com sucesso!",
    });
  };

  const exportProdutoReport = () => {
    toast({
      title: "Relatório de Produtos exportado",
      description: `Relatório exportado como ${produtoReportFormat.toUpperCase()}! Período: ${startDate} a ${endDate}`,
    });
    setIsProdutoReportOpen(false);
  };

  const exportMovimentacaoReport = () => {
    toast({
      title: "Relatório de Movimentações exportado",
      description: `Relatório exportado como ${movimentacaoReportFormat.toUpperCase()}! Período: ${startDate} a ${endDate}`,
    });
    setIsMovimentacaoReportOpen(false);
  };

  const exportFornecedorReport = () => {
    toast({
      title: "Relatório de Fornecedores exportado",
      description: `Relatório exportado como ${fornecedorReportFormat.toUpperCase()}! Período: ${startDate} a ${endDate}`,
    });
    setIsFornecedorReportOpen(false);
  };

  const handleDateChange = (type: "from" | "to", value: string) => {
    if (value) {
      setDateRange((prev) => ({
        ...prev,
        [type]: new Date(value),
      }));
    } else {
      setDateRange((prev) => ({
        ...prev,
        [type]: undefined,
      }));
    }
  };

  // Função para gerar e baixar relatório em Excel
  const downloadExcel = () => {
    // Simular a geração do Excel
    setTimeout(() => {
      // Criar elemento de link para download
      const link = document.createElement('a');
      
      // URL de dados simulado para o Excel (em produção, isso seria gerado pela biblioteca de Excel)
      // No ambiente real, você usaria uma biblioteca como ExcelJS para gerar o arquivo real
      const blob = new Blob([
        // Aqui você colocaria os dados reais do Excel
        // Este é apenas um placeholder para simular o download
        `Relatório de Estoque\n
        Gerado em: ${new Date().toLocaleDateString()}\n
        Categoria: ${reportCategory}\n
        Tipo: ${reportType}\n
        Período: ${selectedPeriod === 'all' ? 'Todo Período' : 
          `${dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : ''} até ${dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : ''}`}\n
        Produtos:\n
        ID\tNome\tCategoria\tQuantidade\tPreço\n
        ${mockProducts.map(p => `${p.id}\t${p.name}\t${p.category}\t${p.quantity}\t${p.salePrice}`).join('\n')}`
      ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileName.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  // Função para gerar e baixar relatório em PDF
  const downloadPDF = () => {
    // Simular a geração do PDF
    setTimeout(() => {
      // Criar elemento de link para download
      const link = document.createElement('a');
      
      // Aqui você usaria uma biblioteca como jsPDF para gerar o PDF real
      // Este é apenas um placeholder para simular o download
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Estoque</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { margin-bottom: 20px; }
          .info { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <h1>Relatório de Estoque</h1>
        
        <div class="header">
          <p class="info"><strong>Gerado em:</strong> ${new Date().toLocaleDateString()}</p>
          <p class="info"><strong>Categoria:</strong> ${reportCategory === 'all' ? 'Geral' : 
            reportCategory === 'products' ? 'Produtos' : 
            reportCategory === 'movement' ? 'Movimentações' : 
            reportCategory === 'suppliers' ? 'Fornecedores' : 'Produtos Populares'}</p>
          <p class="info"><strong>Tipo:</strong> ${reportType === 'complete' ? 'Completo' : 
            reportType === 'summary' ? 'Resumo' : 'Detalhado'}</p>
          <p class="info"><strong>Período:</strong> ${selectedPeriod === 'all' ? 'Todo Período' : 
            `${dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : ''} até ${dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : ''}`}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Preço de Venda</th>
              <th>Preço de Compra</th>
            </tr>
          </thead>
          <tbody>
            ${mockProducts.map(p => `
              <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.quantity}</td>
                <td>R$ ${p.salePrice.toFixed(2)}</td>
                <td>R$ ${p.purchasePrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileName.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulação de progresso de exportação
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // Simulação de tempo para concluir a exportação
    setTimeout(() => {
      clearInterval(interval);
      setExportProgress(100);
      
      setTimeout(() => {
        if (exportFormat === 'excel') {
          downloadExcel();
        } else {
          downloadPDF();
        }
        
        setIsExporting(false);
        setReportModalOpen(false);
        
        toast({
          title: "Relatório gerado com sucesso",
          description: `O relatório de estoque foi exportado no formato ${exportFormat === 'excel' ? 'Excel' : 'PDF'}.`,
        });
      }, 500);
    }, 3000);
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
          totalProducts={products.length}
          inStockProducts={products.filter(p => p.quantity > 0).length}
          lowStockProducts={products.filter(p => p.quantity < p.minQuantity).length}
          topSellingProducts={5}
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
          <Button 
            variant="dashboard-outline" 
            size="sm" 
            onClick={() => setReportModalOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Relatórios
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
          <TabsTrigger 
            value="relatorios" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white rounded"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
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
                suppliers={mockSuppliers.filter(supplier => 
                  supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  supplier.document.includes(searchTerm)
                )} 
                onEdit={(supplier) => setSelectedSupplier(supplier)}
                onDelete={(id) => toast({
                  title: "Fornecedor removido",
                  description: "O fornecedor foi removido com sucesso."
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo Dashboard/Relatórios */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card className="border-purple-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-100 via-purple-50 to-fuchsia-100 rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-2 rounded-full shadow-md">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-purple-800 font-bold">Análise de Estoque</CardTitle>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="dashboard-outline" 
                    size="sm" 
                    onClick={() => setIsProdutoReportOpen(true)}
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <EstoqueCharts
                  products={products}
                  movements={mockMovements}
                />
              </div>
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

      <FornecedorForm
        open={isNewSupplierOpen}
        onOpenChange={setIsNewSupplierOpen}
        onSubmit={handleSupplierSubmit}
        supplier={selectedSupplier}
      />

      {/* Modais de Relatórios */}
      <Dialog open={isProdutoReportOpen} onOpenChange={setIsProdutoReportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Relatório de Produtos</DialogTitle>
            <DialogDescription>
              Configure as opções para exportar o relatório de produtos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="modalStartDate" className="text-sm font-medium">Data inicial</label>
                <Input 
                  id="modalStartDate" 
                  type="date" 
                  className="w-full" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="modalEndDate" className="text-sm font-medium">Data final</label>
                <Input 
                  id="modalEndDate" 
                  type="date" 
                  className="w-full" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Incluir no relatório</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeQuantity" 
                    checked={produtoFilters.includeQuantity}
                    onCheckedChange={(checked) => 
                      setProdutoFilters({...produtoFilters, includeQuantity: !!checked})
                    }
                  />
                  <Label htmlFor="includeQuantity">Quantidade em estoque</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includePrice" 
                    checked={produtoFilters.includePrice}
                    onCheckedChange={(checked) => 
                      setProdutoFilters({...produtoFilters, includePrice: !!checked})
                    }
                  />
                  <Label htmlFor="includePrice">Preços de compra e venda</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCategory" 
                    checked={produtoFilters.includeCategory}
                    onCheckedChange={(checked) => 
                      setProdutoFilters({...produtoFilters, includeCategory: !!checked})
                    }
                  />
                  <Label htmlFor="includeCategory">Categoria</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Formato do Relatório</label>
              <Select value={produtoReportFormat} onValueChange={setProdutoReportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={exportProdutoReport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMovimentacaoReportOpen} onOpenChange={setIsMovimentacaoReportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Relatório de Movimentações</DialogTitle>
            <DialogDescription>
              Configure as opções para exportar o relatório de movimentações.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="movStartDate" className="text-sm font-medium">Data inicial</label>
                <Input 
                  id="movStartDate" 
                  type="date" 
                  className="w-full" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="movEndDate" className="text-sm font-medium">Data final</label>
                <Input 
                  id="movEndDate" 
                  type="date" 
                  className="w-full" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de movimentação</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeIn" 
                    checked={movimentacaoFilters.includeIn}
                    onCheckedChange={(checked) => 
                      setMovimentacaoFilters({...movimentacaoFilters, includeIn: !!checked})
                    }
                  />
                  <Label htmlFor="includeIn">Entradas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeOut" 
                    checked={movimentacaoFilters.includeOut}
                    onCheckedChange={(checked) => 
                      setMovimentacaoFilters({...movimentacaoFilters, includeOut: !!checked})
                    }
                  />
                  <Label htmlFor="includeOut">Saídas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeSupplier" 
                    checked={movimentacaoFilters.includeSupplier}
                    onCheckedChange={(checked) => 
                      setMovimentacaoFilters({...movimentacaoFilters, includeSupplier: !!checked})
                    }
                  />
                  <Label htmlFor="includeSupplier">Incluir fornecedor</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Formato do Relatório</label>
              <Select value={movimentacaoReportFormat} onValueChange={setMovimentacaoReportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={exportMovimentacaoReport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFornecedorReportOpen} onOpenChange={setIsFornecedorReportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Relatório de Fornecedores</DialogTitle>
            <DialogDescription>
              Configure as opções para exportar o relatório de fornecedores.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="fornStartDate" className="text-sm font-medium">Data inicial</label>
                <Input 
                  id="fornStartDate" 
                  type="date" 
                  className="w-full" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="fornEndDate" className="text-sm font-medium">Data final</label>
                <Input 
                  id="fornEndDate" 
                  type="date" 
                  className="w-full" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status do fornecedor</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeActive" 
                    checked={fornecedorFilters.includeActive}
                    onCheckedChange={(checked) => 
                      setFornecedorFilters({...fornecedorFilters, includeActive: !!checked})
                    }
                  />
                  <Label htmlFor="includeActive">Ativos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeInactive" 
                    checked={fornecedorFilters.includeInactive}
                    onCheckedChange={(checked) => 
                      setFornecedorFilters({...fornecedorFilters, includeInactive: !!checked})
                    }
                  />
                  <Label htmlFor="includeInactive">Inativos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeContact" 
                    checked={fornecedorFilters.includeContact}
                    onCheckedChange={(checked) => 
                      setFornecedorFilters({...fornecedorFilters, includeContact: !!checked})
                    }
                  />
                  <Label htmlFor="includeContact">Incluir informações de contato</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Formato do Relatório</label>
              <Select value={fornecedorReportFormat} onValueChange={setFornecedorReportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={exportFornecedorReport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Relatórios de Estoque */}
      <Sheet open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
          {/* Cabeçalho fixo */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
            <SheetHeader className="p-6">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-white" />
                  Relatórios de Estoque
                </SheetTitle>
                <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fechar</span>
                </SheetClose>
              </div>
              <SheetDescription className="text-blue-100">
                Configure o relatório e clique em "Gerar" para exportar
              </SheetDescription>
            </SheetHeader>
          </div>
          
          {/* Conteúdo rolável */}
          <div className="flex-1 overflow-y-auto bg-white">
            {isExporting ? (
              <div className="py-12 space-y-6 px-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md">
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-center mt-4 text-sm text-muted-foreground">
                    Preparando relatório... {exportProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-6">
                  {/* Categoria de Relatório */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Categoria de Relatório</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'all' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('all')}
                      >
                        <Package className="h-6 w-6 text-blue-600 mb-1" />
                        <span className="text-xs font-medium text-center">Geral</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'products' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('products')}
                      >
                        <Package className="h-6 w-6 text-green-600 mb-1" />
                        <span className="text-xs font-medium text-center">Produtos</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'movement' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('movement')}
                      >
                        <ArrowUpCircle className="h-6 w-6 text-orange-600 mb-1" />
                        <span className="text-xs font-medium text-center">Movimentações</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'suppliers' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('suppliers')}
                      >
                        <TrendingUp className="h-6 w-6 text-purple-600 mb-1" />
                        <span className="text-xs font-medium text-center">Fornecedores</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'popular' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('popular')}
                      >
                        <BarChart3 className="h-6 w-6 text-red-600 mb-1" />
                        <span className="text-xs font-medium text-center">Produtos Populares</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tipo de Relatório */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Tipo de Relatório</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div 
                        className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${reportType === 'complete' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportType('complete')}
                      >
                        <FileSpreadsheet className="h-8 w-8 text-blue-600 mb-2" />
                        <span className="text-sm font-medium">Relatório Completo</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${reportType === 'summary' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportType('summary')}
                      >
                        <FileText className="h-8 w-8 text-green-600 mb-2" />
                        <span className="text-sm font-medium">Resumo</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${reportType === 'detailed' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportType('detailed')}
                      >
                        <FileText className="h-8 w-8 text-red-600 mb-2" />
                        <span className="text-sm font-medium">Detalhado</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Período */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Período</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${selectedPeriod === 'all' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                          onClick={() => setSelectedPeriod('all')}
                        >
                          <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                          <span className="text-sm font-medium">Todo Período</span>
                          <p className="text-xs text-muted-foreground mt-1">Incluir todos os dados disponíveis</p>
                        </div>
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${selectedPeriod === 'custom' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                          onClick={() => setSelectedPeriod('custom')}
                        >
                          <Calendar className="h-8 w-8 text-orange-500 mb-2" />
                          <span className="text-sm font-medium">Personalizado</span>
                          <p className="text-xs text-muted-foreground mt-1">Selecionar datas específicas</p>
                        </div>
                      </div>
                      
                      {/* Seção de data personalizada */}
                      {selectedPeriod === "custom" && (
                        <div className="mt-4 p-4 border rounded-md bg-white">
                          <h4 className="text-sm font-medium mb-3">Selecione o intervalo de datas:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Data inicial */}
                            <div className="space-y-2">
                              <Label htmlFor="date-from">Data Inicial</Label>
                              <Input
                                id="date-from"
                                type="date"
                                value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                                onChange={(e) => handleDateChange("from", e.target.value)}
                                className="w-full"
                              />
                            </div>
                            
                            {/* Data final */}
                            <div className="space-y-2">
                              <Label htmlFor="date-to">Data Final</Label>
                              <Input
                                id="date-to"
                                type="date"
                                value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                                onChange={(e) => handleDateChange("to", e.target.value)}
                                className="w-full"
                                min={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
                              />
                            </div>
                          </div>
                          
                          {/* Mensagem informativa sobre o intervalo de datas */}
                          {dateRange.from && dateRange.to && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                              <p className="text-sm text-blue-800 flex items-center">
                                <Calendar className="h-3 w-3 mr-1 inline" />
                                <span>
                                  Período: {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} até {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </p>
                            </div>
                          )}
                          
                          {/* Botão para limpar o intervalo de datas */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs mt-3"
                            onClick={() => setDateRange({ from: undefined, to: undefined })}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Limpar datas
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Formato de Saída */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Formato de Saída</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary ${exportFormat === 'excel' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setExportFormat('excel')}
                      >
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                          <div>
                            <h4 className="font-medium">Excel (.xlsx)</h4>
                            <p className="text-xs text-muted-foreground">Planilha para análises detalhadas</p>
                          </div>
                        </div>
                      </div>
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary ${exportFormat === 'pdf' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setExportFormat('pdf')}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-[#db2777]" />
                          <div>
                            <h4 className="font-medium">PDF (.pdf)</h4>
                            <p className="text-xs text-muted-foreground">Documento para impressão e apresentação</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filtros Adicionais */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Filtros Adicionais</h3>
                    <div className="space-y-4">
                      {/* Produtos que mais saem */}
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mostSoldProducts" defaultChecked />
                        <Label htmlFor="mostSoldProducts">Incluir produtos que mais saem</Label>
                      </div>
                      
                      {/* Fornecedores */}
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeSuppliers" defaultChecked />
                        <Label htmlFor="includeSuppliers">Incluir dados de fornecedores</Label>
                      </div>
                      
                      {/* Informações de compra */}
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includePurchaseInfo" defaultChecked />
                        <Label htmlFor="includePurchaseInfo">Incluir informações de compra</Label>
                      </div>
                      
                      {/* Informações de venda */}
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeSaleInfo" defaultChecked />
                        <Label htmlFor="includeSaleInfo">Incluir informações de venda</Label>
                      </div>
                      
                      {/* Gráficos e análises */}
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeAnalytics" defaultChecked />
                        <Label htmlFor="includeAnalytics">Incluir gráficos e análises</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Nome do Arquivo */}
                  <div className="space-y-2">
                    <Label>Nome do Arquivo</Label>
                    <Input 
                      placeholder="Relatório de Estoque" 
                      defaultValue="Relatório de Estoque"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Rodapé fixo */}
          <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
            <div className="flex flex-row gap-3 w-full justify-end">
              <Button variant="outline" onClick={() => setReportModalOpen(false)}>
                Cancelar
              </Button>
              {!isExporting && (
                <Button 
                  onClick={handleExportReport}
                  variant="pink"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Estoque;
