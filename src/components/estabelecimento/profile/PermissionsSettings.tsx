
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function PermissionsSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões e Níveis de Acesso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-medium">Administrador Geral</h3>
            <div className="ml-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-financial">Acesso ao Financeiro</Label>
                <Switch id="admin-financial" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-reports">Acesso aos Relatórios</Label>
                <Switch id="admin-reports" defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Gerente do Salão</h3>
            <div className="ml-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="manager-schedule">Gerenciar Horários</Label>
                <Switch id="manager-schedule" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="manager-prices">Editar Preços</Label>
                <Switch id="manager-prices" defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Profissional</h3>
            <div className="ml-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="prof-appointments">Ver Agendamentos</Label>
                <Switch id="prof-appointments" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="prof-commission">Ver Comissões</Label>
                <Switch id="prof-commission" defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Recepcionista</h3>
            <div className="ml-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="receptionist-schedule">Fazer Agendamentos</Label>
                <Switch id="receptionist-schedule" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="receptionist-clients">Gerenciar Clientes</Label>
                <Switch id="receptionist-clients" defaultChecked />
              </div>
            </div>
          </div>
        </div>
        <Button>Salvar Permissões</Button>
      </CardContent>
    </Card>
  );
}
