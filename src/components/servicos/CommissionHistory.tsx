
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { ProfessionalPerformance } from "@/types/service";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommissionHistoryProps {
  performance: ProfessionalPerformance[];
  services: { id: number; name: string }[];
  professionals: { id: number; name: string }[];
  onExport?: () => void;
}

export function CommissionHistory({
  performance,
  services,
  professionals,
  onExport,
}: CommissionHistoryProps) {
  // Agrupar por profissional e serviço para totalizadores
  const totals = performance.reduce(
    (acc, curr) => {
      const professional = professionals.find((p) => p.id === curr.professionalId);
      const service = services.find((s) => s.id === curr.serviceId);

      if (!professional || !service) return acc;

      const key = `${professional.id}-${service.id}`;
      if (!acc[key]) {
        acc[key] = {
          professionalId: professional.id,
          professionalName: professional.name,
          serviceId: service.id,
          serviceName: service.name,
          totalRevenue: 0,
          totalCommission: 0,
          count: 0,
          avgSatisfaction: 0,
        };
      }

      acc[key].totalRevenue += curr.revenue;
      acc[key].totalCommission += curr.commission;
      acc[key].count += 1;
      acc[key].avgSatisfaction += curr.clientSatisfaction;

      return acc;
    },
    {} as Record<
      string,
      {
        professionalId: number;
        professionalName: string;
        serviceId: number;
        serviceName: string;
        totalRevenue: number;
        totalCommission: number;
        count: number;
        avgSatisfaction: number;
      }
    >
  );

  const summaryData = Object.values(totals).map((item) => ({
    ...item,
    avgSatisfaction: Number((item.avgSatisfaction / item.count).toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Histórico de Comissões</CardTitle>
          <CardDescription>
            Resumo de comissões por profissional e serviço
          </CardDescription>
        </div>
        {onExport && (
          <Button variant="outline" className="gap-2" onClick={onExport}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="text-right">Qtd.</TableHead>
              <TableHead className="text-right">Faturamento</TableHead>
              <TableHead className="text-right">Comissão</TableHead>
              <TableHead className="text-right">% Média</TableHead>
              <TableHead className="text-right">Satisfação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryData.map((item) => (
              <TableRow key={`${item.professionalId}-${item.serviceId}`}>
                <TableCell>{item.professionalName}</TableCell>
                <TableCell>{item.serviceName}</TableCell>
                <TableCell className="text-right">{item.count}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.totalRevenue)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.totalCommission)}
                </TableCell>
                <TableCell className="text-right">
                  {((item.totalCommission / item.totalRevenue) * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {item.avgSatisfaction.toFixed(1)} ⭐
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
