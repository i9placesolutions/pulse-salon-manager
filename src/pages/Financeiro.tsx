
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { DollarSign, Download, Calendar, Users, CreditCard, QrCode, FileText } from "lucide-react";

// Mock data - Replace with real data from your backend
const revenueData = [
  { date: "01/03", revenue: 1200 },
  { date: "02/03", revenue: 1800 },
  { date: "03/03", revenue: 1400 },
  { date: "04/03", revenue: 2200 },
  { date: "05/03", revenue: 1600 },
  { date: "06/03", revenue: 2400 },
  { date: "07/03", revenue: 2800 },
];

const payments = [
  { id: 1, client: "João Silva", service: "Corte + Barba", value: 80, method: "Pix", date: "2024-03-07" },
  { id: 2, client: "Maria Santos", service: "Hidratação", value: 150, method: "Cartão", date: "2024-03-07" },
  { id: 3, client: "Pedro Costa", service: "Corte", value: 50, method: "Dinheiro", date: "2024-03-06" },
];

const professionals = [
  { id: 1, name: "Ana Silva", commission: 1200, services: 24 },
  { id: 2, name: "Carlos Santos", commission: 980, services: 18 },
  { id: 3, name: "Maria Oliveira", commission: 1450, services: 29 },
];

const Financeiro = () => {
  const [period, setPeriod] = useState("daily");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-neutral">Gestão Financeira</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Hoje
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(2890)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Mensal
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(45980)}</div>
            <p className="text-xs text-muted-foreground">
              +12.3% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comissões a Pagar
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(3630)}</div>
            <p className="text-xs text-muted-foreground">
              3 profissionais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(93.50)}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Faturamento</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={period === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("daily")}
            >
              Diário
            </Button>
            <Button
              variant={period === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("weekly")}
            >
              Semanal
            </Button>
            <Button
              variant={period === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("monthly")}
            >
              Mensal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
                  labelStyle={{ color: '#666' }}
                />
                <Bar dataKey="revenue" fill="#dc8c95" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Payments and Commissions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pagamentos Recentes</CardTitle>
              <CardDescription>Últimos pagamentos recebidos</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{payment.client}</p>
                    <p className="text-sm text-muted-foreground">{payment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(payment.value)}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {payment.method === "Pix" && <QrCode className="h-3 w-3" />}
                      {payment.method === "Cartão" && <CreditCard className="h-3 w-3" />}
                      {payment.method === "Boleto" && <FileText className="h-3 w-3" />}
                      {payment.method}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Professional Commissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Comissões</CardTitle>
              <CardDescription>Comissões dos profissionais</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {professionals.map((professional) => (
                <div
                  key={professional.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{professional.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {professional.services} serviços realizados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(professional.commission)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      a receber
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Financeiro;
