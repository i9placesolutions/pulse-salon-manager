
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "@/types/subscription";
import { formatCurrency } from "@/utils/currency";
import { Check } from "lucide-react";

interface SubscriptionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan;
  onConfirm: () => void;
}

export function SubscriptionConfirmDialog({
  open,
  onOpenChange,
  plan,
  onConfirm
}: SubscriptionConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Assinatura</DialogTitle>
          <DialogDescription>
            Você está prestes a assinar o plano {plan.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Plano</span>
            <span>{plan.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Valor Mensal</span>
            <span>{formatCurrency(plan.price)}</span>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Recursos Inclusos:</h4>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm}>
            Confirmar Assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
