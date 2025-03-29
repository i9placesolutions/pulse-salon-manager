
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkingHours, DaySchedule, BlockedDate } from "@/types/professional";
import { WeeklySchedule } from "./WeeklySchedule";
import { BlockedDateForm } from "./BlockedDateForm";
import { BlockedDatesList } from "./BlockedDatesList";

interface WorkingHoursFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workingHours?: WorkingHours;
  blockedDates?: BlockedDate[];
  onSave: (workingHours: WorkingHours, blockedDates: BlockedDate[]) => void;
}

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
          <WeeklySchedule
            workingHours={workingHours}
            onDayScheduleChange={handleDayScheduleChange}
          />

          <BlockedDateForm
            values={newBlockedDate}
            onChange={setNewBlockedDate}
            onAdd={handleAddBlockedDate}
          />

          <BlockedDatesList
            blockedDates={blockedDates}
            onRemove={handleRemoveBlockedDate}
          />

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
