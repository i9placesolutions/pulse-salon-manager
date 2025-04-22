import React from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, PieChart } from "@/components/ui/charts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown } from "lucide-react";
import { ExportFormat, GlobalFilters } from "@/hooks/useReportManagement";
import { ReportComponentProps } from "@/pages/Relatorios";

interface FinancialReportsProps {
  date?: {
    from: Date;
    to: Date;
  };
  filters: GlobalFilters;
  data?: Record<string, any>;
  onExport?: (format: ExportFormat) => void;
}

export function FinancialReports({ date, filters, data, onExport }: FinancialReportsProps) {
  // Utilizar dados do prop ou vazios
  const reportData = data || {};
  
  // Dados para relatórios financeiros
  const financialData = reportData.summary || {
    receitaTotal: "R$ 0,00",
    despesaTotal: "R$ 0,00",
    lucroLiquido: "R$ 0,00",
    margemLucro: "0%"
  };
  
  const detalhamentoReceitas = reportData.detalhamento || [];
  
  const comissoes = reportData.comissoes || [];
  
  const faturamentoDiario = reportData.faturamentoDiario || [];
  
  // Dados para gráficos
  const pieChartData = {
    labels: detalhamentoReceitas.map(item => item.categoria || ""),
    datasets: [
      {
        data: detalhamentoReceitas.map(item => item.valor || 0),
        backgroundColor: ["#3b82f6", "#10b981", "#f97316"]
      },
    ],
  };
  
  const barChartData = {
    labels: comissoes.map(item => item.profissional || ""),
    datasets: [
      {
        label: "Valor de Comissão (R$)",
        data: comissoes.map(item => item.valorComissao || 0),
        backgroundColor: "#3b82f6",
      },
    ],
  };
  
  const lineChartData = {
    labels: faturamentoDiario.map(item => item.dia || ""),
    datasets: [
      {
        label: "Faturamento Diário (R$)",
        data: faturamentoDiario.map(item => item.valor || 0),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  // Função para exportar relatório
  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      onExport(format);
      return;
    }
    
    // Se não houver onExport, poderia implementar um fallback aqui
    console.log("Exportando relatório financeiro em formato:", format);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Relatórios Financeiros</h2>
        <Button variant="outline" size="sm" onClick={() => handleExport("excel")} className="gap-1">
          <FileDown className="h-4 w-4" />
          Exportar
        </Button>
      </div>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Receita Total</CardTitle>
            <CardDescription>No período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.receitaTotal}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 12%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Despesa Total</CardTitle>
            <CardDescription>No período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.despesaTotal}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-red-500">↑ 5%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Lucro Líquido</CardTitle>
            <CardDescription>No período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.lucroLiquido}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 18%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Margem de Lucro</CardTitle>
            <CardDescription>No período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.margemLucro}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 3.5%</span> em relação ao período anterior
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receitas</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Faturamento Diário</CardTitle>
              <CardDescription>Evolução do faturamento no mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <LineChart data={lineChartData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento de Receitas</CardTitle>
                <CardDescription>Distribuição por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor (R$)</TableHead>
                      <TableHead>Percentual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalhamentoReceitas.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.categoria || ""}</TableCell>
                        <TableCell>{(item.valor || 0).toFixed(2)}</TableCell>
                        <TableCell>{item.percentual}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">
                        {detalhamentoReceitas.reduce((sum, item) => sum + (item.valor || 0), 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Receitas</CardTitle>
                <CardDescription>Visualização gráfica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart data={pieChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="commissions" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Comissões por Profissional</CardTitle>
                <CardDescription>Valores a pagar no período</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Atendimentos</TableHead>
                      <TableHead>Comissão (R$)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comissoes.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.profissional || ""}</TableCell>
                        <TableCell>{item.atendimentos}</TableCell>
                        <TableCell>{(item.valorComissao || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">
                        {comissoes.reduce((sum, item) => sum + item.atendimentos, 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {comissoes.reduce((sum, item) => sum + (item.valorComissao || 0), 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Comissões por Profissional</CardTitle>
                <CardDescription>Visualização gráfica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart data={barChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
