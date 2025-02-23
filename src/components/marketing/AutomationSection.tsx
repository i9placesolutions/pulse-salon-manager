import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageSquare, Gift, Bell, Zap, Calendar, Timer, Users, Star } from "lucide-react";
const automations = [{
  id: 1,
  title: "Mensagem de Boas-vindas",
  description: "Envie uma mensagem automática para novos clientes",
  icon: MessageSquare,
  active: true
}, {
  id: 2,
  title: "Aniversários",
  description: "Envie parabéns e ofertas especiais no aniversário",
  icon: Gift,
  active: true
}, {
  id: 3,
  title: "Reativação",
  description: "Reconquiste clientes inativos com ofertas especiais",
  icon: Zap,
  active: false
}, {
  id: 4,
  title: "Lembretes",
  description: "Envie lembretes de agendamentos",
  icon: Bell,
  active: true
}, {
  id: 5,
  title: "Pós-atendimento",
  description: "Colete feedback após o atendimento",
  icon: Star,
  active: true
}, {
  id: 6,
  title: "Campanhas Periódicas",
  description: "Agende envios automáticos de promoções",
  icon: Calendar,
  active: false
}];
export function AutomationSection() {
  return <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automações</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas automações de marketing
          </p>
        </div>
        <Button className="NAO ABRE MODA  EM NADA, CRIE PARA TUDO EM AUTOMA\xC7\xD4ES ">
          <Zap className="mr-2 h-4 w-4" />
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
              <Button variant="outline" className="w-full mt-4" size="sm">
                Configurar
              </Button>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}