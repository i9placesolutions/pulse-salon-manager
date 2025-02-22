
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Service, ProfessionalCommission } from "@/types/service";
import { formatCurrency } from "@/utils/currency";

interface Professional {
  id: number;
  name: string;
}

interface ServiceCommissionDialogProps {
  service: Service;
  professionals: Professional[];
  customCommissions?: ProfessionalCommission[];
  onSave: (commissions: ProfessionalCommission[]) => void;
}

export function ServiceCommissionDialog({
  service,
  professionals,
  customCommissions = [],
  onSave,
}: ServiceCommissionDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [commissions, setCommissions] = useState<ProfessionalCommission[]>(
    customCommissions.length > 0
      ? customCommissions
      : service.professionals.map((profId) => ({
          professionalId: profId,
          serviceId: service.id,
          type: service.commission.type,
          value: service.commission.value,
        }))
  );

  const handleCommissionChange = (professionalId: number, value: number) => {
    setCommissions((prev) =>
      prev.map((comm) =>
        comm.professionalId === professionalId ? { ...comm, value } : comm
      )
    );
  };

  const handleTypeChange = (professionalId: number, type: 'fixed' | 'percentage') => {
    setCommissions((prev) =>
      prev.map((comm) =>
        comm.professionalId === professionalId ? { ...comm, type } : comm
      )
    );
  };

  const handleApplyToAll = (type: 'fixed' | 'percentage', value: number) => {
    setCommissions((prev) =>
      prev.map((comm) => ({
        ...comm,
        type,
        value,
      }))
    );
    toast({
      title: "Comissão aplicada",
      description: "A comissão foi aplicada para todos os profissionais.",
    });
  };

  const calculateEarnings = (commission: ProfessionalCommission) => {
    if (commission.type === "percentage") {
      return (service.price * commission.value) / 100;
    }
    return commission.value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(commissions);
    toast({
      title: "Comissões atualizadas",
      description: "As comissões foram atualizadas com sucesso!",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Configurar Comissões</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Comissões - {service.name}</DialogTitle>
          <DialogDescription>
            Configure as comissões individuais por profissional. Valor padrão:{" "}
            {service.commission.type === "percentage"
              ? `${service.commission.value}%`
              : formatCurrency(service.commission.value)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <Label>Aplicar para todos os profissionais</Label>
            <div className="flex gap-4">
              <select
                className="flex h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={service.commission.type}
              >
                <option value="percentage">Porcentagem</option>
                <option value="fixed">Valor Fixo</option>
              </select>
              <Input
                type="number"
                step="0.01"
                min="0"
                defaultValue={service.commission.value}
                placeholder="Valor"
              />
              <Button
                type="button"
                onClick={() =>
                  handleApplyToAll(service.commission.type, service.commission.value)
                }
              >
                Aplicar para Todos
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {professionals
              .filter((prof) => service.professionals.includes(prof.id))
              .map((professional) => {
                const commission = commissions.find(
                  (c) => c.professionalId === professional.id
                );
                if (!commission) return null;

                const earnings = calculateEarnings(commission);
                const isCustom =
                  commission.type !== service.commission.type ||
                  commission.value !== service.commission.value;

                return (
                  <div 
                    key={professional.id} 
                    className={`space-y-2 p-4 rounded-lg border ${
                      isCustom ? "border-primary/50" : "border-muted"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <Label>{professional.name}</Label>
                      {isCustom && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Comissão Personalizada
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <select
                        className="flex h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={commission.type}
                        onChange={(e) =>
                          handleTypeChange(
                            professional.id,
                            e.target.value as "fixed" | "percentage"
                          )
                        }
                      >
                        <option value="percentage">Porcentagem</option>
                        <option value="fixed">Valor Fixo</option>
                      </select>
                      <Input
                        type="number"
                        step={commission.type === "percentage" ? "1" : "0.01"}
                        min="0"
                        value={commission.value}
                        onChange={(e) =>
                          handleCommissionChange(professional.id, Number(e.target.value))
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          handleCommissionChange(
                            professional.id,
                            service.commission.value
                          )
                        }
                      >
                        Usar Padrão
                      </Button>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        Comissão: {" "}
                        {commission.type === "percentage"
                          ? `${commission.value}%`
                          : formatCurrency(commission.value)}
                      </span>
                      <span>
                        Valor a receber: {formatCurrency(earnings)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
          <DialogFooter>
            <Button type="submit">Salvar Comissões</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
