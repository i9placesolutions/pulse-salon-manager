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
import { ProfessionalCommission } from "@/types/professional";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface CommissionManagementProps {
  commissions: ProfessionalCommission[];
}

export const CommissionManagement = ({
  commissions,
}: CommissionManagementProps) => {
  const totalPending = commissions
    .filter((c) => c.status === "pending")
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="border-green-200 shadow-sm hover:shadow transition-all">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
        <CardTitle className="text-green-700">Gestão de Comissões</CardTitle>
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm flex items-center space-x-3">
            <div className="p-2 rounded-full bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm text-yellow-700 font-medium">Total Pendente</p>
              <p className="text-xl font-bold text-yellow-600">
                {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm flex items-center space-x-3">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm text-green-700 font-medium">Total Pago</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-b-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-green-50">
              <TableRow className="hover:bg-green-100/50">
                <TableHead className="text-green-700">Data</TableHead>
                <TableHead className="text-green-700">Referência</TableHead>
                <TableHead className="text-green-700">Tipo</TableHead>
                <TableHead className="text-right text-green-700">Valor</TableHead>
                <TableHead className="text-green-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission, index) => (
                <TableRow 
                  key={commission.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-green-50/30'} hover:bg-green-100/40`}
                >
                  <TableCell className="font-medium">
                    {format(new Date(commission.paymentDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{commission.referenceName}</TableCell>
                  <TableCell>
                    {commission.referenceType === "service" ? "Serviço" : "Produto"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(commission.value)}
                  </TableCell>
                  <TableCell>
                    {commission.status === "paid" ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Pago
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
