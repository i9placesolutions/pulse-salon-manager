
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Appointment {
  id: number;
  client: string;
  service: string;
  professional: string;
  time: string;
  status: 'confirmed' | 'pending' | 'canceled';
}

export function AppointmentsTable() {
  const appointments: Appointment[] = [
    { id: 1, client: "Maria Silva", service: "Corte", professional: "Ana", time: "10:00", status: "confirmed" },
    { id: 2, client: "João Santos", service: "Barba", professional: "Carlos", time: "11:30", status: "pending" },
    { id: 3, client: "Ana Oliveira", service: "Coloração", professional: "Patricia", time: "14:00", status: "confirmed" }
  ];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.client}</TableCell>
                <TableCell>{appointment.service}</TableCell>
                <TableCell>{appointment.professional}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-50 text-green-700' 
                      : appointment.status === 'canceled'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmado' 
                      : appointment.status === 'canceled' ? 'Cancelado'
                      : 'Pendente'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
