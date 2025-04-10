import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FormCard } from "@/components/shared/FormCard";
import { Button } from "@/components/ui/button";

export function NotificationPreferences() {
  return (
    <FormCard 
      title="Preferências de Notificação"
      footer={<Button>Salvar Preferências</Button>}
    >
      <div className="space-y-4">
        <h4 className="font-medium">Canais de Comunicação</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>E-mail</Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações importantes no seu e-mail
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Receba mensagens importantes via WhatsApp
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sistema</Label>
              <p className="text-sm text-muted-foreground">
                Receba alertas dentro do sistema
              </p>
            </div>
            <Switch />
          </div>
        </div>

        <Separator className="my-4" />

        <h4 className="font-medium">Tipos de Notificação</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lembrete de Agendamentos</Label>
              <p className="text-sm text-muted-foreground">
                24h antes do horário marcado
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pagamentos e Comissões</Label>
              <p className="text-sm text-muted-foreground">
                Alertas sobre transações financeiras
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </FormCard>
  );
}
