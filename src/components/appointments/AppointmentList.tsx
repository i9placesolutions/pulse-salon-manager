import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/types/appointment";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Scissors, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  MessageSquare, 
  CalendarClock, 
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Star,
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AppointmentListProps {
  appointments: Appointment[];
  onStatusChange: (appointmentId: number, status: Appointment["status"]) => void;
  onReschedule: (appointmentId: number) => void;
  onStatusChangeWithConfirmation?: (appointment: Appointment, action: "confirm" | "cancel") => void;
}

export const AppointmentList = ({ 
  appointments, 
  onStatusChange, 
  onReschedule,
  onStatusChangeWithConfirmation
}: AppointmentListProps) => {
  const [expandedAppointment, setExpandedAppointment] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedAction, setSelectedAction] = useState<"confirm" | "cancel" | null>(null);
  
  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };
  
  const toggleExpand = (appointmentId: number) => {
    setExpandedAppointment(prev => prev === appointmentId ? null : appointmentId);
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "canceled": return "bg-red-100 text-red-800 border-red-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getStatusBgColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "canceled": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "pending": return "Pendente";
      case "canceled": return "Cancelado";
      case "completed": return "Concluído";
      default: return status;
    }
  };
  
  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return <Check className="h-3 w-3" />;
      case "pending": return <Clock className="h-3 w-3" />;
      case "canceled": return <X className="h-3 w-3" />;
      case "completed": return <Check className="h-3 w-3" />;
      default: return null;
    }
  };
  
  const handleStatusChangeClick = (appointment: Appointment, newStatus: "confirm" | "cancel") => {
    if (onStatusChangeWithConfirmation) {
      // Use the parent's confirmation dialog if provided
      onStatusChangeWithConfirmation(appointment, newStatus);
    } else {
      // Fallback to local dialog
      setSelectedAppointment(appointment);
      setSelectedAction(newStatus);
      setConfirmDialogOpen(true);
    }
  };
  
  const confirmStatusChange = () => {
    if (selectedAppointment && selectedAction) {
      onStatusChange(
        selectedAppointment.id, 
        selectedAction === "confirm" ? "confirmed" : "canceled"
      );
      setConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
          {appointments.map((appointment) => (
          <Card 
              key={appointment.id}
            className={cn(
              "overflow-hidden hover:shadow-md transition-all duration-300 bg-white",
              expandedAppointment === appointment.id ? "shadow-md" : "shadow-sm",
              "animate-in fade-in-50 duration-300"
            )}
          >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className={`w-1.5 ${getStatusBgColor(appointment.status)}`}></div>
                <div className="p-4 flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Lado esquerdo - informações principais */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg leading-tight">{appointment.clientName}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge 
                              className={cn(
                                getStatusColor(appointment.status),
                                "px-2 py-0.5 text-xs rounded-full border"
                              )}
                            >
                              <span className="flex items-center gap-1">
                                {getStatusIcon(appointment.status)}
                                {getStatusText(appointment.status)}
                              </span>
                            </Badge>
                            
                            {appointment.paymentStatus === "paid" && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                <CreditCard className="h-3 w-3 mr-1" />
                                Pago
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 pt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <Scissors className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Serviço</p>
                            <p className="text-sm">
                              {appointment.services.map(s => s.name).join(", ")}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                            <User className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Profissional</p>
                            <p className="text-sm">{appointment.professionalName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Data</p>
                            <p className="text-sm">{format(appointment.date, "dd/MM/yyyy")}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Horário</p>
                            <p className="text-sm">{appointment.startTime} - {appointment.endTime}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Valor</p>
                            <p className="text-sm font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(appointment.totalValue)}
                </p>
              </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Duração</p>
                            <p className="text-sm">{appointment.duration} minutos</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Observações - visível apenas quando expandido */}
                      {expandedAppointment === appointment.id && appointment.notes && (
                        <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md mt-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
                          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Observações</p>
                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Lado direito - ações */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {appointment.status !== "completed" && appointment.status !== "canceled" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              className={cn(
                                "w-full justify-start gap-2",
                                appointment.status === "confirmed" ? "bg-green-600 hover:bg-green-700" : ""
                              )}
                              onClick={() => handleStatusChangeClick(
                                appointment,
                                appointment.status === "confirmed" ? "cancel" : "confirm"
                              )}
                            >
                              {appointment.status === "confirmed" ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Confirmado</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Confirmar</span>
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            {appointment.status === "confirmed" 
                              ? "Cancelar este agendamento" 
                              : "Confirmar este agendamento"}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {appointment.status === "confirmed" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                              className="w-full justify-start gap-2"
                              onClick={() => onReschedule(appointment.id)}
                            >
                              <CalendarClock className="h-4 w-4" />
                              <span>Reagendar</span>
                  </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            Reagendar este agendamento
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* Menu dropdown para ações adicionais */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                            className="w-full justify-start gap-2"
                  >
                            <MoreHorizontal className="h-4 w-4" />
                            <span>Mais ações</span>
                  </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleExpand(appointment.id)}>
                            {expandedAppointment === appointment.id ? "Ocultar detalhes" : "Ver detalhes"}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem>
                            Enviar lembrete
                          </DropdownMenuItem>
                          
                          {appointment.status !== "completed" && (
                            <DropdownMenuItem 
                              onClick={() => onStatusChange(appointment.id, "completed")}
                              className="text-green-600"
                            >
                              Marcar como concluído
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem className="text-red-600">
                            Excluir agendamento
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            {/* Rodapé - visível apenas em telas menores */}
            <CardFooter className="p-2 pt-0 flex justify-end md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleExpand(appointment.id)}
                className="text-xs"
              >
                {expandedAppointment === appointment.id ? "Menos detalhes" : "Mais detalhes"}
                <ChevronRight className={cn(
                  "h-4 w-4 ml-1 transition-transform",
                  expandedAppointment === appointment.id ? "rotate-90" : ""
                )} />
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum agendamento encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Não existem agendamentos para os filtros selecionados.
            </p>
        </div>
        )}
      </div>
      
      {/* Diálogo de confirmação - usado somente quando onStatusChangeWithConfirmation não é fornecido */}
      {!onStatusChangeWithConfirmation && (
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAction === "confirm" ? "Confirmar agendamento?" : "Cancelar agendamento?"}
              </DialogTitle>
              <DialogDescription>
                {selectedAction === "confirm" 
                  ? "Deseja confirmar este agendamento? Um e-mail de confirmação será enviado ao cliente."
                  : "Deseja realmente cancelar este agendamento? Esta ação não pode ser desfeita."}
              </DialogDescription>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{selectedAppointment.clientName}</p>
                <p className="text-sm text-gray-600">
                  {format(selectedAppointment.date, "dd/MM/yyyy")} • {selectedAppointment.startTime} - {selectedAppointment.endTime}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAppointment.services.map(s => s.name).join(", ")}
                </p>
              </div>
            )}
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                variant={selectedAction === "confirm" ? "default" : "destructive"}
                onClick={confirmStatusChange}
              >
                {selectedAction === "confirm" ? "Confirmar" : "Cancelar Agendamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
