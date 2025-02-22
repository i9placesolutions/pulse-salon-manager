
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Appointment {
  id: number;
  client: string;
  service: string;
  professional: string;
  time: string;
  status: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  selectedDate: Date | undefined;
}

export const AppointmentList = ({ appointments, selectedDate }: AppointmentListProps) => {
  return (
    <Card className="p-4 lg:col-span-9">
      <div className="space-y-4">
        <h2 className="font-semibold text-neutral">
          Agendamentos para {selectedDate?.toLocaleDateString()}
        </h2>

        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{appointment.client}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.service} com {appointment.professional}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{appointment.time}</span>
                <Button variant="outline" size="sm">
                  Detalhes
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
