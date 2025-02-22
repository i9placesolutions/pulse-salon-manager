
import { addDays, format, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import type { Appointment, Professional } from "@/types/appointment";

interface WeeklyCalendarProps {
  selectedDate: Date;
  appointments: Appointment[];
  professionals: Professional[];
  mode: "day" | "week" | "month";
  onStatusChange: (appointmentId: number, status: Appointment["status"]) => void;
  onReschedule: (appointmentId: number) => void;
}

const timeSlots = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

const weekDays = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export const WeeklyCalendar = ({ 
  selectedDate, 
  appointments, 
  professionals,
  mode,
  onStatusChange,
  onReschedule
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

  return (
    <div className="overflow-auto">
      <div className="min-w-[800px]">
        {/* Week header */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="h-20" /> {/* Empty space for time column */}
          {daysToShow.map((date) => (
            <div
              key={date.toISOString()}
              className="text-center p-2 bg-secondary rounded-lg"
            >
              <div className="text-sm text-muted-foreground">
                {format(date, "EEEE", { locale: ptBR })}
              </div>
              <div className="text-2xl font-semibold">
                {format(date, "dd", { locale: ptBR })}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="space-y-4">
            {timeSlots.map((time) => (
              <div key={time} className="h-24 text-sm text-muted-foreground">
                {time}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {daysToShow.map((date) => (
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
                    className="h-24 p-2 bg-secondary-soft hover:bg-secondary-dark/5 transition-colors relative"
                  >
                    {dayAppointments.map((appointment) => (
                      <HoverCard key={appointment.id}>
                        <HoverCardTrigger asChild>
                          <div
                            className={`absolute inset-1 p-2 rounded border ${getAppointmentStatus(
                              appointment.status
                            )} cursor-pointer transition-colors`}
                          >
                            <div className="text-xs font-medium">
                              {appointment.clientName}
                            </div>
                            <div className="text-xs">
                              {appointment.services.map((s) => s.name).join(", ")}
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold">
                                {appointment.clientName}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                ID: {appointment.id}
                              </span>
                            </div>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(appointment.date, "dd/MM/yyyy")}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Serviços:</p>
                              {appointment.services.map((service) => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span>{service.name}</span>
                                  <span className="text-muted-foreground">
                                    {service.duration}min
                                  </span>
                                </div>
                              ))}
                            </div>
                            {appointment.notes && (
                              <div className="flex items-start gap-1 text-sm">
                                <AlertCircle className="h-4 w-4 mt-0.5" />
                                <span>{appointment.notes}</span>
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  onStatusChange(
                                    appointment.id,
                                    appointment.status === "confirmed"
                                      ? "canceled"
                                      : "confirmed"
                                  )
                                }
                              >
                                {appointment.status === "confirmed"
                                  ? "Cancelar"
                                  : "Confirmar"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onReschedule(appointment.id)}
                              >
                                Reagendar
                              </Button>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
