
import { Button } from "@/components/ui/button";
import { Calendar, Filter, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NavigateFunction } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

// Lista de períodos para filtro
const periodos = [
  { id: "7dias", nome: "Últimos 7 dias" },
  { id: "30dias", nome: "Últimos 30 dias" },
  { id: "90dias", nome: "Últimos 90 dias" },
  { id: "mesAtual", nome: "Mês atual" },
  { id: "mesAnterior", nome: "Mês anterior" }
];

interface DashboardHeaderProps {
  periodoFilter: string;
  setPeriodoFilter: (value: string) => void;
  navigate: NavigateFunction;
}

export const DashboardHeader = React.memo(({ 
  periodoFilter, 
  setPeriodoFilter, 
  navigate 
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-100 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-3 rounded-full">
          <ChevronRight className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-800">
              Dashboard
            </h1>
            <Badge variant="outline" className="bg-blue-500 text-white border-blue-600 uppercase text-xs font-semibold">
              Principal
            </Badge>
          </div>
          <p className="text-sm text-blue-700/70">
            Visão geral do seu negócio
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white mr-2" 
          onClick={() => navigate("/appointments")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Agendamentos
        </Button>

        <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-lg border border-blue-100">
          <Filter className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-700">Filtrar por:</span>
        </div>
        
        <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
          <SelectTrigger className="h-9 w-[160px] border-blue-200 text-blue-700 hover:border-blue-300 focus:ring-blue-500">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {periodos.map((periodo) => (
              <SelectItem key={periodo.id} value={periodo.id}>
                {periodo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

DashboardHeader.displayName = "DashboardHeader";
