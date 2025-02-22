
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
  BarChart
} from "lucide-react";

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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
          <Button>
            <Gift className="mr-2 h-4 w-4" />
            Criar Cupom
          </Button>
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
      <Tabs defaultValue="automacao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automacao">Automação WhatsApp</TabsTrigger>
          <TabsTrigger value="cupons">Cupons</TabsTrigger>
          <TabsTrigger value="retencao">Retenção</TabsTrigger>
          <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="automacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens Automáticas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configure suas mensagens automáticas via WhatsApp.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cupons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cupons de Desconto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gerencie seus cupons de desconto e promoções.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retencao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas de Retenção</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Crie campanhas para reativar clientes inativos.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programa de Indicações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gerencie seu programa de indicações de clientes.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analise o desempenho de suas campanhas.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
