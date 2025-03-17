import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Search, 
  Cake, 
  Download, 
  Filter, 
  X, 
  Calendar, 
  Wallet, 
  FileSpreadsheet,
  FileText,
  Plus,
  Users,
  Crown,
  Clock,
  ShoppingBag,
  Check,
  BarChart
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientList } from "@/components/clients/ClientList";
import { ClientStatistics } from "@/components/clients/ClientStatistics";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { Client, ClientService, ClientPreference, ClientCoupon, ClientFilters, ClientExportOptions, ClientCampaign } from "@/types/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientFiltersDialog } from "@/components/clients/ClientFiltersDialog";
import { ClientExportDialog } from "@/components/clients/ClientExportDialog";
import { ClientProfileDialog } from "@/components/clients/ClientProfileDialog";
import { NewClientDialog } from "@/components/clients/NewClientDialog";
import { format, subMonths, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { exportClientReport } from "@/utils/clientReportUtils";

// Dados mockados para demonstração
const mockClients: Client[] = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-9999",
    birthDate: "1990-01-01",
    firstVisit: "2023-01-15",
    status: "active",
    points: 150,
    lastVisit: "2024-03-01",
    cashback: 50.00,
    totalSpent: 1250.00,
    visitsCount: 15,
    address: "Rua Aurora, 123",
    cpf: "123.456.789-00",
    tags: ["Coloração", "Corte"],
    observations: "Prefere atendimento pela manhã",
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao@email.com",
    phone: "(11) 98888-8888",
    birthDate: "1985-05-10",
    firstVisit: "2023-02-20",
    status: "vip",
    points: 300,
    lastVisit: "2024-03-10",
    cashback: 120.00,
    totalSpent: 3500.00,
    visitsCount: 32,
    address: "Av. Paulista, 1000",
    cpf: "987.654.321-00",
    tags: ["Barba", "Corte", "Premium"],
    observations: "Cliente exigente, gosta de atendimento personalizado",
  },
  {
    id: 3,
    name: "Ana Oliveira",
    email: "ana@email.com",
    phone: "(11) 97777-7777",
    birthDate: "1988-07-15",
    firstVisit: "2023-03-25",
    status: "inactive",
    points: 50,
    lastVisit: "2023-08-10",
    cashback: 0,
    totalSpent: 450.00,
    visitsCount: 4,
    tags: ["Manicure", "Pedicure"],
  },
  {
    id: 4,
    name: "Carla Mendes",
    email: "carla@email.com",
    phone: "(11) 96666-6666",
    birthDate: new Date().getFullYear() - 30 + "-" + (new Date().getMonth() + 1).toString().padStart(2, "0") + "-05",
    firstVisit: "2023-05-10",
    status: "active",
    points: 120,
    lastVisit: "2024-02-28",
    cashback: 35.00,
    totalSpent: 890.00,
    visitsCount: 8,
    tags: ["Corte", "Manicure"],
  },
  {
    id: 5,
    name: "Pedro Almeida",
    email: "pedro@email.com",
    phone: "(11) 95555-5555",
    birthDate: new Date().getFullYear() - 25 + "-" + (new Date().getMonth() + 1).toString().padStart(2, "0") + "-12",
    firstVisit: "2023-06-15",
    status: "vip",
    points: 250,
    lastVisit: "2024-03-05",
    cashback: 80.00,
    totalSpent: 2200.00,
    visitsCount: 22,
    tags: ["Corte", "Coloração", "Premium"],
  },
  {
    id: 6,
    name: "Luiza Fonseca",
    email: "luiza@email.com",
    phone: "(11) 94444-4444",
    birthDate: new Date().getFullYear() - 35 + "-" + (new Date().getMonth() + 1).toString().padStart(2, "0") + "-20",
    firstVisit: "2023-07-01",
    status: "active",
    points: 180,
    lastVisit: "2024-03-15",
    cashback: 40.00,
    totalSpent: 1450.00,
    visitsCount: 12,
    tags: ["Corte", "Hidratação"],
  },
];

