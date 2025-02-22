
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ConfigRelatorios() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Relatórios</CardTitle>
          <CardDescription>
            Personalize seus relatórios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatório Diário</Label>
                <p className="text-sm text-muted-foreground">
                  Resumo do dia anterior
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatório Semanal</Label>
                <p className="text-sm text-muted-foreground">
                  Resumo da semana anterior
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatório Mensal</Label>
                <p className="text-sm text-muted-foreground">
                  Resumo do mês anterior
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destinatários</CardTitle>
          <CardDescription>
            Quem receberá os relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>E-mails</Label>
              <Input placeholder="Digite os e-mails separados por vírgula" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="export-pdf" />
              <Label htmlFor="export-pdf">Exportar como PDF</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="export-excel" />
              <Label htmlFor="export-excel">Exportar como Excel</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
