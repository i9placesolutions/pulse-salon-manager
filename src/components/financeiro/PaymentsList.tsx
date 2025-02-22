
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, CreditCard, FileText, BanknoteIcon } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Payment } from "@/types/financial";

interface PaymentsListProps {
  payments: Payment[];
}

export const PaymentsList = ({ payments }: PaymentsListProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pagamentos Recentes</CardTitle>
          <CardDescription>Últimos pagamentos recebidos</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
            >
              <div>
                <p className="font-medium">{payment.client}</p>
                <p className="text-sm text-muted-foreground">{payment.service}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(payment.value)}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {payment.method === "Pix" && <QrCode className="h-3 w-3" />}
                  {payment.method === "Cartão" && <CreditCard className="h-3 w-3" />}
                  {payment.method === "Boleto" && <FileText className="h-3 w-3" />}
                  {payment.method === "Dinheiro" && <BanknoteIcon className="h-3 w-3" />}
                  {payment.method}
                </div>
                <p className={`text-sm ${
                  payment.status === "Cancelado" ? "text-destructive" : 
                  payment.status === "Pago" ? "text-green-600" : 
                  "text-yellow-600"
                }`}>
                  {payment.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
