
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ScheduleFormProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function ScheduleForm({ date, time, onDateChange, onTimeChange }: ScheduleFormProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label htmlFor="schedule-date">Data (Opcional)</Label>
        <Input 
          type="date"
          id="schedule-date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="schedule-time">Horário</Label>
        <Input 
          type="time"
          id="schedule-time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
        />
      </div>
    </div>
  );
}
