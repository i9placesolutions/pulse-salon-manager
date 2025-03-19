
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, parseCurrency } from "@/utils/currency";
import type { CashierOperation } from "@/types/pdv";

interface CashOperationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: "withdrawal" | "supply";
  onConfirm: (operation: Omit<CashierOperation, "id" | "date" | "userId">) => void;
}

export function CashOperationDialog({
  isOpen,
  onOpenChange,
  type,
  onConfirm,
}: CashOperationDialogProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    const parsedAmount = parseCurrency(amount);
    
    if (parsedAmount <= 0) {
      return;
    }
    
    onConfirm({
      type,
      amount: parsedAmount,
      reason: reason.trim(),
    });
    
    // Reset form
    setAmount("");
    setReason("");
    onOpenChange(false);
  };

  const title = type === "withdrawal" ? "Retirada de Caixa" : "Suprimento de Caixa";
  const description = type === "withdrawal" 
    ? "Registre uma retirada de dinheiro do caixa" 
    : "Registre um suprimento de dinheiro para o caixa";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                R$
              </span>
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Motivo</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da operação"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={parseCurrency(amount) <= 0 || !reason.trim()}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
