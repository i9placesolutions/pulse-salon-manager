
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Appointment } from "@/types/appointment";
import { format } from "date-fns";

interface AppointmentListProps {
  appointments: Appointment[];
  onStatusChange: (appointmentId: number, status: Appointment["status"]) => void;
  onReschedule: (appointmentId: number) => void;
}

export const AppointmentList = ({ appointments, onStatusChange, onReschedule }: AppointmentListProps) => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{appointment.clientName}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.services.map(s => s.name).join(", ")} com {appointment.professionalName}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {format(appointment.date, "dd/MM/yyyy")} {appointment.startTime}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(
                      appointment.id,
                      appointment.status === "confirmed" ? "canceled" : "confirmed"
                    )}
                  >
                    {appointment.status === "confirmed" ? "Cancelar" : "Confirmar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReschedule(appointment.id)}
                  >
                    Reagendar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
