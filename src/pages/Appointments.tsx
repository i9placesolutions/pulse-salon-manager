import { useState, useEffect, useMemo, useCallback } from "react";
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { WeeklyCalendar } from "@/components/appointments/WeeklyCalendar";
import { BlockTimeDialog } from "@/components/appointments/BlockTimeDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  List, 
  Plus,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  Filter,
  Ban,
  BarChart,
  Download,
  FileText,
  Check,
  User,
  FileDown,
  File,
  Search,
  Loader2,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Activity,
  MoreVertical,
  Palette,
  Calendar
} from "lucide-react";
import type { BlockTimeFormData } from "@/components/appointments/BlockTimeDialog";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addMonths, subDays, eachDayOfInterval, endOfMonth, endOfWeek, isSameDay, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, Professional } from "@/types/appointment";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ReactCalendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormCard } from "@/components/shared/FormCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Importando hook de gerenciamento de agendamentos
import { useAppointmentManagement } from "@/hooks/useAppointmentManagement";
import { useProfessionalManagement } from "@/hooks/useProfessionalManagement";

// Dados de profissionais serão carregados do backend
const professionals: Professional[] = [
  { 
    id: 1, 
    name: "Ana Silva",
    specialties: ["Corte", "Coloração"],
    schedule: {
      "1": { start: "09:00", end: "18:00" },
      "2": { start: "09:00", end: "18:00" },
      "3": { start: "09:00", end: "18:00" },
      "4": { start: "09:00", end: "18:00" },
      "5": { start: "09:00", end: "18:00" },
      "6": { start: "09:00", end: "14:00" }
    }
  },
  { 
    id: 2, 
    name: "Carlos Santos",
    specialties: ["Barba", "Corte Masculino"],
    schedule: {
      "1": { start: "10:00", end: "19:00" },
      "2": { start: "10:00", end: "19:00" },
      "3": { start: "10:00", end: "19:00" },
      "4": { start: "10:00", end: "19:00" },
      "5": { start: "10:00", end: "19:00" },
      "6": { start: "10:00", end: "15:00" }
    }
  },
  { 
    id: 3, 
    name: "Maria Oliveira",
    specialties: ["Manicure", "Pedicure"],
    schedule: {
      "1": { start: "08:00", end: "17:00" },
      "2": { start: "08:00", end: "17:00" },
      "3": { start: "08:00", end: "17:00" },
      "4": { start: "08:00", end: "17:00" },
      "5": { start: "08:00", end: "17:00" }
    }
  },
];

// Dados de agendamentos serão carregados do Supabase
// Mantém a estrutura dos mock appointments para referência
const mockAppointments: Appointment[] = [];

// Extrair lista de clientes únicos dos agendamentos para filtro
const uniqueClients = Array.from(new Set(mockAppointments.map(app => app.clientId)))
  .map(clientId => {
    const appointment = mockAppointments.find(app => app.clientId === clientId);
    return {
      id: clientId,
      name: appointment?.clientName || ""
    };
  })
  .filter(client => client.name !== "")
  .sort((a, b) => a.name.localeCompare(b.name));

// Mock data para clientes e serviços - serão substituídos por dados do Supabase posteriormente
const clients = [
  { id: 1, name: "João Silva", phone: "11999999999", email: "joao@email.com" },
  { id: 2, name: "Maria Santos", phone: "11988888888", email: "maria@email.com" }
];

const services = [
  { id: 1, name: "Corte Masculino", duration: 30, price: 50, professionals: [1, 2] },
  { id: 2, name: "Coloração", duration: 120, price: 150, professionals: [1, 3] }
];

