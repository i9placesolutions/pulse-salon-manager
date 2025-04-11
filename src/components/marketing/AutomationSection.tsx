import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Bell, Zap, Calendar, Settings, Plus, ClipboardCheck, ClipboardList, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { sendBulkMessage, fetchWhatsAppContacts, type WhatsAppContact } from "@/lib/uazapiService";

const automations = [{
  id: 1,
  title: "Mensagem de Boas-vindas",
  description: "Envie uma mensagem automática para novos clientes",
  icon: MessageSquare,
  active: true,
  message: "Olá! Seja bem-vindo(a)! Estamos felizes em ter você como cliente."
}, {
  id: 3,
  title: "Reativação",
  description: "Reconquiste clientes inativos com ofertas especiais",
  icon: Zap,
  active: false,
  message: "Sentimos sua falta! Que tal voltar com um desconto especial?"
}, {
  id: 4,
  title: "Lembretes",
  description: "Envie lembretes de agendamentos",
  icon: Bell,
  active: true,
  message: "Lembrete: Você tem um agendamento amanhã!"
}, {
  id: 5,
  title: "Pós-atendimento",
  description: "Colete feedback após o atendimento",
  icon: MessageSquare,
  active: true,
  message: "Como foi sua experiência? Sua opinião é muito importante para nós!"
}, {
  id: 6,
  title: "Campanhas Periódicas",
  description: "Agende envios automáticos de promoções",
  icon: Calendar,
  active: false,
  message: "Confira nossas ofertas especiais desta semana!"
}, {
  id: 7,
  title: "Gerenciamento de Agendamentos",
  description: "Configure mensagens automáticas para agendamentos",
  icon: ClipboardCheck,
  active: false,
  message: "Configuração para agendamentos"
}];

