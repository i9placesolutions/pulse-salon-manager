
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Gift, 
  Users, 
  UserPlus,
  Send,
  BarChart,
  Star,
  Bell
} from "lucide-react";

import { WhatsAppConfig } from "@/components/marketing/WhatsAppConfig";
import { LoyaltyProgram } from "@/components/marketing/LoyaltyProgram";
import { MarketingReports } from "@/components/marketing/MarketingReports";

// Dados mockados para demonstração
const marketingMetrics = [
  {
    title: "Mensagens Enviadas",
    value: "1,234",
    change: 12.5,
    icon: MessageSquare,
    description: "este mês"
  },
  {
    title: "Cupons Ativos",
    value: "45",
    change: 8.2,
    icon: Gift,
    description: "em circulação"
  },
  {
    title: "Clientes Retidos",
    value: "89%",
    change: 5.3,
    icon: Users,
    description: "taxa de retenção"
  },
  {
    title: "Novas Indicações",
    value: "28",
    change: 15.8,
    icon: UserPlus,
    description: "este mês"
  },
];

export default function Marketing() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Marketing e Fidelização</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas campanhas e programas de fidelidade
          </p>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketingMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className={`mr-1 ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                </span>
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Abas de funcionalidades */}
      <Tabs defaultValue="mensagens" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mensagens">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="fidelidade">
            <Star className="h-4 w-4 mr-2" />
            Fidelidade
          </TabsTrigger>
          <TabsTrigger value="automacao">
            <Bell className="h-4 w-4 mr-2" />
            Automação
          </TabsTrigger>
          <TabsTrigger value="relatorios">
            <BarChart className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensagens">
          <WhatsAppConfig />
        </TabsContent>

        <TabsContent value="fidelidade">
          <LoyaltyProgram />
        </TabsContent>

        <TabsContent value="automacao">
          <Card>
            <CardHeader>
              <CardTitle>Automação de Mensagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Lembretes de Agendamento</h3>
                    <p className="text-sm text-muted-foreground">Envio automático de confirmações e lembretes</p>
                    <Button variant="link" className="mt-2 h-auto p-0">
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Aniversariantes</h3>
                    <p className="text-sm text-muted-foreground">Mensagens automáticas de felicitação</p>
                    <Button variant="link" className="mt-2 h-auto p-0">
                      Configurar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Recuperação</h3>
                    <p className="text-sm text-muted-foreground">Reativação de clientes inativos</p>
                    <Button variant="link" className="mt-2 h-auto p-0">
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <MarketingReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