// Dados mockados para serviços de clientes
const mockServices: ClientService[] = [
  {
    id: 1,
    clientId: 1,
    date: "2024-03-01",
    professional: "João Silva",
    service: "Corte Masculino",
    value: 80.00,
    paymentMethod: "Cartão de Crédito",
    status: "completed",
    cashbackGenerated: 8.00,
    pointsGenerated: 10,
  },
  {
    id: 2,
    clientId: 1,
    date: "2024-02-10",
    professional: "Maria Oliveira",
    service: "Barba",
    value: 50.00,
    paymentMethod: "PIX",
    status: "completed",
    cashbackGenerated: 5.00,
    pointsGenerated: 5,
  },
  {
    id: 3,
    clientId: 2,
    date: "2024-03-15",
    professional: "Carlos Santos",
    service: "Coloração",
    value: 150.00,
    paymentMethod: "Pendente",
    status: "scheduled",
    cashbackGenerated: 0,
    pointsGenerated: 0,
  },
  {
    id: 4,
    clientId: 3,
    date: "2024-02-20",
    professional: "Ana Rodrigues",
    service: "Corte e Barba",
    value: 120.00,
    paymentMethod: "Cartão de Débito",
    status: "completed",
    cashbackGenerated: 12.00,
    pointsGenerated: 15,
  },
  {
    id: 5,
    clientId: 4,
    date: "2024-01-05",
    professional: "Pedro Almeida",
    service: "Manicure",
    value: 60,
    paymentMethod: "Dinheiro",
    status: "canceled",
    cashbackGenerated: 0,
    pointsGenerated: 0,
  },
];

// Dados mockados para cupons de clientes
const mockCoupons: ClientCoupon[] = [
  {
    id: 1,
    clientId: 1,
    code: "WELCOME10",
    discount: 20.00,
    discountType: "fixed",
    date: "2023-01-15",
    service: "Corte de Cabelo",
    description: "Cupom de boas-vindas",
    expirationDate: "2023-12-31",
    isUsed: true,
  },
  {
    id: 2,
    clientId: 2,
    code: "VIP25",
    discount: 50.00,
    discountType: "fixed",
    date: "2023-07-10",
    service: "Barba e Corte",
    description: "Cupom exclusivo para VIPs",
    expirationDate: "2023-12-31",
    isUsed: false,
  },
];

// Dados mockados para campanhas
const mockCampaigns: ClientCampaign[] = [
  {
    id: 1,
    name: "Primavera de Ofertas",
    description: "Descontos especiais para a temporada",
    startDate: "2023-09-21",
    endDate: "2023-12-21",
    targetClients: "all",
    discount: 15,
    discountType: "percentage",
    clientId: 1
  },
  {
    id: 2,
    name: "Clube VIP",
    description: "Ofertas exclusivas para membros VIP",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    targetClients: "vip",
    discount: 20,
    discountType: "percentage",
    clientId: 2
  },
];

// Mock de preferências
const mockPreferences: ClientPreference[] = [
  {
    id: 1,
    clientId: 1,
    category: "Coloração",
    description: "Prefere tons mais naturais",
  },
  {
    id: 2,
    clientId: 1,
    category: "Atendimento",
    description: "Gosta de ser atendida pela Maria",
  },
  {
    id: 3,
    clientId: 2,
    category: "Barba",
    description: "Prefere barba com acabamento clássico",
  },
  {
    id: 4,
    clientId: 2,
    category: "Bebidas",
    description: "Gosta de café expresso durante o atendimento",
  },
];

