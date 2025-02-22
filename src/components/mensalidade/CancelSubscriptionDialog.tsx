
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onConfirm
}: CancelSubscriptionDialogProps) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Assinatura</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium ao final do período atual.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Por que você está cancelando?
            </label>
            <Textarea
              id="reason"
              placeholder="Nos ajude a melhorar nosso serviço"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(reason)}
          >
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
