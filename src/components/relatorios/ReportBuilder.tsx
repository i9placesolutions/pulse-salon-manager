import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PieChart, BarChart, LineChart } from "@/components/ui/charts";
import { 
  FileDown, Plus, Settings, Save, Trash, ArrowRightLeft,
  BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, 
  Table as TableIcon
} from "lucide-react";
import { ExportFormat, GlobalFilters } from "@/hooks/useReportManagement";
import { exportData } from "@/utils/export";

interface ReportBuilderProps {
  date?: {
    from: Date;
    to: Date;
  };
  filters: GlobalFilters;
  data?: Record<string, any> | null;
  onExport?: (format: ExportFormat) => void;
}

export function ReportBuilder({ date, filters, data, onExport }: ReportBuilderProps) {
  const [viewType, setViewType] = useState("config");
  const [chartType, setChartType] = useState<string>("bar");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["cliente", "data", "servico", "valor"]);
  const [groupByField, setGroupByField] = useState<string>("servico");
  const [aggregateField, setAggregateField] = useState<string>("valor");
  const [reportTitle, setReportTitle] = useState<string>("Relatório Personalizado");
  
  // Campos disponíveis para o construtor de relatórios
  const availableFields = [
    { id: "cliente", label: "Cliente" },
    { id: "data", label: "Data" },
    { id: "servico", label: "Serviço" },
    { id: "profissional", label: "Profissional" },
    { id: "valor", label: "Valor" },
    { id: "status", label: "Status" },
    { id: "categoria", label: "Categoria" },
    { id: "pagamento", label: "Forma de Pagamento" },
    { id: "duracao", label: "Duração" },
  ];
  
  // Trata o caso onde data pode ser um objeto com uma propriedade que contém o array desejado
  const reportData = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Object.values(data).some(Array.isArray)
      ? Object.values(data).find(Array.isArray) || []
      : [];
  
  // Função para gerar dados agregados com base nos campos selecionados
  const generateAggregatedData = () => {
    // Agrupa os dados pelo campo selecionado
    const grouped = reportData.reduce((acc, item) => {
      const key = item[groupByField];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
    
    // Agrega os valores para cada grupo
    return Object.keys(grouped).map(key => {
      const groupData = grouped[key];
      const sum = groupData.reduce((acc, item) => acc + item[aggregateField], 0);
      const count = groupData.length;
      
      return {
        group: key,
        total: sum,
        count: count,
        average: sum / count
      };
    });
  };
  
  // Dados agregados para visualização
  const aggregatedData = generateAggregatedData();
  
  // Dados base para os gráficos
  const labels = aggregatedData.map(item => item.group);
  const values = aggregatedData.map(item => item.total);
  
  // Dados específicos para cada tipo de gráfico para resolver problemas de tipagem
  const barChartData = {
    labels,
    datasets: [
      {
        label: `Total ${aggregateField === 'valor' ? '(R$)' : ''}`,
        data: values,
        backgroundColor: "#3b82f6",
      },
    ],
  };
  
  const lineChartData = {
    labels,
    datasets: [
      {
        label: `Total ${aggregateField === 'valor' ? '(R$)' : ''}`,
        data: values,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  const pieChartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#6b7280",
          "#ec4899", "#14b8a6", "#f59e0b", "#6366f1", "#d946ef"
        ],
      },
    ],
  };
  
  // Função para exportar o relatório
  const handleExport = (format: ExportFormat) => {
    const dataToExport = Array.isArray(aggregatedData) ? aggregatedData : [aggregatedData];
    exportData(dataToExport, format, `${reportTitle.toLowerCase().replace(/\s+/g, '_')}`, reportTitle);
  };
  
  const handleCustomExport = () => {
    if (onExport) {
      onExport('excel');
    } else {
      // Garantir que os dados são um array antes de exportar
      const dataToExport = Array.isArray(reportData) ? reportData : [reportData];
      exportData(dataToExport, 'excel', 'relatorio_personalizado', 'Relatório Personalizado');
    }
  };
  
  // Função para manipular a seleção de colunas
  const handleColumnSelection = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      setSelectedColumns(selectedColumns.filter(id => id !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };
  
  // Função para renderizar o gráfico adequado com base no tipo selecionado
  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return <BarChart data={barChartData} />;
      case "line":
        return <LineChart data={lineChartData} />;
      case "pie":
        return <PieChart data={pieChartData} />;
      default:
        return <BarChart data={barChartData} />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Construtor de Relatórios</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCustomExport} className="gap-1">
            <FileDown className="h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" className="gap-1">
            <Settings className="h-4 w-4" />
            Salvar Modelo
          </Button>
        </div>
      </div>
      
      <Tabs value={viewType} onValueChange={setViewType} className="w-full">
        <TabsList className="grid grid-cols-4 w-[400px]">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Relatório</CardTitle>
              <CardDescription>Defina os campos e parâmetros para o seu relatório personalizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportTitle">Título do Relatório</Label>
                <Input 
                  id="reportTitle" 
                  value={reportTitle} 
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="block mb-2">Colunas Selecionadas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableFields.map(field => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`column-${field.id}`} 
                        checked={selectedColumns.includes(field.id)}
                        onCheckedChange={() => handleColumnSelection(field.id)}
                      />
                      <Label htmlFor={`column-${field.id}`}>{field.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="groupBy">Agrupar Por</Label>
                  <Select value={groupByField} onValueChange={setGroupByField}>
                    <SelectTrigger id="groupBy" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map(field => (
                        <SelectItem key={field.id} value={field.id}>{field.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="aggregate">Agregar</Label>
                  <Select value={aggregateField} onValueChange={setAggregateField}>
                    <SelectTrigger id="aggregate" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valor">Valor (R$)</SelectItem>
                      <SelectItem value="duracao">Duração (min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="block mb-2">Tipo de Gráfico</Label>
                <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value)}>
                  <ToggleGroupItem value="bar" className="flex items-center gap-1">
                    <BarChart2 className="h-4 w-4" />
                    <span>Barra</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="line" className="flex items-center gap-1">
                    <LineChartIcon className="h-4 w-4" />
                    <span>Linha</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="pie" className="flex items-center gap-1">
                    <PieChartIcon className="h-4 w-4" />
                    <span>Pizza</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="default" onClick={() => setViewType("table")}>Visualizar Relatório</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="table" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{reportTitle}</CardTitle>
                <CardDescription>Visualização em tabela</CardDescription>
              </div>
              <ToggleGroup type="single" value="table">
                <ToggleGroupItem value="table">
                  <TableIcon className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="chart" onClick={() => setViewType("chart")}>
                  <BarChart2 className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedColumns.map(column => {
                        const field = availableFields.find(f => f.id === column);
                        return <TableHead key={column}>{field?.label || column}</TableHead>;
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((row, i) => (
                      <TableRow key={i}>
                        {selectedColumns.map(column => (
                          <TableCell key={column}>
                            {column === 'valor' ? `R$ ${row[column].toFixed(2)}` : row[column]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{reportTitle}</CardTitle>
                <CardDescription>Visualização em gráfico - {groupByField} por {aggregateField}</CardDescription>
              </div>
              <ToggleGroup type="single" value="chart">
                <ToggleGroupItem value="table" onClick={() => setViewType("table")}>
                  <TableIcon className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="chart">
                  <BarChart2 className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {renderChart()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{reportTitle} - Dashboard</CardTitle>
              <CardDescription>Visualização combinada de dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-base font-medium">Total de {aggregateField === 'valor' ? 'Vendas' : 'Minutos'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {aggregateField === 'valor' ? 'R$ ' : ''}
                      {aggregatedData.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-base font-medium">Quantidade de Registros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {aggregatedData.reduce((sum, item) => sum + item.count, 0)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-base font-medium">Média por {groupByField}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {aggregateField === 'valor' ? 'R$ ' : ''}
                      {(aggregatedData.reduce((sum, item) => sum + item.total, 0) / aggregatedData.length).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Gráfico por {groupByField}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      {renderChart()}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Top 5 {groupByField}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{availableFields.find(f => f.id === groupByField)?.label}</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aggregatedData
                          .sort((a, b) => b.total - a.total)
                          .slice(0, 5)
                          .map((item, i) => {
                            const grandTotal = aggregatedData.reduce((sum, data) => sum + data.total, 0);
                            const percentage = (item.total / grandTotal * 100).toFixed(1);
                            
                            return (
                              <TableRow key={i}>
                                <TableCell>{item.group}</TableCell>
                                <TableCell>
                                  {aggregateField === 'valor' ? `R$ ${item.total.toFixed(2)}` : item.total}
                                </TableCell>
                                <TableCell>{percentage}%</TableCell>
                              </TableRow>
                            );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
