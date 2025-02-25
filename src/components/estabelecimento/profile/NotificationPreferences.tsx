
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
            <Label htmlFor="agendamentos">Novos Agendamentos</Label>
            <Switch id="agendamentos" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="cancelamentos">Cancelamentos</Label>
            <Switch id="cancelamentos" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="avaliacoes">Novas Avaliações</Label>
            <Switch id="avaliacoes" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="relatorios">Relatórios Semanais</Label>
            <Switch id="relatorios" />
          </div>
        </div>
        <Button>Salvar Preferências</Button>
      </CardContent>
    </Card>
  );
}
