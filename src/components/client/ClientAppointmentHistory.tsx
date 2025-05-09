import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getClientAppointmentHistory, ClientAppointment } from "@/lib/supabaseClient";
import { Loader2, Calendar, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientAppointmentHistoryProps {
  clientId: string;
}

export function ClientAppointmentHistory({ clientId }: ClientAppointmentHistoryProps) {
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppointmentHistory() {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error } = await getClientAppointmentHistory(clientId);
        
        if (error) {
          throw error;
        }
        
        setAppointments(data || []);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        setError("Não foi possível carregar seu histórico de agendamentos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    if (clientId) {
      loadAppointmentHistory();
    }
  }, [clientId]);

  // Mapeia o status para ícone e cor
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case "concluído":
      case "concluido":
      case "finalizado":
      case "realizado":
        return { icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-100 text-green-800", text: "Realizado" };
      case "cancelado":
        return { icon: <XCircle className="h-4 w-4" />, color: "bg-red-100 text-red-800", text: "Cancelado" };
      case "confirmado":
      case "agendado":
        return { icon: <Calendar className="h-4 w-4" />, color: "bg-blue-100 text-blue-800", text: "Agendado" };
      case "pendente":
      case "aguardando":
        return { icon: <AlertCircle className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-800", text: "Pendente" };
      default:
        return { icon: <Clock className="h-4 w-4" />, color: "bg-gray-100 text-gray-800", text: status || "Desconhecido" };
    }
  };

  // Formata data e hora para exibição
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  // Renderiza o estado de carregamento
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seu Histórico</CardTitle>
          <CardDescription>Carregando seus agendamentos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderiza o estado de erro
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seu Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Renderiza quando não há agendamentos
  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seu Histórico</CardTitle>
          <CardDescription>Histórico de agendamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sem registros</AlertTitle>
            <AlertDescription>Você ainda não possui agendamentos registrados em nosso sistema.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Renderiza a lista de agendamentos
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seu Histórico</CardTitle>
        <CardDescription>Histórico de agendamentos</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const statusInfo = getStatusInfo(appointment.status);
              
              return (
                <Accordion key={appointment.id} type="single" collapsible className="border rounded-lg">
                  <AccordionItem value="details" className="border-0">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex flex-col items-start text-left w-full">
                        <div className="flex items-center justify-between w-full">
                          <div className="font-medium">
                            {formatDate(appointment.date)}
                          </div>
                          <Badge variant="outline" className={`ml-2 ${statusInfo.color}`}>
                            <span className="flex items-center">
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.text}</span>
                            </span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {appointment.start_time} - {appointment.professional_name}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Profissional:</span>
                          <span className="text-sm ml-2">{appointment.professional_name}</span>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Horário:</span>
                          <span className="text-sm ml-2">
                            {appointment.start_time} às {appointment.end_time}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Duração:</span>
                          <span className="text-sm ml-2">{appointment.duration} minutos</span>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Valor total:</span>
                          <span className="text-sm ml-2">
                            R$ {appointment.total_value ? appointment.total_value.toFixed(2).replace('.', ',') : '0,00'}
                          </span>
                        </div>
                        
                        {appointment.notes && (
                          <div>
                            <span className="text-sm font-medium">Observações:</span>
                            <p className="text-sm mt-1">{appointment.notes}</p>
                          </div>
                        )}
                        
                        {appointment.services && appointment.services.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm font-medium">Serviços:</span>
                            <div className="mt-2 space-y-2">
                              {appointment.services.map((service) => (
                                <div key={service.id} className="flex justify-between items-center text-sm">
                                  <span>{service.service_name}</span>
                                  <span>R$ {service.price.toFixed(2).replace('.', ',')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
