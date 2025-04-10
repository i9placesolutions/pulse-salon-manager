
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreditCard, Users, Calendar, MessageSquare } from "lucide-react";
import { SubscriptionDetails, SubscriptionPlan } from "@/types/subscription";
import { formatCurrency } from "@/utils/currency";

interface CurrentPlanDetailsProps {
  subscription: SubscriptionDetails;
  plan: SubscriptionPlan;
  onRenewChange: (autoRenew: boolean) => void;
  onCancelSubscription: () => void;
}

export function CurrentPlanDetails({
  subscription,
  plan,
  onRenewChange,
  onCancelSubscription
}: CurrentPlanDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Plano Atual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plano</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{plan.name}</span>
              <Badge variant="secondary">{subscription.status}</Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Valor Mensal</span>
            <span>{formatCurrency(plan.price)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Início da Assinatura</span>
            <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Próximo Pagamento</span>
            <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Método de Pagamento</span>
            <span className="capitalize">{subscription.paymentMethod.replace("_", " ")}</span>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Usuários</span>
                </div>
                <span className="text-sm">
                  {plan.maxUsers === Infinity ? "Ilimitado" : `${plan.maxUsers} usuários`}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Agendamentos</span>
                </div>
                <span className="text-sm">
                  {plan.maxAppointments === "unlimited" ? "Ilimitado" : `${plan.maxAppointments}/mês`}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Suporte</span>
                </div>
                <span className="text-sm capitalize">{plan.supportType}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoRenew">Renovação Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Sua assinatura será renovada automaticamente
                </p>
              </div>
              <Switch
                id="autoRenew"
                checked={subscription.autoRenew}
                onCheckedChange={onRenewChange}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onCancelSubscription()}
          >
            Cancelar Assinatura
          </Button>
          <Button variant="outline" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Atualizar Método de Pagamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
