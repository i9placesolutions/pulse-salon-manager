import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, parseCurrency } from "@/utils/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  // Formata valor para exibição como moeda brasileira
  const formatBrazilianCurrency = (value: string): string => {
    if (!value) return "";
    
    // Remove qualquer caractere não numérico, exceto vírgula
    let numericValue = value.replace(/[^\d,]/g, "");
    
    // Converte para um formato que podemos manipular
    let intPart = numericValue;
    let decPart = "00";
    
    if (numericValue.includes(",")) {
      const parts = numericValue.split(",");
      intPart = parts[0] || "0";
      decPart = parts[1] || "00";
      
      // Limita parte decimal a 2 dígitos
      if (decPart.length > 2) {
        decPart = decPart.substring(0, 2);
      } else if (decPart.length === 1) {
        decPart = decPart + "0";
      } else if (decPart.length === 0) {
        decPart = "00";
      }
    }
    
    // Remove zeros à esquerda da parte inteira
    intPart = intPart.replace(/^0+/, "") || "0";
    
    // Adiciona separadores de milhar (pontos)
    let formattedIntPart = "";
    for (let i = intPart.length - 1, count = 0; i >= 0; i--, count++) {
      if (count > 0 && count % 3 === 0) {
        formattedIntPart = "." + formattedIntPart;
      }
      formattedIntPart = intPart[i] + formattedIntPart;
    }
    
    return `${formattedIntPart},${decPart}`;
  };
  
  // Função para obter versão limpa do valor (sem formatação)
  const getCleanValue = (value: string): string => {
    return value.replace(/\./g, "");
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove qualquer formatação existente (pontos)
    const cleanValue = value.replace(/\./g, "");
    
    // Mantém a posição do cursor antes da formatação
    const currentCursorPosition = e.target.selectionStart || 0;
    
    // Conta quantos separadores de milhar (pontos) existem antes da posição do cursor
    const dotsBeforeCursor = (value.substring(0, currentCursorPosition).match(/\./g) || []).length;
    
    // Formata o valor
    const formattedValue = formatBrazilianCurrency(cleanValue);
    
    // Atualiza o valor
    onOpeningAmountChange(formattedValue);
    
    // Calcula a nova posição do cursor após formatação
    // Conta quantos separadores de milhar há agora antes da antiga posição
    const cleanValueBeforeCursor = cleanValue.substring(0, currentCursorPosition);
    const formattedValueBeforeCursor = formatBrazilianCurrency(cleanValueBeforeCursor);
    const newDotsBeforeCursor = (formattedValueBeforeCursor.match(/\./g) || []).length;
    
    // Ajusta a posição do cursor considerando os novos separadores
    const newCursorPosition = currentCursorPosition + (newDotsBeforeCursor - dotsBeforeCursor);
    
    // Armazena a posição para aplicar após a renderização
    setCursorPosition(newCursorPosition);
  };
  
  // Efeito para ajustar a posição do cursor após a formatação
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [cursorPosition, openingAmount]);
  
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                R$
              </span>
              <Input
                ref={inputRef}
                type="text"
                value={openingAmount}
                onChange={handleInputChange}
                placeholder="0,00"
                className="pl-9"
              />
            </div>
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
