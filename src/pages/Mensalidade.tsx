import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Users, Calendar, MessageSquare, Download, Bell, Receipt, PackageOpen, AlertCircle } from "lucide-react";
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
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppState } from "@/contexts/AppStateContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const plans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Básico",
    description: "Ideal para iniciantes",
    price: 99.90,
    features: [
      "Até 2 profissionais",
      "Agendamento online",
      "Gestão de clientes",
      "Controle financeiro básico",
      "Até 100 agendamentos/mês"
    ],
    highlight: false,
    icon: "✂️"
  },
  {
    id: "intermediate",
    name: "Profissional",
    description: "Para salões em crescimento",
    price: 149.90,
    features: [
      "Até 5 profissionais",
      "Agendamento online",
      "Gestão de clientes",
      "Controle financeiro completo",
      "Marketing básico",
      "Relatórios essenciais",
      "Até 300 agendamentos/mês"
    ],
    highlight: true,
    icon: "💇"
  },
  {
    id: "advanced",
    name: "Empresarial",
    description: "Para negócios estabelecidos",
    price: 249.90,
    features: [
      "Até 10 profissionais",
      "Agendamento online e app",
      "Gestão avançada de clientes",
      "Controle financeiro completo",
      "Marketing avançado",
      "Relatórios completos",
      "Integração com outras plataformas",
      "Agendamentos ilimitados"
    ],
    highlight: false,
    icon: "💅"
  },
  {
    id: "premium",
    name: "Premium",
    description: "Solução completa para redes",
    price: 399.90,
    features: [
      "Profissionais ilimitados",
      "Gestão de múltiplas unidades",
      "Agendamento online e app personalizado",
      "Gestão avançada de clientes",
      "Controle financeiro avançado",
      "Marketing automatizado",
      "Relatórios personalizados",
      "API para integrações",
      "Suporte prioritário"
    ],
    highlight: false,
    icon: "👑"
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
  const navigate = useNavigate();
  const { profileState, updateSubscriptionStatus } = useAppState();
  
  const isTrialExpired = () => {
    if (!profileState.trialEndsAt) return false;
    
    const today = new Date();
    return today > profileState.trialEndsAt;
  };
  
  const getTrialDaysLeft = () => {
    if (!profileState.trialEndsAt) return 0;
    
    const today = new Date();
    const trialEnd = new Date(profileState.trialEndsAt);
    
    if (today > trialEnd) return 0;
    
    const diffTime = trialEnd.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  useEffect(() => {
    if (isTrialExpired() && !profileState.subscriptionActive) {
      setSelectedTab("plans");
    }
  }, [profileState.trialEndsAt, profileState.subscriptionActive]);

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
    
    updateSubscriptionStatus(true);
    
    toast({
      title: "Assinatura confirmada",
      description: "Sua assinatura foi confirmada com sucesso!",
    });
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const handleCancelSubscription = (reason: string) => {
    console.log("Cancelamento - motivo:", reason);
    setCancelDialogOpen(false);
    
    updateSubscriptionStatus(false);
    
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
    <PageLayout variant="blue">
      <PageHeader 
        title="Mensalidade" 
        subtitle="Gerencie sua assinatura e pagamentos"
        variant="blue"
        badge="Assinatura"
        action={
          <SubscriptionStatusWidget
            status={profileState.subscriptionActive ? "active" : (isTrialExpired() ? "expired" : "trial")}
            trialDaysLeft={getTrialDaysLeft()}
            onAction={() => setSelectedTab("plans")}
          />
        }
      />
      
      {isTrialExpired() && !profileState.subscriptionActive && (
        <Alert variant="destructive" className="mb-4 border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Seu período de teste expirou!</AlertTitle>
          <AlertDescription>
            Para continuar utilizando o sistema, escolha um plano abaixo.
            Você não poderá acessar outras funcionalidades até adquirir uma assinatura.
          </AlertDescription>
        </Alert>
      )}
      
      {!isTrialExpired() && getTrialDaysLeft() <= 3 && getTrialDaysLeft() > 0 && !profileState.subscriptionActive && (
        <Alert variant="warning" className="mb-4 border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Seu período de teste está acabando!</AlertTitle>
          <AlertDescription>
            Restam apenas {getTrialDaysLeft()} dias de teste. 
            Para evitar interrupções, escolha um plano antes do término do período.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="flex w-full h-10 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-xl overflow-hidden">
          <TabsTrigger 
            value="plans" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
            disabled={isTrialExpired() && !profileState.subscriptionActive}
          >
            <PackageOpen className="h-4 w-4" />
            <span className="font-medium">Planos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="subscription" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
            disabled={isTrialExpired() && !profileState.subscriptionActive}
          >
            <CreditCard className="h-4 w-4" />
            <span className="font-medium">Minha Assinatura</span>
          </TabsTrigger>
          <TabsTrigger 
            value="invoices" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
            disabled={isTrialExpired() && !profileState.subscriptionActive}
          >
            <Receipt className="h-4 w-4" />
            <span className="font-medium">Faturas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
            disabled={isTrialExpired() && !profileState.subscriptionActive}
          >
            <Bell className="h-4 w-4" />
            <span className="font-medium">Notificações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative overflow-hidden border-blue-100 ${plan.highlight ? 'border-blue-500 shadow-md' : ''} hover:shadow-lg transition-all duration-300`}>
                {plan.highlight && (
                  <span className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                    RECOMENDADO
                  </span>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className={`text-xl ${
                        plan.id === 'basic' ? 'text-blue-700' : 
                        plan.id === 'intermediate' ? 'text-indigo-700' : 
                        plan.id === 'advanced' ? 'text-purple-700' : 
                        'text-amber-700'
                      }`}>
                        {plan.icon} {plan.name}
                      </CardTitle>
                      <CardDescription className={`${
                        plan.id === 'basic' ? 'text-blue-600/70' : 
                        plan.id === 'intermediate' ? 'text-indigo-600/70' : 
                        plan.id === 'advanced' ? 'text-purple-600/70' : 
                        'text-amber-600/70'
                      }`}>{plan.description}</CardDescription>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`text-3xl font-bold ${
                      plan.id === 'basic' ? 'text-blue-700' : 
                      plan.id === 'intermediate' ? 'text-indigo-700' : 
                      plan.id === 'advanced' ? 'text-purple-700' : 
                      'text-amber-700'
                    }`}>
                      {formatCurrency(plan.price)}
                    </span>
                    <span className={`${
                      plan.id === 'basic' ? 'text-blue-600/70' : 
                      plan.id === 'intermediate' ? 'text-indigo-600/70' : 
                      plan.id === 'advanced' ? 'text-purple-600/70' : 
                      'text-amber-600/70'
                    }`}>/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className={`h-4 w-4 ${
                          plan.id === 'basic' ? 'text-blue-600' : 
                          plan.id === 'intermediate' ? 'text-indigo-600' : 
                          plan.id === 'advanced' ? 'text-purple-600' : 
                          'text-amber-600'
                        }`} />
                        <span className={`text-sm ${
                          plan.id === 'basic' ? 'text-blue-700' : 
                          plan.id === 'intermediate' ? 'text-indigo-700' : 
                          plan.id === 'advanced' ? 'text-purple-700' : 
                          'text-amber-700'
                        }`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full shadow-sm hover:shadow-md ${
                      plan.id === 'basic' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0' : 
                      plan.id === 'intermediate' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0' : 
                      plan.id === 'advanced' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white border-0' : 
                      'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0'
                    }`}
                    variant={plan.highlight ? "dashboard" : "dashboard-outline"}
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
            <div className="overflow-hidden rounded-lg border border-emerald-100 shadow-md">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>
              <CurrentPlanDetails
                subscription={mockSubscription}
                plan={plans.find(p => p.id === mockSubscription.planId)!}
                onRenewChange={handleAutoRenewChange}
                onCancelSubscription={() => setCancelDialogOpen(true)}
              />
            </div>
            <div className="overflow-hidden rounded-lg border border-blue-100 shadow-md">
              <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
              <PaymentMethodForm onSubmit={handlePaymentSubmit} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="overflow-hidden rounded-lg border border-amber-100 shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500"></div>
            <PaymentHistory invoices={mockInvoices} />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="overflow-hidden rounded-lg border border-purple-100 shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500"></div>
            <NotificationPreferences
              preferences={notificationPrefs}
              onPreferenceChange={handleNotificationPreferenceChange}
            />
          </div>
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
    </PageLayout>
  );
}
