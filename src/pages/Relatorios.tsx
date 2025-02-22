
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Calendar, Users, UserCheck, Package } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { RevenueChart } from "@/components/financeiro/RevenueChart";

// Dados mockados para demonstração
const salesData = [
  { date: "01/03", revenue: 3200, expenses: 1800, services: 28, clients: 22 },
  { date: "02/03", revenue: 2800, expenses: 1600, services: 24, clients: 20 },
  { date: "03/03", revenue: 3600, expenses: 2000, services: 32, clients: 25 },
  { date: "04/03", revenue: 4200, expenses: 2200, services: 38, clients: 30 },
  { date: "05/03", revenue: 3800, expenses: 1900, services: 34, clients: 28 },
  { date: "06/03", revenue: 4500, expenses: 2400, services: 40, clients: 32 },
  { date: "07/03", revenue: 5000, expenses: 2600, services: 45, clients: 36 },
];

const metrics = [
  {
    title: "Faturamento do Mês",
    value: formatCurrency(27100),
    change: 12.5,
    icon: FileText,
    description: "vs. mês anterior"
  },
  {
    title: "Atendimentos",
    value: "241",
    change: 8.2,
    icon: Calendar,
    description: "neste mês"
  },
  {
    title: "Clientes Atendidos",
    value: "193",
    change: 5.3,
    icon: Users,
    description: "clientes únicos"
  },
  {
    title: "Novos Clientes",
    value: "28",
    change: -2.1,
    icon: UserCheck,
    description: "este mês"
  },
];

export default function Relatorios() {
  const [period, setPeriod] = useState("daily");

  const handleExport = () => {
    // Implementar exportação de relatórios
    console.log("Exportando relatório...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o desempenho do seu negócio
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
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

      {/* Gráficos e tabelas */}
      <Tabs defaultValue="financeiro" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-4">
          <RevenueChart data={salesData} period={period} setPeriod={setPeriod} />
        </TabsContent>

        <TabsContent value="atendimentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profissionais" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Profissionais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
