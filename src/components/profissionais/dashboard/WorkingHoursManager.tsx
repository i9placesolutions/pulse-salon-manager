
import React from "react";
import { WorkingHoursForm } from "@/components/profissionais/WorkingHoursForm";
import { WorkingHours, BlockedDate } from "@/types/professional";

interface WorkingHoursManagerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const WorkingHoursManager: React.FC<WorkingHoursManagerProps> = ({
  isOpen,
  onOpenChange
}) => {
  const handleSave = (workingHours: WorkingHours, blockedDates: BlockedDate[]) => {
    console.log("Horários salvos:", workingHours);
    console.log("Datas bloqueadas:", blockedDates);
    onOpenChange(false);
  };

  return (
    <WorkingHoursForm
      open={isOpen}
      onOpenChange={onOpenChange}
      onSave={handleSave}
    />
  );
};
