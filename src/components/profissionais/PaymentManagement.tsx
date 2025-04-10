
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProfessionalPayment } from "@/types/professional";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";

interface PaymentManagementProps {
  payments: ProfessionalPayment[];
  onRegisterPayment: (payment: ProfessionalPayment) => void;
}

export const PaymentManagement = ({
  payments,
  onRegisterPayment,
}: PaymentManagementProps) => {
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Pagamentos</CardTitle>
        <div className="mt-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Pendente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPending)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês Referência</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Pagamento</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.referenceMonth}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(payment.value)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "partial"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.status === "paid"
                      ? "Pago"
                      : payment.status === "partial"
                      ? "Parcial"
                      : "Pendente"}
                  </span>
                </TableCell>
                <TableCell>
                  {payment.paymentDate
                    ? format(new Date(payment.paymentDate), "dd/MM/yyyy")
                    : "-"}
                </TableCell>
                <TableCell>{payment.notes || "-"}</TableCell>
                <TableCell>
                  {payment.status !== "paid" && (
                    <Button
                      size="sm"
                      onClick={() => onRegisterPayment(payment)}
                    >
                      Registrar Pagamento
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