export function AutomationSection() {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<typeof automations[0] | null>(null);
  const [newAutomation, setNewAutomation] = useState({
    title: "",
    description: "",
    message: ""
  });
  
  // Estado para configurações de agendamento
  const [schedulingConfig, setSchedulingConfig] = useState({
    active: false,
    pending: {
      active: true,
      message: "Olá {nome}, recebemos sua solicitação de agendamento e está em análise. Em breve entraremos em contato para confirmar."
    },
    confirmed: {
      active: true,
      message: "Olá {nome}, seu agendamento para o dia {data} às {horario} com {profissional} foi confirmado. Aguardamos você!"
    },
    reminder: {
      active: true,
      message: "Olá {nome}, lembrete do seu agendamento no {estabelecimento} para {data} às {horario}. Contamos com sua presença!",
      sendLocation: true
    }
  });
  
  // Estado para o envio de texto via instância uazapi
  const [textMessage, setTextMessage] = useState("");
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [contactsFilter, setContactsFilter] = useState("");
  
  // Carregar contatos do WhatsApp
  useEffect(() => {
    loadWhatsAppContacts();
  }, []);
  
  const loadWhatsAppContacts = async () => {
    try {
      const response = await fetchWhatsAppContacts();
      setWhatsappContacts(response.contacts);
    } catch (error) {
      console.error("Erro ao carregar contatos do WhatsApp:", error);
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível obter a lista de contatos do WhatsApp.",
        variant: "destructive",
      });
    }
  };

  const handleConfigureAutomation = (automation: typeof automations[0]) => {
    // Verifica se é a automação de agendamentos
    if (automation.id === 7) {
      setShowSchedulingModal(true);
      return;
    }
    
    setSelectedAutomation(automation);
    setShowConfigModal(true);
  };

  const handleCreateNewAutomation = () => {
    setShowNewModal(true);
  };

  const handleSaveNewAutomation = () => {
    console.log("Nova automação:", newAutomation);
    setShowNewModal(false);
    setNewAutomation({ title: "", description: "", message: "" });
  };

  const handleSaveConfig = () => {
    console.log("Configuração salva:", selectedAutomation);
    setShowConfigModal(false);
  };

  const handleSaveSchedulingConfig = () => {
    console.log("Configuração de agendamento salva:", schedulingConfig);
    setShowSchedulingModal(false);
  };
  
  // Função para enviar mensagem para os contatos selecionados
  const handleSendTextMessage = async () => {
    if (!textMessage.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, digite uma mensagem para enviar.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedContacts.length === 0) {
      toast({
        title: "Nenhum contato selecionado",
        description: "Por favor, selecione pelo menos um contato para enviar a mensagem.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    try {
      // Obter os números de telefone dos contatos selecionados
      const phoneNumbers = whatsappContacts
        .filter(contact => selectedContacts.includes(contact.id))
        .map(contact => contact.number);
      
      // Enviar mensagem via uazapi
      await sendBulkMessage(phoneNumbers, textMessage);
      
      // Limpar campos após o envio
      setTextMessage("");
      setSelectedContacts([]);
      
      toast({
        title: "Mensagem enviada com sucesso",
        description: `A mensagem foi enviada para ${phoneNumbers.length} contato(s).`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Filtrar contatos com base no texto de busca
  const filteredContacts = contactsFilter
    ? whatsappContacts.filter(contact => 
        contact.name.toLowerCase().includes(contactsFilter.toLowerCase()) ||
        contact.number.includes(contactsFilter)
      )
    : whatsappContacts;
  
  // Selecionar ou desselecionar todos os contatos
  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
  };
  
  // Função para alternar a seleção de um contato
  const toggleContactSelection = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Automações Configuradas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Automações Configuradas
            </CardTitle>
            <CardDescription>
              Gerencie mensagens automáticas para seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automations.map((automation) => (
                <div 
                  key={automation.id} 
                  className="p-4 border rounded-lg hover:border-blue-200 transition-colors cursor-pointer"
                  onClick={() => handleConfigureAutomation(automation)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-full">
                        {<automation.icon className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{automation.title}</h3>
                        <p className="text-sm text-muted-foreground">{automation.description}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={automation.active}
                      onClick={(e) => {
                        e.stopPropagation();
                        automation.active = !automation.active;
                      }}
                    />
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full" onClick={handleCreateNewAutomation}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Automação
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Envio de Texto via uazapi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Envio de Texto via WhatsApp
            </CardTitle>
            <CardDescription>
              Envie mensagens para contatos através da instância conectada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message-text">Mensagem</Label>
                <Textarea
                  id="message-text"
                  placeholder="Digite sua mensagem..."
                  className="min-h-[100px] mt-1"
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Contatos ({filteredContacts.length})</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleSelectAll}
                      className="h-8 text-xs"
                    >
                      {selectedContacts.length === filteredContacts.length ? "Desmarcar Todos" : "Selecionar Todos"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadWhatsAppContacts}
                      className="h-8 text-xs"
                    >
                      Atualizar
                    </Button>
                  </div>
                </div>
                
                <Input
                  type="text"
                  placeholder="Filtrar contatos..."
                  value={contactsFilter}
                  onChange={(e) => setContactsFilter(e.target.value)}
                  className="mb-2"
                />
                
                {whatsappContacts.length === 0 ? (
                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertTitle>Nenhum contato encontrado</AlertTitle>
                    <AlertDescription>
                      Certifique-se de que sua instância do WhatsApp está conectada.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="border rounded-md max-h-[200px] overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <div 
                        key={contact.id}
                        className="flex items-center space-x-2 p-2 hover:bg-slate-50 border-b cursor-pointer"
                        onClick={() => toggleContactSelection(contact.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => {}}
                          className="h-4 w-4"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{contact.name || "Sem nome"}</p>
                          <p className="text-sm text-muted-foreground">{contact.number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSendTextMessage}
                disabled={isSending || textMessage.trim() === "" || selectedContacts.length === 0}
              >
                {isSending ? "Enviando..." : "Enviar Mensagem"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Configuração de Automação */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Automação</DialogTitle>
            <DialogDescription>
              Ajuste as configurações da sua automação
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={selectedAutomation?.title || ""}
                onChange={(e) => setSelectedAutomation(prev => prev ? {...prev, title: e.target.value} : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={selectedAutomation?.description || ""}
                onChange={(e) => setSelectedAutomation(prev => prev ? {...prev, description: e.target.value} : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={selectedAutomation?.message || ""}
                onChange={(e) => setSelectedAutomation(prev => prev ? {...prev, message: e.target.value} : null)}
              />
              <p className="text-xs text-muted-foreground">
                Dica: Use {"{nome}"} para inserir o nome do cliente na mensagem
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfigModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConfig}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Automação */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Automação</DialogTitle>
            <DialogDescription>
              Configure uma nova automação de marketing
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-title">Título</Label>
              <Input
                id="new-title"
                value={newAutomation.title}
                onChange={(e) => setNewAutomation(prev => ({...prev, title: e.target.value}))}
                placeholder="Ex: Mensagem de Boas-vindas"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-description">Descrição</Label>
              <Input
                id="new-description"
                value={newAutomation.description}
                onChange={(e) => setNewAutomation(prev => ({...prev, description: e.target.value}))}
                placeholder="Ex: Envie uma mensagem automática para novos clientes"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-message">Mensagem</Label>
              <Textarea
                id="new-message"
                value={newAutomation.message}
                onChange={(e) => setNewAutomation(prev => ({...prev, message: e.target.value}))}
                placeholder="Digite a mensagem que será enviada automaticamente..."
              />
              <p className="text-xs text-muted-foreground">
                Dica: Use {"{nome}"} para inserir o nome do cliente na mensagem
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNewAutomation}>
              Criar Automação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Configuração de Agendamentos */}
      <Dialog open={showSchedulingModal} onOpenChange={setShowSchedulingModal}>
        <DialogContent className="w-[95%] max-w-[600px] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Configurar Automação de Agendamentos</DialogTitle>
            <DialogDescription>
              Configure as mensagens automáticas para diferentes status de agendamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 space-y-3 overflow-y-auto pr-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Automação de Agendamentos</h3>
                <p className="text-sm text-muted-foreground">Ative para enviar mensagens automáticas relacionadas a agendamentos</p>
              </div>
              <Switch 
                checked={schedulingConfig.active}
                onCheckedChange={(checked) => setSchedulingConfig(prev => ({...prev, active: checked}))}
              />
            </div>
            
            <div className="space-y-4 mt-2">
              {/* Seção de Agendamento em Análise */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Agendamento em Análise</h3>
                  </div>
                  <Switch 
                    checked={schedulingConfig.pending.active}
                    onCheckedChange={(checked) => 
                      setSchedulingConfig(prev => ({
                        ...prev, 
                        pending: {...prev.pending, active: checked}
                      }))
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="pending-message">Mensagem</Label>
                  <Textarea 
                    id="pending-message"
                    className="mt-1 min-h-[80px]"
                    value={schedulingConfig.pending.message}
                    onChange={(e) => 
                      setSchedulingConfig(prev => ({
                        ...prev, 
                        pending: {...prev.pending, message: e.target.value}
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Variáveis: {"{nome}"} - nome do cliente
                  </p>
                </div>
              </div>
              
              {/* Seção de Agendamento Confirmado */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Agendamento Confirmado/Reagendado</h3>
                  </div>
                  <Switch 
                    checked={schedulingConfig.confirmed.active}
                    onCheckedChange={(checked) => 
                      setSchedulingConfig(prev => ({
                        ...prev, 
                        confirmed: {...prev.confirmed, active: checked}
                      }))
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmed-message">Mensagem</Label>
                  <Textarea 
                    id="confirmed-message"
                    className="mt-1 min-h-[80px]"
                    value={schedulingConfig.confirmed.message}
                    onChange={(e) => 
                      setSchedulingConfig(prev => ({
                        ...prev, 
                        confirmed: {...prev.confirmed, message: e.target.value}
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Variáveis: {"{nome}"} - nome do cliente, {"{data}"} - data, {"{horario}"} - horário, {"{profissional}"} - profissional
                  </p>
                </div>
              </div>
              
              {/* Seção de Lembrete de Agendamento */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Lembrete de Agendamento</h3>
                  </div>
                  <Switch 
                    checked={schedulingConfig.reminder.active}
                    onCheckedChange={(checked) => 
                      setSchedulingConfig(prev => ({
                        ...prev, 
                        reminder: {...prev.reminder, active: checked}
                      }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="reminder-message">Mensagem</Label>
                    <Textarea 
                      id="reminder-message"
                      className="mt-1 min-h-[80px]"
                      value={schedulingConfig.reminder.message}
                      onChange={(e) => 
                        setSchedulingConfig(prev => ({
                          ...prev, 
                          reminder: {...prev.reminder, message: e.target.value}
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Variáveis: {"{nome}"} - nome do cliente, {"{estabelecimento}"} - nome do estabelecimento, {"{data}"} - data, {"{horario}"} - horário
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="send-location"
                      checked={schedulingConfig.reminder.sendLocation}
                      onCheckedChange={(checked) => 
                        setSchedulingConfig(prev => ({
                          ...prev,
                          reminder: {...prev.reminder, sendLocation: checked}
                        }))
                      }
                    />
                    <div className="grid gap-0.5">
                      <Label htmlFor="send-location">Enviar localização do estabelecimento</Label>
                      <p className="text-xs text-muted-foreground">
                        A localização será obtida do perfil do estabelecimento
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-2 rounded-md">
                    <h4 className="text-sm font-medium text-blue-700">Regras de envio:</h4>
                    <ul className="text-xs text-blue-600 mt-1 list-disc list-inside">
                      <li>Atendimentos pela manhã: lembrete enviado às 20h do dia anterior</li>
                      <li>Atendimentos à tarde: lembrete enviado às 8h do mesmo dia</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2 mt-auto border-t">
            <Button variant="outline" onClick={() => setShowSchedulingModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSchedulingConfig}>
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
