
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail } from "lucide-react";

interface NotificationPreferencesProps {
  preferences: {
    email: boolean;
    push: boolean;
    paymentReminders: boolean;
    trialEnding: boolean;
    newsAndUpdates: boolean;
  };
  onPreferenceChange: (key: keyof NotificationPreferencesProps['preferences'], value: boolean) => void;
}

export function NotificationPreferences({
  preferences,
  onPreferenceChange
}: NotificationPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Notificação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <div className="space-y-0.5">
                <Label htmlFor="email">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber atualizações importantes por email
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.email}
              onCheckedChange={(checked) => onPreferenceChange('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <div className="space-y-0.5">
                <Label htmlFor="push">Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações no navegador
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.push}
              onCheckedChange={(checked) => onPreferenceChange('push', checked)}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="paymentReminders">Lembretes de Pagamento</Label>
              <p className="text-sm text-muted-foreground">
                Receber lembretes antes do vencimento
              </p>
            </div>
            <Switch
              id="paymentReminders"
              checked={preferences.paymentReminders}
              onCheckedChange={(checked) => onPreferenceChange('paymentReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="trialEnding">Fim do Período de Teste</Label>
              <p className="text-sm text-muted-foreground">
                Ser notificado quando o período de teste estiver acabando
              </p>
            </div>
            <Switch
              id="trialEnding"
              checked={preferences.trialEnding}
              onCheckedChange={(checked) => onPreferenceChange('trialEnding', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsAndUpdates">Novidades e Atualizações</Label>
              <p className="text-sm text-muted-foreground">
                Receber informações sobre novos recursos
              </p>
            </div>
            <Switch
              id="newsAndUpdates"
              checked={preferences.newsAndUpdates}
              onCheckedChange={(checked) => onPreferenceChange('newsAndUpdates', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
