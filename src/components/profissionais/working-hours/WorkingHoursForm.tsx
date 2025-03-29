
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlockedDatesList } from "./BlockedDatesList";
import { BlockedDateForm } from "./BlockedDateForm";
import { WeeklySchedule } from "./WeeklySchedule";
import { WorkingHours, BlockedDate } from "@/types/professional";

interface WorkingHoursFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workingHours: WorkingHours, blockedDates: BlockedDate[]) => void;
  initialWorkingHours?: WorkingHours;
  initialBlockedDates?: BlockedDate[];
}

export const WorkingHoursForm = ({
  open,
  onOpenChange,
  onSave,
  initialWorkingHours,
  initialBlockedDates = [],
}: WorkingHoursFormProps) => {
  // Initialize with default values or provided values
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    initialWorkingHours || {
      monday: { isWorking: true, startTime: "08:00", endTime: "18:00" },
      tuesday: { isWorking: true, startTime: "08:00", endTime: "18:00" },
      wednesday: { isWorking: true, startTime: "08:00", endTime: "18:00" },
      thursday: { isWorking: true, startTime: "08:00", endTime: "18:00" },
      friday: { isWorking: true, startTime: "08:00", endTime: "18:00" },
      saturday: { isWorking: false, startTime: "09:00", endTime: "14:00" },
      sunday: { isWorking: false, startTime: "09:00", endTime: "14:00" },
    }
  );

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(initialBlockedDates);
  const [showBlockedDateForm, setShowBlockedDateForm] = useState(false);

  // Update state when props change
  useEffect(() => {
    if (initialWorkingHours) {
      setWorkingHours(initialWorkingHours);
    }
    if (initialBlockedDates) {
      setBlockedDates(initialBlockedDates);
    }
  }, [initialWorkingHours, initialBlockedDates]);

  const handleUpdateSchedule = (day: keyof WorkingHours, data: { isWorking: boolean; startTime: string; endTime: string }) => {
    setWorkingHours({
      ...workingHours,
      [day]: data,
    });
  };

  const handleAddBlockedDate = (newBlockedDate: BlockedDate) => {
    // Generate a unique ID if one is not provided
    const blockedDateWithId: BlockedDate = {
      ...newBlockedDate,
      id: newBlockedDate.id || String(Date.now()),
    };
    setBlockedDates([...blockedDates, blockedDateWithId]);
    setShowBlockedDateForm(false);
  };

  const handleRemoveBlockedDate = (id: string | number) => {
    setBlockedDates(blockedDates.filter((date) => date.id !== id));
  };

  const handleSave = () => {
    onSave(workingHours, blockedDates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configurar Horários de Trabalho</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Horário Semanal</h3>
            <WeeklySchedule
              workingHours={workingHours}
              onUpdateSchedule={handleUpdateSchedule}
            />
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Datas Bloqueadas</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBlockedDateForm(true)}
              >
                Adicionar Bloqueio
              </Button>
            </div>

            {showBlockedDateForm && (
              <BlockedDateForm
                onSubmit={handleAddBlockedDate}
                onCancel={() => setShowBlockedDateForm(false)}
              />
            )}

            <BlockedDatesList
              blockedDates={blockedDates}
              onRemove={handleRemoveBlockedDate}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
