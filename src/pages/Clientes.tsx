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
  Wallet
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { Client, ClientService, ClientPreference, ClientCoupon, ClientFilters, ClientCampaign } from "@/types/client";
import { useClientManagement } from "@/hooks/useClientManagement";
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
import { ClientProfileDialog } from "@/components/clients/ClientProfileDialog";
import { NewClientDialog } from "@/components/clients/NewClientDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
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

export default function Clientes() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Usar o hook de gestão de clientes
  const {
    clients,
    isLoading,
    fetchClients,
    fetchClientPreferences,
    fetchClientServices,
    fetchClientCoupons,
    addClient,
    updateClient,
    deleteClient,
    addClientPreference,
    addClientService,
    addClientCoupon,
    updateClientService,
    deleteClientService,
  } = useClientManagement();

  // Estados para gerenciar a interface
  const [loading, setLoading] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientServices, setClientServices] = useState<ClientService[]>([]);
  const [clientPreferences, setClientPreferences] = useState<ClientPreference[]>([]);
  const [clientCoupons, setClientCoupons] = useState<ClientCoupon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);

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
  
  // Efeito para atualizar a lista de clientes quando o componente montar
  useEffect(() => {
    fetchClients();
  }, []);

  // Efeito para filtrar clientes com base no termo de busca
  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeTab, clients, filters]);

  // Funções para manipulação de dados
  const handleSaveClient = async (client: Partial<Client>) => {
    try {
      setLoading(true);
      
      // Preparar dados do cliente
      const newClientData: Omit<Client, 'id'> = {
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
      
      // Adicionar cliente usando o hook
      await addClient(newClientData);
      
      // Fechar o modal
      setIsNewClientOpen(false);
      
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast({
        title: "Erro ao adicionar cliente",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      setLoading(true);
      
      // Atualizar cliente usando o hook
      await updateClient(updatedClient.id, updatedClient);
      
      // Se o cliente selecionado for o atualizado, atualizar o selecionado também
      if (selectedClient && selectedClient.id === updatedClient.id) {
        setSelectedClient(updatedClient);
      }
      
      // Fechar o modal
      setIsProfileDialogOpen(false);
      
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClient = async (clientId: string) => {
    try {
      setLoading(true);
      const clientName = clients.find(c => c.id === clientId)?.name;
      
      // Remover cliente usando o hook
      await deleteClient(clientId);
      
      // Se o cliente excluído for o selecionado, limpar seleção
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(null);
        setIsProfileDialogOpen(false);
      }
      
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast({
        title: "Erro ao remover cliente",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewProfile = async (client: Client) => {
    try {
      setLoading(true);
      setSelectedClient(client);
      setIsProfileDialogOpen(true);
      
      // Buscar serviços, preferências e cupons do cliente
      const services = await fetchClientServices(client.id);
      const preferences = await fetchClientPreferences(client.id);
      const coupons = await fetchClientCoupons(client.id);
      
      setClientServices(services);
      setClientPreferences(preferences);
      setClientCoupons(coupons);
      
    } catch (error) {
      console.error('Erro ao carregar detalhes do cliente:', error);
      toast({
        title: "Erro ao carregar detalhes",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    const allTags: string[] = [];
    
    clients.forEach(client => {
      if (client.tags) {
        client.tags.forEach(tag => {
          if (!allTags.includes(tag)) {
            allTags.push(tag);
          }
        });
      }
    });
    
    return allTags;
  };
  
  // Obter serviços de um cliente específico
  const getClientServices = (clientId: string) => {
    return clientServices;
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
          <div className="grid grid-cols-3 gap-4 p-4">
            <div className="rounded-lg bg-white p-4 shadow-sm border border-indigo-100">
              <h3 className="text-lg font-medium">Total de Clientes</h3>
              <p className="text-3xl font-bold text-indigo-600">{clientStats.total}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm border border-green-100">
              <h3 className="text-lg font-medium">Clientes Ativos</h3>
              <p className="text-3xl font-bold text-green-600">{clientStats.ativos}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm border border-amber-100">
              <h3 className="text-lg font-medium">Clientes VIP</h3>
              <p className="text-3xl font-bold text-amber-600">{clientStats.vips}</p>
            </div>
          </div>
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
                  services={clientServices}
                />
              </TabsContent>
              
              <TabsContent value="aniversariantes" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  showBirthdayInfo={true}
                  services={clientServices}
                />
              </TabsContent>
              
              <TabsContent value="ativos" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  services={clientServices}
                />
              </TabsContent>
              
              <TabsContent value="vips" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  services={clientServices}
                />
              </TabsContent>
              
              <TabsContent value="inativos" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  services={clientServices}
                />
              </TabsContent>
              
              <TabsContent value="cashback" className="mt-0 p-0">
                <ClientList 
                  clients={filteredClients} 
                  onViewProfile={handleViewProfile}
                  services={clientServices}
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
          services={getClientServices(selectedClient.id)}
        />
      )}
      
      <ClientFiltersDialog
        isOpen={isFiltersDialogOpen}
        onClose={() => setIsFiltersDialogOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        availableTags={getAllTags()}
      />
      

    </PageLayout>
  );
}
