
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  DollarSign,
  Users,
  Package,
} from "lucide-react";
import { Service, ServicePackage } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
import { ServiceForm } from "@/components/servicos/ServiceForm";
import { ServicePackageForm } from "@/components/servicos/ServicePackageForm";
import { ServiceMetrics } from "@/components/servicos/ServiceMetrics";
import { ServiceCommissionDialog } from "@/components/servicos/ServiceCommissionDialog";

// Mock data for demonstration
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
  },
];

// Mock data for professionals
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
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  // Normally these would come from an API
  const mockMetrics = {
    totalServices: mockServices.length,
    activeServices: mockServices.filter((s) => s.status === "active").length,
    totalProfessionals: 5,
    totalPackages: 3,
  };

  const handleServiceSubmit = (service: Partial<Service>) => {
    // Here you would normally make an API call
    console.log("Service submitted:", service);
    toast({
      title: selectedService ? "Serviço atualizado" : "Serviço criado",
      description: "As alterações foram salvas com sucesso!",
    });
  };

  const handlePackageSubmit = (pkg: Partial<ServicePackage>) => {
    // Here you would normally make an API call
    console.log("Package submitted:", pkg);
    toast({
      title: "Pacote criado",
      description: "O pacote foi criado com sucesso!",
    });
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsServiceFormOpen(true);
  };

  const handleDeleteService = (serviceId: number) => {
    // Here you would normally make an API call
    toast({
      title: "Serviço excluído",
      description: "O serviço foi excluído com sucesso!",
    });
  };

  const handleCommissionSave = (serviceId: number, commissions: any[]) => {
    // Here you would normally make an API call
    console.log("Commissions saved:", { serviceId, commissions });
    toast({
      title: "Comissões atualizadas",
      description: "As comissões foram atualizadas com sucesso!",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Serviços</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os serviços oferecidos pelo seu salão
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => setIsPackageFormOpen(true)}
          >
            <Package className="h-4 w-4" />
            Novo Pacote
          </Button>
          <Button className="gap-2" onClick={() => {
            setSelectedService(undefined);
            setIsServiceFormOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <ServiceMetrics {...mockMetrics} />

      {/* Filters */}
      <Card className="p-4">
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
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todas as categorias</option>
            <option value="Corte">Corte</option>
            <option value="Tintura">Tintura</option>
            <option value="Tratamento">Tratamento</option>
            <option value="Manicure">Manicure</option>
            <option value="Estética">Estética</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Services Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {service.duration}min
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {service.price.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>
                      {service.commission.type === "percentage"
                        ? `${service.commission.value}%`
                        : `R$ ${service.commission.value}`}
                    </span>
                    <ServiceCommissionDialog
                      service={service}
                      professionals={mockProfessionals}
                      onSave={(commissions) => handleCommissionSave(service.id, commissions)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      service.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {service.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
