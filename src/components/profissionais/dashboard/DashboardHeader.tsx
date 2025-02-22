
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Clock } from "lucide-react";

interface DashboardHeaderProps {
  agendaOpen: boolean;
  onToggleAgenda: () => void;
  onManageHours: () => void;
}

export function DashboardHeader({ 
  agendaOpen, 
  onToggleAgenda, 
  onManageHours 
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-neutral">Dashboard do Profissional</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie sua agenda, comissões e desempenho
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant={agendaOpen ? "destructive" : "default"}
          onClick={onToggleAgenda}
        >
          {agendaOpen ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Fechar Agenda
            </>
          ) : (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Abrir Agenda
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onManageHours}>
          <Clock className="mr-2 h-4 w-4" />
          Gerenciar Horários
        </Button>
      </div>
    </div>
  );
}
