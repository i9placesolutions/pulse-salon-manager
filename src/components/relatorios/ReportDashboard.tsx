import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { ExportFormat, GlobalFilters } from "@/hooks/useReportManagement";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportDashboardProps {
  date?: DateRange | undefined;
  filters: GlobalFilters;
  data?: Record<string, any>;
  onExport?: (format: ExportFormat) => void;
}

export function ReportDashboard({ date, filters, data, onExport }: ReportDashboardProps) {
  // Usar dados do prop, se disponível, ou array vazio para dados
  const dashboardData = data || {};
  
  // Dados para os KPIs
  const kpiData = dashboardData.kpis || {
    faturamentoTotal: "R$ 0,00",
    clientesAtendidos: "0",
    servicosRealizados: "0",
    taxaOcupacao: "0%",
    ticketMedio: "R$ 0,00",
    novasAvaliacoes: "0"
  };

  // Dados para os gráficos
  const barChartData = dashboardData.charts?.faturamento || {
    labels: [],
    datasets: [
      {
        label: "Faturamento",
        data: [],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const lineChartData = dashboardData.charts?.novosClientes || {
    labels: [],
    datasets: [
      {
        label: "Novos Clientes",
        data: [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const pieChartData = dashboardData.charts?.servicosPopulares || {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#6b7280"
        ],
      },
    ],
  };

  // Relatórios recentes
  const recentReports = dashboardData.recentReports || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Visão Geral</h2>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport("excel")}
            className="gap-1"
          >
            <FileDown className="h-4 w-4" />
            Exportar Dashboard
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Faturamento Total</CardTitle>
            <CardDescription>No período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.faturamentoTotal}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 12%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Clientes Atendidos</CardTitle>
            <CardDescription>Total de atendimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.clientesAtendidos}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 8%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Ticket Médio</CardTitle>
            <CardDescription>Valor médio por cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.ticketMedio}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 5.2%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Taxa de Ocupação</CardTitle>
            <CardDescription>Capacidade utilizada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.taxaOcupacao}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-red-500">↓ 2%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Serviços Realizados</CardTitle>
            <CardDescription>Total de serviços</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.servicosRealizados}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 11%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Novas Avaliações</CardTitle>
            <CardDescription>Avaliações de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.novasAvaliacoes}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 15%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Relatórios Recentes</CardTitle>
            <CardDescription>Últimos relatórios gerados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center gap-4">
                  <div className="w-2 h-10 rounded-full bg-blue-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.date}</p>
                  </div>
                  <div className="rounded-full px-2 py-1 text-xs bg-slate-100">
                    {report.type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Faturamento por Mês</CardTitle>
            <CardDescription>Evolução do faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <BarChart data={barChartData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Novos Clientes</CardTitle>
            <CardDescription>Evolução mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <LineChart data={lineChartData} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Serviços Populares</CardTitle>
            <CardDescription>Distribuição por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <PieChart data={pieChartData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