const Appointments = () => {
  // Estado para data selecionada (começa com a data atual)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "list">("week");
  const [isBlockTimeOpen, setIsBlockTimeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  
  // Estados para controle de modais
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleProfessional, setRescheduleProfessional] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<"confirm" | "cancel" | null>(null);
  
  // Estado para controlar o modal de novo agendamento
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | undefined>(undefined);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>("");

  const { toast } = useToast();
  
  // Usar o hook de gerenciamento de agendamentos
  const {
    appointments,
    loading,
    error,
    filters,
    updateFilters,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    blockProfessionalTime
  } = useAppointmentManagement({
    initialFilter: {
      startDate: selectedDate,
      professionalId: selectedProfessional ? parseInt(selectedProfessional) : null,
      status: statusFilter || undefined,
      searchTerm: searchTerm || undefined
    }
  });
  
  // Estado local para agendamentos filtrados
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  
  // Atualizar filtros quando mudança de seleção
  useEffect(() => {
    updateFilters({
      startDate: selectedDate,
      professionalId: selectedProfessional ? parseInt(selectedProfessional) : null,
      status: statusFilter || undefined,
      searchTerm: searchTerm || undefined
    });
  }, [selectedDate, selectedProfessional, statusFilter, searchTerm, updateFilters]);
  
  // Atualizar agendamentos filtrados quando mudam os agendamentos do Supabase
  useEffect(() => {
    setIsCalendarLoading(loading);
    
    // Filtrar agendamentos localmente quando os dados são carregados
    if (!loading && appointments) {
      const filterAppointments = () => {
        return appointments.filter(appointment => {
          // Verificar se a data do agendamento está na semana selecionada se viewMode for week
          let matchesDate = true;
          if (viewMode === "day") {
            matchesDate = isSameDay(new Date(appointment.date), selectedDate);
          } else if (viewMode === "week") {
            const startOfSelectedWeek = startOfWeek(selectedDate, { locale: ptBR });
            const endOfSelectedWeek = endOfWeek(selectedDate, { locale: ptBR });
            const appointmentDate = new Date(appointment.date);
            matchesDate = appointmentDate >= startOfSelectedWeek && appointmentDate <= endOfSelectedWeek;
          } else if (viewMode === "month") {
            const startOfSelectedMonth = startOfMonth(selectedDate);
            const endOfSelectedMonth = endOfMonth(selectedDate);
            const appointmentDate = new Date(appointment.date);
            matchesDate = appointmentDate >= startOfSelectedMonth && appointmentDate <= endOfSelectedMonth;
          }

          const matchesProfessional = selectedProfessional 
            ? appointment.professionalId === parseInt(selectedProfessional)
            : true;
          
          const matchesStatus = statusFilter
            ? appointment.status === statusFilter
            : true;
          
          const matchesSearch = searchTerm
            ? appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              appointment.services.some(service => 
                service.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : true;
            
          return matchesDate && matchesProfessional && matchesStatus && matchesSearch;
        });
      };
      
      setFilteredAppointments(filterAppointments());
    }
  }, [appointments, loading, selectedDate, selectedProfessional, statusFilter, searchTerm, viewMode]);

  // Buscar agendamentos ao montar o componente
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = async (appointmentId: number, newStatus: Appointment["status"]) => {
    try {
      // Atualizar o status no Supabase
      await updateAppointment(appointmentId, { status: newStatus });
      
      // Feedback visual ao usuário (toast será mostrado pelo hook)
      toast({
        title: "Status atualizado",
        description: `Agendamento ${appointmentId} alterado para ${
          newStatus === "confirmed" ? "confirmado" : 
          newStatus === "canceled" ? "cancelado" : 
          newStatus === "pending" ? "pendente" : "concluído"
        }`,
        variant: newStatus === "confirmed" ? "default" : 
                newStatus === "canceled" ? "destructive" : undefined,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  // Nova função para iniciar o processo de alteração de status com confirmação
  const handleStatusChangeWithConfirmation = (appointment: Appointment, newStatus: "confirm" | "cancel") => {
    setSelectedAppointment(appointment);
    setStatusAction(newStatus);
    setConfirmDialogOpen(true);
  };

  // Função para confirmar a alteração de status após confirmação do usuário
  const confirmStatusChange = () => {
    if (selectedAppointment && statusAction) {
      handleStatusChange(
        selectedAppointment.id, 
        statusAction === "confirm" ? "confirmed" : "canceled"
      );
      setConfirmDialogOpen(false);
    }
  };

  const handleReschedule = (appointmentId: number) => {
    // Encontrar o agendamento selecionado
    const appointment = filteredAppointments.find(app => app.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setRescheduleDate(appointment.date);
      setRescheduleTime(appointment.startTime);
      setRescheduleProfessional(String(appointment.professionalId));
      setIsRescheduleOpen(true);
    }
  };

  // Nova função para confirmar o reagendamento
  const confirmReschedule = async () => {
    if (selectedAppointment && rescheduleDate && rescheduleTime) {
      try {
        // Encontrar o nome do profissional selecionado
        const professionalName = rescheduleProfessional 
          ? professionals.find(p => p.id === parseInt(rescheduleProfessional))?.name || selectedAppointment.professionalName
          : selectedAppointment.professionalName;
        
        // Atualizar o agendamento no Supabase
        await updateAppointment(selectedAppointment.id, {
          date: rescheduleDate,
          startTime: rescheduleTime,
          professionalId: rescheduleProfessional ? parseInt(rescheduleProfessional) : selectedAppointment.professionalId,
          professionalName: professionalName
        });
        
        // Fechar o modal de reagendamento
        setIsRescheduleOpen(false);
        
        // O toast será mostrado pelo hook, mas podemos adicionar um mais específico aqui
        toast({
          title: "Reagendamento",
          description: "Agendamento reagendado com sucesso",
        });
      } catch (error) {
        console.error("Erro ao reagendar:", error);
        toast({
          title: "Erro no reagendamento",
          description: "Não foi possível reagendar o agendamento",
          variant: "destructive"
        });
      }
    }
  };

  const handleBlockTime = async (professionalId: number, date: Date, startTime: string, endTime: string) => {
    try {
      // Criar objetos de data para início e fim do bloqueio
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startDate = new Date(date);
      startDate.setHours(startHour, startMinute, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(endHour, endMinute, 0, 0);
      
      // Bloquear o horário no Supabase usando o método do hook
      await blockProfessionalTime(professionalId, startDate, endDate, "Horário bloqueado manualmente");
      
      toast({
        title: "Horário bloqueado",
        description: `Horário bloqueado para ${format(date, "dd/MM/yyyy")} das ${startTime} às ${endTime}`,
      });
    } catch (error) {
      console.error("Erro ao bloquear horário:", error);
      toast({
        title: "Erro ao bloquear horário",
        description: "Não foi possível bloquear o horário selecionado",
        variant: "destructive"
      });
    }
  };
  
  const navigateDate = (direction: 'next' | 'prev') => {
    setIsCalendarLoading(true);
    
    // Efeito de feedback visual
    setTimeout(() => {
      if (direction === 'next') {
        if (viewMode === 'day') setSelectedDate(prev => addDays(prev, 1));
        else if (viewMode === 'week') setSelectedDate(prev => addDays(prev, 7));
        else setSelectedDate(prev => addMonths(prev, 1));
      } else {
        if (viewMode === 'day') setSelectedDate(prev => subDays(prev, 1));
        else if (viewMode === 'week') setSelectedDate(prev => subDays(prev, 7));
        else setSelectedDate(prev => subMonths(prev, 1));
      }
      setIsCalendarLoading(false);
    }, 200);
  };
  
  // Dashboard de metadados
  const getStatusCounts = () => {
    const counts = {
      confirmed: filteredAppointments.filter(a => a.status === 'confirmed').length,
      pending: filteredAppointments.filter(a => a.status === 'pending').length,
      canceled: filteredAppointments.filter(a => a.status === 'canceled').length,
      completed: filteredAppointments.filter(a => a.status === 'completed').length,
    };
    return counts;
  };
  
  const statusCounts = getStatusCounts();

  // Função para lidar com clique em um slot vazio
  const handleSlotClick = (date: Date, time: string) => {
    setNewAppointmentDate(date);
    setNewAppointmentTime(time);
    setNewAppointmentOpen(true);
  };
  
  // Função para lidar com a criação de um novo agendamento
  const handleCreateAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      await createAppointment(appointmentData);
      setNewAppointmentOpen(false);
      toast({
        title: "Agendamento criado",
        description: "O novo agendamento foi criado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro ao criar agendamento",
        description: "Não foi possível criar o agendamento",
        variant: "destructive"
      });
    }
  };

  return (
    <PageLayout variant="purple">
      <PageHeader 
        title="Agendamentos" 
        subtitle="Gerencie a agenda de serviços"
        variant="purple"
        badge="Calendário"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="appointments"
              onClick={() => {
              console.log('[Appointments.tsx] Botão Novo Agendamento clicado. newAppointmentOpen antes:', newAppointmentOpen);
              setNewAppointmentOpen(true);
              console.log('[Appointments.tsx] newAppointmentOpen depois de set:', true); // Log direto do valor que deveria ser
            }}
            >
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
            <Button
              variant="appointments-outline"
              onClick={() => setIsBlockTimeOpen(true)}
            >
              <Ban className="h-4 w-4" />
              Bloquear Horário
            </Button>
          </div>
        }
      />
      
      {/* Dashboard de status rápidos - mini cards com contadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-green-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold">{statusCounts.confirmed}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-yellow-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
              <div className="p-2 rounded-full bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-red-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold">{statusCounts.canceled}</p>
              </div>
              <div className="p-2 rounded-full bg-red-100">
                <X className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-blue-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{statusCounts.completed}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de visão */}
      <FormCard variant="purple" className="mb-4" title="Visualização">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as typeof viewMode)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 bg-purple-50 border border-purple-200">
              <TabsTrigger 
                value="day"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Dia
              </TabsTrigger>
              <TabsTrigger 
                value="week"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Semana
              </TabsTrigger>
              <TabsTrigger 
                value="month"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                Mês
              </TabsTrigger>
              <TabsTrigger 
                value="list"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <List className="mr-2 h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="appointments-outline"
                  className="ml-auto"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <ReactCalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="appointments-outline"
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="appointments-outline"
              size="icon"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="appointments-secondary"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </FormCard>

      {selectedProfessional && (
        <div className="mb-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 p-2 bg-purple-100 rounded-lg">
            <Badge variant="outline" className="border-purple-500 text-purple-700 border-2">
              Profissional
            </Badge>
            <span className="text-lg font-medium text-purple-700">
              {professionals.find(p => String(p.id) === selectedProfessional)?.name}
            </span>
          </div>
        </div>
      )}

      {/* Conteúdo do Calendário ou Lista */}
      <FormCard variant="purple" className="mb-4" title="">
        <div className={cn("transition-opacity duration-300", isCalendarLoading ? "opacity-50" : "opacity-100")}>
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as typeof viewMode)}
            className="w-full"
          >
            <TabsContent value="day" className="m-0 p-0">
              <WeeklyCalendar
                selectedDate={selectedDate}
                appointments={filteredAppointments}
                professionals={professionals}
                mode="day"
                onStatusChange={handleStatusChange}
                onReschedule={handleReschedule}
                onSlotClick={handleSlotClick}
              />
            </TabsContent>

            <TabsContent value="week" className="m-0 p-0">
              {isCalendarLoading ? (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <WeeklyCalendar
                  selectedDate={selectedDate}
                  appointments={filteredAppointments}
                  professionals={professionals}
                  mode="week"
                  onStatusChange={handleStatusChange}
                  onReschedule={handleReschedule}
                  onSlotClick={handleSlotClick}
                />
              )}
            </TabsContent>

            <TabsContent value="month" className="m-0 p-0">
              <WeeklyCalendar
                selectedDate={selectedDate}
                appointments={filteredAppointments}
                professionals={professionals}
                mode="month"
                onStatusChange={handleStatusChange}
                onReschedule={handleReschedule}
                onSlotClick={handleSlotClick}
              />
            </TabsContent>

            <TabsContent value="list" className="m-0 p-0">
              <AppointmentList
                appointments={filteredAppointments}
                onStatusChange={handleStatusChange}
                onReschedule={handleReschedule}
                onStatusChangeWithConfirmation={handleStatusChangeWithConfirmation}
              />
            </TabsContent>
          </Tabs>
        </div>
      </FormCard>

      {/* Modal de bloqueio de horas */}
      <BlockTimeDialog
        open={isBlockTimeOpen}
        onOpenChange={setIsBlockTimeOpen}
        onConfirm={(blockData) => {
          toast({
            title: "Horários bloqueados",
            description: `Período bloqueado de ${blockData.startDate} até ${blockData.endDate}, das ${blockData.startTime} às ${blockData.endTime}`
          });
        }}
      />

      {/* Modal para novo agendamento */}
      <AppointmentDialog 
        isOpen={newAppointmentOpen}
        onOpenChange={setNewAppointmentOpen}
        initialDate={newAppointmentDate}
        initialTime={newAppointmentTime}
        onSubmit={async (formData) => {
          // Converter os dados do formulário para o formato esperado pelo hook
          const selectedClient = clients.find(c => c.id === formData.clientId);
          const selectedServiceDetails = formData.selectedServices.map(ss => {
            const service = services.find(s => s.id === ss.serviceId);
            return service ? {
              id: service.id,
              name: service.name,
              duration: service.duration,
              price: service.price
            } : null;
          }).filter(Boolean);
          
          // Calcular o tempo total de duração baseado nos serviços
          const totalDuration = selectedServiceDetails.reduce((total, service) => 
            total + (service?.duration || 0), 0);
          
          // Calcular a hora de término
          const [hours, minutes] = formData.time.split(':').map(Number);
          const startDate = new Date(`${formData.date}T${formData.time}`);
          const endDate = new Date(startDate.getTime() + totalDuration * 60000);
          const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
          
          // Selecionar o profissional do primeiro serviço (simplificação)
          const professionalId = formData.selectedServices[0]?.professionalId;
          const professionalName = professionals.find(p => p.id === professionalId)?.name || '';
          
          // Calcular o valor total
          const totalValue = selectedServiceDetails.reduce((total, service) => 
            total + (service?.price || 0), 0);
          
          // Criar o objeto de agendamento
          const appointmentData = {
            clientId: formData.clientId,
            clientName: selectedClient?.name || '',
            professionalId: professionalId || 0,
            professionalName,
            date: new Date(formData.date),
            startTime: formData.time,
            endTime,
            duration: totalDuration,
            status: 'pending' as const, // Definição de tipo explícita para corrigir erro
            paymentStatus: 'pending' as const,
            totalValue,
            notes: formData.notes,
            services: selectedServiceDetails as any[]
          };
          
          // Chamar a função de criação de agendamento
          await handleCreateAppointment(appointmentData);
        }}
      />

      {/* Modal para confirmação de alteração de status */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-purple-700">
              {statusAction === "confirm" ? "Confirmar agendamento?" : "Cancelar agendamento?"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {statusAction === "confirm" 
                ? "Deseja confirmar este agendamento? O cliente será notificado."
                : "Deseja realmente cancelar este agendamento? Esta ação não pode ser desfeita."}
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-4" />
          <div className="flex justify-center gap-4 mt-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button 
              variant={statusAction === "confirm" ? "appointments" : "destructive"}
              onClick={confirmStatusChange}
            >
              {statusAction === "confirm" ? "Confirmar" : "Cancelar Agendamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para reagendamento */}
      <Dialog open={isRescheduleOpen} onOpenChange={(value) => !value && setIsRescheduleOpen(value)}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold flex items-center justify-center gap-2 text-purple-700">
              <CalendarClock className="h-6 w-6 text-purple-600" />
              Reagendar Atendimento
            </DialogTitle>
            <DialogDescription className="text-center">
              Selecione a nova data e horário para o agendamento
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-4" />
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Cliente:</p>
                <p className="text-sm">{selectedAppointment.clientName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Serviço:</p>
                <p className="text-sm">{selectedAppointment.services.map(s => s.name).join(", ")}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Data atual:</p>
                <p className="text-sm">{format(selectedAppointment.date, "dd/MM/yyyy")}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Horário atual:</p>
                <p className="text-sm">{selectedAppointment.startTime}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="reschedule-date" className="text-sm font-medium">
                  Nova data:
                </Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  min={format(new Date(), "yyyy-MM-dd")}
                  value={rescheduleDate ? format(rescheduleDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setRescheduleDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-time" className="text-sm font-medium">
                  Novo horário:
                </Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-professional" className="text-sm font-medium">
                  Profissional:
                </Label>
                <select
                  id="reschedule-professional"
                  value={rescheduleProfessional}
                  onChange={(e) => setRescheduleProfessional(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map(prof => (
                    <option key={prof.id} value={String(prof.id)}>
                      {prof.name}
                    </option>
                  ))}
                </select>
              </div>
              <Separator className="my-4" />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRescheduleOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="appointments"
                  onClick={confirmReschedule}
                  disabled={!rescheduleDate || !rescheduleTime || !rescheduleProfessional}
                >
                  Reagendar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de filtros */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="p-0 w-full max-w-full sm:max-w-md border-l flex flex-col h-full bg-white">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 border-b">
            <SheetHeader className="p-6">
              <SheetTitle className="text-xl flex items-center gap-2 text-white">
                <Filter className="h-5 w-5 text-white" />
                Filtros
              </SheetTitle>
              <SheetDescription className="text-purple-100">
                Selecione os critérios para filtrar os agendamentos
              </SheetDescription>
            </SheetHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <AppointmentFilters
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedProfessional={selectedProfessional}
              setSelectedProfessional={setSelectedProfessional}
              professionals={professionals}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
          
          <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
            <div className="flex flex-row gap-3 w-full justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedProfessional("");
                  setStatusFilter("");
                  setSearchTerm("");
                }}
              >
                Limpar Filtros
              </Button>
              <Button 
                variant="appointments"
                onClick={() => setIsFilterOpen(false)}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default Appointments;
