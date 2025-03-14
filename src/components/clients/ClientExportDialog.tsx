import { useState } from "react";
import { ClientExportOptions } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileSpreadsheet, FileText, Download, Mail, MapPin, CreditCard, Heart, Calendar, Scissors } from "lucide-react";

interface ClientExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientCount: number;
  onExport: (options: ClientExportOptions) => void;
}

export function ClientExportDialog({
  isOpen,
  onClose,
  clientCount,
  onExport,
}: ClientExportDialogProps) {
  const [options, setOptions] = useState<ClientExportOptions>({
    includeContact: true,
    includeAddress: false,
    includeServices: true,
    includeSpending: true,
    includePreferences: false,
    includeBirthday: true,
    format: "excel",
  });

  const handleToggleOption = (key: keyof ClientExportOptions, value: boolean) => {
    setOptions({ ...options, [key]: value });
  };

  const handleFormatChange = (format: "pdf" | "excel") => {
    setOptions({ ...options, format });
  };

  const handleExport = () => {
    onExport(options);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Clientes</DialogTitle>
          <DialogDescription>
            Selecione quais informações deseja incluir na exportação de {clientCount} cliente{clientCount !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 my-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Dados a serem incluídos</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="contact" className="cursor-pointer">Contato (email, telefone)</Label>
                </div>
                <Switch
                  id="contact"
                  checked={options.includeContact}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeContact", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="address" className="cursor-pointer">Endereço completo</Label>
                </div>
                <Switch
                  id="address"
                  checked={options.includeAddress}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeAddress", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Scissors className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="services" className="cursor-pointer">Histórico de serviços</Label>
                </div>
                <Switch
                  id="services"
                  checked={options.includeServices}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeServices", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="spending" className="cursor-pointer">Gastos e cashback</Label>
                </div>
                <Switch
                  id="spending"
                  checked={options.includeSpending}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeSpending", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="preferences" className="cursor-pointer">Preferências</Label>
                </div>
                <Switch
                  id="preferences"
                  checked={options.includePreferences}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includePreferences", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="birthday" className="cursor-pointer">Data de aniversário</Label>
                </div>
                <Switch
                  id="birthday"
                  checked={options.includeBirthday}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeBirthday", checked)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Formato</h4>
            <RadioGroup
              value={options.format}
              onValueChange={(value) => handleFormatChange(value as "pdf" | "excel")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50" onClick={() => handleFormatChange("excel")}>
                <RadioGroupItem value="excel" id="excel" />
                <FileSpreadsheet className="w-5 h-5 text-green-600 mr-1" />
                <Label htmlFor="excel" className="cursor-pointer">Excel (.xlsx)</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50" onClick={() => handleFormatChange("pdf")}>
                <RadioGroupItem value="pdf" id="pdf" />
                <FileText className="w-5 h-5 text-red-600 mr-1" />
                <Label htmlFor="pdf" className="cursor-pointer">PDF (.pdf)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            className="bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar {clientCount} cliente{clientCount !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 