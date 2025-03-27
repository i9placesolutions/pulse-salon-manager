import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Search, 
  Cake, 
  Filter, 
  X, 
  Users,
  Crown,
  Clock,
  Check,
  BarChart,
  Wallet
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarDatePicker } from "@/components/ui/calendar";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormCard } from "@/components/shared/FormCard";

// Dados mockados para demonstração
const mockClients: Client[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
    id: "5",
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
    id: "6",
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
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados para gerenciar a interface
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([...mockClients]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([...mockClients]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filters, setFilters] = useState<ClientFilters>({
    status: [],
    tags: [],
    dateRange: null,
    spendingRange: [null, null],
    lastVisitRange: [null, null],
    minVisits: undefined,
    hasCashback: false,
    hasWhatsApp: false,
    hasBirthday: false,
    usedCoupons: false,
    joinedCampaigns: false
  });
  
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
      const newId = String(Math.max(...clients.map(c => parseInt(c.id))) + 1);
      
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
  
  const handleDeleteClient = (clientId: string) => {
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
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();
        
        if (!client.birthDate) return false;
        
        const birthDate = new Date(client.birthDate);
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();
        
        // Mostrar apenas aniversariantes do mês atual cujos aniversários ainda não passaram
        return birthMonth === currentMonth && birthDay >= currentDay;
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
        return lastVisit >= filters.lastVisitRange![0]! && lastVisit <= filters.lastVisitRange![1]!;
      });
    }
    
    if (filters.spendingRange && filters.spendingRange[0] && filters.spendingRange[1]) {
      result = result.filter(client => 
        client.totalSpent >= filters.spendingRange![0]! && 
        client.totalSpent <= filters.spendingRange![1]!
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
      tags: [],
      dateRange: null,
      lastVisitRange: [null, null],
      spendingRange: [null, null],
      minVisits: undefined,
      hasCashback: false,
      usedCoupons: false,
      joinedCampaigns: false,
      hasWhatsApp: false,
      hasBirthday: false
    });
    
    toast({
      title: "Filtros resetados",
      description: "Todos os filtros foram removidos"
    });
  };
  
  // Verificar se é aniversariante do mês atual
  const isBirthdayInCurrentMonth = (birthDateStr: string) => {
    try {
      if (!birthDateStr) return false;
      
      const birthDate = new Date(birthDateStr);
      if (isNaN(birthDate.getTime())) return false; // Verifica se a data é válida
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();
      
      // Verifica se o aniversário é neste mês e ainda não passou
      return birthMonth === currentMonth && birthDay >= currentDay;
    } catch (error) {
      console.error("Erro ao verificar aniversário no mês:", error);
      return false;
    }
  };
  
  // Contar número de aniversariantes no mês
  const getBirthdayCount = () => {
    try {
      if (!clients || !Array.isArray(clients)) return 0;
      
      return clients.filter(client => {
        try {
          return client && client.birthDate && isBirthdayInCurrentMonth(client.birthDate);
        } catch {
          return false;
        }
      }).length;
    } catch (error) {
      console.error("Erro ao contar aniversariantes:", error);
      return 0;
    }
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
    total: clients?.length || 0,
    ativos: clients?.filter(c => c?.status === 'active')?.length || 0,
    vips: clients?.filter(c => c?.status === 'vip')?.length || 0,
    inativos: clients?.filter(c => c?.status === 'inactive')?.length || 0,
    aniversariantes: getBirthdayCount(),
    comCashback: clients?.filter(c => (c?.cashback || 0) > 0)?.length || 0,
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
    <PageLayout variant="blue">
      <PageHeader 
        title="Clientes" 
        subtitle="Gerencie seus clientes e relacionamentos"
        variant="blue"
        badge="Cadastros"
        action={
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="dashboard"
              onClick={() => setIsNewClientOpen(true)} 
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
            
            <Button 
              variant="dashboard-outline"
              onClick={handleExportData} 
              size="sm"
              className="border-indigo-400 text-indigo-600 hover:bg-indigo-50 shadow-sm"
            >
              <BarChart className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
          </div>
        }
      />
      
      {/* Estatísticas e filtros */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <FormCard 
          variant="blue" 
          title="Visão geral dos clientes"
          className="md:col-span-9 border-indigo-200 shadow-md overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-blue-500 to-sky-400"></div>
          <ClientStatistics 
            totalClients={clientStats.total}
            activeClients={clientStats.ativos}
            vipClients={clientStats.vips}
            inactiveClients={clientStats.inativos}
            birthdayClients={clientStats.aniversariantes}
            cashbackClients={clientStats.comCashback}
            birthdaysThisMonth={clientStats.aniversariantes}
            birthdaysLastMonth={clientStats.aniversariantes - 2}
          />
        </FormCard>
        
        <FormCard 
          variant="blue"
          title="Filtros rápidos"
          className="md:col-span-3 border-indigo-200 shadow-md overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-indigo-400"></div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="dashboard-outline" 
              size="sm"
              className="justify-start border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => setIsFiltersDialogOpen(true)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros avançados
            </Button>
            <Button 
              variant="dashboard-ghost"
              size="sm"
              className="justify-start"
              onClick={resetFilters}
            >
              <X className="mr-2 h-4 w-4" />
              Limpar filtros
            </Button>
          </div>
        </FormCard>
      </div>
      
      {/* Barra de pesquisa e abas */}
      <FormCard variant="blue" className="mb-6" title="Busca e filtros">
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
          
          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex w-full h-10 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
              <TabsTrigger 
                value="todos" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">Todos ({String(clientStats.total)})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ativos" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
              >
                <Check className="h-4 w-4" />
                <span className="font-medium">Ativos ({String(clientStats.ativos)})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="vips" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
              >
                <Crown className="h-4 w-4" />
                <span className="font-medium">VIPs ({String(clientStats.vips)})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="inativos" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
              >
                <Clock className="h-4 w-4" />
                <span className="font-medium">Inativos ({String(clientStats.inativos)})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="aniversariantes" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
              >
                <Cake className="h-4 w-4" />
                <span className="font-medium">Aniversários ({String(clientStats.aniversariantes)})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="cashback" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
              >
                <Wallet className="h-4 w-4" />
                <span className="font-medium">Cashback ({String(clientStats.comCashback)})</span>
              </TabsTrigger>
            </TabsList>
            
            <FormCard variant="blue" className="mb-0" title="Lista de clientes">
              <TabsContent value="todos" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  services={mockServices}
                />
              </TabsContent>
              
              <TabsContent value="aniversariantes" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  showBirthdayInfo={true}
                  services={mockServices}
                />
              </TabsContent>
              
              <TabsContent value="ativos" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  services={mockServices}
                />
              </TabsContent>
              
              <TabsContent value="vips" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  services={mockServices}
                />
              </TabsContent>
              
              <TabsContent value="inativos" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  services={mockServices}
                />
              </TabsContent>
              
              <TabsContent value="cashback" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  services={mockServices}
                />
              </TabsContent>
            </FormCard>
          </Tabs>
        </div>
      </FormCard>
      
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
          services={mockServices.filter(s => s.clientId === parseInt(selectedClient.id))}
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
    </PageLayout>
  );
}
