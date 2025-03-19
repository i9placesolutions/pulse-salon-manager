import { useState, useEffect } from "react";
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

interface AppointmentDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialDate?: Date;
  initialTime?: string;
  onSubmit?: (data: AppointmentFormData) => void;
  onCancel?: () => void;
}

export const AppointmentDialog = ({ 
  isOpen, 
  onOpenChange, 
  initialDate, 
  initialTime,
  onSubmit,
  onCancel
}: AppointmentDialogProps) => {
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

  // Atualiza formData quando as props iniciais mudarem
  useEffect(() => {
    if (initialDate || initialTime) {
      setFormData(prev => ({
        ...prev,
        date: initialDate ? format(initialDate, "yyyy-MM-dd") : prev.date,
        time: initialTime || prev.time
      }));
    }
  }, [initialDate, initialTime]);

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

    // Check if time is within professional's working hours
    const selectedTime = formData.time;
    if (selectedTime < schedule.start || selectedTime > schedule.end) {
      toast({
        title: "Horário indisponível",
        description: `O profissional só atende entre ${schedule.start} e ${schedule.end} neste dia`,
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate submitting to server with a delay
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSubmit) {
        onSubmit(formData);
      } else {
        toast({
          title: "Agendamento salvo",
          description: "O agendamento foi salvo com sucesso!",
        });
        resetForm();
      }
      
      // Close dialog
      if (onOpenChange) {
        onOpenChange(false);
      }
    }, 1000);
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
    setFormErrors({
      clientId: "",
      serviceId: "",
      professionalId: "",
      date: "",
      time: ""
    });
    setTouched({
      clientId: false,
      serviceId: false,
      professionalId: false,
      date: false,
      time: false
    });
    setClientSearch("");
  };

  const handleCancelClick = () => {
    if (
      formData.clientId !== 0 ||
      formData.serviceId !== 0 ||
      formData.professionalId !== 0 ||
      formData.notes !== ""
    ) {
      setIsConfirmCancelOpen(true);
    } else {
      if (onCancel) {
        onCancel();
      } else if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  // O conteúdo do formulário agora é retornado diretamente
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-blue-50 text-blue-800 rounded-md px-3 py-2 text-sm flex items-center gap-2 flex-grow">
          <CalendarClock className="h-4 w-4" />
          <span>
            {initialDate
              ? `Data selecionada: ${format(initialDate, "dd 'de' MMMM", { locale: ptBR })}`
              : "Selecione a data do agendamento"}
            
            {initialTime && ` às ${initialTime}`}
          </span>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                Cliente
              </span>
            </Label>
            <div className="relative">
              <Input
                id="client-search"
                placeholder="Buscar cliente por nome, telefone ou email"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className={cn(
                  "pl-10",
                  touched.clientId && formErrors.clientId && "border-red-500"
                )}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            {clientSearch && filteredClients.length > 0 && (
              <div className="bg-white border rounded-md mt-1 max-h-40 overflow-y-auto">
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => {
                      handleFieldChange("clientId", client.id);
                      setClientSearch(client.name);
                    }}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                  >
                    <span className="font-medium">{client.name}</span>
                    <span className="text-sm text-gray-500">{client.phone}</span>
                  </div>
                ))}
              </div>
            )}
            
            {touched.clientId && formErrors.clientId && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.clientId}
              </p>
            )}
            
            <div className="flex justify-between items-center mt-2">
              <Button type="button" variant="link" size="sm" className="text-primary p-0 h-auto">
                <Plus className="h-3 w-3 mr-1" />
                Cadastrar novo cliente
              </Button>
              
              {formData.clientId > 0 && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Cliente selecionado</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">
              <span className="flex items-center gap-1.5">
                <Scissors className="h-4 w-4 text-primary" />
                Serviço
              </span>
            </Label>
            <Select
              value={formData.serviceId !== 0 ? String(formData.serviceId) : ""}
              onValueChange={(value) => handleFieldChange("serviceId", parseInt(value))}
            >
              <SelectTrigger 
                id="service" 
                className={cn(touched.serviceId && formErrors.serviceId && "border-red-500")}
              >
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={String(service.id)}>
                    <div className="flex justify-between items-center w-full">
                      <span>{service.name}</span>
                      <span className="text-gray-500 text-sm ml-4">
                        {service.duration} min - R$ {service.price.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.serviceId && formErrors.serviceId && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.serviceId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional">
              <span className="flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-primary" />
                Profissional
              </span>
            </Label>
            <Select
              value={formData.professionalId !== 0 ? String(formData.professionalId) : ""}
              onValueChange={(value) => handleFieldChange("professionalId", parseInt(value))}
              disabled={formData.serviceId === 0}
            >
              <SelectTrigger 
                id="professional" 
                className={cn(touched.professionalId && formErrors.professionalId && "border-red-500")}
              >
                <SelectValue placeholder={formData.serviceId === 0 ? "Selecione o serviço primeiro" : "Selecione o profissional"} />
              </SelectTrigger>
              <SelectContent>
                {formData.serviceId !== 0 && 
                 services.find(s => s.id === formData.serviceId)?.professionals.map(profId => {
                   const professional = professionals.find(p => p.id === profId);
                   return professional ? (
                     <SelectItem key={professional.id} value={String(professional.id)}>
                       {professional.name}
                     </SelectItem>
                   ) : null;
                 })
                }
              </SelectContent>
            </Select>
            {touched.professionalId && formErrors.professionalId && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.professionalId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  Data
                </span>
              </Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date} 
                onChange={(e) => handleFieldChange("date", e.target.value)}
                className={cn(touched.date && formErrors.date && "border-red-500")}
              />
              {touched.date && formErrors.date && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.date}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  Horário
                </span>
              </Label>
              <Input 
                id="time" 
                type="time" 
                value={formData.time} 
                onChange={(e) => handleFieldChange("time", e.target.value)}
                className={cn(touched.time && formErrors.time && "border-red-500")}
              />
              {touched.time && formErrors.time && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.time}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-primary" />
                Observações (opcional)
              </span>
            </Label>
            <Input 
              id="notes" 
              value={formData.notes || ""} 
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Preferências do cliente, detalhes do serviço, etc."
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="sendReminder"
              checked={formData.sendReminder}
              onChange={(e) => handleFieldChange("sendReminder", e.target.checked)}
              className="h-4 w-4 text-primary"
            />
            <Label htmlFor="sendReminder" className="cursor-pointer flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Enviar lembrete por WhatsApp
            </Label>
          </div>
        </div>
      </form>

      {/* Diálogo de confirmação de cancelamento */}
      <Dialog open={isConfirmCancelOpen} onOpenChange={setIsConfirmCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar agendamento?</DialogTitle>
            <DialogDescription>
              As informações preenchidas serão perdidas. Tem certeza que deseja cancelar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsConfirmCancelOpen(false)}
            >
              Voltar ao formulário
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setIsConfirmCancelOpen(false);
                resetForm();
                if (onCancel) {
                  onCancel();
                } else if (onOpenChange) {
                  onOpenChange(false);
                }
              }}
            >
              Sim, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
