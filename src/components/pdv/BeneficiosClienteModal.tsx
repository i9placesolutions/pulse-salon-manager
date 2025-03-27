import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CreditCard, 
  GiftIcon, 
  Percent,
  ChevronRight
} from "lucide-react";
import { parseCurrency } from "@/utils/currency";

// Tipos
interface Cliente {
  id: string;
  nome: string;
  cashbackDisponivel: number;
  cupons: { id: string; descricao: string; valor: number }[];
  ultimaVisita: string;
}

interface Beneficio {
  tipo: "cashback" | "cupom" | "desconto";
  valor: number;
  motivo?: string;
  cupomId?: string;
}

interface BeneficiosClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onAplicarBeneficio: (beneficio: Beneficio) => void;
  subtotal: number;
}

export function BeneficiosClienteModal({ 
  isOpen, 
  onClose, 
  cliente, 
  onAplicarBeneficio,
  subtotal
}: BeneficiosClienteModalProps) {
  const [tipoBeneficio, setTipoBeneficio] = useState<"cashback" | "cupom" | "desconto" | "">("");
  const [cupomSelecionado, setCupomSelecionado] = useState<string>("");
  const [valorCashback, setValorCashback] = useState("");
  const [valorCashbackExibicao, setValorCashbackExibicao] = useState("R$ 0,00");
  const [valorDesconto, setValorDesconto] = useState("");
  const [valorNumericoDesconto, setValorNumericoDesconto] = useState("0");
  const [motivoDesconto, setMotivoDesconto] = useState("");

  // Formata valor em moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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

  // Quando o usuário digita um valor de desconto
  const handleChangeDesconto = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Obtém apenas os números do input
    const numeros = e.target.value.replace(/\D/g, "");
    
    // Atualiza o valor numérico
    setValorNumericoDesconto(numeros);
    
    // Formata e atualiza o valor de exibição
    setValorDesconto(formatarValor(numeros));
  };

  // Quando o usuário digita um valor de cashback
  const handleChangeCashback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    
    // Não permitir valor maior que o disponível
    const numerico = parseFloat(valor || "0");
    if (numerico > cliente.cashbackDisponivel) {
      setValorCashback(cliente.cashbackDisponivel.toString());
      setValorCashbackExibicao(formatCurrency(cliente.cashbackDisponivel));
    } else {
      setValorCashback(valor);
      setValorCashbackExibicao(numerico ? formatCurrency(numerico) : "R$ 0,00");
    }
  };

  // Aplica o benefício selecionado
  const handleAplicarBeneficio = () => {
    let beneficio: Beneficio = {
      tipo: "desconto",
      valor: 0
    };

    if (tipoBeneficio === "cashback") {
      const valor = parseFloat(valorCashback || "0");
      beneficio = {
        tipo: "cashback",
        valor: valor
      };
    } else if (tipoBeneficio === "cupom" && cupomSelecionado) {
      const cupom = cliente.cupons.find(c => c.id === cupomSelecionado);
      if (cupom) {
        beneficio = {
          tipo: "cupom",
          valor: cupom.valor,
          cupomId: cupom.id
        };
      }
    } else if (tipoBeneficio === "desconto") {
      const valor = parseFloat(valorNumericoDesconto) / 100;
      beneficio = {
        tipo: "desconto",
        valor: valor,
        motivo: motivoDesconto
      };
    }

    onAplicarBeneficio(beneficio);
  };

  // Efeito para resetar os valores quando muda o tipo de benefício
  useEffect(() => {
    if (tipoBeneficio === "cashback") {
      setValorCashback("");
      setValorCashbackExibicao("R$ 0,00");
    } else if (tipoBeneficio === "desconto") {
      setValorNumericoDesconto("0");
      setValorDesconto("R$ 0,00");
      setMotivoDesconto("");
    } else if (tipoBeneficio === "cupom") {
      setCupomSelecionado("");
    }
  }, [tipoBeneficio]);

  // Verifica se o botão de aplicar deve estar habilitado
  const podeAplicar = () => {
    if (tipoBeneficio === "cashback") {
      const valor = parseFloat(valorCashback || "0");
      return valor > 0 && valor <= cliente.cashbackDisponivel;
    } else if (tipoBeneficio === "cupom") {
      return !!cupomSelecionado;
    } else if (tipoBeneficio === "desconto") {
      const valor = parseFloat(valorNumericoDesconto) / 100;
      return valor > 0 && valor <= subtotal && motivoDesconto.trim().length >= 5;
    }
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Benefícios do Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <RadioGroup 
            value={tipoBeneficio} 
            onValueChange={(value) => setTipoBeneficio(value as any)}
            className="space-y-3"
          >
            {/* Opção de Cashback */}
            <div className={`flex items-start space-x-3 p-4 rounded-lg border ${tipoBeneficio === "cashback" ? "border-emerald-200 bg-emerald-50" : "border-gray-200"}`}>
              <RadioGroupItem value="cashback" id="cashback" disabled={cliente.cashbackDisponivel <= 0} />
              <div className="space-y-2 flex-1">
                <Label htmlFor="cashback" className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-emerald-600" />
                    <span>Usar Cashback</span>
                  </div>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(cliente.cashbackDisponivel)}
                  </span>
                </Label>
                {tipoBeneficio === "cashback" && (
                  <div className="pt-3 space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="valor-cashback">Quanto deseja usar?</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="valor-cashback"
                          type="number"
                          min="0"
                          step="0.01"
                          max={cliente.cashbackDisponivel}
                          value={valorCashback}
                          onChange={handleChangeCashback}
                          className="w-full"
                        />
                        <div className="text-sm font-medium text-gray-700 min-w-[100px]">
                          {valorCashbackExibicao}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Disponível para uso: {formatCurrency(cliente.cashbackDisponivel)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Opção de Cupom */}
            <div className={`flex items-start space-x-3 p-4 rounded-lg border ${tipoBeneficio === "cupom" ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}>
              <RadioGroupItem value="cupom" id="cupom" disabled={cliente.cupons.length === 0} />
              <div className="space-y-2 flex-1">
                <Label htmlFor="cupom" className="flex items-center">
                  <GiftIcon className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Aplicar Cupom</span>
                </Label>
                {tipoBeneficio === "cupom" && (
                  <div className="pt-3 space-y-3">
                    <RadioGroup 
                      value={cupomSelecionado} 
                      onValueChange={setCupomSelecionado}
                      className="space-y-2"
                    >
                      {cliente.cupons.map((cupom) => (
                        <div key={cupom.id} className="flex items-center space-x-2 p-2 rounded border border-blue-100">
                          <RadioGroupItem value={cupom.id} id={`cupom-${cupom.id}`} />
                          <Label 
                            htmlFor={`cupom-${cupom.id}`}
                            className="flex items-center justify-between flex-1 cursor-pointer"
                          >
                            <span>{cupom.descricao}</span>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(cupom.valor)}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>
            
            {/* Opção de Desconto Manual */}
            <div className={`flex items-start space-x-3 p-4 rounded-lg border ${tipoBeneficio === "desconto" ? "border-amber-200 bg-amber-50" : "border-gray-200"}`}>
              <RadioGroupItem value="desconto" id="desconto" />
              <div className="space-y-2 flex-1">
                <Label htmlFor="desconto" className="flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-amber-600" />
                  <span>Desconto Manual</span>
                </Label>
                {tipoBeneficio === "desconto" && (
                  <div className="pt-3 space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="valor-desconto">Valor do desconto</Label>
                      <Input
                        id="valor-desconto"
                        value={valorDesconto}
                        onChange={handleChangeDesconto}
                        className="w-full text-left"
                        dir="ltr"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="motivo-desconto">Motivo do desconto <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="motivo-desconto"
                        value={motivoDesconto}
                        onChange={(e) => setMotivoDesconto(e.target.value)}
                        placeholder="Explique o motivo deste desconto..."
                        className="resize-none"
                      />
                      {motivoDesconto.trim().length < 5 && tipoBeneficio === "desconto" && (
                        <p className="text-xs text-red-500">
                          Informe o motivo do desconto (mínimo 5 caracteres)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>

          {tipoBeneficio && (
            <div className="rounded-lg border border-gray-200 p-3 bg-gray-50 flex items-center justify-between">
              <span className="text-gray-600">Total da compra:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAplicarBeneficio}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={!podeAplicar()}
          >
            Aplicar Benefício <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 