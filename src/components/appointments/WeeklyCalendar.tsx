
import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";

interface Appointment {
  id: number;
  client: string;
  professional: string;
  startTime: string;
  endTime: string;
  date: Date;
}

interface WeeklyCalendarProps {
  selectedDate: Date;
  appointments: Appointment[];
}

const timeSlots = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

const weekDays = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export const WeeklyCalendar = ({ selectedDate, appointments }: WeeklyCalendarProps) => {
  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="overflow-auto">
      <div className="min-w-[800px]">
        {/* Week header */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="h-20" /> {/* Empty space for time column */}
          {weekDates.map((date) => (
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
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="space-y-4">
              {timeSlots.map((time) => (
                <Card
                  key={`${date.toISOString()}-${time}`}
                  className="h-24 p-2 bg-secondary-soft hover:bg-secondary-dark/5 transition-colors"
                >
                  {/* Here you would map and render appointments for this time slot */}
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
