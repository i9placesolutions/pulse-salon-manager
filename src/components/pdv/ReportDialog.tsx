import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface para o DateRangePicker simulada, pois não temos esse componente
interface DateRangePickerProps {
  className?: string;
}

// Componente simulado de DateRangePicker
const DateRangePicker: React.FC<DateRangePickerProps> = ({ className }) => {
  return (
    <div className={className}>
      <input type="date" className="w-full p-2 border rounded-md" />
    </div>
  );
};

interface ReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateReport: (data: any) => void;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({
  isOpen,
  onOpenChange,
  onGenerateReport,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerar Relatório</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reportType" className="col-span-4">
              Tipo de Relatório
            </Label>
            <Select>
              <SelectTrigger className="col-span-4">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Vendas</SelectItem>
                <SelectItem value="products">Produtos</SelectItem>
                <SelectItem value="clients">Clientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="period" className="col-span-4">
              Período
            </Label>
            <DateRangePicker className="col-span-4" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="col-span-4">
              Formato
            </Label>
            <Select>
              <SelectTrigger className="col-span-4">
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onGenerateReport({})}>Gerar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 