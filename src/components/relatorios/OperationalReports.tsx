import React from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExportFormat, GlobalFilters } from "@/hooks/useReportManagement";
import { useState } from "react";

interface OperationalReportsProps {
  date?: {
    from: Date;
    to: Date;
  };
  filters: GlobalFilters;
  data?: Record<string, any>;
  onExport?: (format: ExportFormat) => void;
}

export function OperationalReports({ date, filters, data, onExport }: OperationalReportsProps) {
  // Utilizar dados do prop ou arrays vazios
  const reportData = data || {};
  
  // Dados para relatórios operacionais
  const appointmentsData = reportData.appointments || [];
  
  const professionalEfficiency = reportData.professionalEfficiency || [];
  
  const servicePerformance = reportData.servicePerformance || [];
  
  // Dados para gráficos
  const appointmentsChartData = {
    labels: appointmentsData.map(item => item.dia || ""),
    datasets: [
      {
        label: "Agendados",
        data: appointmentsData.map(item => item.agendados || 0),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Realizados",
        data: appointmentsData.map(item => item.realizados || 0),
        backgroundColor: "#10b981",
      },
      {
        label: "Cancelados",
        data: appointmentsData.map(item => item.cancelados || 0),
        backgroundColor: "#f97316",
      }
    ],
  };
  
  const occupationRateData = {
    labels: appointmentsData.map(item => item.dia || ""),
    datasets: [
      {
        label: "Taxa de Ocupação (%)",
        data: appointmentsData.map(item => item.taxaOcupacao || 0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      }
    ],
  };
  
  const professionalRatingData = {
    labels: professionalEfficiency.map(item => item.profissional || ""),
    datasets: [
      {
        label: "Avaliação Média",
        data: professionalEfficiency.map(item => item.avaliacao || 0),
        backgroundColor: ["#3b82f6", "#10b981", "#f97316", "#a855f7", "#ec4899"],
        borderWidth: 0,
      }
    ],
  };
  
  // Função para exportar relatório
  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      onExport(format);
      return;
    }
    
    // Se não houver onExport, poderia implementar um fallback aqui
    console.log("Exportando relatório operacional em formato:", format);
  };
  
  const [reportType, setReportType] = useState("appointments");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Relatórios Operacionais</h2>
        <Button variant="outline" size="sm" onClick={() => handleExport("excel")} className="gap-1">
          <FileDown className="h-4 w-4" />
          Exportar
        </Button>
      </div>
      
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="professionals">Profissionais</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos por Dia</CardTitle>
                <CardDescription>Comparativo de agendados, realizados e cancelados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart data={appointmentsChartData} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Ocupação</CardTitle>
                <CardDescription>Percentual de ocupação por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <LineChart data={occupationRateData} />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Agendamentos</CardTitle>
              <CardDescription>Dados por dia da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dia</TableHead>
                    <TableHead>Agendados</TableHead>
                    <TableHead>Realizados</TableHead>
                    <TableHead>Cancelados</TableHead>
                    <TableHead>Taxa de Ocupação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointmentsData.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.dia || ""}</TableCell>
                      <TableCell>{item.agendados || 0}</TableCell>
                      <TableCell>{item.realizados || 0}</TableCell>
                      <TableCell>{item.cancelados || 0}</TableCell>
                      <TableCell>{item.taxaOcupacao || 0}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="font-bold">
                      {appointmentsData.reduce((sum, item) => sum + (item.agendados || 0), 0)}
                    </TableCell>
                    <TableCell className="font-bold">
                      {appointmentsData.reduce((sum, item) => sum + (item.realizados || 0), 0)}
                    </TableCell>
                    <TableCell className="font-bold">
                      {appointmentsData.reduce((sum, item) => sum + (item.cancelados || 0), 0)}
                    </TableCell>
                    <TableCell className="font-bold">
                      {Math.round(
                        appointmentsData.reduce((sum, item) => sum + (item.taxaOcupacao || 0), 0) / appointmentsData.length
                      )}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="professionals" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Eficiência dos Profissionais</CardTitle>
                <CardDescription>Análise de desempenho</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Atendimentos</TableHead>
                      <TableHead>Duração Média (min)</TableHead>
                      <TableHead>Avaliação Média</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professionalEfficiency.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.profissional || ""}</TableCell>
                        <TableCell>{item.atendimentos || 0}</TableCell>
                        <TableCell>{item.duracaoMedia || 0}</TableCell>
                        <TableCell>{item.avaliacao || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Avaliação dos Profissionais</CardTitle>
                <CardDescription>Satisfação dos clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart data={professionalRatingData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Serviço</CardTitle>
              <CardDescription>Análise detalhada por serviço</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Tempo Médio (min)</TableHead>
                    <TableHead>Valor Médio (R$)</TableHead>
                    <TableHead>Faturamento Total (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicePerformance.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.servico || ""}</TableCell>
                      <TableCell>{item.quantidade || 0}</TableCell>
                      <TableCell>{item.tempoMedio || 0}</TableCell>
                      <TableCell>{(item.valorMedio || 0).toFixed(2)}</TableCell>
                      <TableCell>{((item.quantidade || 0) * (item.valorMedio || 0)).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="font-bold">
                      {servicePerformance.reduce((sum, item) => sum + (item.quantidade || 0), 0)}
                    </TableCell>
                    <TableCell className="font-bold">
                      {Math.round(
                        servicePerformance.reduce((sum, item) => sum + (item.tempoMedio || 0), 0) / servicePerformance.length
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      {(
                        servicePerformance.reduce((sum, item) => sum + (item.valorMedio || 0), 0) / servicePerformance.length
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold">
                      {servicePerformance
                        .reduce((sum, item) => sum + (item.quantidade || 0) * (item.valorMedio || 0), 0)
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
