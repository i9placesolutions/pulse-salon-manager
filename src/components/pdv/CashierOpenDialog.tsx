
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
import { useState } from "react";

interface CashierOpenDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  openingAmount: string;
  onOpeningAmountChange: (value: string) => void;
  onConfirm: () => void;
}

export function CashierOpenDialog({
  isOpen,
  onOpenChange,
  openingAmount,
  onOpeningAmountChange,
  onConfirm,
}: CashierOpenDialogProps) {
  const formatCurrency = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");
    
    // Converte para centavos
    const cents = parseInt(numericValue) / 100;
    
    // Formata o número como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove formatação atual
    const rawValue = e.target.value.replace(/\D/g, "");
    
    // Converte para string mantendo apenas números
    const numericValue = rawValue ? (parseInt(rawValue) / 100).toString() : "";
    
    onOpeningAmountChange(numericValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir Caixa</DialogTitle>
          <DialogDescription>
            Informe o valor inicial do caixa para começar as operações do dia.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valor Inicial</Label>
            <Input
              type="text"
              value={openingAmount ? formatCurrency(openingAmount) : ""}
              onChange={handleInputChange}
              placeholder="R$ 0,00"
              className="text-right"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Abrir Caixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
