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
  Ticket, 
  Tag, 
  CreditCard,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  Plus,
  Users,
  Crown,
  Clock,
  ShoppingBag
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientList } from "@/components/clients/ClientList";
import { ClientStatistics } from "@/components/clients/ClientStatistics";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { Client, ClientService, ClientPreference, ClientCoupon, ClientFilters, ClientExportOptions, ClientCampaign } from "@/types/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isClientProfileOpen, setIsClientProfileOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<ClientFilters>({
    status: [],
    minVisits: 0,
    hasCashback: false,
    usedCoupons: false,
    joinedCampaigns: false,
    tags: [],
    dateRange: null,
    lastVisitRange: [null, null],
    spendingRange: [null, null],
    hasWhatsApp: false,
    hasBirthday: false,
  });

  const { toast } = useToast();

  const handleSaveClient = (client: Partial<Client>) => {
    toast({
      title: "Cliente salvo com sucesso!",
      description: "Os dados do cliente foram atualizados.",
    });
    setIsNewClientOpen(false);
  };

  const handleViewProfile = (client: Client) => {
    setSelectedClient(client);
    setIsClientProfileOpen(true);
  };

  const handleExportData = () => {
    if (!selectedFormat) {
      toast({
        title: "Selecione um formato",
        description: "Por favor, selecione um formato para exportação",
      });
      return;
    }

    toast({
      title: "Exportação iniciada",
      description: `Seus dados estão sendo exportados em formato ${selectedFormat.toUpperCase()}`,
    });

    // Simulação de download
    setTimeout(() => {
      toast({
        title: "Exportação concluída",
        description: `Seus dados foram exportados com sucesso em formato ${selectedFormat.toUpperCase()}`,
      });
      setIsExportDialogOpen(false);
      setSelectedFormat(null);
    }, 1500);
  };

  const resetFilters = () => {
    setAppliedFilters({
      status: [],
      minVisits: 0,
      hasCashback: false,
      usedCoupons: false,
      joinedCampaigns: false,
      tags: [],
      dateRange: null,
      lastVisitRange: [null, null],
      spendingRange: [null, null],
      hasWhatsApp: false,
      hasBirthday: false,
    });
    toast({
      title: "Filtros resetados",
      description: "Todos os filtros foram limpos",
    });
  };

  const applyFilters = () => {
    toast({
      title: "Filtros aplicados",
      description: "A lista de clientes foi atualizada conforme os filtros",
    });
    setIsFiltersDialogOpen(false);
  };

  // Filtragem de clientes
  const filteredClients = mockClients.filter(client => {
    // Filtro por pesquisa de texto
    const matchesSearch = 
      searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);
    
    if (!matchesSearch) return false;
    
    // Filtragem por status
    if (appliedFilters.status.length > 0 && !appliedFilters.status.includes(client.status)) {
      return false;
    }
    
    // Filtragem por número mínimo de visitas
    if (appliedFilters.minVisits > 0 && (client.visitsCount || 0) < appliedFilters.minVisits) {
      return false;
    }
    
    // Filtragem por cashback disponível
    if (appliedFilters.hasCashback && (client.cashback || 0) <= 0) {
      return false;
    }
    
    // Filtragem por uso de cupons
    if (appliedFilters.usedCoupons) {
      const hasUsedCoupons = mockCoupons.some(coupon => coupon.clientId === client.id);
      if (!hasUsedCoupons) return false;
    }
    
    // Filtragem por participação em campanhas
    if (appliedFilters.joinedCampaigns) {
      const hasJoinedCampaigns = mockCampaigns.some(campaign => campaign.clientId === client.id);
      if (!hasJoinedCampaigns) return false;
    }
    
    // Filtragem por tags
    if (appliedFilters.tags.length > 0) {
      const clientTags = client.tags || [];
      if (!appliedFilters.tags.some(tag => clientTags.includes(tag))) {
        return false;
      }
    }
    
    // Filtros avançados
    // Verificar intervalo de data da última visita
    if (appliedFilters.lastVisitRange && appliedFilters.lastVisitRange[0] && appliedFilters.lastVisitRange[1] && client.lastVisit) {
      const clientLastVisit = new Date(client.lastVisit);
      const startDate = new Date(appliedFilters.lastVisitRange[0]);
      const endDate = new Date(appliedFilters.lastVisitRange[1]);
      
      if (clientLastVisit < startDate || clientLastVisit > endDate) {
        return false;
      }
    }
    
    // Verificar intervalo de gastos
    if (appliedFilters.spendingRange && 
        ((appliedFilters.spendingRange[0] !== null && client.totalSpent < appliedFilters.spendingRange[0]) || 
         (appliedFilters.spendingRange[1] !== null && client.totalSpent > appliedFilters.spendingRange[1]))) {
      return false;
    }
    
    // Verificar WhatsApp (assumindo que todos os clientes com telefone têm WhatsApp)
    if (appliedFilters.hasWhatsApp && !client.phone) {
      return false;
    }
    
    // Verificar data de aniversário cadastrada
    if (appliedFilters.hasBirthday && !client.birthDate) {
      return false;
    }
    
    return true;
  });

  // Obter os aniversariantes do mês atual
  const currentMonth = new Date().getMonth() + 1; // +1 porque getMonth() retorna 0-11
  const birthdayClients = mockClients.filter(client => {
    const birthMonth = new Date(client.birthDate).getMonth() + 1;
    return birthMonth === currentMonth;
  });
  
  // Organizar aniversariantes por dia
  const sortedBirthdayClients = [...birthdayClients].sort((a, b) => {
    const dayA = new Date(a.birthDate).getDate();
    const dayB = new Date(b.birthDate).getDate();
    return dayA - dayB;
  });

  // Lista de todas as tags disponíveis
  const allTags = Array.from(
    new Set(
      mockClients
        .flatMap(client => client.tags || [])
        .filter(Boolean)
    )
  );

  // Verificar se o aniversário é no mês atual
  const isBirthdayInCurrentMonth = (birthDateStr: string) => {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    return birthDate.getMonth() === today.getMonth();
  };

  // Estatísticas de clientes
  const clientStats = {
    total: mockClients.length,
    active: mockClients.filter((c) => c.status === "active").length,
    vip: mockClients.filter((c) => c.status === "vip").length,
    inactive: mockClients.filter((c) => c.status === "inactive").length,
    birthdays: birthdayClients.length,
  };

  // Manipular a aplicação de filtros
  const handleApplyFilters = (filters: ClientFilters) => {
    setAppliedFilters(filters);
  };

  // Manipular a exportação de clientes
  const handleExportClients = (options: ClientExportOptions) => {
    console.log("Exportando clientes com opções:", options);
    // Em uma implementação real, aqui seria feita a exportação dos dados
    setSelectedFormat(options.format);
    
    toast({
      title: "Exportação iniciada",
      description: `Seus dados estão sendo exportados em formato ${options.format.toUpperCase()}`,
    });

    // Simulação de download
    setTimeout(() => {
      toast({
        title: "Exportação concluída",
        description: `Seus dados foram exportados com sucesso em formato ${options.format.toUpperCase()}`,
      });
      setIsExportDialogOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <Button 
          size="sm" 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => setIsNewClientOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ClientStatistics 
          totalClients={clientStats.total}
          activeClients={clientStats.active}
          vipClients={clientStats.vip}
          inactiveClients={clientStats.inactive}
          birthdayClients={clientStats.birthdays}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, email ou telefone..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setIsFiltersDialogOpen(true)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {Object.keys(appliedFilters).some(key => 
              appliedFilters[key as keyof ClientFilters] !== undefined && 
              (
                Array.isArray(appliedFilters[key as keyof ClientFilters]) 
                  ? (appliedFilters[key as keyof ClientFilters] as any[]).length > 0
                  : true
              )
            ) && (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs text-primary-dark">
                ✓
              </span>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground mr-2">
            {filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            <Users className="h-4 w-4 mr-1.5" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="vip">
            <Crown className="h-4 w-4 mr-1.5" />
            VIP
          </TabsTrigger>
          <TabsTrigger value="inactive">
            <Clock className="h-4 w-4 mr-1.5" />
            Inativos
          </TabsTrigger>
          <TabsTrigger value="birthdays">
            <Cake className="h-4 w-4 mr-1.5" />
            Aniversários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ClientList 
            clients={filteredClients} 
            onViewProfile={handleViewProfile}
            services={mockServices}
          />
        </TabsContent>

        <TabsContent value="vip">
          <ClientList 
            clients={filteredClients} 
            onViewProfile={handleViewProfile}
            services={mockServices}
          />
        </TabsContent>

        <TabsContent value="inactive">
          <ClientList 
            clients={filteredClients} 
            onViewProfile={handleViewProfile}
            services={mockServices}
          />
        </TabsContent>

        <TabsContent value="birthdays">
          {filteredClients.length > 0 ? (
            <>
              <div className="mb-4 p-4 bg-pink-50 rounded-lg border border-pink-100">
                <div className="flex items-center gap-2">
                  <Cake className="h-5 w-5 text-pink-500" />
                  <h3 className="font-medium">Aniversariantes do Mês</h3>
                </div>
                <p className="mt-1 text-sm text-gray-600 ml-7">
                  Clientes que fazem aniversário neste mês. Envie uma mensagem personalizada de felicitações.
                </p>
              </div>
              <ClientList 
                clients={filteredClients} 
                onViewProfile={handleViewProfile}
                showBirthdayInfo
                services={mockServices}
              />
            </>
          ) : (
            <div className="text-center py-12 border rounded-md border-pink-200 bg-pink-50">
              <Cake className="h-12 w-12 text-pink-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-pink-700">Nenhum aniversariante neste mês</p>
              <p className="text-sm text-pink-600 mt-1">
                Quando seus clientes fizerem aniversário no mês atual, eles aparecerão aqui.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <NewClientDialog 
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onSave={handleSaveClient}
      />

      <ClientFiltersDialog
        isOpen={isFiltersDialogOpen}
        onClose={() => setIsFiltersDialogOpen(false)}
        defaultFilters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        availableTags={allTags}
      />

      <ClientExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        clientCount={filteredClients.length}
        onExport={handleExportClients}
      />

      <ClientProfileDialog
        isOpen={isClientProfileOpen}
        onClose={() => setIsClientProfileOpen(false)}
        client={selectedClient}
        services={mockServices}
        preferences={mockPreferences}
        coupons={mockCoupons}
      />
    </div>
  );
}
