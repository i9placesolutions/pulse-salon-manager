import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { parseCurrency } from "@/utils/currency";

interface FechamentoCaixaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (valorFinal: number, justificativa?: string) => void;
}

export function FechamentoCaixaModal({ isOpen, onClose, onConfirm }: FechamentoCaixaModalProps) {
  // Valor esperado em caixa (simulação)
  const valorAbertura = 100;
  const totalVendas = 1250.75;
  const totalSangrias = 200;
  const valorEsperado = valorAbertura + totalVendas - totalSangrias;

  const [valorInformado, setValorInformado] = useState("R$ 0,00");
  const [valorNumerico, setValorNumerico] = useState("0");
  const [justificativa, setJustificativa] = useState("");
  const [diferenca, setDiferenca] = useState(0);
  const [validado, setValidado] = useState(false);

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
    // Obtém apenas os números do input
    const numeros = e.target.value.replace(/\D/g, "");
    
    // Atualiza o valor numérico
    setValorNumerico(numeros);
    
    // Formata e atualiza o valor de exibição
    setValorInformado(formatarValor(numeros));
  };

  // Reseta o estado quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      setValorNumerico("0");
      setValorInformado("R$ 0,00");
      setJustificativa("");
      setValidado(false);
    } else {
      // Quando o modal abre, preenche com valor esperado como sugestão
      const centavos = Math.round(valorEsperado * 100);
      setValorNumerico(centavos.toString());
      setValorInformado(formatarValor(centavos.toString()));
    }
  }, [isOpen, valorEsperado]);

  // Calcula a diferença quando valor informado muda
  useEffect(() => {
    const valorReal = parseFloat(valorNumerico) / 100;
    setDiferenca(valorReal - valorEsperado);
  }, [valorNumerico, valorEsperado]);

  // Valida o fechamento
  const validarFechamento = () => {
    setValidado(true);
  };

  // Confirma o fechamento
  const handleConfirm = () => {
    const valor = parseFloat(valorNumerico) / 100;
    onConfirm(valor, justificativa);
  };

  // Determina se a justificativa é obrigatória
  const justificativaObrigatoria = Math.abs(diferenca) > 0.1;

  // Determina se pode confirmar o fechamento
  const podeConfirmar = validado && (!justificativaObrigatoria || (justificativaObrigatoria && justificativa.trim().length >= 10));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Fechamento de Caixa</DialogTitle>
          <DialogDescription>
            Informe o valor real em caixa para fechar a sessão
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {!validado ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorEsperado">Valor esperado</Label>
                  <Input
                    id="valorEsperado"
                    value={new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(valorEsperado)}
                    disabled
                    className="bg-gray-50 text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorInformado">Valor real em caixa</Label>
                  <Input
                    id="valorInformado"
                    value={valorInformado}
                    onChange={handleChange}
                    className="text-lg font-medium text-left"
                    dir="ltr"
                    inputMode="numeric"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 p-4 rounded-md">
                <div>
                  <p className="text-sm text-gray-500">Abertura</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(valorAbertura)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendas</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalVendas)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sangrias</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalSangrias)}
                  </p>
                </div>
              </div>

              <Button 
                onClick={validarFechamento}
                className="w-full"
              >
                Validar Fechamento
              </Button>
            </>
          ) : (
            <>
              {Math.abs(diferenca) < 0.1 ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700">Fechamento correto</AlertTitle>
                  <AlertDescription className="text-green-600">
                    O valor em caixa confere com o total esperado.
                  </AlertDescription>
                </Alert>
              ) : diferenca > 0 ? (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-700">Sobra em caixa</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    Há uma sobra de {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(diferenca)} no caixa.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-700">Falta em caixa</AlertTitle>
                  <AlertDescription className="text-red-600">
                    Há uma falta de {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Math.abs(diferenca))} no caixa.
                  </AlertDescription>
                </Alert>
              )}
              
              {justificativaObrigatoria && (
                <div className="space-y-2">
                  <Label htmlFor="justificativa">
                    Justificativa <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="justificativa"
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    placeholder="Explique o motivo da diferença..."
                    className="min-h-[100px]"
                  />
                  {justificativa.trim().length < 10 && (
                    <p className="text-sm text-red-500">
                      Forneça uma justificativa com pelo menos 10 caracteres
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          {validado && (
            <Button 
              onClick={handleConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!podeConfirmar}
            >
              Confirmar Fechamento
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 