import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Lock, Laptop, Smartphone } from "lucide-react";
import { FormCard } from "@/components/shared/FormCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ConnectedDevice {
  id: number;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrentSession: boolean;
  type: "laptop" | "mobile";
}

const connectedDevices: ConnectedDevice[] = [
  {
    id: 1,
    device: "MacBook Pro",
    browser: "Chrome",
    ip: "192.168.1.1",
    lastActive: "2024-03-15T10:30:00",
    isCurrentSession: true,
    type: "laptop"
  },
  {
    id: 2,
    device: "iPhone 13",
    browser: "Safari",
    ip: "192.168.1.2",
    lastActive: "2024-03-14T15:45:00",
    isCurrentSession: false,
    type: "mobile"
  }
];

export function SecuritySettings() {
  return (
    <div className="grid gap-4 w-full">
      <FormCard 
        title="Configurações de Segurança"
        footer={<Button>Salvar Configurações</Button>}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de Dois Fatores</Label>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <Switch />
            </div>
            <div className="ml-6 space-y-4">
              <div className="flex items-center gap-2">
                <input type="radio" name="2fa-method" id="2fa-sms" />
                <Label htmlFor="2fa-sms">SMS</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" name="2fa-method" id="2fa-app" />
                <Label htmlFor="2fa-app">App Autenticador</Label>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start">
              <Lock className="mr-2 h-4 w-4" />
              Alterar Senha
            </Button>
          </div>

          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Dispositivos Conectados</h3>
            <div className="space-y-4">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {device.type === 'laptop' ? (
                      <Laptop className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <Smartphone className="h-8 w-8 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{device.device}</p>
                      <p className="text-sm text-muted-foreground">
                        {device.browser} • {device.ip}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Último acesso: {new Date(device.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {device.isCurrentSession ? (
                    <Badge>Sessão Atual</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Encerrar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormCard>
    </div>
  );
}
