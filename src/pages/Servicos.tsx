import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Clock,
  Download,
  Package,
  FileSpreadsheet,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Info,
  Calendar
} from "lucide-react";
import { Service, ServicePackage } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
import { ServiceForm } from "@/components/servicos/ServiceForm";
import { ServicePackageForm } from "@/components/servicos/ServicePackageForm";
import { ServiceMetrics } from "@/components/servicos/ServiceMetrics";
import { ServiceCharts } from "@/components/servicos/ServiceCharts";
import { formatCurrency } from "@/utils/currency";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { exportData } from "@/utils/export";

// Interface para dados de desempenho adicionais
interface PerformanceData {
  appointmentsLastMonth: number;
  rating: number;
  popularityRank: number;
  avgDuration: number;
  priceHistory: { date: string; price: number }[];
  trend: 'up' | 'down' | 'stable';
}

// Estendendo a interface Service para incluir dados extras
interface ExtendedService extends Service {
  performanceData?: PerformanceData;
}

// Mock Services com dados adicionais para métricas de desempenho
const mockServices: ExtendedService[] = [
  {
    id: 1,
    name: "Corte Feminino",
    description: "Corte feminino tradicional",
    category: "Corte",
    duration: 60,
    price: 80,
    status: "active",
    commission: {
      type: "percentage",
      value: 50,
    },
    professionals: [1, 2],
    products: [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 1 },
    ],
    performanceData: {
      appointmentsLastMonth: 45,
      rating: 4.8,
      popularityRank: 1,
      avgDuration: 55, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 75 },
        { date: "2024-02-15", price: 80 },
      ],
      trend: "up",
    }
  },
  {
    id: 2,
    name: "Coloração",
    description: "Coloração completa",
    category: "Tintura",
    duration: 120,
    price: 150,
    status: "active",
    commission: {
      type: "percentage",
      value: 40,
    },
    professionals: [1, 3],
    products: [
      { productId: 3, quantity: 1 },
      { productId: 4, quantity: 2 },
    ],
    performanceData: {
      appointmentsLastMonth: 32,
      rating: 4.6,
      popularityRank: 2,
      avgDuration: 125, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 140 },
        { date: "2024-03-01", price: 150 },
      ],
      trend: "stable",
    }
  },
  {
    id: 3,
    name: "Manicure",
    description: "Esmaltação simples",
    category: "Manicure",
    duration: 45,
    price: 50,
    status: "active",
    commission: {
      type: "percentage",
      value: 60,
    },
    professionals: [3],
    products: [
      { productId: 5, quantity: 1 },
    ],
    performanceData: {
      appointmentsLastMonth: 28,
      rating: 4.3,
      popularityRank: 3,
      avgDuration: 40, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 45 },
        { date: "2024-02-01", price: 50 },
      ],
      trend: "up",
    }
  },
  {
    id: 4,
    name: "Hidratação Profunda",
    description: "Tratamento intensivo para cabelos danificados",
    category: "Tratamento",
    duration: 90,
    price: 120,
    status: "active",
    commission: {
      type: "percentage",
      value: 45,
    },
    professionals: [1, 2],
    products: [
      { productId: 6, quantity: 1 },
      { productId: 7, quantity: 1 },
    ],
    performanceData: {
      appointmentsLastMonth: 15,
      rating: 4.9,
      popularityRank: 4,
      avgDuration: 85, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 110 },
        { date: "2024-03-15", price: 120 },
      ],
      trend: "up",
    }
  },
  {
    id: 5,
    name: "Limpeza de Pele",
    description: "Limpeza facial profunda",
    category: "Estética",
    duration: 60,
    price: 140,
    status: "active",
    commission: {
      type: "fixed",
      value: 50,
    },
    professionals: [3],
    products: [
      { productId: 8, quantity: 1 },
    ],
    performanceData: {
      appointmentsLastMonth: 8,
      rating: 4.7,
      popularityRank: 5,
      avgDuration: 65, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 130 },
        { date: "2024-02-01", price: 140 },
      ],
      trend: "down",
    }
  },
];

const mockProfessionals = [
  { id: 1, name: "Ana Silva" },
  { id: 2, name: "João Santos" },
  { id: 3, name: "Maria Oliveira" },
];

