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
  Clock,
  Star,
  Repeat,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { 
  Professional,
  ProfessionalAppointment,
  ProfessionalCommission,
  ProfessionalPayment,
  ProfessionalPerformance,
  ProfessionalSpecialty
} from "@/types/professional";
import { ProfessionalForm } from "@/components/profissionais/ProfessionalForm";
import { ProfessionalDetails } from "@/components/profissionais/ProfessionalDetails";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";
import { exportData } from "@/utils/export";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useSpecialties } from "@/contexts/SpecialtiesContext";
import { Badge } from "@/components/ui/badge";

// Atualização dos dados simulados para usar o novo sistema de especialidades
const mockProfessionals: Professional[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "(11) 99999-9999",
    specialty: "Cabeleireira",
    specialties: [
      { id: "1", name: "Cabeleireira", color: "#ff9800", isActive: true },
      { id: "4", name: "Maquiagem", color: "#e91e63", isActive: true }
    ],
    hiringDate: "2023-01-15",
    experienceLevel: "expert",
    status: "active",
    totalAppointments: 450,
    totalCommission: 15000,
    averageMonthlyRevenue: 5000,
    paymentModel: "commission",
    commissionRate: 30,
    // Novas métricas adicionadas
    lastAppointmentDate: "2024-04-18T14:30:00",
    averageAppointmentDuration: 45,
    monthRanking: 1,
    clientAttendanceRate: 0.95,
    workingDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    history: [
      { id: "1", date: "2024-04-10", service: "Corte", client: "Cliente 1", description: "Horário alterado para 9h às 18h" },
      { id: "2", date: "2024-03-15", service: "Coloração", client: "Cliente 2", description: "Adicionado novo serviço: Coloração" }
    ]
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "(11) 98888-8888",
    specialty: "Barbeiro",
    specialties: [
      { id: "2", name: "Barbeiro", color: "#2196f3", isActive: true }
    ],
    hiringDate: "2023-03-20",
    experienceLevel: "intermediate",
    status: "active",
    totalAppointments: 280,
    totalCommission: 8500,
    averageMonthlyRevenue: 3500,
    paymentModel: "fixed",
    fixedSalary: 3000,
    // Novas métricas adicionadas
    lastAppointmentDate: "2024-04-17T16:45:00",
    averageAppointmentDuration: 30,
    monthRanking: 2,
    clientAttendanceRate: 0.88,
    workingDays: ["Segunda", "Quarta", "Quinta", "Sexta", "Sábado"],
    history: [
      { id: "3", date: "2024-04-05", service: "Corte", client: "Cliente 3", description: "Adicionado atendimento aos sábados" },
      { id: "4", date: "2024-02-20", service: "Barba", client: "Cliente 4", description: "Alteração na taxa de comissão de produtos" }
    ]
  },
  {
    id: "3",
    name: "Mariana Costa",
    email: "mariana.costa@email.com",
    phone: "(11) 97777-7777",
    specialty: "Manicure",
    specialties: [
      { id: "3", name: "Manicure", color: "#4caf50", isActive: true },
      { id: "5", name: "Pedicure", color: "#9c27b0", isActive: true }
    ],
    hiringDate: "2023-05-10",
    experienceLevel: "beginner",
    status: "active",
    totalAppointments: 320,
    totalCommission: 6400,
    averageMonthlyRevenue: 2800,
    paymentModel: "commission",
    commissionRate: 25,
    // Novas métricas adicionadas
    lastAppointmentDate: "2024-04-18T10:15:00",
    averageAppointmentDuration: 60,
    monthRanking: 3,
    clientAttendanceRate: 0.92,
    workingDays: ["Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
    history: [
      { id: "5", date: "2024-03-25", service: "Unhas", client: "Cliente 5", description: "Treinamento em unhas em gel concluído" },
      { id: "6", date: "2024-02-10", service: "Unhas", client: "Cliente 6", description: "Alteração no horário de trabalho" }
    ]
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
    status: "confirmed"
  },
  {
    id: 2,
    date: "2024-03-09",
    clientName: "João Santos",
    serviceName: "Barba",
    value: 40,
    commission: 12,
    status: "pending"
  },
];

