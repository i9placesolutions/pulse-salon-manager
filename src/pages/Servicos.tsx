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
  FileText,
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
import { exportData } from "@/utils/export";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Label,
} from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

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
  const [reportFormat, setReportFormat] = useState<"excel" | "pdf">("excel");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
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

  const handleExportServices = () => {
    // Fecha o diálogo
    setIsExportDialogOpen(false);
    
    try {
      // Mostra um toast informando que o relatório está sendo gerado
      toast({
        title: "Gerando relatório",
        description: "Preparando o arquivo para download...",
      });
      
      // Coletar os dados com base nos filtros selecionados
      let dataToExport = [...mockServices];
      
      // Aplicar filtros de data se estiverem definidos
      if (dateRange.from && dateRange.to) {
        // Em um caso real, filtraria os serviços por data
        console.log(`Filtrando serviços de ${format(dateRange.from, "yyyy-MM-dd")} até ${format(dateRange.to, "yyyy-MM-dd")}`);
      }
      
      // Filtro por categoria
      const categorySelect = document.querySelector('#category-select') as HTMLSelectElement;
      const selectedCategory = categorySelect?.value;
      if (selectedCategory) {
        dataToExport = dataToExport.filter(service => service.category === selectedCategory);
      }
      
      // Filtro por status
      const statusRadios = document.querySelectorAll('input[name="status"]') as NodeListOf<HTMLInputElement>;
      let selectedStatus = "";
      statusRadios.forEach(radio => {
        if (radio.checked && radio.id !== "status-all") {
          selectedStatus = radio.id === "status-active" ? "active" : "inactive";
        }
      });
      if (selectedStatus) {
        dataToExport = dataToExport.filter(service => service.status === selectedStatus);
      }
      
      // Filtro por faixa de preço
      const priceSelect = document.querySelector('#price-select') as HTMLSelectElement;
      const selectedPriceRange = priceSelect?.value;
      if (selectedPriceRange) {
        switch (selectedPriceRange) {
          case "lt50":
            dataToExport = dataToExport.filter(service => service.price < 50);
            break;
          case "50-100":
            dataToExport = dataToExport.filter(service => service.price >= 50 && service.price <= 100);
            break;
          case "100-200":
            dataToExport = dataToExport.filter(service => service.price > 100 && service.price <= 200);
            break;
          case "gt200":
            dataToExport = dataToExport.filter(service => service.price > 200);
            break;
        }
      }
      
      // Filtro por popularidade
      const popularitySelect = document.querySelector('#popularity-select') as HTMLSelectElement;
      const selectedPopularity = popularitySelect?.value;
      if (selectedPopularity) {
        switch (selectedPopularity) {
          case "high":
            dataToExport = dataToExport.filter(service => 
              service.performanceData && service.performanceData.popularityRank <= 2);
            break;
          case "medium":
            dataToExport = dataToExport.filter(service => 
              service.performanceData && service.performanceData.popularityRank > 2 
              && service.performanceData.popularityRank <= 4);
            break;
          case "low":
            dataToExport = dataToExport.filter(service => 
              service.performanceData && service.performanceData.popularityRank > 4);
            break;
        }
      }
      
      // Verificar profissionais selecionados
      const professionalCheckboxes = document.querySelectorAll('[id^="prof-"]') as NodeListOf<HTMLInputElement>;
      const selectedProfessionals: number[] = [];
      professionalCheckboxes.forEach(cb => {
        if (cb.checked) {
          const profId = parseInt(cb.id.replace('prof-', ''));
          if (!isNaN(profId)) {
            selectedProfessionals.push(profId);
          }
        }
      });
      
      // Filtrar por profissionais se algum estiver selecionado
      if (selectedProfessionals.length > 0) {
        dataToExport = dataToExport.filter(service => 
          service.professionals?.some(profId => selectedProfessionals.includes(profId))
        );
      }
      
      // Coletar informações sobre quais colunas exibir
      const columns = {
        name: document.getElementById('col-name') as HTMLInputElement,
        category: document.getElementById('col-category') as HTMLInputElement,
        price: document.getElementById('col-price') as HTMLInputElement,
        duration: document.getElementById('col-duration') as HTMLInputElement,
        status: document.getElementById('col-status') as HTMLInputElement,
        commission: document.getElementById('col-commission') as HTMLInputElement,
        popularity: document.getElementById('col-popularity') as HTMLInputElement,
        rating: document.getElementById('col-rating') as HTMLInputElement,
      };
      
      // Verificar se é necessário agrupar os dados
      const groupBySelect = document.querySelector('#groupby-select') as HTMLSelectElement;
      const groupByValue = groupBySelect?.value;
      
      // Transformar os dados com base nas colunas selecionadas e agrupamento
      let formattedData: Record<string, any>[] = [];
      
      if (groupByValue) {
        // Agrupar dados
        const groupedData: Record<string, ExtendedService[]> = {};
        
        dataToExport.forEach(service => {
          let groupKey = '';
          
          switch (groupByValue) {
            case 'category':
              groupKey = service.category;
              break;
            case 'professional':
              // Como um serviço pode ter múltiplos profissionais, criamos uma entrada para cada
              service.professionals?.forEach(profId => {
                const professional = mockProfessionals.find(p => p.id === profId);
                if (professional) {
                  const profKey = professional.name;
                  if (!groupedData[profKey]) {
                    groupedData[profKey] = [];
                  }
                  groupedData[profKey].push(service);
                }
              });
              return; // Pular o resto para esse serviço
            case 'status':
              groupKey = service.status === 'active' ? 'Ativo' : 'Inativo';
              break;
            case 'price':
              if (service.price < 50) groupKey = 'Até R$50';
              else if (service.price >= 50 && service.price <= 100) groupKey = 'R$50 - R$100';
              else if (service.price > 100 && service.price <= 200) groupKey = 'R$100 - R$200';
              else groupKey = 'Acima de R$200';
              break;
          }
          
          // Não agrupar se não for por profissional (já tratado acima)
          if (groupByValue !== 'professional') {
            if (!groupedData[groupKey]) {
              groupedData[groupKey] = [];
            }
            groupedData[groupKey].push(service);
          }
        });
        
        // Converter grupos para o formato de saída
        Object.entries(groupedData).forEach(([groupName, services], index) => {
          // Adicionar linha de cabeçalho de grupo se não for o primeiro
          if (index > 0) {
            formattedData.push({ 'Grupo': '' }); // Linha em branco
          }
          
          formattedData.push({ 'Grupo': groupName }); // Nome do grupo
          
          // Adicionar serviços do grupo
          services.forEach(service => {
            const obj: Record<string, any> = {};
            if (columns.name?.checked) obj['Nome'] = service.name;
            if (columns.category?.checked) obj['Categoria'] = service.category;
            if (columns.price?.checked) obj['Preço'] = formatCurrency(service.price);
            if (columns.duration?.checked) obj['Duração (min)'] = service.duration;
            if (columns.status?.checked) obj['Status'] = service.status === 'active' ? 'Ativo' : 'Inativo';
            
            if (columns.commission?.checked) {
              obj['Comissão'] = service.commission.type === 'percentage' 
                ? `${service.commission.value}%` 
                : formatCurrency(service.commission.value);
            }
            
            if (columns.popularity?.checked && service.performanceData) {
              obj['Popularidade'] = `Rank ${service.performanceData.popularityRank}`;
            }
            
            if (columns.rating?.checked && service.performanceData) {
              obj['Avaliação'] = service.performanceData.rating.toFixed(1);
            }
            
            formattedData.push(obj);
          });
          
          // Adicionar linha com estatísticas do grupo
          const totalValue = services.reduce((sum, service) => sum + service.price, 0);
          const avgValue = totalValue / services.length;
          
          formattedData.push({
            'Nome': `Total: ${services.length} serviços`,
            'Preço': services.length > 0 ? `Média: ${formatCurrency(avgValue)}` : '',
          });
        });
      } else {
        // Sem agrupamento - formato simples
        formattedData = dataToExport.map(service => {
          const obj: Record<string, any> = {};
          
          if (columns.name?.checked) obj['Nome'] = service.name;
          if (columns.category?.checked) obj['Categoria'] = service.category;
          if (columns.price?.checked) obj['Preço'] = formatCurrency(service.price);
          if (columns.duration?.checked) obj['Duração (min)'] = service.duration;
          if (columns.status?.checked) obj['Status'] = service.status === 'active' ? 'Ativo' : 'Inativo';
          
          if (columns.commission?.checked) {
            obj['Comissão'] = service.commission.type === 'percentage' 
              ? `${service.commission.value}%` 
              : formatCurrency(service.commission.value);
          }
          
          if (columns.popularity?.checked && service.performanceData) {
            obj['Popularidade'] = `Rank ${service.performanceData.popularityRank}`;
          }
          
          if (columns.rating?.checked && service.performanceData) {
            obj['Avaliação'] = service.performanceData.rating.toFixed(1);
          }
          
          return obj;
        });
      }
      
      // Gerar nome do arquivo com data atual
      const dateStr = format(new Date(), "yyyy-MM-dd");
      const fileName = `relatorio-servicos-${dateStr}`;
      
      // Simular um pequeno atraso para melhor UX
      setTimeout(() => {
        // Gerar e iniciar o download do arquivo de acordo com o formato selecionado
        if (reportFormat === "excel") {
          downloadAsFile(
            generateCSV(formattedData), 
            `${fileName}.xlsx`, 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
        } else {
          downloadAsFile(
            generatePDF(formattedData, dateRange),
            `${fileName}.pdf`,
            'application/pdf'
          );
        }
        
        // Exibe um toast de sucesso
        toast({
          title: "Relatório gerado com sucesso",
          description: `O relatório de serviços foi baixado em formato ${reportFormat === "excel" ? "Excel" : "PDF"}.`,
          variant: "default",
        });
      }, 1500);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      
      // Exibe um toast de erro
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório de serviços. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  // Função para gerar CSV para Excel
  const generateCSV = (data: Record<string, any>[]) => {
    if (data.length === 0) return '';
    
    // Obter cabeçalhos
    const headers = Object.keys(data[0]);
    
    // Criar linhas de cabeçalho
    const headerRow = headers.join(',');
    
    // Criar linhas de dados
    const rows = data.map(obj => 
      headers.map(header => {
        const value = obj[header] || '';
        // Tratar valores com vírgulas adicionando aspas
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    // Combinar tudo
    return [headerRow, ...rows].join('\n');
  };
  
  // Função para gerar PDF (simulação - na implementação real usaria uma biblioteca como jsPDF)
  const generatePDF = (data: Record<string, any>[], dateRange: { from: Date | undefined; to: Date | undefined }) => {
    // Nesta simulação, estamos apenas retornando uma string que representa o conteúdo
    // Em uma implementação real, usaríamos jsPDF ou outra biblioteca para gerar um PDF real
    
    // Por enquanto, vamos apenas simular o conteúdo
    let content = "Relatório de Serviços\n";
    content += `Data do relatório: ${format(new Date(), "dd/MM/yyyy")}\n\n`;
    
    // Adicionar informações de filtros
    content += "Filtros aplicados:\n";
    if (dateRange.from && dateRange.to) {
      content += `- Período: ${format(dateRange.from, "dd/MM/yyyy")} até ${format(dateRange.to, "dd/MM/yyyy")}\n`;
    }
    content += "\n";
    
    // Adicionar dados
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      content += headers.join("\t") + "\n";
      
      data.forEach(row => {
        content += headers.map(header => row[header] || "").join("\t") + "\n";
      });
    } else {
      content += "Nenhum dado encontrado com os filtros aplicados.";
    }
    
    return content;
  };
  
  // Função para download de arquivo
  const downloadAsFile = (content: string, fileName: string, mimeType: string) => {
    // Criar um blob com o conteúdo
    const blob = new Blob([content], { type: mimeType });
    
    // Criar URL para o blob
    const url = URL.createObjectURL(blob);
    
    // Criar um elemento de link para download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Adicionar o link ao documento
    document.body.appendChild(link);
    
    // Clicar no link para iniciar o download
    link.click();
    
    // Limpar
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
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
              onClick={() => setIsPackageFormOpen(true)}
            >
              <Package className="h-4 w-4" />
              Novo Pacote
            </Button>
            <Button 
              variant="dashboard"
              onClick={() => {
                setSelectedService(undefined);
                setIsServiceFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          
            <Button 
              variant="dashboard-outline"
              onClick={() => setIsExportDialogOpen(true)}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
          </div>
        }
      />

      <ServiceMetrics {...mockMetrics} />

      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex w-full h-10 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
          <TabsTrigger 
            value="services" 
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
      
        <TabsContent value="services" className="mt-0 space-y-4">
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                  className={isFilterOpen ? "bg-blue-100 text-blue-600 border-blue-300" : "border-blue-200"}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                
                {(searchTerm || selectedCategory || statusFilter || priceRangeFilter || popularityFilter) && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={resetFilters}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>
            
            {isFilterOpen && (
              <div className="mt-4 p-4 border rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                <h3 className="font-medium mb-3 text-blue-700">Filtros Avançados</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-600">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-10 rounded-md border border-blue-200 bg-white px-3 text-sm focus:border-blue-400"
                    >
                      <option value="">Todos os status</option>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-600">Faixa de Preço</label>
                    <select
                      value={priceRangeFilter}
                      onChange={(e) => setPriceRangeFilter(e.target.value)}
                      className="w-full h-10 rounded-md border border-blue-200 bg-white px-3 text-sm focus:border-blue-400"
                    >
                      <option value="">Todas as faixas</option>
                      <option value="lt50">Até R$ 50,00</option>
                      <option value="50-100">R$ 50,00 - R$ 100,00</option>
                      <option value="100-200">R$ 100,00 - R$ 200,00</option>
                      <option value="gt200">Acima de R$ 200,00</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-600">Popularidade</label>
                    <select
                      value={popularityFilter}
                      onChange={(e) => setPopularityFilter(e.target.value)}
                      className="w-full h-10 rounded-md border border-blue-200 bg-white px-3 text-sm focus:border-blue-400"
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

      {/* Drawer lateral para relatórios */}
      <Sheet open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
          {/* Cabeçalho fixo */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
            <SheetHeader className="p-6">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-white" />
                  Relatórios de Serviços
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
          <div className="flex-1 overflow-y-auto bg-white p-6">
            <div className="space-y-6">
              {/* Formato do relatório */}
              <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                <h3 className="text-lg font-medium mb-4 text-blue-700">Formato de Saída</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`border rounded-md p-4 cursor-pointer hover:border-blue-400 ${reportFormat === 'excel' ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
                    onClick={() => setReportFormat('excel')}
                  >
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                      <div>
                        <h4 className="font-medium text-blue-700">Excel (.xlsx)</h4>
                        <p className="text-xs text-blue-600/70">Planilha para análises detalhadas</p>
                      </div>
                    </div>
                  </div>
                  <div 
                    className={`border rounded-md p-4 cursor-pointer hover:border-blue-400 ${reportFormat === 'pdf' ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
                    onClick={() => setReportFormat('pdf')}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-red-600" />
                      <div>
                        <h4 className="font-medium text-blue-700">PDF (.pdf)</h4>
                        <p className="text-xs text-blue-600/70">Documento para impressão e apresentação</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Período */}
              <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                <h3 className="text-lg font-medium mb-4 text-blue-700">Período</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-blue-600">Data Inicial</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-blue-200",
                              !dateRange.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                              format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-blue-600">Data Final</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-blue-200",
                              !dateRange.to && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.to ? (
                              format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                            initialFocus
                            locale={ptBR}
                            disabled={(date) => dateRange.from ? date < dateRange.from : false}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
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
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs mt-3 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setDateRange({ from: undefined, to: undefined })}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar datas
                  </Button>
                </div>
              </div>

              <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
                <div className="flex flex-row gap-3 w-full justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsExportDialogOpen(false)}
                    className="border-gray-200"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleExportServices}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
