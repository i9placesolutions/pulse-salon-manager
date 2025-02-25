
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function NotificationPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Notificação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="new-appointments">Novos Agendamentos</Label>
            <Switch id="new-appointments" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="cancellations">Cancelamentos</Label>
            <Switch id="cancellations" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="commission">Comissões Recebidas</Label>
            <Switch id="commission" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="schedule-changes">Alterações na Agenda</Label>
            <Switch id="schedule-changes" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="client-feedback">Avaliações de Clientes</Label>
            <Switch id="client-feedback" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="whatsapp">Notificações por WhatsApp</Label>
            <Switch id="whatsapp" />
          </div>
        </div>
        <Button>Salvar Preferências</Button>
      </CardContent>
    </Card>
  );
}