export default function Clientes() {
  // Estados para controle geral
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [filteredClients, setFilteredClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Estados para controle de modais
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  // Estado para filtros
  const [filters, setFilters] = useState<ClientFilters>({
    status: [],
    dateRange: null,
    lastVisitRange: [null, null],
    spendingRange: [null, null],
    minVisits: undefined,
    hasCashback: false,
    usedCoupons: false,
    joinedCampaigns: false,
    hasWhatsApp: false,
    hasBirthday: false,
    tags: []
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Efeito para filtrar clientes com base no termo de busca
  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeTab, clients, filters]);

  // Funções para manipulação de dados
  const handleSaveClient = (client: Partial<Client>) => {
    setLoading(true);
    
    // Simulando tempo de processamento
    setTimeout(() => {
      // Gerar ID para novo cliente
      const newId = Math.max(...clients.map(c => c.id)) + 1;
      
      // Criar novo cliente com dados padrão para campos não preenchidos
      const newClient: Client = {
        id: newId,
        name: client.name!,
        email: client.email || '',
        phone: client.phone!,
        birthDate: client.birthDate!,
        status: client.status || 'active',
        points: client.points || 0,
        cashback: client.cashback || 0,
        totalSpent: client.totalSpent || 0,
        visitsCount: client.visitsCount || 0,
        firstVisit: client.firstVisit || format(new Date(), 'yyyy-MM-dd'),
        lastVisit: client.lastVisit || undefined,
        observations: client.observations || '',
        cpf: client.cpf || '',
        address: client.address || '',
        tags: client.tags || []
      };
      
      // Adicionar novo cliente ao array de clientes
      setClients(prev => [...prev, newClient]);
      
      // Aplicar filtros para atualizar a visualização
      setLoading(false);
      
      // Mostrar feedback
      toast({
        title: "Cliente adicionado",
        description: `Cliente ${newClient.name} foi adicionado com sucesso`,
      });
    }, 800);
  };
  
  const handleUpdateClient = (updatedClient: Client) => {
    setLoading(true);
    
    // Simulando tempo de processamento
    setTimeout(() => {
      // Atualizar cliente existente
      const updatedClients = clients.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      );
      
      setClients(updatedClients);
      setLoading(false);
      
      // Se o cliente selecionado for o atualizado, atualizar o selecionado também
      if (selectedClient && selectedClient.id === updatedClient.id) {
        setSelectedClient(updatedClient);
      }
      
      // Mostrar feedback
      toast({
        title: "Cliente atualizado",
        description: `Dados de ${updatedClient.name} foram atualizados`,
      });
    }, 800);
  };
  
  const handleDeleteClient = (clientId: number) => {
    setLoading(true);
    
    // Simulando tempo de processamento
    setTimeout(() => {
      // Remover cliente
      const updatedClients = clients.filter(client => client.id !== clientId);
      const clientName = clients.find(c => c.id === clientId)?.name;
      
      setClients(updatedClients);
      setLoading(false);
      
      // Se o cliente excluído for o selecionado, limpar seleção
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(null);
        setIsProfileDialogOpen(false);
      }
      
      // Mostrar feedback
      toast({
        title: "Cliente removido",
        description: `Cliente ${clientName} foi removido do sistema`,
        variant: "destructive"
      });
    }, 800);
  };
  
  const handleViewProfile = (client: Client) => {
    setSelectedClient(client);
    setIsProfileDialogOpen(true);
  };
  
  const handleExportData = () => {
    setIsExportDialogOpen(true);
  };
  
  // Funções para filtros e pesquisa
  const filterBySearchTerm = (client: Client, term: string) => {
    if (!term) return true;
    
    const searchLower = term.toLowerCase();
    
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.phone.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.cpf && client.cpf.toLowerCase().includes(searchLower)) ||
      (client.address && client.address.toLowerCase().includes(searchLower))
    );
  };
  
  const filterByTab = (client: Client, tab: string) => {
    switch (tab) {
      case "todos":
        return true;
      case "ativos":
        return client.status === "active";
      case "vips":
        return client.status === "vip";
      case "inativos":
        return client.status === "inactive";
      case "aniversariantes":
        const now = new Date();
        const birthDate = new Date(client.birthDate);
        return birthDate.getMonth() === now.getMonth();
      case "cashback":
        return client.cashback > 0;
      default:
        return true;
    }
  };
  
  const applyFilters = () => {
    let result = [...clients];
    
    // Filtrar por termo de busca
    if (searchTerm) {
      result = result.filter(client => filterBySearchTerm(client, searchTerm));
    }
    
    // Filtrar por aba selecionada
    result = result.filter(client => filterByTab(client, activeTab));
    
    // Aplicar filtros adicionais
    if (filters.status.length > 0) {
      result = result.filter(client => filters.status.includes(client.status));
    }
    
    if (filters.minVisits !== undefined) {
      result = result.filter(client => client.visitsCount >= filters.minVisits!);
    }
    
    if (filters.hasCashback) {
      result = result.filter(client => client.cashback > 0);
    }
    
    if (filters.lastVisitRange && filters.lastVisitRange[0] && filters.lastVisitRange[1]) {
      result = result.filter(client => {
        if (!client.lastVisit) return false;
        const lastVisit = new Date(client.lastVisit);
        return lastVisit >= filters.lastVisitRange[0]! && lastVisit <= filters.lastVisitRange[1]!;
      });
    }
    
    if (filters.spendingRange && filters.spendingRange[0] && filters.spendingRange[1]) {
      result = result.filter(client => 
        client.totalSpent >= filters.spendingRange[0]! && 
        client.totalSpent <= filters.spendingRange[1]!
      );
    }
    
    if (filters.hasBirthday) {
      const currentMonth = new Date().getMonth();
      result = result.filter(client => {
        const birthMonth = new Date(client.birthDate).getMonth();
        return birthMonth === currentMonth;
      });
    }
    
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(client => 
        client.tags && client.tags.some(tag => filters.tags?.includes(tag))
      );
    }
    
    setFilteredClients(result);
  };
  
  const resetFilters = () => {
    setFilters({
      status: [],
      dateRange: null,
      lastVisitRange: [null, null],
      spendingRange: [null, null],
      minVisits: undefined,
      hasCashback: false,
      usedCoupons: false,
      joinedCampaigns: false,
      hasWhatsApp: false,
      hasBirthday: false,
      tags: []
    });
    
    toast({
      title: "Filtros resetados",
      description: "Todos os filtros foram removidos"
    });
  };
  
  // Verificar se é aniversariante do mês atual
  const isBirthdayInCurrentMonth = (birthDateStr: string) => {
    const birthDate = new Date(birthDateStr);
    const currentMonth = new Date().getMonth();
    return birthDate.getMonth() === currentMonth;
  };
  
  // Contar número de aniversariantes no mês
  const getBirthdayCount = () => {
    return clients.filter(client => isBirthdayInCurrentMonth(client.birthDate)).length;
  };
  
  // Funções para eventos de diálogos
  const handleApplyFilters = (filters: ClientFilters) => {
    setFilters(filters);
    setIsFiltersDialogOpen(false);
    
    toast({
      title: "Filtros aplicados",
      description: "A lista foi atualizada com os filtros selecionados"
    });
  };
  
  const handleExportClients = (options: ClientExportOptions) => {
    setLoading(true);
    
    try {
      const format = options.format;
      let clientsToExport = filteredClients.length > 0 ? filteredClients : clients;
      
      // Filtrar por período caso existam datas definidas
      if (options.dateFrom || options.dateTo) {
        clientsToExport = clientsToExport.filter(client => {
          const lastVisitDate = client.lastVisit ? new Date(client.lastVisit) : null;
          
          // Se não tiver data da última visita, só inclui se não estiver filtrando por datas
          if (!lastVisitDate) return false;
          
          const isAfterStartDate = !options.dateFrom || lastVisitDate >= options.dateFrom;
          const isBeforeEndDate = !options.dateTo || lastVisitDate <= options.dateTo;
          
          return isAfterStartDate && isBeforeEndDate;
        });
      }
      
      // Montando descrição das opções selecionadas
      let reportDescription = `${clientsToExport.length} clientes`;
      
      // Adicionar informação sobre o período, se aplicável
      if (options.timeRange !== 'all') {
        const periodText = {
          'last30': 'dos últimos 30 dias',
          'last90': 'dos últimos 90 dias',
          'last180': 'dos últimos 6 meses',
          'last365': 'do último ano',
          'custom': 'do período selecionado'
        }[options.timeRange] || '';
        
        if (periodText) {
          reportDescription += ` ${periodText}`;
        }
      }
      
      // Adicionar informações sobre o tipo de relatório
      const reportTypeText = {
        'summary': 'relatório resumido',
        'detailed': 'relatório detalhado',
        'analytics': 'relatório estatístico'
      }[options.exportFormat] || 'relatório';
      
      toast({
        title: `Exportação ${format === 'pdf' ? 'PDF' : 'Excel'} iniciada`,
        description: `${reportDescription} serão exportados em ${reportTypeText}.`
      });
      
      // Registrar no console as opções selecionadas (para debug)
      console.log("Opções do relatório:", {
        formato: options.format,
        tipoRelatorio: options.exportFormat,
        periodo: options.timeRange,
        dataInicial: options.dateFrom,
        dataFinal: options.dateTo,
        dadosIncluidos: {
          contato: options.includeContact,
          servicos: options.includeServices,
          gastos: options.includeSpending,
          tags: options.includeTags,
          aniversario: options.includeBirthday,
          preferencias: options.includePreferences,
          historico: options.includeVisitHistory,
          estatisticas: options.includeAnalytics
        },
        clientesExportados: clientsToExport.length
      });
      
      // Gerar e exportar o relatório usando as funções reais
      exportClientReport(clientsToExport, options);
      
      // Exibir notificação de sucesso após o download iniciar
      setTimeout(() => {
        toast({
          title: "Exportação concluída",
          description: `${reportTypeText.charAt(0).toUpperCase() + reportTypeText.slice(1)} ${format === 'pdf' ? 'PDF' : 'Excel'} exportado com sucesso.`,
          variant: "default"
        });
        
        setLoading(false);
        setIsExportDialogOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Estatísticas dos clientes
  const clientStats = {
    total: clients.length,
    ativos: clients.filter(c => c.status === 'active').length,
    vips: clients.filter(c => c.status === 'vip').length,
    inativos: clients.filter(c => c.status === 'inactive').length,
    aniversariantes: getBirthdayCount(),
    comCashback: clients.filter(c => c.cashback > 0).length,
  };
  
  // Obter todas as tags únicas dos clientes
  const getAllTags = () => {
    const tags = new Set<string>();
    clients.forEach(client => {
      if (client.tags) {
        client.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus clientes e relacionamentos
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button 
            onClick={() => setIsNewClientOpen(true)} 
            className="bg-primary hover:bg-primary/90 text-white"
            size="sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
          
          <Button 
            onClick={handleExportData} 
            variant="outline" 
            size="sm"
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          >
            <BarChart className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
        </div>
      </div>
      
      {/* Estatísticas e filtros */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Card className="md:col-span-9">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium">Visão geral dos clientes</h3>
            </div>
            <ClientStatistics 
              totalClients={clientStats.total}
              activeClients={clientStats.ativos}
              vipClients={clientStats.vips}
              inactiveClients={clientStats.inativos}
              birthdayClients={clientStats.aniversariantes}
              cashbackClients={clientStats.comCashback}
            />
          </div>
        </Card>
        
        <Card className="md:col-span-3">
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium">Filtros rápidos</h3>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="justify-start"
                onClick={() => setIsFiltersDialogOpen(true)}
              >
                <Filter className="mr-2 h-4 w-4 text-primary" />
                Filtros avançados
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="justify-start"
                onClick={resetFilters}
              >
                <X className="mr-2 h-4 w-4 text-gray-500" />
                Limpar filtros
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Barra de pesquisa e abas */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes por nome, telefone, e-mail..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
            <TabsTrigger value="todos" className="data-[state=active]:bg-primary/10 text-xs rounded-md py-2">
              <Users className="h-4 w-4 mr-1" />
              Todos ({clientStats.total})
            </TabsTrigger>
            <TabsTrigger value="ativos" className="data-[state=active]:bg-primary/10 text-xs rounded-md py-2">
              <Check className="h-4 w-4 mr-1 text-green-500" />
              Ativos ({clientStats.ativos})
            </TabsTrigger>
            <TabsTrigger value="vips" className="data-[state=active]:bg-primary/10 text-xs rounded-md py-2">
              <Crown className="h-4 w-4 mr-1 text-yellow-500" />
              VIPs ({clientStats.vips})
            </TabsTrigger>
            <TabsTrigger value="inativos" className="data-[state=active]:bg-primary/10 text-xs rounded-md py-2">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              Inativos ({clientStats.inativos})
            </TabsTrigger>
            <TabsTrigger value="aniversariantes" className="data-[state=active]:bg-primary/10 text-xs rounded-md py-2">
              <Cake className="h-4 w-4 mr-1 text-pink-500" />
              Aniversários ({clientStats.aniversariantes})
            </TabsTrigger>
            <TabsTrigger value="cashback" className="data-[state=active]:bg-primary/10 text-xs rounded-md py-2">
              <Wallet className="h-4 w-4 mr-1 text-green-600" />
              Cashback ({clientStats.comCashback})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos" className="mt-4">
            <ClientList 
              clients={filteredClients} 
              onViewProfile={handleViewProfile}
              services={mockServices}
            />
          </TabsContent>
          
          <TabsContent value="aniversariantes" className="mt-4">
            <ClientList 
              clients={filteredClients} 
              onViewProfile={handleViewProfile}
              showBirthdayInfo={true}
              services={mockServices}
            />
          </TabsContent>
          
          <TabsContent value="ativos" className="mt-4">
            <ClientList 
              clients={filteredClients} 
              onViewProfile={handleViewProfile}
              services={mockServices}
            />
          </TabsContent>
          
          <TabsContent value="vips" className="mt-4">
            <ClientList 
              clients={filteredClients} 
              onViewProfile={handleViewProfile}
              services={mockServices}
            />
          </TabsContent>
          
          <TabsContent value="inativos" className="mt-4">
            <ClientList 
              clients={filteredClients} 
              onViewProfile={handleViewProfile}
              services={mockServices}
            />
          </TabsContent>
          
          <TabsContent value="cashback" className="mt-4">
            <ClientList 
              clients={filteredClients} 
              onViewProfile={handleViewProfile}
              services={mockServices}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogs de Funcionalidades */}
      <NewClientDialog 
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onSave={handleSaveClient}
      />
      
      {selectedClient && (
        <ClientProfileDialog
          client={selectedClient}
          isOpen={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
          onUpdate={handleUpdateClient}
          onDelete={handleDeleteClient}
          services={mockServices.filter(s => s.clientId === selectedClient.id)}
        />
      )}
      
      <ClientFiltersDialog
        isOpen={isFiltersDialogOpen}
        onClose={() => setIsFiltersDialogOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        availableTags={getAllTags()}
      />
      
      <ClientExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExportClients}
        clientCount={filteredClients.length}
      />
    </div>
  );
}
