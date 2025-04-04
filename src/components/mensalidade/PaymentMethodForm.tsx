import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, QrCode, FileText, Loader2 } from "lucide-react";
import { PaymentMethod } from "@/types/subscription";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodFormProps {
  onSubmit: (data: { method: PaymentMethod; [key: string]: any }) => void;
  customerId?: string; // ID do cliente no Asaas, opcional
  loading?: boolean;
}

export function PaymentMethodForm({ onSubmit, customerId, loading = false }: PaymentMethodFormProps) {
  const [method, setMethod] = useState<PaymentMethod>("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Estado para dados do titular do cartão
  const [holderCpf, setHolderCpf] = useState("");
  const [holderPhone, setHolderPhone] = useState("");
  const [holderZipCode, setHolderZipCode] = useState("");
  const [holderAddress, setHolderAddress] = useState("");
  const [holderNumber, setHolderNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Extrair mês e ano da data de expiração
      let expiryMonth = "";
      let expiryYear = "";
      
      if (expiryDate) {
        const parts = expiryDate.split("/");
        if (parts.length === 2) {
          expiryMonth = parts[0];
          expiryYear = "20" + parts[1]; // Assumindo formato MM/AA
        }
      }

      const paymentData: { method: PaymentMethod; [key: string]: any } = {
        method,
      };

      if (method === "credit_card") {
        paymentData.cardNumber = cardNumber.replace(/\D/g, "");
        paymentData.cardName = cardName;
        paymentData.expiryMonth = expiryMonth;
        paymentData.expiryYear = expiryYear;
        paymentData.cvv = cvv;
        
        // Dados do titular
        paymentData.holderInfo = {
          cpfCnpj: holderCpf.replace(/\D/g, ""),
          phone: holderPhone.replace(/\D/g, ""),
          postalCode: holderZipCode.replace(/\D/g, ""),
          addressNumber: holderNumber,
          address: holderAddress
        };
      }

      // Adiciona o ID do cliente, se fornecido
      if (customerId) {
        paymentData.customerId = customerId;
      }

      onSubmit(paymentData);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Funções para formatar campos
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let formatted = "";
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += digits[i];
    }
    return formatted.substring(0, 19); // Limita a 16 dígitos + 3 espaços
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    if (digits.length <= 9) return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
  };

  const formatZipCode = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    return `${digits.substring(0, 5)}-${digits.substring(5, 8)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Método de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            value={method}
            onValueChange={(value) => setMethod(value as PaymentMethod)}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="credit_card"
                id="credit_card"
                className="peer sr-only"
              />
              <Label
                htmlFor="credit_card"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <CreditCard className="mb-2" />
                <span>Cartão de Crédito</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
              <Label
                htmlFor="pix"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <QrCode className="mb-2" />
                <span>PIX</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="boleto"
                id="boleto"
                className="peer sr-only"
              />
              <Label
                htmlFor="boleto"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <FileText className="mb-2" />
                <span>Boleto</span>
              </Label>
            </div>
          </RadioGroup>

          {method === "credit_card" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input
                  id="cardName"
                  placeholder="Nome como está no cartão"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Data de Expiração</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/AA"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Dados do Titular</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="holderCpf">CPF</Label>
                    <Input
                      id="holderCpf"
                      placeholder="000.000.000-00"
                      value={holderCpf}
                      onChange={(e) => setHolderCpf(formatCpf(e.target.value))}
                      maxLength={14}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="holderPhone">Telefone</Label>
                    <Input
                      id="holderPhone"
                      placeholder="(00) 00000-0000"
                      value={holderPhone}
                      onChange={(e) => setHolderPhone(formatPhone(e.target.value))}
                      maxLength={15}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="holderZipCode">CEP</Label>
                      <Input
                        id="holderZipCode"
                        placeholder="00000-000"
                        value={holderZipCode}
                        onChange={(e) => setHolderZipCode(formatZipCode(e.target.value))}
                        maxLength={9}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="holderNumber">Número</Label>
                      <Input
                        id="holderNumber"
                        placeholder="123"
                        value={holderNumber}
                        onChange={(e) => setHolderNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="holderAddress">Endereço</Label>
                    <Input
                      id="holderAddress"
                      placeholder="Rua, Av, etc"
                      value={holderAddress}
                      onChange={(e) => setHolderAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {method === "pix" && (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Ao prosseguir, você receberá um QR Code PIX para pagamento imediato.
              </p>
              <div className="p-8 border-2 border-dashed rounded-lg flex items-center justify-center">
                <QrCode size={120} className="text-gray-400" />
              </div>
            </div>
          )}

          {method === "boleto" && (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Ao prosseguir, você receberá um boleto bancário com vencimento para 3 dias úteis.
              </p>
              <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                <FileText size={60} className="text-gray-400 mb-3" />
                <span className="text-sm text-gray-500">Boleto Bancário</span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitting || loading}
          >
            {(submitting || loading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
