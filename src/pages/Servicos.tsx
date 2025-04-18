import { useState, useEffect, useMemo, useCallback } from "react";
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
  Package,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Info,
  X,
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
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useServiceManagement, ExtendedService } from "@/hooks/useServiceManagement";
import { supabase } from "@/lib/supabaseClient";

// Interface para dados de desempenho adicionais
interface PerformanceData {
  appointmentsLastMonth: number;
  rating: number;
  popularityRank: number;
  avgDuration: number;
  priceHistory: { date: string; price: number }[];
  trend: 'up' | 'down' | 'stable';
}

// Função para carregar profissionais do Supabase
const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Array<{id: number, name: string}>>([]);
  
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals')
          .select('id, name')
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        setProfessionals(data || []);
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
      }
    };
    fetchProfessionals();
  }, []);
  
  return professionals;
};

export default function Servicos() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const professionals = useProfessionals(); // Usar o hook para carregar profissionais do Supabase
  
  const [tab, setTab] = useState("servicos"); // servicos, pacotes, relatorios
  const [modalOpen, setModalOpen] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ExtendedService | null>(null);
  

  
  // Usando o hook do Supabase
  const {
    services,
    servicePackages,
    loading,
    error,
    addService,
    updateService,
    deleteService,
    addServicePackage,
    updateServicePackage,
    deleteServicePackage
  } = useServiceManagement();
  
  // Filtrar serviços com useMemo para performance
  const filteredServices = useMemo(() => {
    let filtered = services;
    
    // Aplicar filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro por categoria
    if (categoryFilter) {
      filtered = filtered.filter(
        (service) => service.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    return filtered;
  }, [services, searchTerm, categoryFilter]);

  // Reset dos filtros
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setCategoryFilter("");
  }, []);

  // Handlers para formulários
  const handleServiceSubmit = useCallback((service: Partial<Service>) => {
    if (editingService) {
      // Atualizar serviço existente
      updateService(editingService.id, service);
    } else {
      // Adicionar novo serviço
      addService(service as Omit<Service, 'id'>);
    }
    setModalOpen(false);
    setEditingService(null);
  }, [editingService, updateService, addService]);

  const handlePackageSubmit = useCallback((pkg: Partial<ServicePackage>) => {
    // Lógica para salvar/atualizar pacote usando o hook do Supabase
    if (pkg.id) {
      updateServicePackage(pkg.id, pkg);
    } else {
      addServicePackage(pkg as Omit<ServicePackage, 'id'>);
    }
    setPackageModalOpen(false);
  }, [updateServicePackage, addServicePackage]);

  const handleEditService = useCallback((service: ExtendedService) => {
    setEditingService(service);
    setModalOpen(true);
  }, []);

  const handleDeleteService = useCallback((serviceId: number) => {
    // Confirmar antes de excluir
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      deleteService(serviceId);
    }
  }, [deleteService]);

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
  
  // Componente para renderizar as métricas de desempenho de forma organizada
  const ServicePerformance = ({ data }: { data?: PerformanceData }) => {
    if (!data) {
      return <div className="text-muted-foreground text-sm">Sem dados disponíveis</div>;
    }
    
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <div className="flex items-center mr-2 bg-muted/20 rounded-full px-2 py-0.5">
            <Star className="h-3.5 w-3.5 text-amber-500 mr-1" />
            <span className="font-medium text-sm">{data.rating.toFixed(1)}</span>
          </div>
          <span>{getTrendIcon(data.trend)}</span>
        </div>
        
        <div className="flex items-center">
          <Badge variant="outline" className="font-medium text-xs py-0.5 px-2">
            {data.appointmentsLastMonth} atendimentos
          </Badge>
        </div>
      </div>
    );
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
    <PageLayout variant="blue">
      <PageHeader 
        title="Serviços" 
        subtitle="Gerencie os serviços oferecidos pelo seu salão"
        variant="blue"
        badge="Catálogo"
        action={
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              className="gap-2 border-amber-300 text-amber-600 hover:bg-amber-50"
              onClick={() => setPackageModalOpen(true)}
            >
              <Package className="h-4 w-4" />
              Novo Pacote
            </Button>
            <Button 
              variant="dashboard"
              onClick={() => {
                setEditingService(null);
                setModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          

          </div>
        }
      />

      <ServiceMetrics 
        totalServices={services.length}
        activeServices={services.filter(s => s.status === 'active').length}
        totalProfessionals={professionals.length}
        totalPackages={servicePackages.length}
      />

      <Tabs defaultValue="servicos" value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex w-full h-10 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
          <TabsTrigger 
            value="servicos" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <Package className="h-4 w-4" />
            <span className="font-medium">Serviços</span>
          </TabsTrigger>
          <TabsTrigger 
            value="overview" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <BarChart2 className="h-4 w-4" />
            <span className="font-medium">Visão Geral</span>
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="servicos" className="mt-0 space-y-4">
          <Card className="p-4 bg-white border border-blue-100 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
                <Input
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 border-blue-200 focus:border-blue-400"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 rounded-md border border-blue-200 bg-background px-3 text-sm min-w-[180px] focus:border-blue-400"
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
                  className="border-blue-200"
                  onClick={() => {
                    setCategoryFilter("");
                    setSearchTerm("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border border-blue-100 shadow-sm overflow-hidden">
            <CardHeader className="px-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-700">Lista de Serviços</CardTitle>
                <Badge variant="outline" className="text-sm bg-blue-100 text-blue-700 border-blue-200">
                  {filteredServices.length} serviços encontrados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-blue-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-blue-700">Serviço</TableHead>
                    <TableHead className="text-blue-700">Categoria</TableHead>
                    <TableHead className="text-blue-700">Duração</TableHead>
                    <TableHead className="text-blue-700">Valor</TableHead>
                    <TableHead className="text-blue-700">Desempenho</TableHead>
                    <TableHead className="text-blue-700">Status</TableHead>
                    <TableHead className="text-right text-blue-700">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service, idx) => (
                      <TableRow key={service.id} className={idx % 2 === 0 ? "bg-white hover:bg-blue-50/30" : "bg-blue-50/20 hover:bg-blue-50/40"}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-blue-700">{service.name}</div>
                            <div className="text-sm text-blue-600/70">
                              {service.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {service.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-amber-500" />
                            {service.duration}min
                            {service.performanceData && service.performanceData.avgDuration !== service.duration && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                    <Info className="h-3.5 w-3.5" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-60 border-amber-200 bg-amber-50">
                                  <div className="text-sm">
                                    <p className="font-medium text-amber-800">Tempo médio real: {service.performanceData.avgDuration}min</p>
                                    <p className="text-amber-700 mt-1">
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
                            <div className="font-medium text-emerald-700">{formatCurrency(service.price)}</div>
                            {service.performanceData?.priceHistory && service.performanceData.priceHistory.length > 1 && (
                              <div className="text-xs text-blue-600/70">
                                Último ajuste: {getLastPriceAdjustment(service.performanceData.priceHistory)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ServicePerformance data={service.performanceData} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              service.status === "active"
                                ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
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
                              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
                      <TableCell colSpan={7} className="text-center py-8 text-blue-600/70 bg-blue-50/10">
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
          <Card className="border border-blue-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-700">Visão Geral</CardTitle>
                  <CardDescription className="text-blue-600/70">Dados consolidados dos serviços</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ServiceCharts
                services={services}
                professionals={professionals}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ServiceForm 
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleServiceSubmit}
        service={editingService}
      />

      <ServicePackageForm 
        open={packageModalOpen}
        onOpenChange={setPackageModalOpen}
        onSubmit={handlePackageSubmit}
      />


    </PageLayout>
  );
}
