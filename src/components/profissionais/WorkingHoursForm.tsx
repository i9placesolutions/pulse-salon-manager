
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WeeklySchedule } from "./working-hours/WeeklySchedule";
import { DaySchedule, WorkingHours, BlockedDate, Professional } from "@/types/professional";
import { BlockedDateForm } from "./working-hours/BlockedDateForm";
import { BlockedDatesList } from "./working-hours/BlockedDatesList";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

interface WorkingHoursFormProps {
  professional?: Professional;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workingHours: WorkingHours, blockedDates: BlockedDate[]) => void;
}

export function WorkingHoursForm({ open, onOpenChange, onSave }: WorkingHoursFormProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    thursday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    friday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    saturday: { isWorking: true, startTime: "09:00", endTime: "12:00" },
    sunday: { isWorking: false, startTime: "", endTime: "" },
  });

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [newBlockedDate, setNewBlockedDate] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });
  
  const { toast } = useToast();
  
  const handleSave = () => {
    // Validar os dados antes de salvar
    for (const day in workingHours) {
      const schedule = workingHours[day as keyof WorkingHours];
      if (schedule.isWorking) {
        if (!schedule.startTime || !schedule.endTime) {
          toast({
            title: "Horários inválidos",
            description: `Defina os horários de início e fim para ${day}.`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    
    // Salvar as alterações
    onSave(workingHours, blockedDates);
  };
  
  const handleDayScheduleChange = (day: string, field: string, value: string | boolean) => {
    setWorkingHours((prevHours) => ({
      ...prevHours,
      [day]: {
        ...prevHours[day as keyof WorkingHours],
        [field]: value,
      },
    }));
  };
  
  const handleAddBlockedDate = () => {
    // Validar as datas
    if (!newBlockedDate.startDate || !newBlockedDate.endDate) {
      toast({
        title: "Datas inválidas",
        description: "Selecione as datas de início e fim.",
        variant: "destructive",
      });
      return;
    }
    
    // Adicionar nova data bloqueada
    const newId = blockedDates.length > 0 ? Math.max(...blockedDates.map(d => d.id || 0)) + 1 : 1;
    const newDate: BlockedDate = {
      id: newId,
      start: newBlockedDate.startDate,
      end: newBlockedDate.endDate,
      reason: newBlockedDate.reason,
      startDate: newBlockedDate.startDate,
      endDate: newBlockedDate.endDate,
    };
    
    setBlockedDates([...blockedDates, newDate]);
    
    // Limpar o formulário
    setNewBlockedDate({
      startDate: "",
      endDate: "",
      reason: "",
    });
    setSelectedDateRange({ from: undefined, to: undefined });
    
    toast({
      title: "Data bloqueada adicionada",
      description: "A data foi adicionada à lista de datas bloqueadas.",
    });
  };
  
  const handleRemoveBlockedDate = (id: number) => {
    setBlockedDates(blockedDates.filter(date => date.id !== id));
    toast({
      title: "Data bloqueada removida",
      description: "A data foi removida da lista de datas bloqueadas.",
    });
  };

  const handleDateSelect = (range: any) => {
    if (!range || (!range.from && !range.to)) return;
    
    setSelectedDateRange(range);
    
    if (range.from) {
      setNewBlockedDate(prev => ({
        ...prev,
        startDate: format(range.from, "yyyy-MM-dd")
      }));
    }
    
    if (range.to) {
      setNewBlockedDate(prev => ({
        ...prev,
        endDate: format(range.to, "yyyy-MM-dd")
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Horários de Trabalho</h3>
          <WeeklySchedule
            workingHours={workingHours}
            onDayScheduleChange={handleDayScheduleChange}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Datas Bloqueadas</h3>
          <BlockedDatesList
            blockedDates={blockedDates}
            onRemove={handleRemoveBlockedDate}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Selecione o Período</h4>
              <Calendar
                initialFocus
                mode="range"
                selected={selectedDateRange}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                locale={ptBR}
                disabled={(date) => date < new Date()}
                className="bg-white border rounded-md shadow-sm"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium mb-2">Detalhes do Bloqueio</h4>
              <div className="space-y-2">
                <BlockedDateForm
                  startDate={newBlockedDate.startDate}
                  endDate={newBlockedDate.endDate}
                  reason={newBlockedDate.reason}
                  onChange={setNewBlockedDate}
                  onAdd={handleAddBlockedDate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Salvar Horários
        </Button>
      </div>
    </div>
  );
}
