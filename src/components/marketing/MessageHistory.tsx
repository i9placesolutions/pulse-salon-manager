
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Dados mockados para exemplo
const messageHistory = [
  {
    id: 1,
    recipient: "João Silva",
    type: "client",
    status: "delivered",
    message: "Olá João, temos uma promoção especial para você!",
    sentAt: "2024-03-10T10:00:00",
    deliveredAt: "2024-03-10T10:00:05"
  },
  {
    id: 2,
    recipient: "Maria Santos",
    type: "contact",
    status: "failed",
    message: "Feliz aniversário, Maria!",
    sentAt: "2024-03-10T10:30:00",
    error: "Número inválido"
  }
];

export function MessageHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Mensagens</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mensagem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messageHistory.map((message) => (
              <TableRow key={message.id}>
                <TableCell>
                  {format(new Date(message.sentAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>{message.recipient}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {message.type === 'client' ? 'Cliente' : 'Contato API'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={message.status === 'delivered' ? 'default' : 'destructive'}
                  >
                    {message.status === 'delivered' ? 'Entregue' : 'Falha'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {message.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
