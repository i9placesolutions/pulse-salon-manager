import { useState, useEffect } from "react";
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
  Ban
} from "lucide-react";
import type { BlockTimeFormData } from "@/components/appointments/BlockTimeDialog";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addMonths, subMonths, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, Professional } from "@/types/appointment";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose 
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Temporary mock data
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

// Ampliando dados de exemplo para mostrar mais casos
const mockAppointments: Appointment[] = [
  {
    id: 1,
    clientId: 1,
    clientName: "João Paulo",
    professionalId: 1,
    professionalName: "Ana Silva",
    services: [
      { id: 1, name: "Corte Masculino", duration: 30, price: 50 }
    ],
    date: new Date(),
    startTime: "10:00",
    endTime: "10:30",
    duration: 30,
    status: "confirmed",
    paymentStatus: "pending",
    totalValue: 50,
    notes: "Cliente prefere corte mais curto"
  },
  {
    id: 2,
    clientId: 2,
    clientName: "Maria Clara",
    professionalId: 3,
    professionalName: "Maria Oliveira",
    services: [
      { id: 2, name: "Manicure", duration: 60, price: 45 }
    ],
    date: new Date(),
    startTime: "14:30",
    endTime: "15:30",
    duration: 60,
    status: "pending",
    paymentStatus: "pending",
    totalValue: 45
  },
  {
    id: 3,
    clientId: 3,
    clientName: "Carlos Mendes",
    professionalId: 2,
    professionalName: "Carlos Santos",
    services: [
      { id: 3, name: "Barba", duration: 30, price: 35 }
    ],
    date: addDays(new Date(), 1),
    startTime: "11:00",
    endTime: "11:30",
    duration: 30,
    status: "confirmed",
    paymentStatus: "paid",
    totalValue: 35
  },
  {
    id: 4,
    clientId: 4,
    clientName: "Fernanda Alves",
    professionalId: 1,
    professionalName: "Ana Silva",
    services: [
      { id: 4, name: "Coloração", duration: 120, price: 150 }
    ],
    date: subDays(new Date(), 1),
    startTime: "13:00",
    endTime: "15:00",
    duration: 120,
    status: "completed",
    paymentStatus: "paid",
    totalValue: 150
  }
];

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "list">("week");
  const [isBlockTimeOpen, setIsBlockTimeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(mockAppointments);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  
  // Estados para controle de modais
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleProfessional, setRescheduleProfessional] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<"confirm" | "cancel" | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Simulando um carregamento de dados
    setIsCalendarLoading(true);
    const filterAppointments = () => {
      return mockAppointments.filter(appointment => {
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
          
        return matchesProfessional && matchesStatus && matchesSearch;
      });
    };
    
    // Simulando um pequeno delay de carregamento para mostrar animação
    setTimeout(() => {
      setFilteredAppointments(filterAppointments());
      setIsCalendarLoading(false);
    }, 300);
  }, [selectedProfessional, statusFilter, searchTerm, selectedDate]);

  const handleStatusChange = (appointmentId: number, newStatus: Appointment["status"]) => {
    // Simulando uma atualização de estado com animação
    const updatedAppointments = filteredAppointments.map(app => 
      app.id === appointmentId ? {...app, status: newStatus} : app
    );
    
    setFilteredAppointments(updatedAppointments);
    
    // Feedback visual ao usuário
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
  const confirmReschedule = () => {
    if (selectedAppointment && rescheduleDate && rescheduleTime) {
      // Aqui você faria a chamada para a API para reagendar
      // Simulando atualização do agendamento
      const updatedAppointments = filteredAppointments.map(app => 
        app.id === selectedAppointment.id 
          ? {
              ...app, 
              date: rescheduleDate,
              startTime: rescheduleTime,
              professionalId: rescheduleProfessional ? parseInt(rescheduleProfessional) : app.professionalId,
              professionalName: rescheduleProfessional 
                ? professionals.find(p => p.id === parseInt(rescheduleProfessional))?.name || app.professionalName
                : app.professionalName
            } 
          : app
      );
      
      setFilteredAppointments(updatedAppointments);
      setIsRescheduleOpen(false);
      
      toast({
        title: "Reagendamento",
        description: "Agendamento reagendado com sucesso",
      });
    }
  };

  const handleBlockTime = (professionalId: number, date: Date, startTime: string, endTime: string) => {
    // Aqui seria a chamada para a API para bloquear horário
    toast({
      title: "Horário bloqueado",
      description: `Horário bloqueado para ${format(date, "dd/MM/yyyy")} das ${startTime} às ${endTime}`,
    });
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Agendamentos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os agendamentos do seu salão
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AppointmentDialog />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="py-6 space-y-6">
                <h3 className="text-lg font-medium">Filtros Avançados</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={statusFilter === 'confirmed' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setStatusFilter(prev => prev === 'confirmed' ? '' : 'confirmed')}
                        className={statusFilter === 'confirmed' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        Confirmados
                      </Button>
                      <Button 
                        variant={statusFilter === 'pending' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setStatusFilter(prev => prev === 'pending' ? '' : 'pending')}
                        className={statusFilter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      >
                        Pendentes
                      </Button>
                      <Button 
                        variant={statusFilter === 'canceled' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setStatusFilter(prev => prev === 'canceled' ? '' : 'canceled')}
                        className={statusFilter === 'canceled' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        Cancelados
                      </Button>
                      <Button 
                        variant={statusFilter === 'completed' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setStatusFilter(prev => prev === 'completed' ? '' : 'completed')}
                        className={statusFilter === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      >
                        Concluídos
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Profissional</h4>
                    <div className="space-y-2">
                      {professionals.map(prof => (
                        <Button 
                          key={prof.id}
                          variant={selectedProfessional === String(prof.id) ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setSelectedProfessional(prev => prev === String(prof.id) ? '' : String(prof.id))}
                          className="w-full justify-start"
                        >
                          {prof.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 space-x-2">
                    <Button variant="outline" onClick={() => {
                      setStatusFilter('');
                      setSelectedProfessional('');
                    }}>
                      Limpar Filtros
                    </Button>
                    <SheetClose asChild>
                      <Button>Aplicar</Button>
                    </SheetClose>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsBlockTimeOpen(true)}
            className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
          >
            <Ban className="mr-2 h-4 w-4" />
            Bloquear Horário
          </Button>
        </div>
      </div>
      
      {/* Dashboard de status rápidos - mini cards com contadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-green-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold">{statusCounts.confirmed}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CalendarClock className="h-5 w-5 text-green-600" />
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
                <CalendarRange className="h-5 w-5 text-red-600" />
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

      <AppointmentFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedProfessional={selectedProfessional}
        setSelectedProfessional={setSelectedProfessional}
        professionals={professionals}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {selectedProfessional && (
        <div className="mb-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
            <Badge variant="outline" className="border-primary text-primary border-2">
              Profissional
            </Badge>
            <span className="text-lg font-medium text-primary">
              {professionals.find(p => String(p.id) === selectedProfessional)?.name}
            </span>
          </div>
        </div>
      )}

      {/* Navigation & View Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => navigateDate('prev')}
            >
              <span>&lt;</span>
            </Button>
            
            <div className="text-sm font-medium">
              {viewMode === 'day' && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              {viewMode === 'week' && (
                <>
                  <span>Semana de </span>
                  {format(selectedDate, "dd/MM", { locale: ptBR })}
                </>
              )}
              {viewMode === 'month' && format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => navigateDate('next')}
            >
              <span>&gt;</span>
            </Button>
          </div>

          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as typeof viewMode)}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-4 h-9 w-auto">
              <TabsTrigger value="day" className="h-8 text-xs px-3">
                <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                Dia
              </TabsTrigger>
              <TabsTrigger value="week" className="h-8 text-xs px-3">
                <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="h-8 text-xs px-3">
                <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                Mês
              </TabsTrigger>
              <TabsTrigger value="list" className="h-8 text-xs px-3">
                <List className="mr-1 h-3.5 w-3.5" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tabs Content Separated from Navigation Controls */}
        <div className={cn("transition-opacity duration-300", isCalendarLoading ? "opacity-50" : "opacity-100")}>
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as typeof viewMode)}
            className="w-full"
          >
            <TabsContent value="day" className="m-0 p-0">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 bg-white rounded-md">
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    appointments={filteredAppointments}
                    professionals={professionals}
                    mode="day"
                    onStatusChange={handleStatusChange}
                    onReschedule={handleReschedule}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="m-0 p-0">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 bg-white rounded-md">
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    appointments={filteredAppointments}
                    professionals={professionals}
                    mode="week"
                    onStatusChange={handleStatusChange}
                    onReschedule={handleReschedule}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month" className="m-0 p-0">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 bg-white rounded-md">
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    appointments={filteredAppointments}
                    professionals={professionals}
                    mode="month"
                    onStatusChange={handleStatusChange}
                    onReschedule={handleReschedule}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="m-0 p-0">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 bg-white rounded-md">
                  <AppointmentList
                    appointments={filteredAppointments}
                    onStatusChange={handleStatusChange}
                    onReschedule={handleReschedule}
                    onStatusChangeWithConfirmation={handleStatusChangeWithConfirmation}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

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

      {/* Diálogo de Confirmação */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
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
              className="border-gray-300"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button 
              variant={statusAction === "confirm" ? "default" : "destructive"}
              className={statusAction === "confirm" ? "bg-primary hover:bg-primary/90" : ""}
              onClick={confirmStatusChange}
            >
              {statusAction === "confirm" ? "Confirmar" : "Cancelar Agendamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Reagendamento */}
      <Dialog open={isRescheduleOpen} onOpenChange={(value) => !value && setIsRescheduleOpen(value)}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold flex items-center justify-center gap-2">
              <CalendarClock className="h-6 w-6 text-primary" />
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
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="border-gray-300"
                  onClick={() => setIsRescheduleOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
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

    </div>
  );
};

export default Appointments;
