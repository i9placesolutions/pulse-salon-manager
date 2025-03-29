
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkingHours, BlockedDate } from "@/types/professional";

// Mock functional components since we don't have the actual ones:
const WeeklySchedule = ({
  workingHours, 
  onDayScheduleChange
}: {
  workingHours: WorkingHours;
  onDayScheduleChange: (day: string, field: string, value: string | boolean) => void;
}) => {
  return <div>Weekly Schedule Component</div>;
};

const BlockedDateForm = ({
  startDate,
  endDate,
  reason,
  onChange,
  onAdd
}: {
  startDate: string;
  endDate: string;
  reason: string;
  onChange: (values: {startDate: string; endDate: string; reason: string}) => void;
  onAdd: () => void;
}) => {
  return <div>Blocked Date Form Component</div>;
};

const BlockedDatesList = ({
  blockedDates,
  onRemove
}: {
  blockedDates: BlockedDate[];
  onRemove: (id: string | number) => void;
}) => {
  return <div>Blocked Dates List Component</div>;
};

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
  // Define a default working hours structure that is consistent with the type
  const defaultWorkingHours: WorkingHours = {
    monday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
    tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
    wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
    thursday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
    friday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
    saturday: { isWorking: true, startTime: "09:00", endTime: "13:00" },
    sunday: { isWorking: false, startTime: "", endTime: "" }, // Add required fields even if not working
  };
  
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    initialWorkingHours || defaultWorkingHours
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
    day: string,
    field: string,
    value: string | boolean
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...(prev as any)[day],
        [field]: value,
      },
    }));
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate.startDate && newBlockedDate.endDate && newBlockedDate.reason) {
      const newDate: BlockedDate = {
        id: String(Date.now()),
        startDate: newBlockedDate.startDate,
        endDate: newBlockedDate.endDate,
        reason: newBlockedDate.reason,
      };
      
      setBlockedDates([
        ...blockedDates,
        newDate
      ]);
      setNewBlockedDate({ startDate: "", endDate: "", reason: "" });
    }
  };

  const handleRemoveBlockedDate = (id: string | number) => {
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
            startDate={newBlockedDate.startDate}
            endDate={newBlockedDate.endDate}
            reason={newBlockedDate.reason}
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
