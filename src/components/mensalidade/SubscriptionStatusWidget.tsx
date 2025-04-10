
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubscriptionStatus } from "@/types/subscription";
import { AlertTriangle } from "lucide-react";

interface SubscriptionStatusWidgetProps {
  status: SubscriptionStatus;
  trialDaysLeft?: number;
  onAction?: () => void;
}

export function SubscriptionStatusWidget({
  status,
  trialDaysLeft,
  onAction
}: SubscriptionStatusWidgetProps) {
  const getStatusContent = () => {
    switch (status) {
      case "trial":
        return {
          badge: "Período de Teste",
          variant: "secondary" as const,
          message: trialDaysLeft
            ? `${trialDaysLeft} dias restantes`
            : "Período de teste ativo",
          action: "Assinar Agora",
          showWarning: trialDaysLeft && trialDaysLeft <= 3
        };
      case "active":
        return {
          badge: "Ativo",
          variant: "default" as const,
          message: "Sua assinatura está ativa",
          action: "Gerenciar Assinatura"
        };
      case "expired":
        return {
          badge: "Expirado",
          variant: "destructive" as const,
          message: "Sua assinatura expirou",
          action: "Renovar Assinatura",
          showWarning: true
        };
      case "cancelled":
        return {
          badge: "Cancelado",
          variant: "secondary" as const,
          message: "Sua assinatura foi cancelada",
          action: "Reativar Assinatura"
        };
      default:
        return {
          badge: "Status Desconhecido",
          variant: "secondary" as const,
          message: "Verifique seu status",
          action: "Verificar Status"
        };
    }
  };

  const content = getStatusContent();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {content.showWarning && (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          )}
          <div className="flex-1">
            <Badge variant={content.variant}>{content.badge}</Badge>
            <p className="mt-1 text-sm text-muted-foreground">
              {content.message}
            </p>
          </div>
          {onAction && content.action && (
            <Button
              variant={status === "expired" ? "destructive" : "default"}
              size="sm"
              onClick={onAction}
            >
              {content.action}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
