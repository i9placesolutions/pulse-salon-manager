
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
import { ProfessionalCommission } from "@/types/professional";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";

interface CommissionManagementProps {
  commissions: ProfessionalCommission[];
  onPayCommission: (commission: ProfessionalCommission) => void;
}

export const CommissionManagement = ({
  commissions,
  onPayCommission,
}: CommissionManagementProps) => {
  const totalPending = commissions
    .filter((c) => c.status === "pending")
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Comissões</CardTitle>
        <div className="flex gap-4 mt-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Pendente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPending)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Referência</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.map((commission) => (
              <TableRow key={commission.id}>
                <TableCell>
                  {format(new Date(commission.paymentDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{commission.referenceName}</TableCell>
                <TableCell>
                  {commission.referenceType === "service" ? "Serviço" : "Produto"}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(commission.value)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      commission.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {commission.status === "paid" ? "Pago" : "Pendente"}
                  </span>
                </TableCell>
                <TableCell>
                  {commission.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => onPayCommission(commission)}
                    >
                      Pagar
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
