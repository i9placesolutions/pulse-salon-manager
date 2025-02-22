
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/currency";
import type { Sale } from "@/types/pdv";

interface CashierCloseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialAmount: number;
  sales: Sale[];
  onConfirm: () => void;
}

export function CashierCloseDialog({
  isOpen,
  onOpenChange,
  initialAmount,
  sales,
  onConfirm,
}: CashierCloseDialogProps) {
  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const finalAmount = initialAmount + totalSales;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Fechar Caixa</DialogTitle>
          <DialogDescription>
            Confira o resumo das operações do dia antes de fechar o caixa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vendas Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalSales)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Saldo Final</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(finalAmount)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Dinheiro</span>
                <span>{formatCurrency(
                  sales.reduce((acc, sale) => 
                    acc + sale.payments
                      .filter(p => p.method === 'cash')
                      .reduce((sum, p) => sum + p.amount, 0)
                  , 0)
                )}</span>
              </div>
              <div className="flex justify-between">
                <span>Cartão de Crédito</span>
                <span>{formatCurrency(
                  sales.reduce((acc, sale) => 
                    acc + sale.payments
                      .filter(p => p.method === 'credit')
                      .reduce((sum, p) => sum + p.amount, 0)
                  , 0)
                )}</span>
              </div>
              <div className="flex justify-between">
                <span>Cartão de Débito</span>
                <span>{formatCurrency(
                  sales.reduce((acc, sale) => 
                    acc + sale.payments
                      .filter(p => p.method === 'debit')
                      .reduce((sum, p) => sum + p.amount, 0)
                  , 0)
                )}</span>
              </div>
              <div className="flex justify-between">
                <span>PIX</span>
                <span>{formatCurrency(
                  sales.reduce((acc, sale) => 
                    acc + sale.payments
                      .filter(p => p.method === 'pix')
                      .reduce((sum, p) => sum + p.amount, 0)
                  , 0)
                )}</span>
              </div>
            </CardContent>
          </Card>
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
            onClick={onConfirm}
          >
            Confirmar Fechamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
