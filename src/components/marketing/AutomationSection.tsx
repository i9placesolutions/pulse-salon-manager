import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Gift, Bell, Zap, Calendar, Settings, Plus, ClipboardCheck, ClipboardList } from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const automations = [{
  id: 1,
  title: "Mensagem de Boas-vindas",
  description: "Envie uma mensagem automática para novos clientes",
  icon: MessageSquare,
  active: true,
  message: "Olá! Seja bem-vindo(a)! Estamos felizes em ter você como cliente."
}, {
  id: 2,
  title: "Aniversários",
  description: "Envie parabéns e ofertas especiais no aniversário",
  icon: Gift,
  active: true,
  message: "Feliz aniversário! 🎉 Como presente, preparamos um desconto especial para você!"
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
    console.log("Configuração de agendamentos salva:", schedulingConfig);
    setShowSchedulingModal(false);
  };

  return <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automações</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas automações de marketing
          </p>
        </div>
        <Button onClick={handleCreateNewAutomation}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Automação
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {automations.map(automation => <Card key={automation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <automation.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{automation.title}</CardTitle>
                </div>
                <Switch checked={automation.active} onCheckedChange={() => console.log("Toggle automation:", automation.id)} />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{automation.description}</CardDescription>
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                size="sm"
                onClick={() => handleConfigureAutomation(automation)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurar
              </Button>
            </CardContent>
          </Card>)}
      </div>

      {/* Modal de Configuração */}
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
    </div>;
}
