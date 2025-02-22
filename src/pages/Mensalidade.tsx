
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Users, 
  Calendar, 
  MessageSquare, 
  Check, 
  Download,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { SubscriptionPlan, SubscriptionStatus } from "@/types/subscription";

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

// Mock data - substituir pela integração real depois
const subscriptionStatus: SubscriptionStatus = "trial";
const trialDaysLeft = 3;

export default function Mensalidade() {
  const [selectedTab, setSelectedTab] = useState("plans");

  const showTrialWarning = subscriptionStatus === "trial" && trialDaysLeft <= 3;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Mensalidade</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua assinatura e pagamentos
          </p>
        </div>
        
        {showTrialWarning && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="flex items-center gap-2 py-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Seu período de teste expira em {trialDaysLeft} dias
              </span>
              <Button size="sm" variant="default" className="ml-4">
                Assinar Agora
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="subscription">Minha Assinatura</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
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
                  <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                    Assinar Plano {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status da Assinatura</CardTitle>
                <CardDescription>Detalhes do seu plano atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plano Atual</span>
                    <Badge>Período de Teste</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Expira em</span>
                    <span className="text-sm">3 dias</span>
                  </div>
                  <Button className="mt-4">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Atualizar Método de Pagamento
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limites do Plano</CardTitle>
                <CardDescription>Uso atual dos recursos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Usuários</span>
                    </div>
                    <span className="text-sm">1 de 1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Agendamentos</span>
                    </div>
                    <span className="text-sm">50 de 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">Suporte</span>
                    </div>
                    <span className="text-sm">E-mail</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Faturas</CardTitle>
              <CardDescription>Todas as suas faturas e pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { data: '01/03/2024', valor: 99.90, status: 'Pago' },
                  { data: '01/02/2024', valor: 99.90, status: 'Pago' },
                  { data: '01/01/2024', valor: 99.90, status: 'Pago' }
                ].map((fatura, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{fatura.data}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(fatura.valor)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{fatura.status}</Badge>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
