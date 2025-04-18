import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClientManagement } from "@/hooks/useClientManagement";
import { useServiceManagement } from "@/hooks/useServiceManagement";
import { useProfessionalManagement } from "@/hooks/useProfessionalManagement";
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
// Definindo interface local para Professional com a propriedade schedule
interface AppointmentProfessional {
  id: number;
  name: string;
  specialties: string[];
  schedule?: {
    [key: string]: { start: string; end: string };
  };
}
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

interface SelectedService {
  serviceId: number;
  professionalId: number;
}

interface AppointmentFormData {
  clientId: number;
  selectedServices: SelectedService[];
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
    selectedServices: [],
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    notes: "",
    sendReminder: true
  });
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [open, setOpen] = useState(isOpen || false);

  // Sincronizar o estado open com a prop isOpen
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Notificar mudanças no estado para o componente pai
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // Validação dos campos
  const [formErrors, setFormErrors] = useState({
    clientId: "",
    selectedServices: "",
    date: "",
    time: ""
  });

  // Estado para controlar se os campos foram tocados
  const [touched, setTouched] = useState({
    clientId: false,
    selectedServices: false,
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

  // Buscar dados reais de clientes do Supabase
  const { clients = [] } = useClientManagement();

  // Buscar dados reais de serviços do Supabase
  const { services = [] } = useServiceManagement();

  // Buscar dados reais de profissionais do Supabase
  const { professionals: dbProfessionals = [] } = useProfessionalManagement();
  
  // Converter profissionais para o formato esperado pelo componente
  const professionals: AppointmentProfessional[] = dbProfessionals.map(prof => {
    // Converter especialidades para string[] quando necessário
    const specialtiesAsStrings: string[] = Array.isArray(prof.specialties) 
      ? prof.specialties.map(spec => 
          typeof spec === 'string' ? spec : (spec?.name || '')) 
      : [];
    
    return {
      id: typeof prof.id === 'string' ? parseInt(prof.id) : prof.id,
      name: prof.name,
      specialties: specialtiesAsStrings,
      schedule: prof.schedule || {
        "1": { start: "09:00", end: "18:00" },
        "2": { start: "09:00", end: "18:00" },
        "3": { start: "09:00", end: "18:00" },
        "4": { start: "09:00", end: "18:00" },
        "5": { start: "09:00", end: "18:00" }
      }
    };
  });

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
      case "selectedServices":
        return (Array.isArray(value) && value.length > 0) ? "" : "Pelo menos um serviço é obrigatório";
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
    // Verificar se os campos obrigatórios estão preenchidos
    const basicFieldsValid = !formErrors.clientId && 
           !formErrors.selectedServices && 
           !formErrors.date && 
           !formErrors.time &&
           formData.clientId > 0 &&
           formData.selectedServices.length > 0;
    
    // Verificar se todos os serviços têm profissionais selecionados
    const servicesComplete = formData.selectedServices.every(
      service => service.serviceId > 0 && service.professionalId > 0
    );
    
    return basicFieldsValid && servicesComplete;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validar todos os campos
    const allTouched = {
      clientId: true,
      selectedServices: true,
      date: true,
      time: true
    };
    setTouched(allTouched);
    
    // Verificar se todos os serviços têm profissionais selecionados
    const servicesComplete = formData.selectedServices.every(
      service => service.serviceId > 0 && service.professionalId > 0
    );
    
    if (!servicesComplete) {
      toast({
        title: "Erro",
        description: "Cada serviço deve ter um profissional selecionado",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    // Validar disponibilidade dos profissionais
    const appointmentDate = new Date(formData.date);
    const dayOfWeek = String(appointmentDate.getDay() + 1);
    
    for (const selectedService of formData.selectedServices) {
      const service = services.find(s => s.id === selectedService.serviceId);
      const professional = professionals.find(p => p.id === selectedService.professionalId);
      
      if (!service || !professional) {
        toast({
          title: "Erro",
          description: "Serviço ou profissional não encontrado",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Check if professional works on this day
      const schedule = professional.schedule[dayOfWeek];
      if (!schedule) {
        toast({
          title: "Horário indisponível",
          description: `O profissional ${professional.name} não atende neste dia`,
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
          description: `O profissional ${professional.name} só atende entre ${schedule.start} e ${schedule.end} neste dia`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
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
      selectedServices: [],
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      notes: "",
      sendReminder: true
    });
    setFormErrors({
      clientId: "",
      selectedServices: "",
      date: "",
      time: ""
    });
    setTouched({
      clientId: false,
      selectedServices: false,
      date: false,
      time: false
    });
    setClientSearch("");
  };

  const handleCancelClick = () => {
    if (
      formData.clientId !== 0 ||
      formData.selectedServices.length > 0 ||
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

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="bg-blue-600 text-white p-6 -mx-6 -mt-6 rounded-t-lg">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-white">
              <CalendarClock className="h-6 w-6" />
              Novo Agendamento
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-1">
              Preencha os dados para criar um novo agendamento
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4 px-1">
            {/* Serviços */}
            <div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="w-full border-dashed flex items-center justify-center h-12 gap-2"
                onClick={() => {
                  const newService: SelectedService = {
                    serviceId: 0,
                    professionalId: 0
                  };
                  handleFieldChange("selectedServices", [
                    ...formData.selectedServices,
                    newService
                  ]);
                }}
              >
                <Plus className="h-5 w-5" />
                Adicionar serviço
              </Button>
              
              {/* Lista de serviços selecionados */}
              {formData.selectedServices.length > 0 && (
                <div className="space-y-3 mt-4">
                  {formData.selectedServices.map((selectedService, index) => {
                    const service = services.find(s => s.id === selectedService.serviceId);
                    const professional = professionals.find(p => p.id === selectedService.professionalId);
                    
                    return (
                      <div key={index} className="bg-blue-50 rounded-md p-3 relative">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1 h-6 w-6 text-gray-500 hover:text-red-500"
                          onClick={() => {
                            const newServices = [...formData.selectedServices];
                            newServices.splice(index, 1);
                            handleFieldChange("selectedServices", newServices);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Serviço</Label>
                            <Select
                              value={String(selectedService.serviceId)}
                              onValueChange={(value) => {
                                const newServices = [...formData.selectedServices];
                                newServices[index].serviceId = parseInt(value);
                                newServices[index].professionalId = 0; // Resetar profissional
                                handleFieldChange("selectedServices", newServices);
                              }}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map(service => (
                                  <SelectItem key={service.id} value={String(service.id)}>
                                    {service.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Profissional</Label>
                            <Select
                              value={String(selectedService.professionalId || "")}
                              onValueChange={(value) => {
                                const newServices = [...formData.selectedServices];
                                newServices[index].professionalId = parseInt(value);
                                handleFieldChange("selectedServices", newServices);
                              }}
                              disabled={!selectedService.serviceId}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedService.serviceId > 0 && 
                                 services.find(s => s.id === selectedService.serviceId)?.professionals.map(profId => {
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
                          </div>
                        </div>
                        
                        {service && (
                          <div className="mt-2 text-xs text-gray-700 flex justify-between">
                            <span>Duração: {service.duration} min</span>
                            <span>R$ {service.price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {touched.selectedServices && formErrors.selectedServices && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.selectedServices}
                </p>
              )}
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <User className="h-5 w-5 text-primary" />
                <Label htmlFor="client" className="text-base font-medium">
                  Cliente
                </Label>
              </div>
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

            {/* Data e Hora */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="h-5 w-5 text-primary" />
                <Label htmlFor="date" className="text-base font-medium">
                  Data
                </Label>
              </div>
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
            
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-5 w-5 text-primary" />
                <Label htmlFor="time" className="text-base font-medium">
                  Horário
                </Label>
              </div>
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

            {/* Observações */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-5 w-5 text-primary" />
                <Label htmlFor="notes" className="text-base font-medium">
                  Observações (opcional)
                </Label>
              </div>
              <Input 
                id="notes" 
                value={formData.notes || ""} 
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                placeholder="Preferências do cliente, detalhes do serviço, etc."
              />
            </div>
            
            {/* Lembrete WhatsApp */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="sendReminder"
                checked={formData.sendReminder}
                onChange={(e) => handleFieldChange("sendReminder", e.target.checked)}
                className="h-4 w-4 text-primary"
              />
              <MessageCircle className="h-5 w-5 text-primary" />
              <Label htmlFor="sendReminder" className="cursor-pointer">
                Enviar lembrete por WhatsApp
              </Label>
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelClick}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 gap-1"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin">&#9696;</span>
                    Salvando...
                  </span>
                ) : (
                  <>
                    <CalendarClock className="h-4 w-4" />
                    Criar Agendamento
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação para cancelar */}
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
                handleOpenChange(false);
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
