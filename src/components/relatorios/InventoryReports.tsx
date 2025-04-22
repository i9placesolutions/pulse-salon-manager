import React from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ExportFormat, GlobalFilters } from "@/hooks/useReportManagement";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface InventoryReportsProps {
  date?: {
    from: Date;
    to: Date;
  };
  filters: GlobalFilters;
  data?: Record<string, any>;
  onExport?: (format: ExportFormat) => void;
}

export function InventoryReports({ date, filters, data, onExport }: InventoryReportsProps) {
  // Utilizar dados do prop ou arrays vazios
  const reportData = data || {};
  
  // Dados para relatórios de estoque
  const productsData = reportData.products || [];
  
  const categoryData = reportData.categories || [];
  
  const movementData = reportData.movements || [];
  
  // Dados para gráficos
  const productChartData = {
    labels: productsData.map(item => (item.produto || "").split(' ').slice(0, 2).join(' ')),
    datasets: [
      {
        label: "Estoque Atual",
        data: productsData.map(item => item.estoque || 0),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Estoque Mínimo",
        data: productsData.map(item => item.minimo || 0),
        backgroundColor: "#ef4444",
      }
    ],
  };
  
  const categoryChartData = {
    labels: categoryData.map(item => item.categoria || ""),
    datasets: [
      {
        data: categoryData.map(item => item.percentual || 0),
        backgroundColor: ["#3b82f6", "#10b981", "#f97316", "#a855f7", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };
  
  const movementChartData = {
    labels: movementData.map(item => item.data || ""),
    datasets: [
      {
        label: "Entradas",
        data: movementData.map(item => item.entradas || 0),
        backgroundColor: "#10b981",
      },
      {
        label: "Saídas",
        data: movementData.map(item => item.saidas || 0),
        backgroundColor: "#ef4444",
      },
      {
        label: "Saldo",
        data: movementData.map(item => item.saldo || 0),
        backgroundColor: "#3b82f6",
        type: 'line',
        borderColor: "#3b82f6",
        borderWidth: 2,
        fill: false,
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
    console.log("Exportando relatório de estoque em formato:", format);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Relatórios de Estoque</h2>
        <Button variant="outline" size="sm" onClick={() => handleExport("excel")} className="gap-1">
          <FileDown className="h-4 w-4" />
          Exportar
        </Button>
      </div>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Situação de Estoque</CardTitle>
                <CardDescription>Análise de produtos e níveis de estoque</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Mínimo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsData.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.produto || ""}</TableCell>
                        <TableCell>{item.estoque || 0}</TableCell>
                        <TableCell>{item.minimo || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(item.estoque || 0) / ((item.minimo || 0) * 2) * 100} 
                              className="h-2 w-24" 
                            />
                            <Badge variant={
                              (item.estoque || 0) < (item.minimo || 0) ? "destructive" : 
                              (item.estoque || 0) < (item.minimo || 0) * 1.5 ? "outline" : 
                              "default"
                            }>
                              {(item.estoque || 0) < (item.minimo || 0) ? "Crítico" : 
                               (item.estoque || 0) < (item.minimo || 0) * 1.5 ? "Baixo" : 
                               "Normal"}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Comparativo de Estoque</CardTitle>
                <CardDescription>Estoque atual x estoque mínimo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart data={productChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Categoria</CardTitle>
                <CardDescription>Análise do desempenho por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Vendas</TableHead>
                      <TableHead>Percentual</TableHead>
                      <TableHead>Faturamento (R$)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryData.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.categoria || ""}</TableCell>
                        <TableCell>{item.vendas || 0}</TableCell>
                        <TableCell>{item.percentual || 0}%</TableCell>
                        <TableCell>{(item.faturamento || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">
                        {categoryData.reduce((sum, item) => sum + (item.vendas || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">100%</TableCell>
                      <TableCell className="font-bold">
                        {categoryData.reduce((sum, item) => sum + (item.faturamento || 0), 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Vendas</CardTitle>
                <CardDescription>Por categoria de produto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart data={categoryChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="movements" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Movimentação de Estoque</CardTitle>
                <CardDescription>Entradas, saídas e ajustes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Entradas</TableHead>
                      <TableHead>Saídas</TableHead>
                      <TableHead>Ajustes</TableHead>
                      <TableHead>Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementData.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.data || ""}</TableCell>
                        <TableCell>{item.entradas || 0}</TableCell>
                        <TableCell>{item.saidas || 0}</TableCell>
                        <TableCell className={(item.ajustes || 0) !== 0 ? "text-red-500" : ""}>
                          {(item.ajustes || 0) !== 0 ? (item.ajustes || 0) : "-"}
                        </TableCell>
                        <TableCell className={
                          (item.saldo || 0) > 0 ? "text-green-500" : 
                          (item.saldo || 0) < 0 ? "text-red-500" : ""
                        }>
                          {(item.saldo || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">
                        {movementData.reduce((sum, item) => sum + (item.entradas || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {movementData.reduce((sum, item) => sum + (item.saidas || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {movementData.reduce((sum, item) => sum + (item.ajustes || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {movementData.reduce((sum, item) => sum + (item.saldo || 0), 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Movimentação</CardTitle>
                <CardDescription>Visão semanal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <BarChart data={movementChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
