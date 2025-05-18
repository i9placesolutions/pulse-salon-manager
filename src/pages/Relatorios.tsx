import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormCard } from "@/components/shared/FormCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar, BarChart2, FileText, PieChart, LineChart, 
  TrendingUp, Users, ShoppingBag, DollarSign, Clock, 
  Filter, FileDown, Loader2, RefreshCw
} from "lucide-react";
import { useReportManagement, ExportFormat, ReportType, GlobalFilters } from "@/hooks/useReportManagement";
import { ReportDashboard } from "@/components/relatorios/ReportDashboard";
import { ReportBuilder } from "@/components/relatorios/ReportBuilder";
import { FinancialReports } from "@/components/relatorios/FinancialReports";
import { ClientReports } from "@/components/relatorios/ClientReports";
import { OperationalReports } from "@/components/relatorios/OperationalReports";
import { MarketingReports } from "@/components/relatorios/MarketingReports";
import { InventoryReports } from "@/components/relatorios/InventoryReports";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as pulseDadosClient from "@/lib/pulseDadosClient";

// Tipagem para garantir consistência em todos os componentes de relatórios
export interface ReportComponentProps {
  date?: {
    from: Date;
    to: Date;
  };
  filters: GlobalFilters;
  data?: Record<string, any>;
  onExport?: (format: ExportFormat) => Promise<void>;
}

