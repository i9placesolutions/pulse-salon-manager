
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CashFlow } from "@/types/financial";
import { formatCurrency } from "@/utils/currency";

interface CashFlowPanelProps {
  data: CashFlow[];
}

export function CashFlowPanel({ data }: CashFlowPanelProps) {
  const totalIncome = data
    .filter((flow) => flow.type === "entrada")
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalExpenses = data
    .filter((flow) => flow.type === "saida")
    .reduce((acc, curr) => acc + curr.value, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${
              balance >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Movimentações</CardTitle>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <option value="all">Todas</option>
                <option value="income">Entradas</option>
                <option value="expense">Saídas</option>
              </Select>
              <Input type="date" className="w-40" />
              <Button>Filtrar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell>{flow.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      flow.type === "entrada"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {flow.type === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </TableCell>
                  <TableCell>{flow.category}</TableCell>
                  <TableCell>{flow.description}</TableCell>
                  <TableCell>{formatCurrency(flow.value)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      flow.status === "realizado"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {flow.status === "realizado" ? "Realizado" : "Previsto"}
                    </span>
                  </TableCell>
                  <TableCell>{flow.paymentMethod}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
