import { Button } from "@/components/ui/button";
import { Lock, Unlock, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100 shadow-sm mb-6">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-3 rounded-full">
          <ChevronRight className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">
              Dashboard do Profissional
            </h1>
            <Badge variant="outline" className="bg-blue-500 text-white border-blue-600 uppercase text-xs font-semibold">
              {agendaOpen ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <p className="text-sm text-blue-700/70">
            Gerencie sua agenda, comissões e desempenho
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="default"
          onClick={onToggleAgenda}
          className={`whitespace-nowrap transition-all ${
            agendaOpen 
              ? "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
              : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          }`}
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
        <Button 
          variant="outline" 
          onClick={onManageHours} 
          className="whitespace-nowrap border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
        >
          <Clock className="mr-2 h-4 w-4" />
          Gerenciar Horários
        </Button>
      </div>
    </div>
  );
}
