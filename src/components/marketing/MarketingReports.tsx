import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const channelData = [
  { name: 'WhatsApp', enviados: 1200, abertos: 980, convertidos: 450 },
  { name: 'SMS', enviados: 800, abertos: 600, convertidos: 250 },
  { name: 'Email', enviados: 2000, abertos: 1200, convertidos: 380 },
];

const campaignData = [
  { name: 'Black Friday', value: 85 },
  { name: 'Natal', value: 72 },
  { name: 'Aniversariantes', value: 65 },
  { name: 'Reativação', value: 58 },
];

export function MarketingReports() {
  const { toast } = useToast();

  const handleExportReport = () => {
    const reportData = {
      channelPerformance: channelData,
      topCampaigns: campaignData,
      engagementMetrics: {
        openRate: 75,
        clickRate: 45,
        conversionRate: 28,
        roi: 3.2
      }
    };

    const csvContent = [
      ['Canal', 'Mensagens Enviadas', 'Mensagens Abertas', 'Conversões'].join(','),
      ...channelData.map(row => [
        row.name,
        row.enviados,
        row.abertos,
        row.convertidos
      ].join(',')),
      '',
      ['Campanha', 'Taxa de Conversão (%)'].join(','),
      ...campaignData.map(row => [
        row.name,
        row.value
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-marketing-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Relatório exportado com sucesso!",
      description: "O arquivo CSV foi baixado para o seu computador.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios de Marketing</h2>
          <p className="text-sm text-muted-foreground">
            Analise o desempenho das suas campanhas
          </p>
        </div>
        <Button onClick={handleExportReport}>
          <BarChartIcon className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enviados" fill="#8884d8" name="Mensagens Enviadas" />
                  <Bar dataKey="abertos" fill="#82ca9d" name="Mensagens Abertas" />
                  <Bar dataKey="convertidos" fill="#ffc658" name="Conversões" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Campanhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Taxa de Conversão (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engajamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Taxa de Abertura</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '75%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxa de Clique</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '45%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxa de Conversão</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '28%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span>ROI Médio</span>
                  <span className="font-medium">3.2x</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '80%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
