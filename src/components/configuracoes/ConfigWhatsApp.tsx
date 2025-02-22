
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";

export function ConfigWhatsApp() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Conexão WhatsApp</CardTitle>
          <CardDescription>
            Configure a integração com o WhatsApp para envio de mensagens automáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="apiToken">Token da API Uazapi</Label>
              <Input id="apiToken" type="password" placeholder="Digite seu token da API" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-sm">Desconectado</span>
            </div>
            <Button variant="secondary">Conectar WhatsApp</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagens Automáticas</CardTitle>
          <CardDescription>
            Configure mensagens automáticas para seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Confirmação de Agendamento</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar mensagem quando um novo agendamento for realizado
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembrete de Agendamento</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar lembrete 24h antes do horário marcado
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aniversário</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar mensagem de felicitação no aniversário do cliente
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
