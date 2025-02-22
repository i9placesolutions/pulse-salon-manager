
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ConfigSeguranca() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Autenticação</CardTitle>
          <CardDescription>
            Configure as políticas de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de Dois Fatores</Label>
                <p className="text-sm text-muted-foreground">
                  Exigir 2FA para todos os usuários
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Senha Forte</Label>
                <p className="text-sm text-muted-foreground">
                  Exigir senhas com números, letras e caracteres especiais
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