const Relatorios = () => {
  const { toast } = useToast();
  
  const {
    isLoading,
    isExporting,
    activeTab,
    setActiveTab,
    dateRange,
    setDateRange,
    globalFilters,
    setGlobalFilters,
    applyFilters,
    resetFilters,
    reportData,
    loadReportData,
    exportReport
  } = useReportManagement();

  // Estados para opções dos filtros
  const [professionals, setProfessionals] = useState<{ id: string, name: string }[]>([]);
  const [services, setServices] = useState<{ id: string, name: string }[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Carregar as opções dos filtros do Supabase
  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoadingOptions(true);
      try {
        // Carregar profissionais do Supabase
        const profsData = await pulseDadosClient.getProfessionals();
        setProfessionals(profsData.map(prof => ({
          id: prof.id,
          name: prof.name
        })));

        // Carregar serviços do Supabase
        const servicesData = await pulseDadosClient.getServices();
        setServices(servicesData.map(service => ({
          id: service.id,
          name: service.name
        })));
      } catch (error) {
        console.error("Erro ao carregar opções de filtro:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar filtros",
          description: "Não foi possível carregar as opções de filtro",
          className: "bg-red-50 border-red-200 text-red-800",
        });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadFilterOptions();
  }, [toast]);

  const handleExport = async (format: ExportFormat) => {
    try {
      await exportReport(format);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o relatório. Tente novamente.",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  };

  // Tipagem segura para o setter do activeTab
  const handleTabChange = (value: string) => {
    setActiveTab(value as ReportType);
  };

  const getValidDateRange = (dateRange: DateRange | undefined): { from: Date; to: Date } => {
    if (!dateRange) return { from: new Date(), to: new Date() };
    const { from, to } = dateRange;
    return { 
      from: from || new Date(), 
      to: to || from || new Date() 
    };
  };

  return (
    <PageLayout>
      <PageHeader
        title="Relatórios e Análises"
        subtitle="Visualize e analise os dados do seu salão de forma dinâmica e completa."
        action={
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 border-gray-300 hover:bg-gray-100">
                  <Filter className="h-3.5 w-3.5 text-gray-600" />
                  <span>Filtros</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Filtros Globais</h4>
                  <div className="space-y-2">
                    <div className="grid gap-1">
                      <label htmlFor="professional" className="text-sm font-medium text-gray-700">
                        Profissional
                      </label>
                      <Select
                        value={globalFilters.professionalId || "all"}
                        onValueChange={(value) => setGlobalFilters({ ...globalFilters, professionalId: value === "all" ? "" : value })}
                      >
                        <SelectTrigger id="professional">
                          <SelectValue placeholder="Todos os profissionais" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {isLoadingOptions ? (
                            <SelectItem value="loading" disabled>Carregando...</SelectItem>
                          ) : (
                            professionals.map((professional) => (
                              <SelectItem key={professional.id} value={professional.id}>
                                {professional.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="service" className="text-sm font-medium text-gray-700">
                        Serviço
                      </label>
                      <Select
                        value={globalFilters.serviceId || "all"}
                        onValueChange={(value) => setGlobalFilters({ ...globalFilters, serviceId: value === "all" ? "" : value })}
                      >
                        <SelectTrigger id="service">
                          <SelectValue placeholder="Todos os serviços" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {isLoadingOptions ? (
                            <SelectItem value="loading" disabled>Carregando...</SelectItem>
                          ) : (
                            services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="status" className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <Select
                        value={globalFilters.status || "all"}
                        onValueChange={(value) => setGlobalFilters({ ...globalFilters, status: value === "all" ? "" : value })}
                      >
                        <SelectTrigger id="status" className="h-8">
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="completed">Concluídos</SelectItem>
                          <SelectItem value="pending">Pendentes</SelectItem>
                          <SelectItem value="canceled">Cancelados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 border-gray-300 hover:bg-gray-100"
                      onClick={resetFilters}
                    >
                      Limpar
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 bg-blue-600 hover:bg-blue-700"
                      onClick={() => applyFilters(globalFilters)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 border-gray-300 hover:bg-gray-100">
                  <FileDown className="h-3.5 w-3.5 text-gray-600" />
                  <span>Exportar</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 mb-2">Formato</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start h-8 gap-2 border-gray-300 hover:bg-blue-50"
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                  >
                    <FileText className="h-3.5 w-3.5 text-green-600" />
                    <span>Excel</span>
                    {isExporting && <Loader2 className="h-3 w-3 ml-auto animate-spin" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start h-8 gap-2 border-gray-300 hover:bg-blue-50"
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span>CSV</span>
                    {isExporting && <Loader2 className="h-3 w-3 ml-auto animate-spin" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start h-8 gap-2 border-gray-300 hover:bg-blue-50"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                  >
                    <FileText className="h-3.5 w-3.5 text-red-600" />
                    <span>PDF</span>
                    {isExporting && <Loader2 className="h-3 w-3 ml-auto animate-spin" />}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1 border-gray-300 hover:bg-gray-100"
              onClick={loadReportData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </Button>
            <DateRangePicker 
              value={dateRange as { from: Date; to: Date }}
              onChange={setDateRange}
              className="border border-gray-200 rounded-md shadow-sm"
            />
          </div>
        }
      />

      <FormCard variant="blue" className="mb-0" title="Relatórios e Análises">
        <Tabs 
          defaultValue="dashboard" 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 data-[state=active]:bg-blue-200">
              <BarChart2 className="h-4 w-4 text-blue-600" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 data-[state=active]:bg-purple-200">
              <LineChart className="h-4 w-4 text-purple-600" />
              <span>Construtor</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2 bg-green-50 hover:bg-green-100 data-[state=active]:bg-green-200">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 bg-cyan-50 hover:bg-cyan-100 data-[state=active]:bg-cyan-200">
              <Users className="h-4 w-4 text-cyan-600" />
              <span>Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="operational" className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 data-[state=active]:bg-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Operacional</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 data-[state=active]:bg-pink-200">
              <TrendingUp className="h-4 w-4 text-pink-600" />
              <span>Marketing</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 data-[state=active]:bg-orange-200">
              <ShoppingBag className="h-4 w-4 text-orange-600" />
              <span>Estoque</span>
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-[400px] w-full bg-gray-200 animate-pulse" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-[100px] bg-gray-200 animate-pulse" />
                    <Skeleton className="h-[100px] bg-gray-200 animate-pulse" />
                    <Skeleton className="h-[100px] bg-gray-200 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="dashboard">
                <Card className="border-blue-100 shadow-sm">
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <CardTitle className="text-blue-800">Dashboard Geral</CardTitle>
                    <CardDescription className="text-blue-600">
                      Visão geral consolidada do desempenho do salão
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ReportDashboard 
                      date={getValidDateRange(dateRange)} 
                      filters={globalFilters} 
                      data={reportData} 
                      onExport={handleExport}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="custom">
                <Card className="border-purple-100 shadow-sm">
                  <CardHeader className="bg-purple-50 border-b border-purple-100">
                    <CardTitle className="text-purple-800">Construtor de Relatórios</CardTitle>
                    <CardDescription className="text-purple-600">
                      Crie relatórios personalizados com os parâmetros que desejar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ReportBuilder 
                      date={getValidDateRange(dateRange)} 
                      filters={globalFilters} 
                      data={reportData}
                      onExport={handleExport}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="financial">
                <Card className="border-green-100 shadow-sm">
                  <CardHeader className="bg-green-50 border-b border-green-100">
                    <CardTitle className="text-green-800">Relatório Financeiro</CardTitle>
                    <CardDescription className="text-green-600">
                      Análise completa de receitas, despesas e comissões
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FinancialReports 
                      date={getValidDateRange(dateRange)} 
                      filters={globalFilters} 
                      data={reportData} 
                      onExport={handleExport}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="clients">
                <Card className="border-cyan-100 shadow-sm">
                  <CardHeader className="bg-cyan-50 border-b border-cyan-100">
                    <CardTitle className="text-cyan-800">Relatório de Clientes</CardTitle>
                    <CardDescription className="text-cyan-600">
                      Dados sobre perfil, frequência e ticket médio dos clientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ClientReports 
                      date={getValidDateRange(dateRange)} 
                      filters={globalFilters} 
                      data={reportData} 
                      onExport={handleExport}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="operational">
                <Card className="border-amber-100 shadow-sm">
                  <CardHeader className="bg-amber-50 border-b border-amber-100">
                    <CardTitle className="text-amber-800">Relatório Operacional</CardTitle>
                    <CardDescription className="text-amber-600">
                      Desempenho de profissionais, serviços e ocupação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <OperationalReports 
                      date={getValidDateRange(dateRange)} 
                      filters={globalFilters} 
                      data={reportData} 
                      onExport={handleExport}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="marketing">
                <Card className="border-pink-100 shadow-sm">
                  <CardHeader className="bg-pink-50 border-b border-pink-100">
                    <CardTitle className="text-pink-800">Relatório de Marketing</CardTitle>
                    <CardDescription className="text-pink-600">
                      Análise de campanhas, canais e resultados de marketing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <MarketingReports 
                      date={getValidDateRange(dateRange)} 
                      filters={globalFilters} 
                      data={reportData} 
                      onExport={handleExport}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="inventory">
                <Card className="border-orange-100 shadow-sm">
                  <CardHeader className="bg-orange-50 border-b border-orange-100">
                    <CardTitle className="text-orange-800">Relatório de Estoque</CardTitle>
                    <CardDescription className="text-orange-600">
                      Produtos, movimentações e nível de estoque atual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <InventoryReports 
                      date={getValidDateRange(dateRange)} 
                      filters={globalFilters} 
                      data={reportData} 
                      onExport={handleExport}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </FormCard>
    </PageLayout>
  );
};

export default Relatorios;
