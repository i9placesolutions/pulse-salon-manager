
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
import { TaxRecord } from "@/types/financial";
import { formatCurrency } from "@/utils/currency";

interface TaxManagementPanelProps {
  taxes: TaxRecord[];
}

export function TaxManagementPanel({ taxes }: TaxManagementPanelProps) {
  const totalTaxes = taxes.reduce((acc, tax) => acc + tax.value, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Impostos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Total a pagar: {formatCurrency(totalTaxes)}
              </p>
            </div>
            <Button>Novo Imposto</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Base de Cálculo</TableHead>
                <TableHead>Alíquota</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxes.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell>{tax.name}</TableCell>
                  <TableCell>{tax.type}</TableCell>
                  <TableCell>{formatCurrency(tax.baseValue)}</TableCell>
                  <TableCell>{tax.rate}%</TableCell>
                  <TableCell>{formatCurrency(tax.value)}</TableCell>
                  <TableCell>{tax.dueDate}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tax.status === "Pago"
                        ? "bg-green-100 text-green-800"
                        : tax.status === "Atrasado"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {tax.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm">Pagar</Button>
                      <Button size="sm" variant="outline">
                        Anexos
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
