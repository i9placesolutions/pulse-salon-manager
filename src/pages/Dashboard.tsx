
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ServiceDistributionChart } from "@/components/dashboard/ServiceDistributionChart";
import { TopServicesList } from "@/components/dashboard/TopServicesList";
import { AppointmentsTable } from "@/components/dashboard/AppointmentsTable";
import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { metrics, serviceDistribution, topProducts, revenueData } from "@/data/dashboardData";
import { formatCurrency } from "@/utils/currency";

export default function Dashboard() {
  const [period, setPeriod] = useState<string>("daily");
  
  const handleExportReport = () => {
    console.log("Exportando relatório...");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <DashboardHeader onExportReport={handleExportReport} />
      
      <MetricsGrid metrics={metrics} />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Receita */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Receita x Despesas
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value)]}
                    labelStyle={{ color: '#666' }}
                  />
                  <Bar dataKey="revenue" name="Receita" fill="#dc8c95" />
                  <Bar dataKey="expenses" name="Despesas" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <ServiceDistributionChart data={serviceDistribution} />
        <TopServicesList services={topProducts} />
        <AppointmentsTable />
        <StockAlerts />
      </div>
    </div>
  );
}
