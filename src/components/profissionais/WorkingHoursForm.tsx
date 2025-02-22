
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { WorkingHours, DaySchedule, BlockedDate } from "@/types/professional";

interface WorkingHoursFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workingHours?: WorkingHours;
  blockedDates?: BlockedDate[];
  onSave: (workingHours: WorkingHours, blockedDates: BlockedDate[]) => void;
}

const DAYS_OF_WEEK = [
  { id: "monday" as const, label: "Segunda-feira" },
  { id: "tuesday" as const, label: "Terça-feira" },
  { id: "wednesday" as const, label: "Quarta-feira" },
  { id: "thursday" as const, label: "Quinta-feira" },
  { id: "friday" as const, label: "Sexta-feira" },
  { id: "saturday" as const, label: "Sábado" },
  { id: "sunday" as const, label: "Domingo" },
];

export const WorkingHoursForm = ({
  open,
  onOpenChange,
  workingHours: initialWorkingHours,
  blockedDates: initialBlockedDates = [],
  onSave,
}: WorkingHoursFormProps) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    initialWorkingHours || {
      monday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      thursday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      friday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      saturday: { isWorking: true, startTime: "09:00", endTime: "13:00" },
      sunday: { isWorking: false },
    }
  );

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(
    initialBlockedDates
  );

  const [newBlockedDate, setNewBlockedDate] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleDayScheduleChange = (
    day: keyof WorkingHours,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate.startDate && newBlockedDate.endDate && newBlockedDate.reason) {
      setBlockedDates([
        ...blockedDates,
        {
          id: Date.now(),
          ...newBlockedDate,
        },
      ]);
      setNewBlockedDate({ startDate: "", endDate: "", reason: "" });
    }
  };

  const handleRemoveBlockedDate = (id: number) => {
    setBlockedDates(blockedDates.filter((date) => date.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(workingHours, blockedDates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Horários de Trabalho</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Horários Semanais</h3>
            {DAYS_OF_WEEK.map(({ id, label }) => (
              <div key={id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={workingHours[id]?.isWorking}
                    onCheckedChange={(checked) =>
                      handleDayScheduleChange(id, "isWorking", checked)
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
                          handleDayScheduleChange(id, "startTime", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Fim</Label>
                      <Input
                        type="time"
                        value={workingHours[id]?.endTime || ""}
                        onChange={(e) =>
                          handleDayScheduleChange(id, "endTime", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Intervalo Início</Label>
                      <Input
                        type="time"
                        value={workingHours[id]?.breakStart || ""}
                        onChange={(e) =>
                          handleDayScheduleChange(id, "breakStart", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Intervalo Fim</Label>
                      <Input
                        type="time"
                        value={workingHours[id]?.breakEnd || ""}
                        onChange={(e) =>
                          handleDayScheduleChange(id, "breakEnd", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Bloqueio de Datas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={newBlockedDate.startDate}
                  onChange={(e) =>
                    setNewBlockedDate({ ...newBlockedDate, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={newBlockedDate.endDate}
                  onChange={(e) =>
                    setNewBlockedDate({ ...newBlockedDate, endDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Motivo</Label>
                <Input
                  value={newBlockedDate.reason}
                  onChange={(e) =>
                    setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })
                  }
                  placeholder="Ex: Férias, Folga, etc."
                />
              </div>
              <Button
                type="button"
                onClick={handleAddBlockedDate}
                className="md:col-span-2"
              >
                Adicionar Bloqueio
              </Button>
            </div>

            {blockedDates.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Datas Bloqueadas</h4>
                <div className="space-y-2">
                  {blockedDates.map((date) => (
                    <div
                      key={date.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(date.startDate).toLocaleDateString()} até{" "}
                          {new Date(date.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {date.reason}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveBlockedDate(date.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
