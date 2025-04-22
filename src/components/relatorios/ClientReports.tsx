import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { exportData } from "@/utils/export";
import { FileDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExportFormat, GlobalFilters } from "@/hooks/useReportManagement";

interface ClientReportsProps {
  date?: {
    from: Date;
    to: Date;
  };
  filters: GlobalFilters;
  data?: Record<string, any>;
  onExport?: (format: ExportFormat) => void;
}

export function ClientReports({ date, filters, data, onExport }: ClientReportsProps) {
  const [reportType, setReportType] = useState("perfil");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Utilizar dados do prop ou arrays vazios
  const reportData = data || {};
  
  console.log("Dados recebidos na aba Clientes:", reportData);
  
  // Dados para o relatório de perfil demográfico
  const clientProfileData = reportData.clientProfileData || [];
  
  // Dados para o gráfico de perfil de clientes
  const clientProfileChartData = {
    labels: clientProfileData.map(item => item.faixaEtaria || ""),
    datasets: [
      {
        data: clientProfileData.map(item => item.quantidade || 0),
        backgroundColor: [
          "#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#6b7280"
        ],
      },
    ],
  };
  
  // Dados para o relatório de frequência
  const frequencyData = reportData.frequencyData || [];
  
  // Dados para o gráfico de frequência
  const frequencyChartData = {
    labels: frequencyData.map(item => item.categoria || ""),
    datasets: [
      {
        label: "Quantidade de Clientes",
        data: frequencyData.map(item => item.quantidade || 0),
        backgroundColor: "#3b82f6",
      },
    ],
  };
  
  // Dados para o relatório de retenção
  const retentionData = reportData.retentionData || [];
  
  // Dados para o gráfico de retenção
  const retentionChartData = {
    labels: retentionData.map(item => item.mes || ""),
    datasets: [
      {
        label: "Taxa de Retenção (%)",
        data: retentionData.map(item => item.taxa || 0),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  // Dados para o relatório de ticket médio
  const ticketData = reportData.ticketData || [];
  
  // Filtragem de dados com base no termo de pesquisa
  const filteredTicketData = ticketData.filter(
    item => item && item.cliente && item.cliente.toLowerCase().includes((searchTerm || '').toLowerCase())
  );
  
  // Função para exportar relatório atual
  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      onExport(format);
      return;
    }
    
    // Fallback para exportação local se onExport não for fornecido
    let data = [];
    let filename = "";
    
    if (reportType === "perfil") {
      data = clientProfileData;
      filename = "relatorio_perfil_clientes";
    } else if (reportType === "frequencia") {
      data = frequencyData;
      filename = "relatorio_frequencia_clientes";
    } else if (reportType === "retencao") {
      data = retentionData;
      filename = "relatorio_retencao_clientes";
    } else if (reportType === "ticket") {
      data = ticketData;
      filename = "relatorio_ticket_medio_clientes";
    }
    
    exportData(data, format, filename);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="perfil" value={reportType} onValueChange={setReportType} className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="perfil">Perfil Demográfico</TabsTrigger>
            <TabsTrigger value="frequencia">Frequência</TabsTrigger>
            <TabsTrigger value="retencao">Retenção</TabsTrigger>
            <TabsTrigger value="ticket">Ticket Médio</TabsTrigger>
          </TabsList>
        
          <Button variant="outline" size="sm" onClick={() => handleExport("excel")} className="gap-1 mt-4 float-right">
            <FileDown className="h-4 w-4" />
            Exportar
          </Button>
        
          <TabsContent value="perfil" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Perfil Demográfico</CardTitle>
                  <CardDescription>Distribuição por faixa etária</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faixa Etária</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Percentual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientProfileData.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.faixaEtaria || ""}</TableCell>
                          <TableCell>{item.quantidade || 0}</TableCell>
                          <TableCell>{item.percentual || 0}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-bold">Total</TableCell>
                        <TableCell className="font-bold">
                          {clientProfileData.reduce((sum, item) => sum + (item.quantidade || 0), 0)}
                        </TableCell>
                        <TableCell className="font-bold">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Faixa Etária</CardTitle>
                  <CardDescription>Visualização gráfica</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <PieChart data={clientProfileChartData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        
          <TabsContent value="frequencia" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Frequência de Visitas</CardTitle>
                  <CardDescription>Categorização de clientes por frequência</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Percentual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {frequencyData.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.categoria || ""}</TableCell>
                          <TableCell>{item.quantidade || 0}</TableCell>
                          <TableCell>{item.percentual || 0}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-bold">Total</TableCell>
                        <TableCell className="font-bold">
                          {frequencyData.reduce((sum, item) => sum + (item.quantidade || 0), 0)}
                        </TableCell>
                        <TableCell className="font-bold">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Frequência</CardTitle>
                  <CardDescription>Visualização gráfica</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <BarChart data={frequencyChartData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        
          <TabsContent value="retencao" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Retenção</CardTitle>
                  <CardDescription>Evolução mensal da retenção de clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead>Novos Clientes</TableHead>
                        <TableHead>Clientes Retidos</TableHead>
                        <TableHead>Taxa de Retenção</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retentionData.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.mes || ""}</TableCell>
                          <TableCell>{item.novos || 0}</TableCell>
                          <TableCell>{item.retidos || 0}</TableCell>
                          <TableCell>{item.taxa || 0}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Taxa de Retenção</CardTitle>
                  <CardDescription>Visualização gráfica</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <LineChart data={retentionChartData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        
          <TabsContent value="ticket" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Médio por Cliente</CardTitle>
                <CardDescription>
                  Valor médio gasto por cliente em cada visita
                </CardDescription>
                <div className="mt-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Nº de Visitas</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Ticket Médio</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTicketData.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.cliente || ""}</TableCell>
                        <TableCell>{item.visitas || 0}</TableCell>
                        <TableCell>R$ {(item.valorTotal || 0).toFixed(2)}</TableCell>
                        <TableCell>R$ {(item.ticketMedio || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.ticketMedio > 250 ? "default" : 
                                    item.ticketMedio > 200 ? "outline" : "secondary"}
                          >
                            {item.ticketMedio > 250 ? "Alto" : 
                             item.ticketMedio > 200 ? "Médio" : "Básico"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTicketData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhum cliente encontrado com este termo de busca.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
