import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Lock, Laptop, Smartphone } from "lucide-react";
import { FormCard } from "@/components/shared/FormCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [terminatingDeviceId, setTerminatingDeviceId] = useState<number | null>(null);
  
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulação de salvamento
    setTimeout(() => {
      setIsSaving(false);
      
      // Mostrar mensagem de sucesso
      toast({
        variant: "success",
        title: "Configurações salvas com sucesso!",
        description: "As configurações de segurança foram atualizadas.",
        className: "shadow-xl",
      });
    }, 1000);
  };
  
  const handlePasswordChange = () => {
    setIsChangingPassword(true);
    
    // Simulação de operação
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordDialogOpen(false);
      
      // Mostrar mensagem de sucesso
      toast({
        variant: "success",
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
        className: "shadow-xl",
      });
    }, 1500);
  };
  
  const handleTerminateSession = (deviceId: number) => {
    setTerminatingDeviceId(deviceId);
    
    // Simulação de operação
    setTimeout(() => {
      setTerminatingDeviceId(null);
      
      // Mostrar mensagem de sucesso
      toast({
        variant: "info",
        title: "Sessão encerrada!",
        description: "A sessão do dispositivo foi encerrada com sucesso.",
        className: "shadow-xl",
      });
    }, 1000);
  };

  return (
    <div className="grid gap-4 w-full">
      <FormCard 
        title="Configurações de Segurança"
        footer={
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Salvando...
              </>
            ) : (
              "Salvar Configurações"
            )}
          </Button>
        }
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
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setPasswordDialogOpen(true)}
            >
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      disabled={terminatingDeviceId === device.id}
                      onClick={() => handleTerminateSession(device.id)}
                    >
                      {terminatingDeviceId === device.id ? (
                        <>
                          <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Encerrando...
                        </>
                      ) : (
                        "Encerrar"
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormCard>
      
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Crie uma nova senha segura com pelo menos 8 caracteres, incluindo letras, números e símbolos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setPasswordDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handlePasswordChange} 
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Alterando...
                </>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
