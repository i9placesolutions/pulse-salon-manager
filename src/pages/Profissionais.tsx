import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  DollarSign,
  Clock,
  Star,
  Repeat,
  AlertCircle,
  Edit,
  X,
  Smile,
  Calendar,
  User,
  BarChart
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
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { useSpecialties } from "@/contexts/SpecialtiesContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useProfessionalManagement } from "@/hooks/useProfessionalManagement";

// Arrays vazios para ser usados quando necessário
const emptyAppointments: ProfessionalAppointment[] = [];
const emptyCommissions: ProfessionalCommission[] = [];
const emptyPayments: ProfessionalPayment[] = [];

const Profissionais = () => {
  const navigate = useNavigate();
  const { specialties } = useSpecialties();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | undefined>();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Integração com Supabase via hook
  const {
    professionals,
    loading,
    error,
    getProfessionalDetails,
    deleteProfessional
  } = useProfessionalManagement();

  // Filtrar e ordenar profissionais com base em critérios usando useMemo para otimização
  const filteredProfessionals = useMemo(() => {
    return professionals
      .filter((professional) => {
        // Busca por texto
        const matchesSearch =
          professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (professional.email && professional.email.toLowerCase().includes(searchTerm.toLowerCase()));

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
          return (experienceOrder[a.experienceLevel as keyof typeof experienceOrder] || 0) - 
                 (experienceOrder[b.experienceLevel as keyof typeof experienceOrder] || 0);
        }
        return 0;
      });
  }, [professionals, searchTerm, specialtyFilter, sortBy]);

  const handleShowDetails = useCallback(async (professional: Professional) => {
    try {
      // Buscar detalhes completos do profissional no Supabase
      const details = await getProfessionalDetails(professional.id);
      if (details) {
        setSelectedProfessional(details);
        setDetailsModalOpen(true);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do profissional.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do profissional:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do profissional.",
        variant: "destructive"
      });
    }
  }, [getProfessionalDetails, toast]);

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

  const formatExperienceLevel = useCallback((level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'expert': return 'Especialista';
      default: return level;
    }
  }, []);

  const createDefaultPerformance = useCallback((): ProfessionalPerformance => {
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
  }, []);

  return (
    <PageLayout variant="blue">
      <PageHeader 
        title="Gerenciamento de Profissionais"
        subtitle="Gerencie os profissionais do salão, visualize métricas e desempenho"
        variant="blue"
        badge="Equipe"
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/usuarios")}
              variant="dashboard"
            >
              <Plus className="h-4 w-4 mr-2" />
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
                  {filteredProfessionals
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
                  {filteredProfessionals
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
                  {filteredProfessionals
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
            Total de {filteredProfessionals.length} profissionais ativos no salão
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
                {filteredProfessionals.length > 0 ? (
                  filteredProfessionals.map((professional, idx) => (
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
              appointments={emptyAppointments}
              commissions={emptyCommissions}
              payments={emptyPayments}
              performance={useMemo(() => {
                if (selectedProfessional?.totalAppointments) {
                  return {
                    totalAppointments: selectedProfessional.totalAppointments || 0,
                    topServices: [],
                    monthlyRevenue: [],
                    rating: selectedProfessional.rating || 4.5,
                    clientReturnRate: selectedProfessional.clientAttendanceRate || 0.75,
                    newClientsPerMonth: 10,
                    scheduleOccupancy: 0.8,
                    quoteConversionRate: 0.7,
                    additionalSalesRate: 0.4
                  };
                }
                return createDefaultPerformance();
              }, [selectedProfessional, createDefaultPerformance])}
            />
          }
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Profissionais;
