import { useNavigate } from "react-router-dom";
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
  Scissors,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Repeat,
  RefreshCw,
  AlertCircle,
  Edit,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  X,
  Import,
  Check,
  FileSearch,
  ArrowUpDown,
  Smile,
  Calendar,
  User,
} from "lucide-react";
import { 
  Professional,
  ProfessionalAppointment,
  ProfessionalCommission,
  ProfessionalPayment,
  ProfessionalPerformance,
  ProfessionalSpecialty
} from "@/types/professional";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { useSpecialties } from "@/contexts/SpecialtiesContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

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
  newClientsPerMonth: 15,
  scheduleOccupancy: 0.85,
  quoteConversionRate: 0.65,
  additionalSalesRate: 0.3
};

const Profissionais = () => {
  const navigate = useNavigate();
  const { specialties } = useSpecialties();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | undefined>();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "csv" | "pdf">("excel");
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [reportTabActive, setReportTabActive] = useState("filters");
  const [selectedProfessionalForReport, setSelectedProfessionalForReport] = useState<string>("all");
  const [reportFiltersValid, setReportFiltersValid] = useState(false);
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const handleDateChange = (type: "from" | "to", value: string) => {
    if (value) {
      const date = new Date(value);
      setDateRange((prev) => ({ ...prev, [type]: date }));
    } else {
      setDateRange((prev) => ({ ...prev, [type]: undefined }));
    }
  };

  // Validar os filtros do relatório para permitir avançar para a próxima aba
  const validateReportFilters = () => {
    // Verificar se pelo menos um filtro foi selecionado
    // Verifica se o profissional foi selecionado
    if (!selectedProfessionalForReport) {
      toast({
        title: "Profissional não selecionado",
        description: "Por favor, selecione um profissional para o relatório.",
        variant: "destructive",
      });
      return false;
    }

    // Se o período personalizado for selecionado, verificar se as datas foram preenchidas
    if (selectedPeriod === "custom") {
      if (!dateRange.from || !dateRange.to) {
        toast({
          title: "Datas não selecionadas",
          description: "Por favor, selecione as datas inicial e final para o período personalizado.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };
  
  // Função para avançar para a próxima aba após validar os filtros
  const handleNextTab = () => {
    if (validateReportFilters()) {
      setReportTabActive("format");
    } else {
      toast({
        title: "Preencha os filtros",
        description: "Por favor, selecione pelo menos um profissional para gerar o relatório.",
        variant: "destructive",
      });
    }
  };
  
  // Manipulador de evento para tentar mudar a aba diretamente
  const handleTabChange = (value: string) => {
    if (value === "format" && reportTabActive === "filters") {
      // Se estiver tentando ir para a aba de formato a partir da aba de filtros
      if (validateReportFilters()) {
        setReportTabActive(value);
      } else {
        toast({
          title: "Preencha os filtros",
          description: "Por favor, selecione pelo menos um profissional para gerar o relatório.",
          variant: "destructive",
        });
      }
    } else {
      // Para outras transições (ex: de formato para filtros), permitir diretamente
      setReportTabActive(value);
    }
  };

  // Filtrar profissionais com base nos critérios
  const filteredProfessionals = mockProfessionals.filter((professional) => {
    // Busca por texto
    const matchesSearch =
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por especialidade
    const matchesSpecialty =
      !specialtyFilter ||
      professional.specialties.some((s) => s.id === specialtyFilter);

    return matchesSearch && matchesSpecialty;
  });

  // Ordenar profissionais
  let sortedProfessionals = [...filteredProfessionals];
  if (sortBy === "name") {
    sortedProfessionals.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "performance") {
    sortedProfessionals.sort((a, b) => (a.monthRanking || 0) - (b.monthRanking || 0));
  } else if (sortBy === "experience") {
    const experienceOrder = { expert: 0, intermediate: 1, beginner: 2 };
    sortedProfessionals.sort(
      (a, b) => experienceOrder[a.experienceLevel] - experienceOrder[b.experienceLevel]
    );
  }

  const handleShowDetails = (professional: Professional) => {
    setSelectedProfessional(professional);
    setDetailsModalOpen(true);
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
        setExportModalOpen(false);
        setExportProgress(0);
        
        toast({
          title: "Relatório gerado com sucesso",
          description: `O relatório foi exportado no formato ${exportFormat === 'excel' ? 'Excel' : exportFormat === 'pdf' ? 'PDF' : 'CSV'}.`,
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

  // Função para preparar dados para exportação
  const prepareExportData = () => {
    return mockProfessionals.map(prof => ({
      Nome: prof.name,
      Email: prof.email,
      Telefone: prof.phone,
      Especialidade: prof.specialties.map(s => s.name).join(", "),
      'Data de Contratação': formatDate(prof.hiringDate),
      'Nível de Experiência': formatExperienceLevel(prof.experienceLevel),
      Status: prof.status === 'active' ? 'Ativo' : 'Inativo',
      'Total de Atendimentos': prof.totalAppointments,
      'Comissão Total': formatCurrency(prof.totalCommission),
      'Faturamento Médio Mensal': formatCurrency(prof.averageMonthlyRevenue)
    }));
  };

  const formatExperienceLevel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'expert': return 'Especialista';
      default: return level;
    }
  };

  const createDefaultPerformance = (): ProfessionalPerformance => {
    return {
      totalAppointments: 0,
      topServices: [],
      monthlyRevenue: [],
      rating: 0,
      clientReturnRate: 0,
      newClientsPerMonth: 0,
      scheduleOccupancy: 0,
      quoteConversionRate: 0,
      additionalSalesRate: 0
    };
  };

  return (
    <PageLayout variant="blue">
      <PageHeader 
        title="Profissionais" 
        subtitle="Gerencie a equipe do seu salão"
        variant="blue"
        badge="Equipe"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="dashboard-outline"
              onClick={() => setExportModalOpen(true)}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <Button
              variant="dashboard"
              onClick={() => navigate("/configuracoes", { state: { initialTab: "usuarios" } })}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Profissional
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-[280px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
          <Input 
            placeholder="Buscar profissionais..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 border-blue-200 focus:border-blue-400"
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Select 
            value={specialtyFilter || "none"} 
            onValueChange={(value) => setSpecialtyFilter(value === "none" ? null : value)}
          >
            <SelectTrigger className="w-[180px] border-blue-200">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Especialidade</SelectLabel>
                <SelectItem value="none">Todas</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select 
            value={sortBy || "none"} 
            onValueChange={(value) => setSortBy(value === "none" ? null : value)}
          >
            <SelectTrigger className="w-[180px] border-blue-200">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ordenar por</SelectLabel>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="performance">Ranking</SelectItem>
                <SelectItem value="experience">Nível de Experiência</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-6 border-blue-100 overflow-hidden">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-700">Métricas e Desempenho</CardTitle>
          </div>
          <CardDescription className="text-blue-600/70">
            Visão geral do desempenho da equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-blue-100 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-amber-500"></div>
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
                <CardTitle className="text-base text-amber-800 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Top Profissionais do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 py-2">
                  {mockProfessionals
                    .filter(p => p.monthRanking && p.monthRanking <= 3)
                    .sort((a, b) => (a.monthRanking || 0) - (b.monthRanking || 0))
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center">
                        <div className={`flex items-center justify-center h-9 w-9 rounded-full ${
                          professional.monthRanking === 1 
                            ? 'bg-gradient-to-br from-yellow-100 to-yellow-300 text-yellow-800 border-2 border-yellow-400' 
                            : professional.monthRanking === 2 
                              ? 'bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 border-2 border-gray-400' 
                              : 'bg-gradient-to-br from-amber-100 to-amber-300 text-amber-800 border-2 border-amber-400'
                        } mr-3`}>
                          {professional.monthRanking}
                        </div>
                        <div>
                          <p className="font-medium text-amber-800">{professional.name}</p>
                          <p className="text-sm text-amber-700/70">
                            {professional.totalAppointments} atendimentos
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-indigo-500"></div>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="text-base text-purple-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Tempo Médio de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 py-2">
                  {mockProfessionals
                    .sort((a, b) => (a.averageAppointmentDuration || 0) - (b.averageAppointmentDuration || 0))
                    .slice(0, 3)
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center justify-between p-2 rounded-md hover:bg-purple-50 transition-colors">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="text-purple-800">{professional.name}</span>
                        </div>
                        <span className="font-medium text-purple-800">{professional.averageAppointmentDuration} min</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-base text-emerald-800 flex items-center gap-2">
                  <Smile className="h-4 w-4 text-emerald-500" />
                  Taxa de Comparecimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 py-2">
                  {mockProfessionals
                    .sort((a, b) => (b.clientAttendanceRate || 0) - (a.clientAttendanceRate || 0))
                    .slice(0, 3)
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center justify-between p-2 rounded-md hover:bg-emerald-50 transition-colors">
                        <div className="flex items-center">
                          <Repeat className="h-4 w-4 mr-2 text-emerald-600" />
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
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6 border-blue-100">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-700">Profissionais</CardTitle>
          </div>
          <CardDescription className="text-blue-600/70">
            Total de {sortedProfessionals.length} profissionais ativos no salão
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="rounded-md border border-blue-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-100">
                  <TableHead className="text-blue-700">Profissional</TableHead>
                  <TableHead className="text-blue-700">Especialidades</TableHead>
                  <TableHead className="text-blue-700">Experiência</TableHead>
                  <TableHead className="text-blue-700">Status</TableHead>
                  <TableHead className="text-blue-700">Info</TableHead>
                  <TableHead className="text-right text-blue-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProfessionals.length > 0 ? (
                  sortedProfessionals.map((professional, idx) => (
                    <TableRow key={professional.id} className={idx % 2 === 0 ? "bg-white hover:bg-blue-50/50" : "bg-gradient-to-r from-blue-50/30 to-indigo-50/30 hover:bg-blue-50/60"}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-blue-700">{professional.name}</span>
                          <span className="text-sm text-blue-600/70">{professional.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {professional.specialties.map((specialty, idx) => (
                            <Badge 
                              key={specialty.id} 
                              variant="outline"
                              className={`
                                ${idx % 5 === 0 ? "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border-rose-200" : ""}
                                ${idx % 5 === 1 ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200" : ""}
                                ${idx % 5 === 2 ? "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200" : ""}
                                ${idx % 5 === 3 ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200" : ""}
                                ${idx % 5 === 4 ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200" : ""}
                              `}
                            >
                              {specialty.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "bg-muted/50",
                          professional.experienceLevel === "expert" && "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200",
                          professional.experienceLevel === "intermediate" && "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200",
                          professional.experienceLevel === "beginner" && "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200"
                        )}>
                          {formatExperienceLevel(professional.experienceLevel)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={professional.status === "active" ? "default" : "secondary"} className={professional.status === "active" ? "bg-gradient-to-r from-green-500 to-teal-500" : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700"}>
                          {professional.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="text-green-700">
                            <DollarSign className="inline h-4 w-4 text-green-600 mr-1" />
                            {formatCurrency(professional.totalCommission)}
                          </span>
                          <span className="text-blue-700">
                            <Calendar className="inline h-4 w-4 text-blue-600 mr-1" />
                            {formatDate(professional.lastAppointmentDate || '')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                              <MoreVertical className="h-4 w-4 text-blue-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-blue-100">
                            <DropdownMenuItem 
                              onClick={() => handleShowDetails(professional)}
                              className="text-blue-700 cursor-pointer hover:bg-blue-50"
                            >
                              <User className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => alert(`Editar: ${professional.name}`)}
                              className="text-indigo-700 cursor-pointer hover:bg-indigo-50"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => alert(`Agendar: ${professional.name}`)}
                              className="text-emerald-700 cursor-pointer hover:bg-emerald-50"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Agendar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-blue-700">
                      Nenhum profissional encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes do profissional */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-screen-md">
          {selectedProfessional && 
            <ProfessionalDetails 
              professional={selectedProfessional}
              open={detailsModalOpen}
              onOpenChange={setDetailsModalOpen}
              appointments={[]}
              commissions={[]}
              payments={[]}
              performance={mockPerformance}
            />
          }
        </DialogContent>
      </Dialog>

      {/* Drawer para exportação de relatórios */}
      <Sheet open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md md:max-w-lg flex flex-col overflow-hidden">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatório de Profissionais
                </SheetTitle>
                <SheetClose className="rounded-full opacity-70 text-white hover:opacity-100 focus:ring-0">
                  <X className="h-4 w-4" />
                </SheetClose>
              </div>
              <SheetDescription className="text-blue-100">
                Configure e exporte dados da equipe em diferentes formatos
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 p-6 bg-white overflow-y-auto">
            <Tabs value={reportTabActive} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                <TabsTrigger 
                  value="filters" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <FileSearch className="h-4 w-4 mr-2" />
                  Filtros
                </TabsTrigger>
                <TabsTrigger 
                  value="format" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Formato
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="filters" className="p-4 border border-blue-100 rounded-md mt-4 bg-blue-50/50">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-700">Selecione os Profissionais</h3>
                    <select
                      value={selectedProfessionalForReport}
                      onChange={(e) => setSelectedProfessionalForReport(e.target.value)}
                      className="w-full h-10 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="all">Todos os profissionais</option>
                      {mockProfessionals.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-700">Período</h3>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full h-10 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="all">Todo o período</option>
                      <option value="current-month">Mês atual</option>
                      <option value="last-month">Mês anterior</option>
                      <option value="last-3-months">Últimos 3 meses</option>
                      <option value="year-to-date">Ano até a data</option>
                      <option value="custom">Período personalizado</option>
                    </select>
                  </div>
                  
                  {selectedPeriod === "custom" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-blue-700">Data Inicial</Label>
                          <input
                            type="date"
                            value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                            onChange={(e) => handleDateChange("from", e.target.value)}
                            className="w-full h-10 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm text-blue-700">Data Final</Label>
                          <input
                            type="date"
                            value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                            onChange={(e) => handleDateChange("to", e.target.value)}
                            className="w-full h-10 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleNextTab}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="format" className="p-4 border border-blue-100 rounded-md mt-4 bg-blue-50/50">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-700">Formato de Saída</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div 
                        className={`border rounded-md p-3 cursor-pointer ${exportFormat === 'excel' ? 'bg-blue-100 border-blue-300' : 'bg-white border-blue-100'}`}
                        onClick={() => setExportFormat('excel')}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FileSpreadsheet className="h-8 w-8 text-green-600" />
                          <span className="text-sm text-blue-700">Excel</span>
                        </div>
                      </div>
                      <div 
                        className={`border rounded-md p-3 cursor-pointer ${exportFormat === 'csv' ? 'bg-blue-100 border-blue-300' : 'bg-white border-blue-100'}`}
                        onClick={() => setExportFormat('csv')}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-orange-600" />
                          <span className="text-sm text-blue-700">CSV</span>
                        </div>
                      </div>
                      <div 
                        className={`border rounded-md p-3 cursor-pointer ${exportFormat === 'pdf' ? 'bg-blue-100 border-blue-300' : 'bg-white border-blue-100'}`}
                        onClick={() => setExportFormat('pdf')}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-red-600" />
                          <span className="text-sm text-blue-700">PDF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setReportTabActive('filters')}
                    className="gap-2 border-blue-200 text-blue-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  
                  <Button
                    onClick={handleExportReport}
                    disabled={isExporting}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Exportar
                      </>
                    )}
                  </Button>
                </div>
                
                {isExporting && (
                  <div className="mt-6 space-y-4">
                    <div className="relative pt-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-blue-600">Progresso</span>
                        <span className="text-blue-600 font-semibold">{exportProgress}%</span>
                      </div>
                      <Progress 
                        value={exportProgress} 
                        className="bg-blue-100" 
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default Profissionais;
