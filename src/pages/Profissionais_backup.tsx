import { useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertCircle,
  BarChart,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  FileSpreadsheet,
  FileText,
  Filter,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  Printer,
  Repeat,
  Scissors,
  Search,
  Settings,
  Smile,
  Star,
  TrendingUp,
  User,
  UserPlus,
  Users,
  ArrowUpDown,
} from "lucide-react";
import {
  Professional,
  ProfessionalAppointment,
  ProfessionalCommission,
  ProfessionalPayment,
  ProfessionalPerformance,
  ProfessionalSpecialty,
} from "@/types/professional";
import { ProfessionalDetails } from "@/components/profissionais/ProfessionalDetails";
import { formatCurrency } from "@/utils/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSpecialties } from "@/contexts/SpecialtiesContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useProfessionalManagement } from "@/hooks/useProfessionalManagement";

const Profissionais = () => {
  const navigate = useNavigate();
  const { specialties } = useSpecialties();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | undefined>();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  // Usando o hook para gerenciar os profissionais
  const {
    professionals,
    loading,
    error,
    getProfessionalDetails,
    deleteProfessional,
    updateProfessional,
  } = useProfessionalManagement();

  // Função para excluir um profissional (memorizada para evitar recriação)
  const handleDeleteProfessional = useCallback(
    async (id: string) => {
      if (confirm("Tem certeza que deseja excluir este profissional?")) {
        try {
          await deleteProfessional(id);
          toast({
            title: "Sucesso",
            description: "Profissional excluído com sucesso.",
            variant: "default",
          });
        } catch (error) {
          toast({
            title: "Erro",
            description: "Não foi possível excluir o profissional.",
            variant: "destructive",
          });
        }
      }
    },
    [deleteProfessional, toast]
  );

  // Carrega detalhes do profissional quando clicado
  // Função memorizada para carregar detalhes do profissional
  const handleShowDetails = useCallback(
    async (professional: Professional) => {
      try {
        // Buscar detalhes completos do profissional
        const details = await getProfessionalDetails(professional.id);
        if (details) {
          setSelectedProfessional(details);
          setDetailsModalOpen(true);
        } else {
          throw new Error("Detalhes não encontrados");
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do profissional.",
          variant: "destructive",
        });
      }
    },
    [getProfessionalDetails, setSelectedProfessional, setDetailsModalOpen, toast]
  );

  // Formatação do nível de experiência para exibição
  // Função de formatação memorizada para evitar recriação
  const formatExperienceLevel = useCallback((level: string) => {
    switch (level) {
      case "beginner":
        return "Iniciante";
      case "intermediate":
        return "Intermediário";
      case "expert":
        return "Especialista";
      default:
        return level;
    }
  }, []);

  // Cria um objeto de performance padrão para quando não houver dados
  // Performance padrão memorizada quando não há dados disponíveis
  const createDefaultPerformance = useCallback(
    (): ProfessionalPerformance => ({
      totalAppointments: 0,
      topServices: [],
      monthlyRevenue: [],
      rating: 0,
      clientReturnRate: 0,
      newClientsPerMonth: 0,
      scheduleOccupancy: 0,
      quoteConversionRate: 0,
      additionalSalesRate: 0,
    }),
    []
  );

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
              variant="dashboard"
              onClick={() => navigate("/usuarios")}
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 border-blue-200 focus:border-blue-400"
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Select
            value={specialtyFilter || "none"}
            onValueChange={(value) =>
              setSpecialtyFilter(value === "none" ? null : value)
            }
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
            onValueChange={(value) =>
              setSortBy(value === "none" ? null : value)
            }
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
                  {useMemo(() => {
                    return professionals
                    .filter((p) => p.monthRanking && p.monthRanking <= 3)
                    .sort((a, b) => (a.monthRanking || 0) - (b.monthRanking || 0))
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center">
                        <div
                          className={`flex items-center justify-center h-9 w-9 rounded-full ${
                            professional.monthRanking === 1
                              ? "bg-gradient-to-br from-yellow-100 to-yellow-300 text-yellow-800 border-2 border-yellow-400"
                              : professional.monthRanking === 2
                                ? "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 border-2 border-gray-400"
                                : "bg-gradient-to-br from-amber-100 to-amber-300 text-amber-800 border-2 border-amber-400"
                          } mr-3`}
                        >
                          {professional.monthRanking}
                        </div>
                        <div>
                          <p className="font-medium text-amber-800">
                            {professional.name}
                          </p>
                          <p className="text-sm text-amber-700/70">
                            {professional.totalAppointments} atendimentos
                          </p>
                        </div>
                      </div>
                    ))
                  )}
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
                  {useMemo(() => {
                    return professionals
                    .sort((a, b) => (a.averageAppointmentDuration || 0) - (b.averageAppointmentDuration || 0))
                    .slice(0, 3)
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center justify-between p-2 rounded-md hover:bg-purple-50 transition-colors">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="text-xs">
                            {professional.lastAppointmentDate
                              ? new Date(professional.lastAppointmentDate).toLocaleDateString(
                                  "pt-BR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "N/A"}
                          </span>
                        </div>
                        <span className="font-medium text-purple-800">
                          {professional.averageAppointmentDuration || 0} min
                        </span>
                      </div>
                    ))
                  )}
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
                  {useMemo(() => {
                    return professionals
                    .sort((a, b) => (b.clientAttendanceRate || 0) - (a.clientAttendanceRate || 0))
                    .slice(0, 3)
                    .map((professional) => (
                      <div key={professional.id} className="flex items-center justify-between p-2 rounded-md hover:bg-emerald-50 transition-colors">
                        <div className="flex items-center">
                          <Repeat className="h-4 w-4 mr-2 text-emerald-600" />
                          <span className={`font-medium ${(professional.clientAttendanceRate || 0) > 0.9 ? 'text-green-600' : (professional.clientAttendanceRate || 0) > 0.8 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {professional.clientAttendanceRate
                              ? `${(professional.clientAttendanceRate * 100).toFixed(0)}%`
                              : "N/A"}
                          </span>
                        </div>
                        <span className="font-medium text-emerald-800">
                          {professional.name}
                        </span>
                      </div>
                    ))
                  )}
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
            Total de {professionals.filter((p) => p.status === "active").length}{" "}
            profissionais ativos no salão
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-blue-600">Carregando profissionais...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Users className="h-10 w-10 mb-2 text-blue-300" />
                        <p>Nenhum profissional encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : professionals.length > 0 ? (
                  {/* Filtragem e ordenação memorizada para evitar recálculos */}
                  {useMemo(() => {
                    return professionals
                    .filter((professional) => {
                      // Busca por texto
                      const matchesSearch =
                        professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (professional.email &&
                          professional.email.toLowerCase().includes(searchTerm.toLowerCase()));

                      // Filtro por especialidade
                      const matchesSpecialty =
                        !specialtyFilter ||
                        professional.specialties.some((s) => s.id === specialtyFilter);

                      return matchesSearch && matchesSpecialty;
                    })
                    .sort((a, b) => {
                      if (sortBy === "name") {
                        return a.name.localeCompare(b.name);
                      } else if (sortBy === "performance") {
                        return (a.monthRanking || 0) - (b.monthRanking || 0);
                      } else if (sortBy === "experience") {
                        const experienceOrder = { expert: 0, intermediate: 1, beginner: 2 };
                        return (
                          experienceOrder[a.experienceLevel as keyof typeof experienceOrder] -
                          experienceOrder[b.experienceLevel as keyof typeof experienceOrder]
                        );
                      }
                      return 0;
                    })
                    .map((professional, idx) => (
                      <TableRow
                        key={professional.id}
                        className={idx % 2 === 0 ? "bg-white hover:bg-blue-50/50" : "bg-gradient-to-r from-blue-50/30 to-indigo-50/30 hover:bg-blue-50/60"}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-blue-700">
                              {professional.name}
                            </span>
                            <span className="text-sm text-blue-600/70">
                              {professional.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {professional.specialties.map((specialty, idx) => (
                              <Badge
                                key={specialty.id}
                                variant="outline"
                                className={`
                                  ${idx % 5 === 0
                                    ? "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border-rose-200"
                                    : ""}
                                  ${idx % 5 === 1
                                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200"
                                    : ""}
                                  ${idx % 5 === 2
                                    ? "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200"
                                    : ""}
                                  ${idx % 5 === 3
                                    ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200"
                                    : ""}
                                  ${idx % 5 === 4
                                    ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200"
                                    : ""}
                                `}
                              >
                                {specialty.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "bg-muted/50",
                              professional.experienceLevel === "expert" &&
                                "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200",
                              professional.experienceLevel === "intermediate" &&
                                "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200",
                              professional.experienceLevel === "beginner" &&
                                "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200"
                            )}
                          >
                            {formatExperienceLevel(professional.experienceLevel)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={professional.status === "active" ? "default" : "secondary"}
                            className={professional.status === "active" ? "bg-gradient-to-r from-green-500 to-teal-500" : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700"}
                          >
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
                              {professional.lastAppointmentDate
                                ? new Date(professional.lastAppointmentDate).toLocaleDateString(
                                    "pt-BR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )
                                : "N/A"}
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
                              <DropdownMenuItem
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                                onClick={() => handleDeleteProfessional(professional.id)}
                              >
                                Excluir profissional
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
          {selectedProfessional && (
            <ProfessionalDetails
              professional={selectedProfessional}
              open={detailsModalOpen}
              onOpenChange={setDetailsModalOpen}
              appointments={[]}
              commissions={[]}
              payments={[]}
              performance={useMemo(() => {
                if (selectedProfessional?.appointmentHistory) {
                  return {
                    totalAppointments: selectedProfessional.totalAppointments || 0,
                    topServices: [],
                    monthlyRevenue: [],
                    rating: selectedProfessional.rating || 4.5,
                    clientReturnRate: selectedProfessional.clientAttendanceRate || 0.75,
                    newClientsPerMonth: 10,
                    scheduleOccupancy: 0.8,
                    quoteConversionRate: 0.7,
                    additionalSalesRate: 0.4,
                  };
                }
                return createDefaultPerformance();
              }, [selectedProfessional, createDefaultPerformance])}
            />
          )}
        </DialogContent>
      </Dialog>

    </PageLayout>
  );
};

export default Profissionais;
