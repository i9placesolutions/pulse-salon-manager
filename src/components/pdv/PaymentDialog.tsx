
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BanknoteIcon, CreditCard, QrCode } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { Payment } from "@/types/pdv";

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cartTotal: number;
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (method: string) => void;
  paymentAmount: string;
  onPaymentAmountChange: (value: string) => void;
  onAddPayment: () => void;
  paymentMethods: Payment[];
  remainingAmount: number;
  changeAmount: number;
  onFinalize: () => void;
}

export function PaymentDialog({
  isOpen,
  onOpenChange,
  cartTotal,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  paymentAmount,
  onPaymentAmountChange,
  onAddPayment,
  paymentMethods,
  remainingAmount,
  changeAmount,
  onFinalize,
}: PaymentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
          <DialogDescription>
            Total a pagar: {formatCurrency(cartTotal)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => onSelectPaymentMethod('cash')}
              >
                <BanknoteIcon className="mr-2 h-4 w-4" />
                Dinheiro
              </Button>
              <Button
                variant={selectedPaymentMethod === 'credit' ? 'default' : 'outline'}
                onClick={() => onSelectPaymentMethod('credit')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Crédito
              </Button>
              <Button
                variant={selectedPaymentMethod === 'debit' ? 'default' : 'outline'}
                onClick={() => onSelectPaymentMethod('debit')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Débito
              </Button>
              <Button
                variant={selectedPaymentMethod === 'pix' ? 'default' : 'outline'}
                onClick={() => onSelectPaymentMethod('pix')}
              >
                <QrCode className="mr-2 h-4 w-4" />
                PIX
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Valor do Pagamento</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => onPaymentAmountChange(e.target.value)}
                placeholder={formatCurrency(remainingAmount)}
              />
            </div>

            <Button 
              className="w-full"
              onClick={onAddPayment}
              disabled={!paymentAmount || Number(paymentAmount) <= 0}
            >
              Adicionar Pagamento
            </Button>
          </div>

          {paymentMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pagamentos Registrados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {paymentMethods.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center">
                    <span className="capitalize">{payment.method}</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
                {changeAmount > 0 && (
                  <div className="flex justify-between items-center text-primary">
                    <span>Troco</span>
                    <span>{formatCurrency(changeAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Restante</span>
                    <span>{formatCurrency(remainingAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="sm:flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            className="sm:flex-1"
            onClick={onFinalize}
            disabled={remainingAmount > 0}
          >
            Finalizar Venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
