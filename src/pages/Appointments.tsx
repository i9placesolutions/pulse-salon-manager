
import { useState } from "react";
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { WeeklyCalendar } from "@/components/appointments/WeeklyCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock, Calendar as CalendarIcon, List } from "lucide-react";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, Professional } from "@/types/appointment";

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
  }
];

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "list">("week");
  const { toast } = useToast();

  const handleStatusChange = (appointmentId: number, newStatus: Appointment["status"]) => {
    // Aqui seria a chamada para a API para atualizar o status
    toast({
      title: "Status atualizado",
      description: `Agendamento ${appointmentId} alterado para ${newStatus}`,
    });
  };

  const handleReschedule = (appointmentId: number) => {
    // Aqui seria a chamada para a API para reagendar
    toast({
      title: "Reagendamento",
      description: "Agendamento reagendado com sucesso",
    });
  };

  const handleBlockTime = (professionalId: number, date: Date, startTime: string, endTime: string) => {
    // Aqui seria a chamada para a API para bloquear horário
    toast({
      title: "Horário bloqueado",
      description: `Horário bloqueado para ${format(date, "dd/MM/yyyy")} das ${startTime} às ${endTime}`,
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header com título e ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-neutral">Agendamentos</h1>
        <div className="flex flex-wrap gap-2">
          <AppointmentDialog />
          <Button variant="outline" size="sm" onClick={() => handleBlockTime(1, new Date(), "10:00", "11:00")}>
            <Clock className="mr-2 h-4 w-4" />
            Bloquear Horário
          </Button>
        </div>
      </div>

      <AppointmentFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedProfessional={selectedProfessional}
        setSelectedProfessional={setSelectedProfessional}
        professionals={professionals}
      />

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
        <TabsList>
          <TabsTrigger value="day">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Dia
          </TabsTrigger>
          <TabsTrigger value="week">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Semana
          </TabsTrigger>
          <TabsTrigger value="month">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Mês
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="mr-2 h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day">
          <WeeklyCalendar
            selectedDate={selectedDate}
            appointments={mockAppointments}
            professionals={professionals}
            mode="day"
            onStatusChange={handleStatusChange}
            onReschedule={handleReschedule}
          />
        </TabsContent>

        <TabsContent value="week">
          <WeeklyCalendar
            selectedDate={selectedDate}
            appointments={mockAppointments}
            professionals={professionals}
            mode="week"
            onStatusChange={handleStatusChange}
            onReschedule={handleReschedule}
          />
        </TabsContent>

        <TabsContent value="month">
          <WeeklyCalendar
            selectedDate={selectedDate}
            appointments={mockAppointments}
            professionals={professionals}
            mode="month"
            onStatusChange={handleStatusChange}
            onReschedule={handleReschedule}
          />
        </TabsContent>

        <TabsContent value="list">
          <AppointmentList
            appointments={mockAppointments}
            onStatusChange={handleStatusChange}
            onReschedule={handleReschedule}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appointments;
