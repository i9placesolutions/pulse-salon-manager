
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Download } from "lucide-react";

interface DashboardHeaderProps {
  onExportReport: () => void;
}

export function DashboardHeader({ onExportReport }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl font-semibold text-neutral">Dashboard</h1>
      <div className="flex flex-wrap gap-2">
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
        <Button variant="outline" size="sm">
          <DollarSign className="mr-2 h-4 w-4" />
          Registrar Pagamento
        </Button>
        <Button variant="outline" size="sm" onClick={onExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>
    </div>
  );
}
