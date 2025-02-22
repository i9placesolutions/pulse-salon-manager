
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  LineChart,
  PieChart,
  Download,
  FileText
} from "lucide-react";
import { ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Dados mockados para demonstração
const campaignData = [
  { month: 'Jan', mensagens: 240, conversao: 180, cupons: 45 },
  { month: 'Fev', mensagens: 300, conversao: 200, cupons: 65 },
  { month: 'Mar', mensagens: 280, conversao: 210, cupons: 55 },
  { month: 'Abr', mensagens: 320, conversao: 250, cupons: 75 },
];

export function MarketingReports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Relatórios de Marketing</h3>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desempenho de Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={campaignData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mensagens" stroke="#dc8c95" name="Mensagens" />
                  <Line type="monotone" dataKey="conversao" stroke="#82ca9d" name="Conversão" />
                  <Line type="monotone" dataKey="cupons" stroke="#8884d8" name="Cupons" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uso de Cupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <PieChart className="h-32 w-32 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Engajamento de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <BarChart className="h-32 w-32 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
