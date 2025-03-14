import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle, 
  User, 
  Scissors, 
  UserCheck, 
  CalendarClock, 
  MessageSquare, 
  MessageCircle, 
  X,
  CheckCircle2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import type { Professional } from "@/types/appointment";
import { cn } from "@/lib/utils";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  professionals: number[];
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface AppointmentFormData {
  clientId: number;
  serviceId: number;
  professionalId: number;
  date: string;
  time: string;
  notes?: string;
  sendReminder: boolean;
}

export const AppointmentDialog = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientId: 0,
    serviceId: 0,
    professionalId: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    notes: "",
    sendReminder: true
  });
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  // Validação dos campos
  const [formErrors, setFormErrors] = useState({
    clientId: "",
    serviceId: "",
    professionalId: "",
    date: "",
    time: ""
  });

  // Estado para controlar se os campos foram tocados
  const [touched, setTouched] = useState({
    clientId: false,
    serviceId: false,
    professionalId: false,
    date: false,
    time: false
  });

  // Mock data - replace with API calls
  const clients: Client[] = [
    { id: 1, name: "João Silva", phone: "11999999999", email: "joao@email.com" },
    { id: 2, name: "Maria Santos", phone: "11988888888", email: "maria@email.com" }
  ];

  const services: Service[] = [
    { id: 1, name: "Corte Masculino", duration: 30, price: 50, professionals: [1, 2] },
    { id: 2, name: "Coloração", duration: 120, price: 150, professionals: [1, 3] }
  ];

  const professionals: Professional[] = [
    { 
      id: 1, 
      name: "Ana Silva",
      specialties: ["Corte", "Coloração"],
      schedule: {
        "1": { start: "09:00", end: "18:00" },
        "2": { start: "09:00", end: "18:00" },
        "3": { start: "09:00", end: "18:00" },
        "4": { start: "09:00", end: "18:00" },
        "5": { start: "09:00", end: "18:00" },
        "6": { start: "09:00", end: "14:00" }
      }
    }
  ];

  // Filtragem de clientes baseada na busca
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.phone.includes(clientSearch) ||
    client.email.toLowerCase().includes(clientSearch)
  );

  const validateField = (field: keyof typeof formErrors, value: any): string => {
    switch (field) {
      case "clientId":
        return value > 0 ? "" : "Cliente é obrigatório";
      case "serviceId":
        return value > 0 ? "" : "Serviço é obrigatório";
      case "professionalId":
        return value > 0 ? "" : "Profissional é obrigatório";
      case "date":
        return value ? "" : "Data é obrigatória";
      case "time":
        return value ? "" : "Horário é obrigatório";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    // Atualiza o estado do formulário
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Marca o campo como tocado
    if (!touched[field as keyof typeof touched]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
    
    // Valida o campo
    const error = validateField(field as keyof typeof formErrors, value);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = (): boolean => {
    return !formErrors.clientId && 
           !formErrors.serviceId && 
           !formErrors.professionalId && 
           !formErrors.date && 
           !formErrors.time &&
           formData.clientId > 0 &&
           formData.serviceId > 0 &&
           formData.professionalId > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validar todos os campos
    const allTouched = {
      clientId: true,
      serviceId: true,
      professionalId: true,
      date: true,
      time: true
    };
    setTouched(allTouched);
    
    // Validar disponibilidade do profissional
    const selectedService = services.find(s => s.id === formData.serviceId);
    const selectedProfessional = professionals.find(p => p.id === formData.professionalId);
    const appointmentDate = new Date(formData.date);
    const dayOfWeek = String(appointmentDate.getDay() + 1);

    if (!selectedService || !selectedProfessional) {
      toast({
        title: "Erro",
        description: "Selecione o serviço e o profissional",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Check if professional works on this day
    const schedule = selectedProfessional.schedule[dayOfWeek];
    if (!schedule) {
      toast({
        title: "Horário indisponível",
        description: "O profissional não atende neste dia",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Check if time is within working hours
    if (formData.time < schedule.start || formData.time > schedule.end) {
      toast({
        title: "Horário indisponível",
        description: "O horário está fora do expediente do profissional",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Here you would check for conflicts with other appointments
    // and save the appointment to the database

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send WhatsApp reminder if enabled
    if (formData.sendReminder) {
      const client = clients.find(c => c.id === formData.clientId);
      if (client) {
        sendWhatsAppReminder(client.phone, {
          serviceName: selectedService.name,
          professionalName: selectedProfessional.name,
          date: format(appointmentDate, "dd/MM/yyyy", { locale: ptBR }),
          time: formData.time
        });
      }
    }

    toast({
      title: "Agendamento criado",
      description: "O agendamento foi criado com sucesso!"
    });
    
    setIsSubmitting(false);
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientId: 0,
      serviceId: 0,
      professionalId: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      notes: "",
      sendReminder: true
    });
    setTouched({
      clientId: false,
      serviceId: false,
      professionalId: false,
      date: false,
      time: false
    });
    setFormErrors({
      clientId: "",
      serviceId: "",
      professionalId: "",
      date: "",
      time: ""
    });
  };

  const handleCancelClick = () => {
    if (formData.clientId || formData.serviceId || formData.professionalId || formData.notes) {
      setIsConfirmCancelOpen(true);
    } else {
      setDialogOpen(false);
      resetForm();
    }
  };

  const handleConfirmCancel = () => {
    resetForm();
    setIsConfirmCancelOpen(false);
    setDialogOpen(false);
  };

  const sendWhatsAppReminder = (phone: string, appointment: {
    serviceName: string;
    professionalName: string;
    date: string;
    time: string;
  }) => {
    // Integration with WhatsApp API (Uazapi) would go here
    console.log("Sending WhatsApp reminder:", { phone, appointment });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Criar Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
            <Calendar className="h-6 w-6 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Preencha os dados do agendamento. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client" className="flex items-center gap-1 text-sm font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                Cliente <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.clientId ? String(formData.clientId) : ""}
                onValueChange={(value) => handleFieldChange("clientId", Number(value))}
              >
                <SelectTrigger 
                  id="client" 
                  className={cn(
                    "h-10",
                    touched.clientId && formErrors.clientId ? "border-destructive" : "",
                    touched.clientId && !formErrors.clientId ? "border-green-500" : ""
                  )}
                >
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Buscar cliente..."
                      className="mb-2"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                  </div>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        <div className="flex flex-col">
                          <span>{client.name}</span>
                          <span className="text-xs text-muted-foreground">{client.phone}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum cliente encontrado
                    </div>
                  )}
                </SelectContent>
              </Select>
              {touched.clientId && formErrors.clientId && (
                <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.clientId}
                </div>
              )}
              {touched.clientId && !formErrors.clientId && formData.clientId > 0 && (
                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Cliente selecionado
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service" className="flex items-center gap-1 text-sm font-medium">
                <Scissors className="h-4 w-4 text-muted-foreground" />
                Serviço <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.serviceId ? String(formData.serviceId) : ""}
                onValueChange={(value) => {
                  const newValue = Number(value);
                  handleFieldChange("serviceId", newValue);
                  handleFieldChange("professionalId", 0);
                }}
              >
                <SelectTrigger 
                  id="service" 
                  className={cn(
                    "h-10",
                    touched.serviceId && formErrors.serviceId ? "border-destructive" : "",
                    touched.serviceId && !formErrors.serviceId ? "border-green-500" : ""
                  )}
                >
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      <div className="flex flex-col">
                        <span>{service.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {service.duration}min - R${service.price.toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.serviceId && formErrors.serviceId && (
                <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.serviceId}
                </div>
              )}
              {touched.serviceId && !formErrors.serviceId && formData.serviceId > 0 && (
                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Serviço selecionado
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="professional" className="flex items-center gap-1 text-sm font-medium">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                Profissional <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.professionalId ? String(formData.professionalId) : ""}
                onValueChange={(value) => handleFieldChange("professionalId", Number(value))}
                disabled={!formData.serviceId}
              >
                <SelectTrigger 
                  id="professional" 
                  className={cn(
                    "h-10",
                    touched.professionalId && formErrors.professionalId ? "border-destructive" : "",
                    touched.professionalId && !formErrors.professionalId ? "border-green-500" : ""
                  )}
                >
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals
                    .filter(p => {
                      const service = services.find(s => s.id === formData.serviceId);
                      return service ? service.professionals.includes(p.id) : false;
                    })
                    .map((professional) => (
                      <SelectItem key={professional.id} value={String(professional.id)}>
                        <div className="flex flex-col">
                          <span>{professional.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {professional.specialties.join(", ")}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {touched.professionalId && formErrors.professionalId && (
                <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.professionalId}
                </div>
              )}
              {touched.professionalId && !formErrors.professionalId && formData.professionalId > 0 && (
                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Profissional selecionado
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1 text-sm font-medium">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                Data e Hora <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative space-y-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      className={cn(
                        "pl-9",
                        touched.date && formErrors.date ? "border-destructive" : "",
                        touched.date && !formErrors.date ? "border-green-500" : ""
                      )}
                      value={formData.date}
                      min={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const selectedProfessional = professionals.find(p => p.id === formData.professionalId);
                        const dayOfWeek = String(new Date(newDate).getDay() + 1);
                        
                        // Verifica se o profissional trabalha no dia selecionado
                        if (selectedProfessional && !selectedProfessional.schedule[dayOfWeek]) {
                          toast({
                            title: "Data indisponível",
                            description: "O profissional não atende neste dia",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        handleFieldChange("date", newDate);
                        handleFieldChange("time", "09:00");
                      }}
                      disabled={!formData.professionalId}
                    />
                  </div>
                  {touched.date && formErrors.date && (
                    <div className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.date}
                    </div>
                  )}
                </div>
                <div className="relative space-y-2">
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={formData.time}
                      onValueChange={(value) => handleFieldChange("time", value)}
                      disabled={!formData.professionalId || !formData.date}
                    >
                      <SelectTrigger 
                        className={cn(
                          "h-10 pl-9",
                          touched.time && formErrors.time ? "border-destructive" : "",
                          touched.time && !formErrors.time ? "border-green-500" : ""
                        )}
                      >
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.professionalId && formData.date && (() => {
                          const selectedProfessional = professionals.find(p => p.id === formData.professionalId);
                          const selectedService = services.find(s => s.id === formData.serviceId);
                          const appointmentDate = new Date(formData.date);
                          const dayOfWeek = String(appointmentDate.getDay() + 1);
                          const schedule = selectedProfessional?.schedule[dayOfWeek];
                        
                          if (!schedule || !selectedService) return (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Profissional não atende neste dia
                            </div>
                          );
                        
                          const timeSlots = [];
                          const [startHour, startMinute] = schedule.start.split(':').map(Number);
                          const [endHour, endMinute] = schedule.end.split(':').map(Number);
                          const serviceDuration = selectedService.duration;
                        
                          let currentTime = new Date();
                          currentTime.setHours(startHour, startMinute, 0);
                        
                          const endTime = new Date();
                          endTime.setHours(endHour, endMinute - serviceDuration, 0);
                        
                          // Verifica se a data selecionada é hoje
                          const isToday = format(appointmentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                          let now = new Date();
                          
                          while (currentTime <= endTime) {
                            const timeString = format(currentTime, 'HH:mm');
                            
                            // Se for hoje, só mostra horários futuros
                            if (isToday && currentTime <= now) {
                              currentTime.setMinutes(currentTime.getMinutes() + 30);
                              continue;
                            }
                            
                            // Aqui você verificaria conflitos com outros agendamentos
                            const isAvailable = true;
                        
                            if (isAvailable) {
                              timeSlots.push(
                                <SelectItem key={timeString} value={timeString}>
                                  {timeString}
                                </SelectItem>
                              );
                            }
                        
                            currentTime.setMinutes(currentTime.getMinutes() + 30);
                          }
                        
                          return timeSlots.length > 0 ? timeSlots : (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Não há horários disponíveis
                            </div>
                          );
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                  {touched.time && formErrors.time && (
                    <div className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.time}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-1 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Observações
              </Label>
              <textarea
                id="notes"
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Adicionar observações sobre o agendamento..."
                value={formData.notes || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="sendReminder"
                checked={formData.sendReminder}
                onChange={(e) => setFormData(prev => ({ ...prev, sendReminder: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="sendReminder" className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer">
                <MessageCircle className="h-4 w-4" />
                Enviar lembretes via WhatsApp
              </Label>
            </div>
          </div>
          
          <Separator />
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              className="gap-2 border-gray-300" 
              onClick={handleCancelClick}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="gap-2 bg-primary hover:bg-primary/90" 
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Processando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Criar Agendamento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={isConfirmCancelOpen} onOpenChange={setIsConfirmCancelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center font-semibold">Cancelar Agendamento</DialogTitle>
            <DialogDescription className="text-center">
              Tem certeza que deseja cancelar o agendamento? Todas as informações serão perdidas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={() => setIsConfirmCancelOpen(false)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Sim, cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
