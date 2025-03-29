
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { WorkingHours, DaySchedule } from "@/types/professional";

interface WeeklyScheduleProps {
  workingHours: WorkingHours;
  onUpdateSchedule: (day: keyof WorkingHours, data: DaySchedule) => void;
}

export function WeeklySchedule({ workingHours, onUpdateSchedule }: WeeklyScheduleProps) {
  const weekDays = [
    { key: "monday" as keyof WorkingHours, label: "Segunda-feira" },
    { key: "tuesday" as keyof WorkingHours, label: "Terça-feira" },
    { key: "wednesday" as keyof WorkingHours, label: "Quarta-feira" },
    { key: "thursday" as keyof WorkingHours, label: "Quinta-feira" },
    { key: "friday" as keyof WorkingHours, label: "Sexta-feira" },
    { key: "saturday" as keyof WorkingHours, label: "Sábado" },
    { key: "sunday" as keyof WorkingHours, label: "Domingo" },
  ];

  const handleToggleDay = (day: keyof WorkingHours) => {
    onUpdateSchedule(day, {
      ...workingHours[day],
      isWorking: !workingHours[day].isWorking,
      startTime: workingHours[day].startTime || "09:00",
      endTime: workingHours[day].endTime || "18:00",
    });
  };

  const handleStartTimeChange = (day: keyof WorkingHours, value: string) => {
    onUpdateSchedule(day, {
      ...workingHours[day],
      startTime: value,
    });
  };

  const handleEndTimeChange = (day: keyof WorkingHours, value: string) => {
    onUpdateSchedule(day, {
      ...workingHours[day],
      endTime: value,
    });
  };

  const handleBreakStartChange = (day: keyof WorkingHours, value: string) => {
    onUpdateSchedule(day, {
      ...workingHours[day],
      breakStart: value,
    });
  };

  const handleBreakEndChange = (day: keyof WorkingHours, value: string) => {
    onUpdateSchedule(day, {
      ...workingHours[day],
      breakEnd: value,
    });
  };

  return (
    <div className="space-y-6">
      {weekDays.map((day) => (
        <div key={day.key} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <Label
              htmlFor={`${day.key}-toggle`}
              className="text-base font-medium cursor-pointer"
            >
              {day.label}
            </Label>
            <Switch
              id={`${day.key}-toggle`}
              checked={workingHours[day.key]?.isWorking}
              onCheckedChange={() => handleToggleDay(day.key)}
            />
          </div>

          {workingHours[day.key]?.isWorking && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${day.key}-start`}>Hora de início</Label>
                  <Input
                    id={`${day.key}-start`}
                    type="time"
                    value={workingHours[day.key]?.startTime}
                    onChange={(e) =>
                      handleStartTimeChange(day.key, e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${day.key}-end`}>Hora de término</Label>
                  <Input
                    id={`${day.key}-end`}
                    type="time"
                    value={workingHours[day.key]?.endTime}
                    onChange={(e) =>
                      handleEndTimeChange(day.key, e.target.value)
                    }
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${day.key}-break-start`}>Intervalo início</Label>
                  <Input
                    id={`${day.key}-break-start`}
                    type="time"
                    value={workingHours[day.key]?.breakStart || ""}
                    onChange={(e) =>
                      handleBreakStartChange(day.key, e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${day.key}-break-end`}>Intervalo término</Label>
                  <Input
                    id={`${day.key}-break-end`}
                    type="time"
                    value={workingHours[day.key]?.breakEnd || ""}
                    onChange={(e) =>
                      handleBreakEndChange(day.key, e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