export default function Servicos() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ExtendedService | undefined>();
  const [filteredServices, setFilteredServices] = useState<ExtendedService[]>(mockServices);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>("");
  const [popularityFilter, setPopularityFilter] = useState<string>("");
  const [isExportPopoverOpen, setIsExportPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("services");

  const mockMetrics = {
    totalServices: mockServices.length,
    activeServices: mockServices.filter((s) => s.status === "active").length,
    totalProfessionals: 5,
    totalPackages: 3,
  };

  useEffect(() => {
    filterServices();
  }, [searchTerm, selectedCategory, statusFilter, priceRangeFilter, popularityFilter]);

  const filterServices = () => {
    let filtered = [...mockServices];

    // Filtro de busca textual
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filtro por status
    if (statusFilter) {
      filtered = filtered.filter(service => service.status === statusFilter);
    }

    // Filtro por faixa de preço
    if (priceRangeFilter) {
      switch (priceRangeFilter) {
        case "lt50":
          filtered = filtered.filter(service => service.price < 50);
          break;
        case "50-100":
          filtered = filtered.filter(service => service.price >= 50 && service.price <= 100);
          break;
        case "100-200":
          filtered = filtered.filter(service => service.price > 100 && service.price <= 200);
          break;
        case "gt200":
          filtered = filtered.filter(service => service.price > 200);
          break;
      }
    }
    
    // Filtro por popularidade
    if (popularityFilter) {
      switch (popularityFilter) {
        case "high":
          filtered = filtered.filter(service => 
            service.performanceData && service.performanceData.popularityRank <= 2);
          break;
        case "medium":
          filtered = filtered.filter(service => 
            service.performanceData && service.performanceData.popularityRank > 2 
            && service.performanceData.popularityRank <= 4);
          break;
        case "low":
          filtered = filtered.filter(service => 
            service.performanceData && service.performanceData.popularityRank > 4);
          break;
      }
    }

    setFilteredServices(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setStatusFilter("");
    setPriceRangeFilter("");
    setPopularityFilter("");
    setFilteredServices(mockServices);
  };

  const handleServiceSubmit = (service: Partial<Service>) => {
    console.log("Service submitted:", service);
    toast({
      title: selectedService ? "Serviço atualizado" : "Serviço criado",
      description: "As alterações foram salvas com sucesso!",
    });
  };

  const handlePackageSubmit = (pkg: Partial<ServicePackage>) => {
    console.log("Package submitted:", pkg);
    toast({
      title: "Pacote criado",
      description: "O pacote foi criado com sucesso!",
    });
  };

  const handleEditService = (service: ExtendedService) => {
    setSelectedService(service);
    setIsServiceFormOpen(true);
  };

  const handleDeleteService = (serviceId: number) => {
    toast({
      title: "Serviço excluído",
      description: "O serviço foi excluído com sucesso!",
    });
  };

  const handleExportServices = (format: "excel" | "csv") => {
    // Fecha o popover
    setIsExportPopoverOpen(false);
    
    try {
      // Mostra um toast informando que a exportação está começando
      toast({
        title: "Exportando serviços",
        description: "Preparando o arquivo para download...",
      });
      
      // Preparar dados para exportação
      const dataToExport = filteredServices.map(service => ({
        ID: service.id,
        Nome: service.name,
        Categoria: service.category,
        Preco: service.price, // Valor numérico para melhor exportação
        PrecoFormatado: formatCurrency(service.price),
        Duracao: service.duration,
        DuracaoFormatada: `${service.duration} min`,
        Status: service.status === 'active' ? 'Ativo' : 'Inativo',
        Atendimentos: service.performanceData?.appointmentsLastMonth || 0,
        Avaliacao: service.performanceData?.rating || 0
      }));
      
      // Chama a função de exportação
      exportData(dataToExport, format, 'servicos');
      
      // Mostra um toast de sucesso
      toast({
        title: `Serviços exportados para ${format.toUpperCase()}`,
        description: `A lista de serviços foi exportada com sucesso!`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os serviços. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Função para obter o ícone de tendência
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart2 className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  // Função para formatar o último ajuste de preço
  const getLastPriceAdjustment = (priceHistory?: { date: string; price: number }[]) => {
    if (!priceHistory || priceHistory.length < 2) return "Nenhum ajuste";
    
    const lastTwo = priceHistory.slice(-2);
    const oldPrice = lastTwo[0].price;
    const newPrice = lastTwo[1].price;
    const diff = newPrice - oldPrice;
    const percentageDiff = (diff / oldPrice) * 100;
    
    const formattedDate = format(new Date(lastTwo[1].date), "dd 'de' MMMM", { locale: ptBR });
    
    return (
      <div className="flex items-center gap-1">
        <span>{formattedDate}</span>
        <Badge 
          variant="outline" 
          className={diff > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
        >
          {diff > 0 ? "+" : ""}{percentageDiff.toFixed(1)}%
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Serviços</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os serviços oferecidos pelo seu salão
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            className="gap-2 border-primary/20 text-primary hover:bg-primary/10"
            onClick={() => setIsPackageFormOpen(true)}
          >
            <Package className="h-4 w-4" />
            Novo Pacote
          </Button>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90" 
            onClick={() => {
              setSelectedService(undefined);
              setIsServiceFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
          
          <Popover open={isExportPopoverOpen} onOpenChange={setIsExportPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Exportar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="grid gap-2">
                <Button 
                  variant="ghost" 
                  className="justify-start gap-2 text-sm"
                  onClick={() => handleExportServices("excel")}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Exportar para Excel
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start gap-2 text-sm"
                  onClick={() => handleExportServices("csv")}
                >
                  <Download className="h-4 w-4" />
                  Exportar para CSV
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ServiceMetrics {...mockMetrics} />

      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="services" className="mt-0 space-y-4">
          <Card className="p-4 bg-white border-0 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[180px]"
              >
                <option value="">Todas as categorias</option>
                <option value="Corte">Corte</option>
                <option value="Tintura">Tintura</option>
                <option value="Tratamento">Tratamento</option>
                <option value="Manicure">Manicure</option>
                <option value="Estética">Estética</option>
              </select>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className={isFilterOpen ? "bg-primary/10 text-primary" : ""}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                
                {(searchTerm || selectedCategory || statusFilter || priceRangeFilter || popularityFilter) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetFilters}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>
            
            {isFilterOpen && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <h3 className="font-medium mb-3">Filtros Avançados</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Todos os status</option>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Faixa de Preço</label>
                    <select
                      value={priceRangeFilter}
                      onChange={(e) => setPriceRangeFilter(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Todas as faixas</option>
                      <option value="lt50">Até R$ 50,00</option>
                      <option value="50-100">R$ 50,00 - R$ 100,00</option>
                      <option value="100-200">R$ 100,00 - R$ 200,00</option>
                      <option value="gt200">Acima de R$ 200,00</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Popularidade</label>
                    <select
                      value={popularityFilter}
                      onChange={(e) => setPopularityFilter(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Todos os níveis</option>
                      <option value="high">Alta (Top 2)</option>
                      <option value="medium">Média</option>
                      <option value="low">Baixa</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="px-6 border-b bg-muted/30">
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Serviços</CardTitle>
                <Badge variant="outline" className="text-sm">
                  {filteredServices.length} serviços encontrados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Serviço</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Desempenho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <TableRow key={service.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {service.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/50">
                            {service.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {service.duration}min
                            {service.performanceData && service.performanceData.avgDuration !== service.duration && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-60">
                                  <div className="text-sm">
                                    <p className="font-medium">Tempo médio real: {service.performanceData.avgDuration}min</p>
                                    <p className="text-muted-foreground mt-1">
                                      Este serviço tem duração média {service.performanceData.avgDuration > service.duration ? "maior" : "menor"} que o planejado.
                                    </p>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">{formatCurrency(service.price)}</div>
                            {service.performanceData?.priceHistory && service.performanceData.priceHistory.length > 1 && (
                              <div className="text-xs text-muted-foreground">
                                Último ajuste: {getLastPriceAdjustment(service.performanceData.priceHistory)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{service.performanceData?.appointmentsLastMonth || 0}</span>
                              <span className="text-xs text-muted-foreground">último mês</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span>{service.performanceData?.rating.toFixed(1) || "0.0"}</span>
                              <span className="ml-1">
                                {getTrendIcon(service.performanceData?.trend)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              service.status === "active"
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            }
                          >
                            {service.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditService(service)}
                              className="hover:bg-muted"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        Nenhum serviço encontrado com os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Visão Geral</CardTitle>
                  <CardDescription>Dados consolidados dos serviços</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ServiceCharts
                services={mockServices}
                professionals={mockProfessionals}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ServiceForm
        open={isServiceFormOpen}
        onOpenChange={setIsServiceFormOpen}
        onSubmit={handleServiceSubmit}
        service={selectedService}
      />

      <ServicePackageForm
        open={isPackageFormOpen}
        onOpenChange={setIsPackageFormOpen}
        onSubmit={handlePackageSubmit}
      />
    </div>
  );
}
