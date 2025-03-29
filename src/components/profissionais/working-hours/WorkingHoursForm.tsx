
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklySchedule } from "./WeeklySchedule";
import { BlockedDatesList } from "./BlockedDatesList";
import { BlockedDateForm } from "./BlockedDateForm";
import { WorkingHours, BlockedDate, DaySchedule } from "@/types/professional";
import { useToast } from "@/hooks/use-toast";

interface WorkingHoursFormProps {
  initialWorkingHours?: WorkingHours;
  initialBlockedDates?: BlockedDate[];
  onSave: (workingHours: WorkingHours, blockedDates: BlockedDate[]) => void;
}

export function WorkingHoursForm({
  initialWorkingHours,
  initialBlockedDates = [],
  onSave,
}: WorkingHoursFormProps) {
  const { toast } = useToast();
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    initialWorkingHours || {
      monday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      thursday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      friday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      saturday: { isWorking: false, startTime: "09:00", endTime: "13:00" },
      sunday: { isWorking: false, startTime: "09:00", endTime: "18:00" }
    }
  );
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(initialBlockedDates);
  const [showBlockedDateForm, setShowBlockedDateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");

  const handleUpdateSchedule = (day: keyof WorkingHours, data: DaySchedule) => {
    setWorkingHours({ ...workingHours, [day]: data });
  };

  const handleAddBlockedDate = (newBlockedDate: BlockedDate) => {
    setBlockedDates([...blockedDates, newBlockedDate]);
    setShowBlockedDateForm(false);
    toast({
      title: "Data bloqueada",
      description: "A data foi bloqueada com sucesso.",
    });
  };

  const handleRemoveBlockedDate = (id: string | number) => {
    setBlockedDates(blockedDates.filter((date) => date.id !== id));
    toast({
      title: "Data desbloqueada",
      description: "O bloqueio foi removido com sucesso.",
    });
  };

  const handleSave = () => {
    onSave(workingHours, blockedDates);
    toast({
      title: "Configurações salvas",
      description: "As configurações de horário foram salvas com sucesso.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Horários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Horários Semanais</TabsTrigger>
            <TabsTrigger value="blocked-dates">Datas Bloqueadas</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule" className="py-4">
            <WeeklySchedule 
              workingHours={workingHours} 
              onUpdateSchedule={handleUpdateSchedule} 
            />
          </TabsContent>
          <TabsContent value="blocked-dates" className="py-4 space-y-4">
            {showBlockedDateForm ? (
              <BlockedDateForm 
                onSubmit={handleAddBlockedDate}
                onCancel={() => setShowBlockedDateForm(false)} 
              />
            ) : (
              <Button onClick={() => setShowBlockedDateForm(true)}>
                Adicionar Data Bloqueada
              </Button>
            )}
            <BlockedDatesList
              blockedDates={blockedDates}
              onRemove={handleRemoveBlockedDate}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </CardContent>
    </Card>
  );
}
