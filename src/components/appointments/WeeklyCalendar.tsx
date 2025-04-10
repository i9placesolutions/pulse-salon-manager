import { addDays, format, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertCircle, CheckCircle2, User } from "lucide-react";
import type { Appointment, Professional } from "@/types/appointment";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WeeklyCalendarProps {
  selectedDate: Date;
  appointments: Appointment[];
  professionals: Professional[];
  mode: "day" | "week" | "month";
  onStatusChange: (appointmentId: number, status: Appointment["status"]) => void;
  onReschedule: (appointmentId: number) => void;
  onSlotClick?: (date: Date, time: string) => void;
}

const timeSlots = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

const weekDays = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export const WeeklyCalendar = ({ 
  selectedDate, 
  appointments, 
  professionals,
  mode,
  onStatusChange,
  onReschedule,
  onSlotClick
}: WeeklyCalendarProps) => {
  const getDaysToShow = () => {
    switch (mode) {
      case "day":
        return [selectedDate];
      case "week":
        return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate, { locale: ptBR }), i));
      case "month":
        return eachDayOfInterval({
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        });
      default:
        return [selectedDate];
    }
  };

  const daysToShow = getDaysToShow();

  const getAppointmentStatus = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 border-green-500 text-green-700";
      case "pending":
        return "bg-yellow-100 border-yellow-500 text-yellow-700";
      case "canceled":
        return "bg-red-100 border-red-500 text-red-700";
      case "completed":
        return "bg-blue-100 border-blue-500 text-blue-700";
      default:
        return "bg-gray-100 border-gray-500 text-gray-700";
    }
  };

  const getAppointmentsCountForDay = (date: Date) => {
    return appointments.filter(
      (apt) => format(apt.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    ).length;
  };

  const handleSlotClick = (date: Date, time: string) => {
    if (onSlotClick) {
      onSlotClick(date, time);
    }
  };

  return (
    <div className="overflow-auto">
      <div className="min-w-[800px]">
        {/* Week header */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="h-20" /> {/* Empty space for time column */}
          {daysToShow.map((date) => {
            const isCurrentDay = isToday(date);
            const isSelected = isSameDay(date, selectedDate);
            const appointmentsCount = getAppointmentsCountForDay(date);

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "text-center p-2 rounded-lg shadow-sm border transition-all",
                  isCurrentDay 
                    ? "bg-[#db2777]/10 border-[#db2777]" 
                    : "bg-secondary border-gray-200",
                  isSelected && "ring-2 ring-[#db2777] ring-opacity-50"
                )}
              >
                <div className="text-sm font-medium mb-1">
                  {format(date, "EEEE", { locale: ptBR })}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div className={cn(
                    "text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center",
                    isCurrentDay ? "bg-[#db2777] text-white" : ""
                  )}>
                    {format(date, "dd", { locale: ptBR })}
                  </div>
                  {appointmentsCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                      {appointmentsCount}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(date, "MMM", { locale: ptBR })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots grid */}
        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="space-y-4">
            {timeSlots.map((time) => (
              <div key={time} className="h-24 flex items-center justify-end pr-2 text-sm font-medium text-muted-foreground">
                {time}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {daysToShow.map((date) => {
            const isCurrentDay = isToday(date);
            
            return (
              <div key={date.toISOString()} className="space-y-4">
                {timeSlots.map((time) => {
                  const dayAppointments = appointments.filter(
                    (apt) => 
                      format(apt.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
                      apt.startTime === time
                  );

                  return (
                    <Card
                      key={`${date.toISOString()}-${time}`}
                      className={cn(
                        "h-24 p-2 relative border transition-colors",
                        isCurrentDay ? "bg-[#db2777]/5" : "bg-white hover:bg-secondary/5",
                        dayAppointments.length > 0 && "ring-1 ring-inset ring-blue-200"
                      )}
                      onClick={() => dayAppointments.length === 0 && handleSlotClick(date, time)}
                    >
                      {dayAppointments.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                          <span className="text-xs text-muted-foreground">Clique para adicionar</span>
                        </div>
                      )}
                      
                      {dayAppointments.length > 0 && (
                        <ScrollArea className="h-full w-full">
                          <div className="space-y-1">
                            {dayAppointments.map((appointment) => (
                              <HoverCard key={appointment.id}>
                                <HoverCardTrigger asChild>
                                  <div
                                    className={`p-1 rounded-md border-l-4 shadow-sm ${getAppointmentStatus(
                                      appointment.status
                                    )} cursor-pointer hover:shadow-md transition-all text-xs`}
                                  >
                                    <div className="font-medium flex items-center justify-between">
                                      <span>{appointment.clientName}</span>
                                      {appointment.status === "confirmed" && (
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs truncate max-w-full">
                                      <User className="h-3 w-3" />
                                      <span>{appointment.professionalName}</span>
                                    </div>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80 p-4 shadow-xl border border-gray-200 bg-white !opacity-100">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-base font-semibold">
                                        {appointment.clientName}
                                      </h4>
                                      <span className="text-xs text-muted-foreground">
                                        ID: {appointment.id}
                                      </span>
                                    </div>
                                    <div className="text-sm space-y-1">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-[#db2777]" />
                                        <span className="font-medium">Prof.: {appointment.professionalName}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-[#db2777]" />
                                        <span className="font-medium">{appointment.startTime} - {appointment.endTime}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-[#db2777]" />
                                        <span>{format(appointment.date, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-2 bg-gray-50 p-2 rounded-md">
                                      <p className="text-sm font-medium">Serviços:</p>
                                      {appointment.services.map((service) => (
                                        <div
                                          key={service.id}
                                          className="flex items-center justify-between text-sm"
                                        >
                                          <span>{service.name}</span>
                                          <span className="text-muted-foreground font-medium">
                                            {service.duration} min
                                          </span>
                                        </div>
                                      ))}
                                      <div className="text-right text-sm font-semibold">
                                        Total: R$ {appointment.totalValue.toFixed(2)}
                                      </div>
                                    </div>
                                    {appointment.notes && (
                                      <div className="flex items-start gap-2 text-sm p-2 bg-yellow-50 rounded-md">
                                        <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                                        <span>{appointment.notes}</span>
                                      </div>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                      <Button
                                        size="sm"
                                        variant={appointment.status === "confirmed" ? "outline" : "default"}
                                        onClick={() =>
                                          onStatusChange(
                                            appointment.id,
                                            appointment.status === "confirmed"
                                              ? "canceled"
                                              : "confirmed"
                                          )
                                        }
                                        className={appointment.status === "confirmed" ? "text-red-600 border-red-200 hover:bg-red-50 flex-1" : "bg-green-600 text-white hover:bg-green-700 flex-1"}
                                      >
                                        {appointment.status === "confirmed"
                                          ? "Cancelar"
                                          : "Confirmar"}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onReschedule(appointment.id)}
                                        className="hover:bg-blue-50 hover:text-blue-600 flex-1"
                                      >
                                        Reagendar
                                      </Button>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
