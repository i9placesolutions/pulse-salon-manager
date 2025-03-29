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

interface PerformanceData {
  appointmentsLastMonth: number;
  rating: number;
  popularityRank: number;
  avgDuration: number;
  priceHistory: { date: string; price: number }[];
  trend: 'up' | 'down' | 'stable';
}

// Using the Service interface from /types/service.ts directly
// instead of redefining ExtendedService

const mockServices: Service[] = [
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

// Export as a function component that returns JSX
const Servicos: React.FC = () => {
  // Add state and component implementation here
  const [servicesPanelOpen, setServicesPanelOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState<[number, number]>([0, 1000]);
  const [services, setServices] = useState<Service[]>(mockServices);
  const { toast } = useToast();

  const [packagePanelOpen, setPackagePanelOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);

  const filteredServices = services.filter((service) => {
    const searchMatch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = categoryFilter ? service.category === categoryFilter : true;
    const statusMatch = statusFilter ? service.status === statusFilter : true;
    const priceMatch = service.price >= priceFilter[0] && service.price <= priceFilter[1];
    return searchMatch && categoryMatch && statusMatch && priceMatch;
  });

  const handleCreateService = (service: Service) => {
    setServices([...services, service]);
    toast({
      title: "Serviço criado",
      description: "O serviço foi criado com sucesso!",
    });
  };

  const handleUpdateService = (updatedService: Service) => {
    const updatedServices = services.map((service) =>
      service.id === updatedService.id ? updatedService : service
    );
    setServices(updatedServices);
    toast({
      title: "Serviço atualizado",
      description: "O serviço foi atualizado com sucesso!",
    });
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter((service) => service.id !== id));
    toast({
      title: "Serviço excluído",
      description: "O serviço foi excluído com sucesso!",
    });
  };

  const handleCreatePackage = (servicePackage: ServicePackage) => {
    toast({
      title: "Pacote criado",
      description: "O pacote foi criado com sucesso!",
    });
  };

  const handleUpdatePackage = (updatedPackage: ServicePackage) => {
    toast({
      title: "Pacote atualizado",
      description: "O pacote foi atualizado com sucesso!",
    });
  };

  const handleDeletePackage = (id: number) => {
    toast({
      title: "Pacote excluído",
      description: "O pacote foi excluído com sucesso!",
    });
  };

  const totalServices = services.length;
  const activeServices = services.filter((service) => service.status === "active").length;
  const totalProfessionals = mockProfessionals.length;
  const totalPackages = 5;

  return (
    <PageLayout>
      <PageHeader title="Serviços" description="Gerenciamento de serviços e pacotes" />
      
      <div className="space-y-6">
        <ServiceMetrics
          totalServices={totalServices}
          activeServices={activeServices}
          totalProfessionals={totalProfessionals}
          totalPackages={totalPackages}
        />

        <ServiceCharts services={services} professionals={mockProfessionals} />

        <Tabs defaultValue="services" className="space-y-4">
          <TabsList>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="packages">Pacotes</TabsTrigger>
          </TabsList>
          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Serviços</h2>
              <Button onClick={() => setServicesPanelOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Serviço
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Input
                placeholder="Buscar serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="Corte">Corte</SelectItem>
                  <SelectItem value="Tintura">Tintura</SelectItem>
                  <SelectItem value="Tratamento">Tratamento</SelectItem>
                  <SelectItem value="Manicure">Manicure</SelectItem>
                  <SelectItem value="Estética">Estética</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={true} className="justify-start w-full text-left font-normal">
                    <Filter className="mr-2 h-4 w-4" />
                    Preço
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-4 space-y-2">
                  <div className="space-y-1">
                    <Label>Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={priceFilter[0]}
                      onChange={(e) => setPriceFilter([Number(e.target.value), priceFilter[1]])}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Máximo</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={priceFilter[1]}
                      onChange={(e) => setPriceFilter([priceFilter[0], Number(e.target.value)])}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell>{formatCurrency(service.price)}</TableCell>
                    <TableCell>
                      <Badge variant={service.status === "active" ? "default" : "secondary"}>
                        {service.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="packages" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Pacotes</h2>
              <Button onClick={() => setPackagePanelOpen(true)}>
                <Package className="mr-2 h-4 w-4" />
                Adicionar Pacote
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Pacote 1</TableCell>
                  <TableCell>Corte, Barba</TableCell>
                  <TableCell>R$ 150,00</TableCell>
                  <TableCell>Ativo</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <ServiceForm
          open={servicesPanelOpen}
          onOpenChange={setServicesPanelOpen}
          onSubmit={handleCreateService}
          service={selectedService}
        />

        <ServicePackageForm
          open={packagePanelOpen}
          onOpenChange={setPackagePanelOpen}
          onSubmit={handleCreatePackage}
          servicePackage={selectedPackage}
        />
      </div>
    </PageLayout>
  );
};

export default Servicos;
