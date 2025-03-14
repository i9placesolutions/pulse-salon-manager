import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Users, Calendar, MessageSquare, Download } from "lucide-react";
import { PaymentMethodForm } from "@/components/mensalidade/PaymentMethodForm";
import { SubscriptionConfirmDialog } from "@/components/mensalidade/SubscriptionConfirmDialog";
import { CurrentPlanDetails } from "@/components/mensalidade/CurrentPlanDetails";
import { CancelSubscriptionDialog } from "@/components/mensalidade/CancelSubscriptionDialog";
import { PaymentHistory } from "@/components/mensalidade/PaymentHistory";
import { NotificationPreferences } from "@/components/mensalidade/NotificationPreferences";
import { SubscriptionStatusWidget } from "@/components/mensalidade/SubscriptionStatusWidget";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";
import { SubscriptionPlan, SubscriptionStatus, PaymentMethod, Invoice } from "@/types/subscription";

const plans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Básico",
    price: 99.90,
    icon: "🟢",
    description: "Ideal para profissionais autônomos",
    features: [
      "1 usuário",
      "100 agendamentos/mês",
      "Suporte via e-mail",
      "Backup diário",
      "Segurança avançada",
      "Atualizações automáticas"
    ],
    maxUsers: 1,
    maxAppointments: 100,
    supportType: "email"
  },
  {
    id: "intermediate",
    name: "Intermediário",
    price: 149.90,
    icon: "🔵",
    description: "Perfeito para pequenos salões",
    features: [
      "3 usuários",
      "300 agendamentos/mês",
      "Suporte via chat e WhatsApp",
      "Backup diário",
      "Segurança avançada",
      "Atualizações automáticas"
    ],
    maxUsers: 3,
    maxAppointments: 300,
    supportType: "chat",
    highlight: true
  },
  {
    id: "advanced",
    name: "Avançado",
    price: 249.90,
    icon: "🟣",
    description: "Para salões em crescimento",
    features: [
      "Usuários ilimitados",
      "Agendamentos ilimitados",
      "Integração com WhatsApp API",
      "Backup diário",
      "Segurança avançada",
      "Atualizações automáticas"
    ],
    maxUsers: Infinity,
    maxAppointments: "unlimited",
    supportType: "priority"
  },
  {
    id: "premium",
    name: "Premium",
    price: 399.90,
    icon: "🔥",
    description: "Solução completa para grandes salões",
    features: [
      "Todos os recursos do Avançado",
      "Automação total",
      "Relatórios premium",
      "Suporte VIP 24/7",
      "Backup diário",
      "Segurança avançada",
      "Atualizações automáticas"
    ],
    maxUsers: Infinity,
    maxAppointments: "unlimited",
    supportType: "vip"
  }
];

const mockInvoices: Invoice[] = [
  {
    id: "1",
    date: "2024-03-01",
    dueDate: "2024-03-10",
    amount: 99.90,
    status: "paid",
    paymentMethod: "credit_card",
    downloadUrl: "#"
  },
  {
    id: "2",
    date: "2024-02-01",
    dueDate: "2024-02-10",
    amount: 99.90,
    status: "paid",
    paymentMethod: "credit_card",
    downloadUrl: "#"
  },
  {
    id: "3",
    date: "2024-01-01",
    dueDate: "2024-01-10",
    amount: 99.90,
    status: "paid",
    paymentMethod: "credit_card",
    downloadUrl: "#"
  }
];

const mockSubscription = {
  id: "1",
  planId: "basic",
  status: "trial" as SubscriptionStatus,
  startDate: "2024-03-01",
  endDate: "2024-04-01",
  trialEndsAt: "2024-03-15",
  paymentMethod: "credit_card" as PaymentMethod,
  autoRenew: true,
  lastPayment: {
    date: "2024-03-01",
    amount: 99.90,
    status: "success" as const
  }
};

const mockNotificationPreferences = {
  email: true,
  push: false,
  paymentReminders: true,
  trialEnding: true,
  newsAndUpdates: false
};

export default function Mensalidade() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState(mockNotificationPreferences);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setConfirmDialogOpen(true);
  };

  const handlePaymentSubmit = (data: { method: PaymentMethod; [key: string]: any }) => {
    console.log("Payment data:", data);
    toast({
      title: "Pagamento processado",
      description: "Seu pagamento está sendo processado.",
    });
  };

  const handleSubscriptionConfirm = () => {
    setConfirmDialogOpen(false);
    toast({
      title: "Assinatura confirmada",
      description: "Sua assinatura foi confirmada com sucesso!",
    });
  };

  const handleCancelSubscription = (reason: string) => {
    console.log("Cancelamento - motivo:", reason);
    setCancelDialogOpen(false);
    toast({
      title: "Assinatura cancelada",
      description: "Sua assinatura foi cancelada com sucesso.",
      variant: "destructive",
    });
  };

  const handleAutoRenewChange = (autoRenew: boolean) => {
    console.log("Auto renovação:", autoRenew);
    toast({
      title: "Preferência atualizada",
      description: autoRenew 
        ? "Renovação automática ativada"
        : "Renovação automática desativada",
    });
  };

  const handleNotificationPreferenceChange = (
    key: keyof typeof notificationPrefs,
    value: boolean
  ) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: value }));
    toast({
      title: "Preferências atualizadas",
      description: "Suas preferências de notificação foram atualizadas.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Mensalidade</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua assinatura e pagamentos
          </p>
        </div>
        
        <SubscriptionStatusWidget
          status={mockSubscription.status}
          trialDaysLeft={3}
          onAction={() => setSelectedTab("plans")}
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="subscription">Minha Assinatura</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.highlight ? 'border-primary' : ''}`}>
                {plan.highlight && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-primary">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {plan.icon} {plan.name}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    Assinar Plano {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="grid gap-4 md:grid-cols-2">
            <CurrentPlanDetails
              subscription={mockSubscription}
              plan={plans.find(p => p.id === mockSubscription.planId)!}
              onRenewChange={handleAutoRenewChange}
              onCancelSubscription={() => setCancelDialogOpen(true)}
            />
            <PaymentMethodForm onSubmit={handlePaymentSubmit} />
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <PaymentHistory invoices={mockInvoices} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationPreferences
            preferences={notificationPrefs}
            onPreferenceChange={handleNotificationPreferenceChange}
          />
        </TabsContent>
      </Tabs>

      {selectedPlan && (
        <SubscriptionConfirmDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          plan={selectedPlan}
          onConfirm={handleSubscriptionConfirm}
        />
      )}

      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelSubscription}
      />
    </div>
  );
}
