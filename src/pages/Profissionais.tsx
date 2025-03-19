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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Profissionais</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os profissionais do seu salão, suas especialidades e agenda
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2 border-purple-300 text-purple-600 hover:bg-purple-50" onClick={() => setExportModalOpen(true)}>
            <FileText className="h-4 w-4" />
            Relatórios
          </Button>
          
          <Button className="gap-2 bg-pink-600 hover:bg-pink-700 text-white" asChild>
            <a href="/configuracoes?tab=usuarios">
              <UserPlus className="h-4 w-4" />
              Adicionar Profissional
            </a>
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium mb-1 text-blue-700">Gerenciamento unificado de profissionais</h4>
          <p className="text-sm text-blue-600">
            Os profissionais são gerenciados através da tela de <strong>Configurações &gt; Usuários</strong>. 
            Para adicionar ou editar dados básicos de um profissional, acesse a tela de Usuários e edite o respectivo cadastro.
            Nesta tela você pode acessar relatórios individuais, visualizar métricas e gerenciar status dos profissionais.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="overflow-hidden border-blue-100 group hover:shadow-md transition-all">
          <div className="h-1 w-full bg-blue-500"></div>
          <CardContent className="flex flex-col items-center justify-center p-6 group-hover:bg-blue-50/50 transition-colors">
            <Users className="h-8 w-8 text-blue-600" />
            <p className="mt-2 text-2xl font-bold text-blue-700">{mockProfessionals.length}</p>
            <p className="text-sm text-blue-600">Total de Profissionais</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-green-100 group hover:shadow-md transition-all">
          <div className="h-1 w-full bg-green-500"></div>
          <CardContent className="flex flex-col items-center justify-center p-6 group-hover:bg-green-50/50 transition-colors">
            <Calendar className="h-8 w-8 text-green-600" />
            <p className="mt-2 text-2xl font-bold text-green-700">
              {mockProfessionals.reduce(
                (acc, curr) => acc + curr.totalAppointments,
                0
              )}
            </p>
            <p className="text-sm text-green-600">
              Total de Atendimentos
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-amber-100 group hover:shadow-md transition-all">
          <div className="h-1 w-full bg-amber-500"></div>
          <CardContent className="flex flex-col items-center justify-center p-6 group-hover:bg-amber-50/50 transition-colors">
            <DollarSign className="h-8 w-8 text-amber-600" />
            <p className="mt-2 text-2xl font-bold text-amber-700">
              {formatCurrency(
                mockProfessionals.reduce(
                  (acc, curr) => acc + curr.totalCommission,
                  0
                )
              )}
            </p>
            <p className="text-sm text-amber-600">
              Total em Comissões
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-purple-100 group hover:shadow-md transition-all">
          <div className="h-1 w-full bg-purple-500"></div>
          <CardContent className="flex flex-col items-center justify-center p-6 group-hover:bg-purple-50/50 transition-colors">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <p className="mt-2 text-2xl font-bold text-purple-700">
              {formatCurrency(
                mockProfessionals.reduce(
                  (acc, curr) => acc + curr.averageMonthlyRevenue,
                  0
                ) / mockProfessionals.length
              )}
            </p>
            <p className="text-sm text-purple-600">
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
            className="pl-9 border-indigo-200 focus:border-indigo-400"
          />
        </div>
        <Select 
          value={specialtyFilter || "all"} 
          onValueChange={(value) => setSpecialtyFilter(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px] border-indigo-200">
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
          <SelectTrigger className="w-[180px] border-indigo-200">
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

      <Card className="p-6 border-indigo-100 overflow-hidden">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-indigo-700">Métricas e Desempenho</CardTitle>
          </div>
          <CardDescription>
            Visão geral do desempenho da equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-yellow-100 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-amber-500"></div>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                <CardTitle className="text-base text-amber-700 flex items-center gap-2">
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
                            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400' 
                            : professional.monthRanking === 2 
                              ? 'bg-gray-100 text-gray-700 border-2 border-gray-300' 
                              : 'bg-amber-100 text-amber-700 border-2 border-amber-400'
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
            
            <Card className="border-teal-100 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-green-500"></div>
              <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50">
                <CardTitle className="text-base text-teal-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-500" />
                  Tempo Médio de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 py-2">
                  {mockProfessionals
                    .sort((a, b) => (a.averageAppointmentDuration || 0) - (b.averageAppointmentDuration || 0))
                    .slice(0, 3)
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center justify-between p-2 rounded-md hover:bg-teal-50 transition-colors">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-teal-600" />
                          <span>{professional.name}</span>
                        </div>
                        <span className="font-medium text-teal-700">{professional.averageAppointmentDuration} min</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-base text-blue-700 flex items-center gap-2">
                  <Smile className="h-4 w-4 text-blue-500" />
                  Taxa de Comparecimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 py-2">
                  {mockProfessionals
                    .sort((a, b) => (b.clientAttendanceRate || 0) - (a.clientAttendanceRate || 0))
                    .slice(0, 3)
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 transition-colors">
                        <div className="flex items-center">
                          <Repeat className="h-4 w-4 mr-2 text-blue-600" />
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

      <Card className="p-6 border-indigo-100">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-indigo-700">Profissionais</CardTitle>
          </div>
          <CardDescription>
            Total de {sortedProfessionals.length} profissionais ativos no salão
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="rounded-md border border-indigo-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <TableHead className="text-indigo-700">Profissional</TableHead>
                  <TableHead className="text-indigo-700">Especialidades</TableHead>
                  <TableHead className="text-indigo-700">Experiência</TableHead>
                  <TableHead className="text-indigo-700">Status</TableHead>
                  <TableHead className="text-indigo-700">Info</TableHead>
                  <TableHead className="text-right text-indigo-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProfessionals.length > 0 ? (
                  sortedProfessionals.map((professional, idx) => (
                    <TableRow key={professional.id} className={idx % 2 === 0 ? "bg-white hover:bg-indigo-50" : "bg-indigo-50/40 hover:bg-indigo-50"}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-indigo-700">{professional.name}</span>
                          <span className="text-sm text-muted-foreground">{professional.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {professional.specialties.map((specialty) => (
                            <Badge 
                              key={specialty.id} 
                              variant="outline"
                              className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200"
                            >
                              {specialty.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "bg-muted/50",
                          professional.experienceLevel === "expert" && "bg-green-50 text-green-700 border-green-200",
                          professional.experienceLevel === "intermediate" && "bg-blue-50 text-blue-700 border-blue-200",
                          professional.experienceLevel === "beginner" && "bg-amber-50 text-amber-700 border-amber-200"
                        )}>
                          {formatExperienceLevel(professional.experienceLevel)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={professional.status === "active" ? "default" : "secondary"} className={professional.status === "active" ? "bg-green-600" : ""}>
                          {professional.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>
                            Contratado: {formatDate(professional.hiringDate)}
                          </span>
                          <span>
                            Atendimentos: {professional.totalAppointments}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShowDetails(professional)} className="text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50">
                              <FileText className="mr-2 h-4 w-4" />
                              Relatório Individual
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/configuracoes?tab=usuarios&edit=${professional.id}`} className="flex items-center text-pink-600 focus:text-pink-700 focus:bg-pink-50">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Cadastro
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nenhum profissional encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedProfessional && (
        <ProfessionalDetails
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          professional={selectedProfessional}
          appointments={mockAppointments}
          commissions={mockCommissions}
          payments={mockPayments}
          performance={mockPerformance}
        />
      )}

      {/* Drawer lateral para relatórios */}
      <Sheet open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
          {/* Cabeçalho fixo */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
            <SheetHeader className="p-6">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-white" />
                  Relatórios de Profissionais
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
          <div className="flex-1 overflow-y-auto bg-white">
            {isExporting ? (
              <div className="py-12 space-y-6 px-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md">
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-center mt-4 text-sm text-muted-foreground">
                    Preparando relatório... {exportProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-6">
                  {/* Tipo de relatório */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Tipo de Relatório</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary ${selectedProfessionalForReport === 'all' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setSelectedProfessionalForReport('all')}
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-8 w-8 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Todos os Profissionais</h4>
                            <p className="text-xs text-muted-foreground">Relatório completo da equipe</p>
                          </div>
                        </div>
                      </div>
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary ${selectedProfessionalForReport !== 'all' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setSelectedProfessionalForReport(mockProfessionals[0].id)}
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-8 w-8 text-indigo-600" />
                          <div>
                            <h4 className="font-medium">Profissional Individual</h4>
                            <p className="text-xs text-muted-foreground">Relatório detalhado de um profissional</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profissional específico */}
                  {selectedProfessionalForReport !== 'all' && (
                    <div className="bg-muted/30 p-5 rounded-lg border">
                      <h3 className="text-lg font-medium mb-4">Selecionar Profissional</h3>
                      <Select 
                        value={selectedProfessionalForReport}
                        onValueChange={setSelectedProfessionalForReport}
                      >
                        <SelectTrigger id="professional-select" className="w-full">
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProfessionals.map(prof => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Período */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Período</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${selectedPeriod === 'all' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                          onClick={() => setSelectedPeriod('all')}
                        >
                          <Calendar className="h-6 w-6 text-blue-600 mb-1" />
                          <span className="text-xs font-medium text-center">Todo Período</span>
                          <p className="text-xs text-muted-foreground mt-1 text-center">Todos os dados disponíveis</p>
                        </div>
                        <div 
                          className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${selectedPeriod === 'custom' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                          onClick={() => setSelectedPeriod('custom')}
                        >
                          <Calendar className="h-6 w-6 text-orange-500 mb-1" />
                          <span className="text-xs font-medium text-center">Personalizado</span>
                          <p className="text-xs text-muted-foreground mt-1 text-center">Selecionar datas específicas</p>
                        </div>
                      </div>
                      
                      {/* Seção de data personalizada */}
                      {selectedPeriod === "custom" && (
                        <div className="mt-4 p-4 border rounded-md bg-white">
                          <h4 className="text-sm font-medium mb-3">Selecione o intervalo de datas:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Data inicial */}
                            <div className="space-y-2">
                              <Label>Data Inicial</Label>
                              <input
                                type="date"
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                                onChange={(e) => handleDateChange("from", e.target.value)}
                              />
                            </div>
                            
                            {/* Data final */}
                            <div className="space-y-2">
                              <Label>Data Final</Label>
                              <input
                                type="date"
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                                onChange={(e) => handleDateChange("to", e.target.value)}
                                min={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
                              />
                            </div>
                          </div>
                          
                          {/* Mensagem informativa sobre o intervalo de datas */}
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
                          
                          {/* Botão para limpar o intervalo de datas */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs mt-3"
                            onClick={() => setDateRange({ from: undefined, to: undefined })}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Limpar datas
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Filtros */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Filtros</h3>
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="status-filter">
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Ativos</SelectItem>
                            <SelectItem value="inactive">Inativos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Especialidade */}
                      <div className="space-y-2">
                        <Label>Especialidade</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="specialty-filter">
                            <SelectValue placeholder="Selecione uma especialidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {specialties
                              .filter(spec => spec.isActive)
                              .map(specialty => (
                                <SelectItem key={specialty.id} value={specialty.id}>
                                  {specialty.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Nível de experiência */}
                      <div className="space-y-2">
                        <Label>Nível de Experiência</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="experience-filter">
                            <SelectValue placeholder="Selecione um nível" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="beginner">Iniciante</SelectItem>
                            <SelectItem value="intermediate">Intermediário</SelectItem>
                            <SelectItem value="expert">Especialista</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informações a incluir */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Informações a Incluir</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-basic" defaultChecked />
                        <Label htmlFor="include-basic">Informações Básicas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-appointments" defaultChecked />
                        <Label htmlFor="include-appointments">Atendimentos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-commission" defaultChecked />
                        <Label htmlFor="include-commission">Comissões</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-earnings" defaultChecked />
                        <Label htmlFor="include-earnings">Faturamento</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-specialties" defaultChecked />
                        <Label htmlFor="include-specialties">Especialidades</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-performance" defaultChecked />
                        <Label htmlFor="include-performance">Indicadores de Desempenho</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Formato de Saída */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Formato de Saída</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary ${exportFormat === 'excel' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setExportFormat('excel')}
                      >
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                          <div>
                            <h4 className="font-medium">Excel (.xlsx)</h4>
                            <p className="text-xs text-muted-foreground">Planilha para análises detalhadas</p>
                          </div>
                        </div>
                      </div>
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary ${exportFormat === 'pdf' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setExportFormat('pdf')}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-[#db2777]" />
                          <div>
                            <h4 className="font-medium">PDF (.pdf)</h4>
                            <p className="text-xs text-muted-foreground">Documento para impressão e apresentação</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Nome do Arquivo */}
                  <div className="space-y-2">
                    <Label>Nome do Arquivo</Label>
                    <Input 
                      placeholder="Relatório de Profissionais" 
                      defaultValue={selectedProfessionalForReport !== "all" 
                        ? `Relatório - ${mockProfessionals.find(p => p.id === selectedProfessionalForReport)?.name || 'Profissional'}` 
                        : "Relatório de Profissionais"
                      } 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Rodapé fixo */}
          <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
            <div className="flex flex-row gap-3 w-full justify-end">
              <Button 
                variant="outline" 
                onClick={() => setExportModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleExportReport}
                variant="pink"
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Profissionais;
