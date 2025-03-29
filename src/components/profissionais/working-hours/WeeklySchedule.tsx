
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { WorkingHours, DaySchedule } from "@/types/professional";

interface WeeklyScheduleProps {
  workingHours: WorkingHours;
  onDayScheduleChange: (day: string, field: string, value: string | boolean) => void;
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAYS_OF_WEEK: { id: DayKey; label: string }[] = [
  { id: "monday", label: "Segunda-feira" },
  { id: "tuesday", label: "Terça-feira" },
  { id: "wednesday", label: "Quarta-feira" },
  { id: "thursday", label: "Quinta-feira" },
  { id: "friday", label: "Sexta-feira" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

export const WeeklySchedule = ({
  workingHours,
  onDayScheduleChange,
}: WeeklyScheduleProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Horários Semanais</h3>
      {DAYS_OF_WEEK.map(({ id, label }) => (
        <div key={id} className="flex items-start space-x-4 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              checked={workingHours[id]?.isWorking}
              onCheckedChange={(checked) =>
                onDayScheduleChange(id, "isWorking", checked)
              }
            />
            <Label>{label}</Label>
          </div>
          {workingHours[id]?.isWorking && (
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <Label>Início</Label>
                <Input
                  type="time"
                  value={workingHours[id]?.startTime || ""}
                  onChange={(e) =>
                    onDayScheduleChange(id, "startTime", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Fim</Label>
                <Input
                  type="time"
                  value={workingHours[id]?.endTime || ""}
                  onChange={(e) =>
                    onDayScheduleChange(id, "endTime", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Intervalo Início</Label>
                <Input
                  type="time"
                  value={workingHours[id]?.breakStart || ""}
                  onChange={(e) =>
                    onDayScheduleChange(id, "breakStart", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Intervalo Fim</Label>
                <Input
                  type="time"
                  value={workingHours[id]?.breakEnd || ""}
                  onChange={(e) =>
                    onDayScheduleChange(id, "breakEnd", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
