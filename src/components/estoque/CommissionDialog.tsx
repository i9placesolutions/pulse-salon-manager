
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/stock";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Professional {
  id: number;
  name: string;
}

interface CommissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  professionals: Professional[];
  onSave: (productId: number, commissions: Record<number, number>) => void;
}

export function CommissionDialog({
  open,
  onOpenChange,
  product,
  professionals,
  onSave,
}: CommissionDialogProps) {
  const { toast } = useToast();
  const [customCommissions, setCustomCommissions] = useState<Record<number, number>>(
    product.commission.customValues || {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product.id, customCommissions);
    toast({
      title: "Comissões atualizadas",
      description: "As comissões por profissional foram atualizadas com sucesso!",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Comissões por Profissional</DialogTitle>
          <DialogDescription>
            Configure comissões específicas para cada profissional neste produto.
            Se não definido, será usado o valor padrão de{" "}
            {product.commission.type === "percentage" ? `${product.commission.defaultValue}%` : 
             `R$ ${product.commission.defaultValue.toFixed(2)}`}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            {professionals.map((professional) => (
              <div key={professional.id} className="space-y-2">
                <label htmlFor={`commission-${professional.id}`}>{professional.name}</label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`commission-${professional.id}`}
                    type="number"
                    step="0.01"
                    value={customCommissions[professional.id] || ""}
                    onChange={(e) =>
                      setCustomCommissions((prev) => ({
                        ...prev,
                        [professional.id]: Number(e.target.value),
                      }))
                    }
                    placeholder={`Valor ${product.commission.type === "percentage" ? "em %" : "em R$"}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setCustomCommissions((prev) => {
                        const newCommissions = { ...prev };
                        delete newCommissions[professional.id];
                        return newCommissions;
                      })
                    }
                  >
                    Usar Padrão
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit">Salvar Comissões</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
