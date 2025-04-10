import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { parseCurrency } from "@/utils/currency";

interface AberturaCaixaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (valorInicial: number) => void;
}

export function AberturaCaixaModal({ isOpen, onClose, onConfirm }: AberturaCaixaModalProps) {
  const [valorInicial, setValorInicial] = useState("R$ 0,00");
  const [valorNumerico, setValorNumerico] = useState("0");
  const [semDinheiro, setSemDinheiro] = useState(false);

  // Formata o valor numérico para exibição (R$ X.XXX,XX)
  const formatarValor = (valor: string): string => {
    // Remove todos caracteres não numéricos
    const numeros = valor.replace(/\D/g, "");
    
    // Converte para centavos (divide por 100 para ter os decimais)
    const valorEmReais = parseFloat(numeros) / 100;
    
    // Formata no padrão brasileiro
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valorEmReais);
  };

  // Quando o usuário digita um valor
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (semDinheiro) return;
    
    // Obtém apenas os números do input
    const numeros = e.target.value.replace(/\D/g, "");
    
    // Atualiza o valor numérico
    setValorNumerico(numeros);
    
    // Formata e atualiza o valor de exibição
    setValorInicial(formatarValor(numeros));
  };

  // Efeito para resetar o valor quando o checkbox é marcado
  useEffect(() => {
    if (semDinheiro) {
      setValorNumerico("0");
      setValorInicial("R$ 0,00");
    }
  }, [semDinheiro]);

  // Função para confirmar a abertura do caixa
  const handleConfirm = () => {
    const valor = parseFloat(valorNumerico) / 100;
    onConfirm(valor);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Abertura de Caixa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="valorInicial">Valor inicial em caixa</Label>
            <Input
              id="valorInicial"
              value={valorInicial}
              onChange={handleChange}
              className="text-lg text-left"
              dir="ltr"
              inputMode="numeric"
              placeholder="R$ 0,00"
              disabled={semDinheiro}
            />
            <p className="text-sm text-gray-500">
              Informe o valor que você está colocando no caixa para iniciar o dia
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="semDinheiro" 
              checked={semDinheiro} 
              onCheckedChange={(checked) => {
                setSemDinheiro(checked as boolean);
              }}
            />
            <label
              htmlFor="semDinheiro"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Abrir sem dinheiro físico (R$ 0,00)
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Abrir Caixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 