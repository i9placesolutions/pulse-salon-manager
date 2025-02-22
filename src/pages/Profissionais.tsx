import { useState } from "react";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  Plus,
  FileText,
  BarChart,
  Download,
  MoreVertical,
  UserPlus,
  Ban,
  Scissors,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { 
  Professional,
  ProfessionalAppointment,
  ProfessionalCommission,
  ProfessionalPayment,
  ProfessionalPerformance 
} from "@/types/professional";
import { ProfessionalForm } from "@/components/profissionais/ProfessionalForm";
import { ProfessionalDetails } from "@/components/profissionais/ProfessionalDetails";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";

const mockProfessionals: Professional[] = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "(11) 99999-9999",
    specialty: "Cabeleireira",
    hiringDate: "2023-01-15",
    experienceLevel: "expert",
    status: "active",
    totalAppointments: 450,
    totalCommission: 15000,
    averageMonthlyRevenue: 5000,
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "(11) 98888-8888",
    specialty: "Barbeiro",
    hiringDate: "2023-03-20",
    experienceLevel: "intermediate",
    status: "active",
    totalAppointments: 280,
    totalCommission: 8500,
    averageMonthlyRevenue: 3500,
  },
];

const mockAppointments: ProfessionalAppointment[] = [
  {
    id: 1,
    date: "2024-03-10",
    clientName: "Maria Silva",
    serviceName: "Corte de Cabelo",
    value: 80,
    commission: 24,
  },
  {
    id: 2,
    date: "2024-03-09",
    clientName: "João Santos",
    serviceName: "Barba",
    value: 40,
    commission: 12,
  },
];

const mockCommissions: ProfessionalCommission[] = [
  {
    id: 1,
    paymentDate: "2024-03-01",
    value: 450,
    referenceType: "service",
    referenceName: "Corte de Cabelo",
    status: "paid",
  },
  {
    id: 2,
    paymentDate: "2024-03-01",
    value: 150,
    referenceType: "product",
    referenceName: "Shampoo Profissional",
    status: "pending",
  },
];

const mockPayments: ProfessionalPayment[] = [
  {
    id: 1,
    professionalId: 1,
    value: 2500,
    referenceMonth: "2024-02",
    status: "paid",
    paymentDate: "2024-03-05",
  },
  {
    id: 2,
    professionalId: 1,
    value: 2800,
    referenceMonth: "2024-03",
    status: "pending",
  },
];

const mockPerformance: ProfessionalPerformance = {
  totalAppointments: 450,
  topServices: [
    { serviceName: "Corte de Cabelo", count: 200 },
    { serviceName: "Coloração", count: 150 },
    { serviceName: "Hidratação", count: 100 },
  ],
  monthlyRevenue: [
    { month: "Jan", revenue: 4500 },
    { month: "Fev", revenue: 5000 },
    { month: "Mar", revenue: 4800 },
  ],
  rating: 4.8,
  clientReturnRate: 0.75,
};

const Profissionais = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [isNewProfessionalOpen, setIsNewProfessionalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const handleNewProfessional = () => {
    setSelectedProfessional(null);
    setIsNewProfessionalOpen(true);
  };

  const handleEditProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsNewProfessionalOpen(true);
  };

  const handleShowDetails = (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsDetailsOpen(true);
  };

  const handleGenerateReport = () => {
    toast({
      title: "Gerando relatório",
      description: "O relatório será gerado em breve.",
    });
  };

  const handleDisableProfessional = (professionalId: number) => {
    toast({
      title: "Profissional desativado",
      description: "O profissional foi desativado com sucesso.",
    });
  };

  const handleProfessionalSubmit = (data: Partial<Professional>) => {
    toast({
      title: selectedProfessional ? "Profissional atualizado" : "Profissional cadastrado",
      description: selectedProfessional
        ? "Os dados do profissional foram atualizados com sucesso!"
        : "Novo profissional cadastrado com sucesso!",
    });
    setIsNewProfessionalOpen(false);
  };

  const filteredProfessionals = mockProfessionals.filter((professional) => {
    const matchesSearch = professional.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      !specialtyFilter || professional.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    switch (sortBy) {
      case "appointments":
        return b.totalAppointments - a.totalAppointments;
      case "commission":
        return b.totalCommission - a.totalCommission;
      case "revenue":
        return b.averageMonthlyRevenue - a.averageMonthlyRevenue;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Profissionais</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua equipe de profissionais
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleNewProfessional}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Profissional
          </Button>
          <Button variant="outline" onClick={handleGenerateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Relatório Completo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Users className="h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">{mockProfessionals.length}</p>
            <p className="text-sm text-muted-foreground">Total de Profissionais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">
              {mockProfessionals.reduce(
                (acc, curr) => acc + curr.totalAppointments,
                0
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Total de Atendimentos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <DollarSign className="h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(
                mockProfessionals.reduce(
                  (acc, curr) => acc + curr.totalCommission,
                  0
                )
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Total em Comissões
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <TrendingUp className="h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(
                mockProfessionals.reduce(
                  (acc, curr) => acc + curr.averageMonthlyRevenue,
                  0
                ) / mockProfessionals.length
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Média de Faturamento
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar profissionais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select 
          value={specialtyFilter || "all"} 
          onValueChange={(value) => setSpecialtyFilter(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Especialidade</SelectLabel>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Cabeleireira">Cabeleireira</SelectItem>
              <SelectItem value="Barbeiro">Barbeiro</SelectItem>
              <SelectItem value="Manicure">Manicure</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select 
          value={sortBy || "none"} 
          onValueChange={(value) => setSortBy(value === "none" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Ordenar por</SelectLabel>
              <SelectItem value="none">Nenhum</SelectItem>
              <SelectItem value="appointments">Atendimentos</SelectItem>
              <SelectItem value="commission">Comissão</SelectItem>
              <SelectItem value="revenue">Faturamento</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>
            {filteredProfessionals.length} profissionais encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Atendimentos</TableHead>
                <TableHead>Comissão Total</TableHead>
                <TableHead>Média Mensal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProfessionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{professional.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {professional.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{professional.specialty}</TableCell>
                  <TableCell>{professional.totalAppointments}</TableCell>
                  <TableCell>{formatCurrency(professional.totalCommission)}</TableCell>
                  <TableCell>
                    {formatCurrency(professional.averageMonthlyRevenue)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        professional.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {professional.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShowDetails(professional)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProfessional(professional)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart className="mr-2 h-4 w-4" />
                          Relatório Individual
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar Dados
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDisableProfessional(professional.id)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Desativar Profissional
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProfessionalForm
        open={isNewProfessionalOpen}
        onOpenChange={setIsNewProfessionalOpen}
        onSubmit={handleProfessionalSubmit}
        professional={selectedProfessional || undefined}
      />

      {selectedProfessional && (
        <ProfessionalDetails
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          professional={selectedProfessional}
          appointments={mockAppointments}
          commissions={mockCommissions}
          payments={mockPayments}
          performance={mockPerformance}
        />
      )}
    </div>
  );
};

export default Profissionais;
