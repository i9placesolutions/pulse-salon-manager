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
import { Product } from "@/types/stock";
import { formatCurrency } from "@/utils/currency";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, Percent } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommissionDialogProps {
  product: Product;
  professionals: { id: number; name: string }[];
  onSave: (commissions: { professionalId: number; type: 'fixed' | 'percentage'; value: number }[]) => void;
}

export function CommissionDialog({
  product,
  professionals,
  onSave,
}: CommissionDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [commissions, setCommissions] = useState<{
    professionalId: number;
    type: 'fixed' | 'percentage';
    value: number;
  }[]>(
    professionals.map((prof) => ({
      professionalId: prof.id,
      type: product.commission.type,
      value: product.commission.customValues?.[prof.id] ?? product.commission.defaultValue,
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

  const calculateEarnings = (commission: { type: 'fixed' | 'percentage'; value: number }) => {
    if (commission.type === "percentage") {
      return (product.salePrice * commission.value) / 100;
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-purple-700 hover:text-purple-500 hover:bg-purple-50"
              >
                <Percent className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configurar Comissões</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Comissões - {product.name}</DialogTitle>
          <DialogDescription>
            Configure as comissões individuais por profissional. Valor padrão:{" "}
            {product.commission.type === "percentage"
              ? `${product.commission.defaultValue}%`
              : formatCurrency(product.commission.defaultValue)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <Label>Aplicar para todos os profissionais</Label>
            <div className="flex gap-4">
              <select
                className="flex h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={product.commission.type}
              >
                <option value="percentage">Porcentagem</option>
                <option value="fixed">Valor Fixo</option>
              </select>
              <Input
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.commission.defaultValue}
                placeholder="Valor"
              />
              <Button
                type="button"
                onClick={() =>
                  handleApplyToAll(product.commission.type, product.commission.defaultValue)
                }
              >
                Aplicar para Todos
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {professionals.map((professional) => {
              const commission = commissions.find(
                (c) => c.professionalId === professional.id
              );
              if (!commission) return null;

              const earnings = calculateEarnings(commission);
              const isCustom =
                commission.type !== product.commission.type ||
                commission.value !== product.commission.defaultValue;

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
                          product.commission.defaultValue
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
