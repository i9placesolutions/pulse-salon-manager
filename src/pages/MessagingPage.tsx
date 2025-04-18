import { useState } from "react";
import { WhatsAppSender } from "@/components/messaging/WhatsAppSender";
import { MAIN_INSTANCE_TOKEN } from "@/lib/whatsappApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CalendarIcon, X, CheckCircle } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSupabaseMessaging } from "@/hooks/useSupabaseMessaging";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientAuthForm } from "@/components/client/ClientAuthForm";
import { ClientAppointmentHistory } from "@/components/client/ClientAppointmentHistory";

export default function MessagingPage() {
  // Estados locais da página
  const [useMainInstance, setUseMainInstance] = useState(true);
  const [activeTab, setActiveTab] = useState("mensagens");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para autenticação de cliente (histórico)
  const [authenticatedClientId, setAuthenticatedClientId] = useState<string | null>(null);
  
  // Hook personalizado para comunicação com Supabase
  const { 
    establishmentData,
    professionals,
    appointments,
    userAppointments,
    services,
    isLoadingEstablishment,
    isLoadingProfessionals,
    isLoadingAppointments,
    isLoadingUserAppointments,
    fetchClientAppointments,
    createAppointment,
    cancelAppointment,
    getAvailableDates,
    getAvailableHours,
    formatPhone,
    normalizePhone
  } = useSupabaseMessaging();
  
  // Lista de datas disponíveis para o profissional selecionado
  const availableDates = getAvailableDates(selectedProfessional);
  
  // Lista de horários disponíveis para a data e serviço selecionados
  const availableHours = getAvailableHours(selectedProfessional, selectedDate, selectedService);
  
  // Resetar seleções quando mudar o profissional
  const handleProfessionalChange = (value: string) => {
    setSelectedProfessional(value);
    setSelectedDate("");
    setSelectedHour("");
  };
  
  // Resetar horário quando mudar a data
  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    setSelectedHour("");
  };
  
  // Criar um novo agendamento
  const handleCreateAppointment = async () => {
    if (!selectedProfessional || !selectedService || !selectedDate || !selectedHour || !clientName || !clientPhone) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const service = services.find(s => s.id === selectedService);
      if (!service) throw new Error("Serviço não encontrado");
      
      const startTime = new Date(`${selectedDate}T${selectedHour}:00`);
      const endTime = addMinutes(startTime, service.duration);
      
      // Normaliza o telefone
      const normalizedPhone = normalizePhone(clientPhone);
      
      // Cria o agendamento usando o hook
      await createAppointment({
        professional_id: selectedProfessional,
        client_name: clientName,
        client_phone: normalizedPhone,
        service_name: service.name,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        value: service.price,
        status: 'confirmado'
      });
      
      toast({
        title: "Agendamento realizado",
        description: "Seu horário foi agendado com sucesso!",
        variant: "default"
      });
      
      // Limpar formulário
      setSelectedService("");
      setSelectedDate("");
      setSelectedHour("");
      
      // Atualizar lista de agendamentos do cliente
      if (normalizedPhone) {
        fetchClientAppointments(normalizedPhone);
      }
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro no agendamento",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Buscar agendamentos do cliente
  const handleFetchClientAppointments = async () => {
    if (!clientPhone) return;
    
    try {
      setIsSubmitting(true);
      await fetchClientAppointments(clientPhone);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível buscar seus agendamentos.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar agendamento
  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    try {
      setIsSubmitting(true);
      
      // Cancelar usando o hook
      await cancelAppointment(appointmentToCancel);
      
      toast({
        title: "Agendamento cancelado",
        description: "Seu agendamento foi cancelado com sucesso.",
        variant: "default"
      });
      
      // Fechar diálogo
      setIsDialogOpen(false);
      setAppointmentToCancel(null);
      
      // Atualizar lista
      if (clientPhone) {
        fetchClientAppointments(clientPhone);
      }
      
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Lidar com autenticação bem-sucedida do cliente
  const handleClientAuthenticated = (clientId: string) => {
    setAuthenticatedClientId(clientId);
  };
  
  // Limpar autenticação (logout)
  const handleLogout = () => {
    setAuthenticatedClientId(null);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Central de Atendimento</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Informações do Estabelecimento</CardTitle>
          <CardDescription>
            {isLoadingEstablishment ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              establishmentData?.description || "Bem-vindo ao nosso sistema de agendamento online"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {isLoadingEstablishment ? (
              <div className="flex justify-center">
                <Skeleton className="h-20 w-40" />
              </div>
            ) : establishmentData?.logo_url ? (
              <div className="flex justify-center mb-4">
                <img 
                  src={establishmentData.logo_url} 
                  alt="Logo" 
                  className="h-20 w-auto object-contain" 
                />
              </div>
            ) : null}
            
            {isLoadingEstablishment ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ) : establishmentData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p className="text-sm text-gray-700">
                    {establishmentData.address_street}, {establishmentData.address_number}
                    <br />
                    {establishmentData.address_neighborhood}, {establishmentData.address_city} - {establishmentData.address_state}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contato</p>
                  <p className="text-sm text-gray-700">
                    {establishmentData.whatsapp && (
                      <span className="block">WhatsApp: {formatPhone(establishmentData.whatsapp)}</span>
                    )}
                    {establishmentData.email && (
                      <span className="block">Email: {establishmentData.email}</span>
                    )}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
      
      <Tabs 
        defaultValue="mensagens" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
          <TabsTrigger value="agendar">Agendar</TabsTrigger>
          <TabsTrigger value="consultar">Consultar</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mensagens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração da Instância</CardTitle>
              <CardDescription>
                Escolha qual instância usar para enviar mensagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Switch 
                  id="useMainInstance" 
                  checked={useMainInstance} 
                  onCheckedChange={setUseMainInstance}
                />
                <Label htmlFor="useMainInstance" className="font-medium">
                  Usar instância principal do sistema
                </Label>
              </div>
              
              {useMainInstance ? (
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <InfoIcon className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-700">Usando token principal</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    As mensagens serão enviadas usando a instância principal (token: {MAIN_INSTANCE_TOKEN.substring(0, 8)}...{MAIN_INSTANCE_TOKEN.substring(MAIN_INSTANCE_TOKEN.length - 8)})
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mt-4 bg-amber-50 border-amber-200">
                  <InfoIcon className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-700">Usando token do estabelecimento</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    As mensagens serão enviadas usando a instância configurada nas configurações deste estabelecimento.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <WhatsAppSender token={useMainInstance ? MAIN_INSTANCE_TOKEN : undefined} />
        </TabsContent>
        
        <TabsContent value="agendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agendar Atendimento</CardTitle>
              <CardDescription>
                Selecione um profissional, serviço e horário disponível
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Seu Nome</Label>
                  <Input
                    id="clientName"
                    placeholder="Digite seu nome completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientPhone">Seu Telefone (WhatsApp)</Label>
                  <Input
                    id="clientPhone"
                    placeholder="Ex: (11) 99999-9999"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="professional">Profissional</Label>
                  {isLoadingProfessionals ? (
                    <Skeleton className="h-10 w-full mt-1" />
                  ) : (
                    <Select 
                      value={selectedProfessional}
                      onValueChange={handleProfessionalChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals
                          .filter(p => p.is_agenda_open)
                          .map(pro => (
                            <SelectItem key={pro.id} value={pro.id}>
                              {pro.name} ({pro.specialty})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="service">Serviço</Label>
                  <Select 
                    value={selectedService}
                    onValueChange={setSelectedService}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - R$ {service.price.toFixed(2)} ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedProfessional && selectedService && (
                  <>
                    <div>
                      <Label htmlFor="date">Data</Label>
                      <Select 
                        value={selectedDate}
                        onValueChange={handleDateChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma data" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDates.map(date => (
                            <SelectItem key={date} value={date}>
                              {format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedDate && (
                      <div>
                        <Label htmlFor="hour">Horário</Label>
                        <Select 
                          value={selectedHour}
                          onValueChange={setSelectedHour}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um horário" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingAppointments ? (
                              <SelectItem value="loading" disabled>
                                Carregando horários...
                              </SelectItem>
                            ) : availableHours.length > 0 ? (
                              availableHours.map(hour => (
                                <SelectItem key={hour} value={hour}>
                                  {hour}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                Não há horários disponíveis
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
                
                <Button 
                  className="w-full mt-4"
                  disabled={!selectedProfessional || !selectedService || !selectedDate || !selectedHour || !clientName || !clientPhone || isSubmitting}
                  onClick={handleCreateAppointment}
                >
                  {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="consultar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consultar Agendamentos</CardTitle>
              <CardDescription>
                Informe seu telefone para consultar seus agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite seu telefone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                  <Button 
                    onClick={handleFetchClientAppointments}
                    disabled={!clientPhone || isSubmitting}
                  >
                    {isSubmitting ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
                
                {isLoadingUserAppointments ? (
                  <div className="space-y-4 mt-4">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-24 w-full mb-2" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : userAppointments.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    <h3 className="text-sm font-semibold">Seus agendamentos:</h3>
                    {userAppointments.map(appointment => (
                      <Card key={appointment.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{appointment.service_name}</p>
                            <p className="text-sm text-gray-500">
                              {format(parseISO(appointment.start_time), "dd/MM/yyyy 'às' HH:mm")}
                            </p>
                            <p className="text-sm text-gray-500">
                              Profissional: {professionals.find(p => p.id === appointment.professional_id)?.name || "Não especificado"}
                            </p>
                            <p className="text-sm mt-1">
                              <span 
                                className={`px-2 py-1 rounded-full text-xs ${
                                  appointment.status === 'confirmado' 
                                    ? 'bg-green-100 text-green-800' 
                                    : appointment.status === 'cancelado'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {appointment.status === 'confirmado' 
                                  ? 'Confirmado' 
                                  : appointment.status === 'cancelado'
                                  ? 'Cancelado'
                                  : 'Aguardando'}
                              </span>
                            </p>
                          </div>
                          {appointment.status === 'confirmado' && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setAppointmentToCancel(appointment.id)}
                                >
                                  Cancelar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirmar Cancelamento</DialogTitle>
                                  <DialogDescription>
                                    Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setIsDialogOpen(false);
                                      setAppointmentToCancel(null);
                                    }}
                                  >
                                    Manter Agendamento
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={handleCancelAppointment}
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? "Cancelando..." : "Confirmar Cancelamento"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  clientPhone && !isLoadingUserAppointments && (
                    <Alert className="mt-4 bg-blue-50 border-blue-200">
                      <InfoIcon className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-700">Nenhum agendamento encontrado</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        Não encontramos agendamentos ativos para este telefone.
                      </AlertDescription>
                    </Alert>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historico" className="space-y-4">
          {authenticatedClientId ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </div>
              
              <ClientAppointmentHistory clientId={authenticatedClientId} />
            </div>
          ) : (
            <ClientAuthForm onAuthenticated={handleClientAuthenticated} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}