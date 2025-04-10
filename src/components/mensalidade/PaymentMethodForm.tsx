
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, QrCode, FileText } from "lucide-react";
import { PaymentMethod } from "@/types/subscription";

interface PaymentMethodFormProps {
  onSubmit: (data: { method: PaymentMethod; [key: string]: any }) => void;
}

export function PaymentMethodForm({ onSubmit }: PaymentMethodFormProps) {
  const [method, setMethod] = useState<PaymentMethod>("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      method,
      ...(method === "credit_card" && {
        cardNumber,
        cardName,
        expiryDate,
        cvv
      })
    });
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
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input
                  id="cardName"
                  placeholder="Nome como está no cartão"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Data de Expiração</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/AA"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Continuar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
