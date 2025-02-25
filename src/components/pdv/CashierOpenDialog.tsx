
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
    // Remove qualquer caractere que não seja número
    const numericValue = value.replace(/[^0-9]/g, "");
    
    // Converte para número, tratando string vazia como zero
    const number = numericValue === "" ? 0 : parseInt(numericValue);
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number / 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Pega apenas os números do input
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    
    // Converte para valor em reais (string)
    const valueInReais = numericValue === "" ? "0" : (parseInt(numericValue) / 100).toString();
    
    // Atualiza o valor
    onOpeningAmountChange(valueInReais);
  };

  // Função auxiliar para debugar os valores
  const logValues = () => {
    console.log("Valor atual:", openingAmount);
    console.log("Valor formatado:", formatCurrency(openingAmount));
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
              inputMode="numeric"
              value={formatCurrency(openingAmount)}
              onChange={handleInputChange}
              onClick={() => logValues()} // Debug: log valores ao clicar
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
