import React from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileDown } from "lucide-react";
import { ExportFormat, GlobalFilters } from "@/hooks/useReportManagement";
import { ReportComponentProps } from "@/pages/Relatorios";

interface MarketingReportsProps {
  date?: {
    from: Date;
    to: Date;
  };
  filters: GlobalFilters;
  data?: Record<string, any>;
  onExport?: (format: ExportFormat) => void;
}

export function MarketingReports({ date, filters, data, onExport }: MarketingReportsProps) {
  // Utilizar dados do prop ou vazios
  const reportData = data || {};
  
  // Dados para relatórios de marketing
  const campaignData = reportData.campaigns || [];
  
  const channelData = reportData.channelPerformance || [];
  
  const loyaltyData = reportData.promotions || [];
  
  // Dados para gráficos
  const campaignChartData = {
    labels: campaignData.map(item => (item.nome || '').split(' ').slice(0, 2).join(' ')),
    datasets: [
      {
        label: "ROI (%)",
        data: campaignData.map(item => item.roi || 0),
        backgroundColor: ["#3b82f6", "#10b981", "#f97316", "#a855f7", "#ef4444"],
      },
    ],
  };
  
  const channelChartData = {
    labels: channelData.map(item => item.canal || ""),
    datasets: [
      {
        data: channelData.map(item => item.engajamento || item.percentual || 0),
        backgroundColor: ["#3b82f6", "#10b981", "#f97316", "#a855f7", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };
  
  const loyaltyChartData = {
    labels: loyaltyData.map(item => item.promocao || item.faixa || ''),
    datasets: [
      {
        data: loyaltyData.map(item => item.taxaConversao || item.percentual || 0),
        backgroundColor: ["#3b82f6", "#10b981", "#f97316", "#a855f7"],
        borderWidth: 0,
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
    console.log("Exportando relatório de marketing em formato:", format);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Relatórios de Marketing</h2>
        <Button variant="outline" size="sm" onClick={() => handleExport("excel")} className="gap-1">
          <FileDown className="h-4 w-4" />
          Exportar
        </Button>
      </div>
      
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="loyalty">Fidelização</TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance de Campanhas</CardTitle>
                <CardDescription>Análise de resultados das campanhas de marketing</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Investimento (R$)</TableHead>
                      <TableHead>Novas Clientes</TableHead>
                      <TableHead>Agendamentos</TableHead>
                      <TableHead>ROI (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignData.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.investimento?.toFixed ? item.investimento.toFixed(2) : item.investimento}</TableCell>
                        <TableCell>{item.novosClientes}</TableCell>
                        <TableCell>{item.agendamentos || item.receita}</TableCell>
                        <TableCell>
                          <Badge variant={item.roi > 10 ? "default" : item.roi > 5 ? "outline" : "destructive"}>
                            {item.roi}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">
                        {campaignData.reduce((sum, item) => sum + (item.investimento || 0), 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {campaignData.reduce((sum, item) => sum + (item.novosClientes || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {campaignData.reduce((sum, item) => sum + (item.agendamentos || item.receita || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {campaignData.length > 0 
                          ? (campaignData.reduce((sum, item) => sum + (parseFloat(item.roi) || 0), 0) / campaignData.length).toFixed(1) 
                          : 0}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>ROI por Campanha</CardTitle>
                <CardDescription>Retorno sobre investimento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart data={campaignChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="channels" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Canais de Captação</CardTitle>
                <CardDescription>Origem das novas clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Canal</TableHead>
                      <TableHead>Clientes</TableHead>
                      <TableHead>Percentual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channelData.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.canal}</TableCell>
                        <TableCell>{item.clientes || item.seguidores || 0}</TableCell>
                        <TableCell>{(item.percentual || item.engajamento || 0).toString()}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">
                        {channelData.reduce((sum, item) => sum + (parseInt(item.clientes) || parseInt(item.seguidores) || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Canal</CardTitle>
                <CardDescription>Participação percentual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart data={channelChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="loyalty" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fidelização de Clientes</CardTitle>
                <CardDescription>Segmentação por frequência</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa</TableHead>
                      <TableHead>Clientes</TableHead>
                      <TableHead>Percentual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loyaltyData.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.faixa || item.promocao || ''}</TableCell>
                        <TableCell>{item.clientes || item.cuponsEmitidos || 0}</TableCell>
                        <TableCell>{(item.percentual || item.taxaConversao || 0).toString()}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">
                        {loyaltyData.reduce((sum, item) => sum + (parseInt(item.clientes) || parseInt(item.cuponsEmitidos) || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Clientes</CardTitle>
                <CardDescription>Por frequência de visitas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart data={loyaltyChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
