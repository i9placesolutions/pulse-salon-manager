import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type MessageStatus = 'enviando' | 'aguardando' | 'pausada' | 'cancelada' | 'entregue' | 'falha';

type Message = {
  id: string;
  titulo: string;
  mensagem: string;
  destinatarios: number;
  dataEnvio: string;
  status: MessageStatus;
  canal: 'whatsapp' | 'email' | 'sms';
  agendamento?: string;
};

const messageHistory: Message[] = [
  {
    id: '1',
    titulo: 'Promoção de Verão',
    mensagem: 'Olá {nome}, temos ofertas especiais para você!',
    destinatarios: 150,
    dataEnvio: '2025-03-10T10:00:00',
    status: 'entregue',
    canal: 'whatsapp'
  },
  {
    id: '2',
    titulo: 'Lembrete de Aniversário',
    mensagem: 'Feliz aniversário! Presente especial aguarda você.',
    destinatarios: 45,
    dataEnvio: '2025-03-10T11:30:00',
    status: 'enviando',
    canal: 'email',
    agendamento: '2025-03-10T11:00:00'
  },
];

interface MessageHistoryProps {
  messages?: Message[];
}

export function MessageHistory({ messages = messageHistory }: MessageHistoryProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'entregue': return 'bg-green-500';
      case 'enviando': return 'bg-yellow-500';
      case 'aguardando': return 'bg-blue-500';
      case 'pausada': return 'bg-gray-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Mensagens</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Destinatários</TableHead>
              <TableHead>Data Envio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow 
                key={message.id} 
                onClick={() => setSelectedMessage(message)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="font-medium">{message.titulo}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(message.status)} text-white`}>
                    {message.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {message.canal}
                  </Badge>
                </TableCell>
                <TableCell>{message.destinatarios}</TableCell>
                <TableCell>
                  {new Date(message.dataEnvio).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Modal de Detalhes */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{selectedMessage?.titulo}</DialogTitle>
              <DialogDescription>
                Detalhes completos da mensagem
              </DialogDescription>
            </DialogHeader>

            {selectedMessage && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status:</Label>
                    <p>
                      <Badge className={`${getStatusColor(selectedMessage.status)} text-white`}>
                        {selectedMessage.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label>Canal:</Label>
                    <p>{selectedMessage.canal}</p>
                  </div>
                  <div>
                    <Label>Destinatários:</Label>
                    <p>{selectedMessage.destinatarios}</p>
                  </div>
                  <div>
                    <Label>Data de Envio:</Label>
                    <p>{new Date(selectedMessage.dataEnvio).toLocaleString()}</p>
                  </div>
                  {selectedMessage.agendamento && (
                    <div>
                      <Label>Agendamento:</Label>
                      <p>{new Date(selectedMessage.agendamento).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Conteúdo:</Label>
                  <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                    {selectedMessage.mensagem}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
