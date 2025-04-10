
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CommissionConfig } from "@/types/financial";
import { useToast } from "@/hooks/use-toast";

interface CommissionConfigDialogProps {
  configs: CommissionConfig[];
}

export function CommissionConfigDialog({ configs }: CommissionConfigDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de comissão foram atualizadas com sucesso.",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Configurar Comissões</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuração de Comissões</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {configs.map((config) => (
            <div
              key={config.id}
              className="p-4 border rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{config.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Tipo: {config.type === "service" ? "Serviço" : "Produto"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <Label>Tipo de Comissão</Label>
                    <Select
                      defaultValue={config.commissionType}
                      onValueChange={() => {}}
                    >
                      <option value="fixed">Valor Fixo</option>
                      <option value="percentage">Porcentagem</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Valor Padrão</Label>
                    <Input
                      type="number"
                      value={config.defaultValue}
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </div>

              {config.customValues && config.customValues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Valores Personalizados</h4>
                  <div className="space-y-2">
                    {config.customValues.map((custom) => (
                      <div
                        key={custom.professionalId}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">Profissional ID: {custom.professionalId}</span>
                        <Input
                          type="number"
                          value={custom.value}
                          onChange={() => {}}
                          className="w-32"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar Configurações</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
