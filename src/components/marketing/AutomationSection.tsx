
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Gift, Bell, Zap, Calendar, Settings, Plus } from "lucide-react";
import { useState } from "react";

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
}];

export function AutomationSection() {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<typeof automations[0] | null>(null);
  const [newAutomation, setNewAutomation] = useState({
    title: "",
    description: "",
    message: ""
  });

  const handleConfigureAutomation = (automation: typeof automations[0]) => {
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
    </div>;
}
