
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
          {professionals
            .filter((prof) => service.professionals.includes(prof.id))
            .map((professional) => {
              const commission = commissions.find(
                (c) => c.professionalId === professional.id
              );
              if (!commission) return null;

              return (
                <div key={professional.id} className="space-y-2">
                  <Label>{professional.name}</Label>
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
                  <p className="text-sm text-muted-foreground">
                    Comissão atual:{" "}
                    {commission.type === "percentage"
                      ? `${commission.value}% (${formatCurrency(
                          (service.price * commission.value) / 100
                        )})`
                      : formatCurrency(commission.value)}
                  </p>
                </div>
              );
            })}
          <DialogFooter>
            <Button type="submit">Salvar Comissões</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
