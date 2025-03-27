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
import { Search, Download, Calendar, DollarSign, BadgePercent } from "lucide-react";
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
    <Card className="border-purple-200 shadow-sm hover:shadow transition-all">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
        <div>
          <CardTitle className="text-purple-700">Histórico de Atendimentos</CardTitle>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-purple-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Total: {appointments.length} atendimentos</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>Valor Total: {formatCurrency(totalValue)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BadgePercent className="h-4 w-4" />
              <span>Comissão Total: {formatCurrency(totalCommission)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-[250px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-500" />
            <Input 
              placeholder="Buscar atendimento..." 
              className="pl-8 border-purple-200 focus-visible:ring-purple-500" 
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-b-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-purple-50">
              <TableRow className="hover:bg-purple-100/50">
                <TableHead className="text-purple-700">Data</TableHead>
                <TableHead className="text-purple-700">Cliente</TableHead>
                <TableHead className="text-purple-700">Serviço</TableHead>
                <TableHead className="text-right text-purple-700">Valor</TableHead>
                <TableHead className="text-right text-purple-700">Comissão</TableHead>
                <TableHead className="text-purple-700">Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment, index) => (
                <TableRow 
                  key={appointment.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'} hover:bg-purple-100/40`}
                >
                  <TableCell className="font-medium">
                    {format(new Date(appointment.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{appointment.clientName}</TableCell>
                  <TableCell>{appointment.serviceName}</TableCell>
                  <TableCell className="text-right text-green-700 font-medium">
                    {formatCurrency(appointment.value)}
                  </TableCell>
                  <TableCell className="text-right text-purple-700 font-medium">
                    {formatCurrency(appointment.commission)}
                  </TableCell>
                  <TableCell className="text-neutral-600">{appointment.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
