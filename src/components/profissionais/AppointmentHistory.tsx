
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { ProfessionalAppointment } from "@/types/professional";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency";

interface AppointmentHistoryProps {
  appointments: ProfessionalAppointment[];
}

export const AppointmentHistory = ({ appointments }: AppointmentHistoryProps) => {
  const totalCommission = appointments.reduce((acc, curr) => acc + curr.commission, 0);
  const totalValue = appointments.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Histórico de Atendimentos</CardTitle>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Total: {appointments.length} atendimentos</span>
            <span>Valor Total: {formatCurrency(totalValue)}</span>
            <span>Comissão Total: {formatCurrency(totalCommission)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-[250px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar atendimento..." className="pl-8" />
          </div>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Comissão</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {format(new Date(appointment.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{appointment.clientName}</TableCell>
                <TableCell>{appointment.serviceName}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(appointment.value)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(appointment.commission)}
                </TableCell>
                <TableCell>{appointment.notes || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
