
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StockAlerts() {
  const stockAlerts = [
    { id: 1, name: "Shampoo Premium", quantity: 2, minQuantity: 5, lastRestock: "28/02/2024", supplier: "Distribuidora A" },
    { id: 2, name: "Condicionador", quantity: 3, minQuantity: 5, lastRestock: "28/02/2024", supplier: "Distribuidora A" }
  ];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Alertas de Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade Atual</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Última Reposição</TableHead>
              <TableHead>Fornecedor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockAlerts.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-red-600 font-medium">{item.quantity}</TableCell>
                <TableCell>{item.minQuantity}</TableCell>
                <TableCell>{item.lastRestock}</TableCell>
                <TableCell>{item.supplier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
