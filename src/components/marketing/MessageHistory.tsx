import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MarketingMessage } from "@/lib/marketingService";

export type MessageStatus = 'enviando' | 'aguardando' | 'pausada' | 'cancelada' | 'entregue' | 'falha' | 'draft' | 'sent' | 'scheduled' | 'error';

type Message = {
  id: string;
  titulo: string;
  mensagem: string;
  destinatarios?: number;
  sucessos?: number;
  falhas?: number;
  dataEnvio?: string;
  data?: string; // Pode ser a data formatada do componente parent
  status: MessageStatus;
  canal?: 'whatsapp' | 'email' | 'sms';
  agendamento?: string;
};

interface MessageHistoryProps {
  messages: Message[];
}

export function MessageHistory({ messages }: MessageHistoryProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'entregue': case 'sent': return 'bg-green-500';
      case 'enviando': return 'bg-yellow-500';
      case 'aguardando': case 'scheduled': return 'bg-blue-500';
      case 'pausada': case 'draft': return 'bg-gray-500';
      case 'cancelada': case 'error': case 'falha': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Mensagens</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="bg-pink-50/60 border border-pink-200 rounded-lg p-8 text-center">
            <p className="text-pink-500 mt-2">
              Nenhuma mensagem encontrada.
            </p>
          </div>
        ) : (
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
                      {message.canal || 'whatsapp'}
                    </Badge>
                  </TableCell>
                  <TableCell>{message.destinatarios || 0}</TableCell>
                  <TableCell>
                    {message.data || (message.dataEnvio ? new Date(message.dataEnvio).toLocaleDateString() : '-')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

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
                    <p>{selectedMessage.canal || 'whatsapp'}</p>
                  </div>
                  <div>
                    <Label>Destinatários:</Label>
                    <p>{selectedMessage.destinatarios || 0}</p>
                  </div>
                  {selectedMessage.sucessos !== undefined && (
                    <div>
                      <Label>Enviados com sucesso:</Label>
                      <p>{selectedMessage.sucessos}</p>
                    </div>
                  )}
                  {selectedMessage.falhas !== undefined && (
                    <div>
                      <Label>Falhas de envio:</Label>
                      <p>{selectedMessage.falhas}</p>
                    </div>
                  )}
                  <div>
                    <Label>Data de Envio:</Label>
                    <p>{selectedMessage.data || (selectedMessage.dataEnvio ? new Date(selectedMessage.dataEnvio).toLocaleString() : '-')}</p>
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