const mockCommissions: ProfessionalCommission[] = [
  {
    id: 1,
    paymentDate: "2024-03-01",
    value: 450,
    referenceType: "service",
    referenceName: "Corte de Cabelo",
    status: "paid"
  },
  {
    id: 2,
    paymentDate: "2024-03-01",
    value: 150,
    referenceType: "product",
    referenceName: "Shampoo Profissional",
    status: "pending"
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
    type: "commission"
  },
  {
    id: 2,
    professionalId: 1,
    value: 2800,
    referenceMonth: "2024-03",
    status: "pending",
    type: "salary"
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
  const { specialties } = useSpecialties();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [isNewProfessionalOpen, setIsNewProfessionalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
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
    setIsExportDialogOpen(true);
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    setExportProgress(10);

    // Simulação de processamento
    setTimeout(() => setExportProgress(30), 500);
    setTimeout(() => setExportProgress(50), 1000);
    setTimeout(() => setExportProgress(70), 1500);

    try {
      // Preparar dados para exportação
      const professionalData = prepareExportData();

      setExportProgress(90);

      // Exportar dados usando a função genérica
      exportData(professionalData, exportFormat, 'Relatorio_Profissionais');
      
      setExportProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setIsExportDialogOpen(false);
        setExportProgress(0);
        
        toast({
          title: "Relatório gerado com sucesso",
          description: `O relatório foi exportado no formato ${exportFormat === 'excel' ? 'Excel' : 'CSV'}.`,
        });
      }, 500);

    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setIsExporting(false);
      setExportProgress(0);
      
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDisableProfessional = (professionalId: string) => {
    toast({
      title: "Profissional desativado",
      description: "O profissional foi desativado com sucesso.",
    });
  };

  const handleProfessionalSubmit = (data: Partial<Professional>) => {
    if (selectedProfessional) {
      // Atualizar profissional existente
      setProfessionals(prev => 
        prev.map(p => p.id === selectedProfessional.id ? { ...p, ...data } as Professional : p)
      );
    } else {
      // Adicionar novo profissional
      const newProfessional: Professional = {
        ...data,
        id: `${Date.now()}`, // Criar ID único
        totalAppointments: 0,
        totalCommission: 0,
        averageMonthlyRevenue: 0,
        // Outras propriedades padrão para um novo profissional
      } as Professional;
      
      setProfessionals(prev => [...prev, newProfessional]);
    }

    toast({
      title: selectedProfessional ? "Profissional atualizado" : "Profissional cadastrado",
      description: selectedProfessional
        ? "Os dados do profissional foram atualizados com sucesso!"
        : "Novo profissional cadastrado com sucesso!",
    });
    setIsNewProfessionalOpen(false);
  };

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch = professional.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    // Filtro de especialidade: verifica se alguma das especialidades do profissional corresponde ao filtro
    const matchesSpecialty = !specialtyFilter || 
      professional.specialties?.some(spec => spec.id === specialtyFilter);
    
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
      case "ranking":
        return (a.monthRanking || 999) - (b.monthRanking || 999);
      default:
        return 0;
    }
  });

  // Formatador de data
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para preparar os dados para exportação, incluindo especialidades
  const prepareExportData = () => {
    return professionals.map(professional => {
      return {
        ID: professional.id,
        Nome: professional.name,
        Email: professional.email,
        Telefone: professional.phone,
        'Especialidades': professional.specialties?.map(s => s.name).join(', ') || 'Não definida',
        'Data de Contratação': professional.hiringDate,
        'Nível de Experiência': professional.experienceLevel === 'beginner' ? 'Iniciante' : 
                              professional.experienceLevel === 'intermediate' ? 'Intermediário' : 'Avançado',
        Status: professional.status === 'active' ? 'Ativo' : 'Inativo',
        'Total de Atendimentos': professional.totalAppointments,
        'Comissão Total': professional.totalCommission,
        'Média de Faturamento Mensal': professional.averageMonthlyRevenue,
        'Modelo de Pagamento': professional.paymentModel === 'commission' ? 'Comissão' : 'Salário Fixo',
        'Taxa de Comissão (%)': professional.commissionRate || 0,
        'Salário Fixo': professional.fixedSalary || 0,
        'Último Atendimento': professional.lastAppointmentDate ? new Date(professional.lastAppointmentDate).toLocaleString('pt-BR') : 'N/A',
        'Tempo Médio por Atendimento (min)': professional.averageAppointmentDuration || 0,
        'Ranking no Mês': professional.monthRanking || 0,
        'Taxa de Comparecimento (%)': professional.clientAttendanceRate ? (professional.clientAttendanceRate * 100).toFixed(0) : 'N/A',
        'Dias Disponíveis': professional.workingDays ? professional.workingDays.join(', ') : 'N/A',
      };
    });
  };

  return (
    <div className="space-y-6">
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
            <p className="mt-2 text-2xl font-bold">{professionals.length}</p>
            <p className="text-sm text-muted-foreground">Total de Profissionais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">
              {professionals.reduce(
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
                professionals.reduce(
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
                professionals.reduce(
                  (acc, curr) => acc + curr.averageMonthlyRevenue,
                  0
                ) / professionals.length
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
              {specialties
                .filter(spec => spec.isActive)
                .map(specialty => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))
              }
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
              <SelectItem value="ranking">Ranking</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Seção de métricas e indicadores */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Métricas e Desempenho</CardTitle>
          <CardDescription>
            Visão geral do desempenho da equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Top 3 Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Profissionais do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professionals
                    .filter(p => p.monthRanking && p.monthRanking <= 3)
                    .sort((a, b) => (a.monthRanking || 0) - (b.monthRanking || 0))
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center">
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                          professional.monthRanking === 1 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : professional.monthRanking === 2 
                              ? 'bg-gray-100 text-gray-700' 
                              : 'bg-amber-100 text-amber-700'
                        } mr-3`}>
                          {professional.monthRanking}
                        </div>
                        <div>
                          <p className="font-medium">{professional.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {professional.totalAppointments} atendimentos
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Tempo Médio de Atendimento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tempo Médio de Atendimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professionals
                    .sort((a, b) => (a.averageAppointmentDuration || 0) - (b.averageAppointmentDuration || 0))
                    .slice(0, 3)
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{professional.name}</span>
                        </div>
                        <span className="font-medium">{professional.averageAppointmentDuration} min</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Taxa de Comparecimento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Taxa de Comparecimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professionals
                    .sort((a, b) => (b.clientAttendanceRate || 0) - (a.clientAttendanceRate || 0))
                    .slice(0, 3)
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Repeat className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{professional.name}</span>
                        </div>
                        <span className={`font-medium ${
                          (professional.clientAttendanceRate || 0) > 0.9 
                            ? 'text-green-600' 
                            : (professional.clientAttendanceRate || 0) > 0.8 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                        }`}>
                          {professional.clientAttendanceRate 
                            ? `${(professional.clientAttendanceRate * 100).toFixed(0)}%` 
                            : 'N/A'}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

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
                <TableHead>Especialidades</TableHead>
                <TableHead>Último Atendimento</TableHead>
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
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {professional.specialties?.map(spec => (
                        <Badge key={spec.id} style={{ backgroundColor: spec.color, color: '#fff' }}>
                          {spec.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {professional.lastAppointmentDate 
                      ? formatDate(professional.lastAppointmentDate) 
                      : 'N/A'}
                  </TableCell>
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

      {/* Diálogo de exportação */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Relatório de Profissionais</DialogTitle>
            <DialogDescription>
              Escolha o formato de exportação para o relatório completo de profissionais.
            </DialogDescription>
          </DialogHeader>
          
          {isExporting ? (
            <div className="py-6 space-y-4">
              <Progress value={exportProgress} />
              <p className="text-center text-sm text-muted-foreground">
                Preparando relatório... {exportProgress}%
              </p>
            </div>
          ) : (
            <>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Formato</h3>
                  <div className="flex gap-4">
                    <div 
                      className={`border rounded-md p-4 flex-1 cursor-pointer hover:border-primary ${exportFormat === 'excel' ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setExportFormat('excel')}
                    >
                      <h4 className="font-medium">Excel (.xlsx)</h4>
                      <p className="text-sm text-muted-foreground">Planilha Excel com formatação</p>
                    </div>
                    <div 
                      className={`border rounded-md p-4 flex-1 cursor-pointer hover:border-primary ${exportFormat === 'csv' ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setExportFormat('csv')}
                    >
                      <h4 className="font-medium">CSV (.csv)</h4>
                      <p className="text-sm text-muted-foreground">Arquivo CSV separado por vírgulas</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleExportReport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Relatório
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profissionais;
