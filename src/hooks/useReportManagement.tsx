import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format as dateFormat } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import {
  getRevenueData,
  getServicePerformance,
  getProfessionalPerformance,
  getFinancialReportData,
  getClientReportData,
  getOperationalReportData,
  getMarketingReportData,
  getInventoryReportData
} from "@/lib/pulseDadosClient";

export type ReportType = 
  | "dashboard" 
  | "financial" 
  | "clients" 
  | "operational" 
  | "marketing" 
  | "inventory" 
  | "custom";

export type ExportFormat = "excel" | "csv" | "pdf";

// Definição da interface para filtros globais
export interface GlobalFilters {
  professionalId: string;
  serviceId: string;
  status: string;
  [key: string]: string;
}

// Tipo para dados genéricos de relatório
export type ReportData = Record<string, any>;

// Definir filtros e datas iniciais
const initialFilters: GlobalFilters = {
  professionalId: "",
  serviceId: "",
  status: ""
};

// Definir data inicial (último mês)
const currentDate = new Date();
const lastMonth = new Date(currentDate);
lastMonth.setMonth(currentDate.getMonth() - 1);

const initialDateRange: DateRange = {
  from: lastMonth,
  to: currentDate
};

export function useReportManagement() {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ReportType>("dashboard");
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>(initialFilters);
  const [reportData, setReportData] = useState<ReportData>({});

  // Função para formatar o intervalo de datas para exibição
  const formatDateRange = (range: DateRange) => {
    if (!range.from) return "Data não selecionada";
    
    const fromDate = dateFormat(range.from, "dd 'de' MMMM", { locale: ptBR });
    
    if (!range.to || range.to.getTime() === range.from.getTime()) {
      return fromDate;
    }
    
    const toDate = dateFormat(range.to, "dd 'de' MMMM", { locale: ptBR });
    return `${fromDate} - ${toDate}`;
  };

  // Carregar dados de relatório com base nos filtros e data
  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Formatação das datas para o formato esperado pela API
      const startDate = dateRange.from ? dateFormat(dateRange.from, "yyyy-MM-dd") : '';
      const endDate = dateRange.to ? dateFormat(dateRange.to, "yyyy-MM-dd") : startDate;
      
      let data: ReportData = {};
      
      // Carrega dados reais do Supabase através do pulseDadosClient
      switch(activeTab) {
        case "dashboard":
          try {
            // Buscando dados de receita, serviços e profissionais
            const [revenueData, serviceData, professionalData] = await Promise.all([
              getRevenueData(startDate, endDate),
              getServicePerformance(startDate, endDate),
              getProfessionalPerformance(startDate, endDate)
            ]);
            
            // Calculando KPIs
            const totalRevenue = revenueData.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0);
            const txCount = revenueData.reduce((sum, item) => sum + parseInt(item.transaction_count || 0), 0);
            const avgTicket = txCount > 0 ? totalRevenue / txCount : 0;
            const servicesCount = serviceData.reduce((sum, item) => sum + parseInt(item.service_count || 0), 0);
            
            // Dados financeiros para gráficos
            const revenueByDay = revenueData.map(item => ({
              date: item.date,
              value: parseFloat(item.revenue || 0)
            }));
            
            // Top serviços
            const topServices = [...serviceData]
              .sort((a, b) => parseFloat(b.revenue || 0) - parseFloat(a.revenue || 0))
              .slice(0, 5);
            
            // Top profissionais
            const topProfessionals = [...professionalData]
              .sort((a, b) => parseFloat(b.revenue || 0) - parseFloat(a.revenue || 0))
              .slice(0, 5);
            
            // Formatando dados para dashboard
            data = {
              kpis: {
                faturamentoTotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue),
                clientesAtendidos: txCount.toString(),
                servicosRealizados: servicesCount.toString(),
                taxaOcupacao: professionalData.length > 0 
                  ? `${(professionalData.reduce((sum, p) => sum + parseFloat(p.occupancy_rate || 0), 0) / professionalData.length).toFixed(1)}%`
                  : "0%",
                ticketMedio: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avgTicket),
                novasAvaliacoes: revenueData.reduce((sum, item) => sum + parseInt(item.new_reviews || 0), 0).toString()
              },
              charts: {
                faturamento: {
                  labels: revenueByDay.map(item => dateFormat(new Date(item.date), 'dd/MM')),
                  datasets: [{
                    label: 'Faturamento',
                    data: revenueByDay.map(item => item.value)
                  }]
                },
                servicos: {
                  labels: topServices.map(item => item.service_name),
                  datasets: [{
                    label: 'Receita',
                    data: topServices.map(item => parseFloat(item.revenue || 0))
                  }]
                },
                profissionais: {
                  labels: topProfessionals.map(item => item.professional_name),
                  datasets: [{
                    label: 'Receita',
                    data: topProfessionals.map(item => parseFloat(item.revenue || 0))
                  }]
                }
              }
            };
          } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
            toast({
              variant: "destructive",
              title: "Erro ao carregar dados do dashboard",
              description: "Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.",
              className: "bg-red-50 border-red-200 text-red-800",
            });
          }
          break;
          
        case "financial":
          try {
            // Buscar dados financeiros completos
            const financialData = await getFinancialReportData(startDate, endDate, globalFilters);
            
            data = {
              resumo: financialData.overview,
              faturamento: financialData.revenueByDay,
              detalhamento: financialData.transactions,
              comissoes: financialData.commissions,
              metodoPagamento: financialData.paymentMethods,
              categoriasDespesa: financialData.expenseCategories,
              fluxoCaixa: financialData.cashFlow,
              metricas: {
                lucratividade: financialData.overview.profitability,
                margemLucro: financialData.overview.profitMargin,
                crescimento: financialData.overview.growthRate
              },
              rawData: financialData.rawData
            };
          } catch (error) {
            console.error("Erro ao carregar dados financeiros:", error);
            toast({
              variant: "destructive",
              title: "Erro ao carregar relatório financeiro",
              description: "Não foi possível carregar os dados financeiros. Tente novamente mais tarde.",
              className: "bg-red-50 border-red-200 text-red-800",
            });
          }
          break;
          
        case "clients":
          try {
            // Buscar dados de clientes
            const clientData = await getClientReportData(startDate, endDate, globalFilters);
            
            data = {
              resumo: clientData.overview,
              segmentacao: clientData.segments,
              recorrencia: clientData.clientFrequency,
              ticketData: clientData.ticketData,
              clientProfileData: clientData.servicesData,
              rawData: clientData.rawData
            };
          } catch (error) {
            console.error("Erro ao carregar dados de clientes:", error);
            toast({
              variant: "destructive", 
              title: "Erro ao carregar relatório de clientes",
              description: "Não foi possível carregar os dados de clientes. Tente novamente mais tarde.",
              className: "bg-red-50 border-red-200 text-red-800",
            });
          }
          break;
          
        case "operational":
          try {
            // Buscar dados operacionais
            const operationalData = await getOperationalReportData(startDate, endDate, globalFilters);
            
            data = {
              resumo: operationalData.overview,
              efficiency: operationalData.professionalEfficiency,
              services: operationalData.servicePerformance,
              rawData: operationalData.rawData
            };
          } catch (error) {
            console.error("Erro ao carregar dados operacionais:", error);
            toast({
              variant: "destructive",
              title: "Erro ao carregar relatório operacional",
              description: "Não foi possível carregar os dados operacionais. Tente novamente mais tarde.",
              className: "bg-red-50 border-red-200 text-red-800",
            });
          }
          break;
          
        case "marketing":
          try {
            // Buscar dados de marketing
            const marketingData = await getMarketingReportData(startDate, endDate, globalFilters);
            
            data = {
              resumo: marketingData.overview,
              campaigns: marketingData.campaignPerformance,
              channelPerformance: marketingData.channelPerformance,
              retencao: marketingData.retentionData,
              rawData: marketingData.rawData
            };
          } catch (error) {
            console.error("Erro ao carregar dados de marketing:", error);
            toast({
              variant: "destructive",
              title: "Erro ao carregar relatório de marketing",
              description: "Não foi possível carregar os dados de marketing. Tente novamente mais tarde.",
              className: "bg-red-50 border-red-200 text-red-800",
            });
          }
          break;
          
        case "inventory":
          try {
            // Buscar dados de estoque
            const inventoryData = await getInventoryReportData(startDate, endDate, globalFilters);
            
            data = {
              resumo: inventoryData.overview,
              stock: inventoryData.stockStatus,
              consumption: inventoryData.consumption,
              purchases: inventoryData.purchases,
              rawData: inventoryData.rawData
            };
          } catch (error) {
            console.error("Erro ao carregar dados de estoque:", error);
            toast({
              variant: "destructive",
              title: "Erro ao carregar relatório de estoque",
              description: "Não foi possível carregar os dados de estoque. Tente novamente mais tarde.",
              className: "bg-red-50 border-red-200 text-red-800",
            });
          }
          break;
          
        case "custom":
          // Para o construtor personalizado, preparamos um conjunto vazio de dados
          // Os dados serão carregados conforme o usuário selecionar os critérios
          data = {
            availableSources: [
              { id: 'appointments', label: 'Agendamentos' },
              { id: 'clients', label: 'Clientes' },
              { id: 'services', label: 'Serviços' },
              { id: 'professionals', label: 'Profissionais' },
              { id: 'financials', label: 'Financeiro' },
              { id: 'inventory', label: 'Estoque' }
            ],
            availableMetrics: [
              { id: 'count', label: 'Contagem' },
              { id: 'sum', label: 'Soma' },
              { id: 'average', label: 'Média' },
              { id: 'min', label: 'Mínimo' },
              { id: 'max', label: 'Máximo' }
            ],
            availableVisualizations: [
              { id: 'table', label: 'Tabela' },
              { id: 'bar', label: 'Gráfico de Barras' },
              { id: 'line', label: 'Gráfico de Linha' },
              { id: 'pie', label: 'Gráfico de Pizza' }
            ]
          };
          break;
      }

      // Aplicar filtros globais selecionados
      if (globalFilters.professionalId !== "" || globalFilters.serviceId !== "" || globalFilters.status !== "") {
        data.filteredData = true;
        data.appliedFilters = globalFilters;
      }

      setReportData(data);
      
      toast({
        title: "Dados atualizados",
        description: "Os dados do relatório foram carregados com sucesso",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("Erro ao carregar dados do relatório:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar relatório",
        description: "Não foi possível carregar os dados do relatório. Tente novamente mais tarde.",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = (filters: GlobalFilters) => {
    setGlobalFilters(filters);
    toast({
      title: "Filtros aplicados",
      description: "Os filtros foram aplicados com sucesso",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  // Resetar filtros
  const resetFilters = () => {
    setGlobalFilters(initialFilters);
    toast({
      title: "Filtros resetados",
      description: "Os filtros foram redefinidos para os valores padrão",
      variant: "default",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  };

  // Exportar relatório
  const exportReport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      let data: any[] = [];
      // Formatamos a data para o nome do arquivo usando o dateFormat para evitar conflito com o parâmetro format
      const formattedDate = dateFormat(new Date(), "yyyyMMdd", { locale: ptBR });
      let filename = `relatorio_${activeTab}_${formattedDate}`;
      let title = "";
      
      // Preparar dados com base no tipo de relatório
      switch(activeTab) {
        case "dashboard":
          data = (reportData.charts?.faturamento?.datasets?.[0]?.data || []).map((value, index) => ({
            periodo: reportData.charts?.faturamento?.labels?.[index] || '',
            faturamento: value
          }));
          title = "Dashboard Geral";
          break;
        case "financial":
          data = reportData.detalhamento || reportData.comissoes || [];
          title = "Relatório Financeiro";
          break;
        case "clients":
          data = reportData.ticketData || reportData.clientProfileData || [];
          title = "Relatório de Clientes";
          break;
        case "operational":
          data = reportData.efficiency || reportData.services || [];
          title = "Relatório Operacional";
          break;
        case "marketing":
          data = reportData.campaigns || reportData.channelPerformance || [];
          title = "Relatório de Marketing";
          break;
        case "inventory":
          data = reportData.stock || [];
          title = "Relatório de Estoque";
          break;
        case "custom":
          // Para relatórios personalizados, usar dados específicos
          data = reportData.customData || [];
          title = "Relatório Personalizado";
          break;
      }
      
      // Importar o utilitário de exportação e executar
      const { exportData } = await import("@/utils/export");
      
      // Simular uma pequena espera para mostrar o estado de loading
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await exportData(data, format, filename, title);
      
      toast({
        title: "Exportação concluída",
        description: `O relatório foi exportado com sucesso no formato ${format.toUpperCase()}`,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório. Tente novamente mais tarde",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Exposição de funções e estados
  return {
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
    exportReport,
    formatDateRange
  };
}
