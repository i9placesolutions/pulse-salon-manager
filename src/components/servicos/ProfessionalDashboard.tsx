
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Download, Target, TrendingUp, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProfessionalGoal, ProfessionalPerformance } from "@/types/service";

interface ProfessionalDashboardProps {
  professionalId: number;
  professionalName: string;
  goals: ProfessionalGoal[];
  performance: ProfessionalPerformance[];
}

export function ProfessionalDashboard({
  professionalId,
  professionalName,
  goals,
  performance,
}: ProfessionalDashboardProps) {
  const { toast } = useToast();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    serviceTarget: 0,
    revenueTarget: 0,
    commissionsTarget: 0,
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentGoal = goals.find((g) => g.month === currentMonth);

  // Calcular métricas do mês atual
  const currentPerformance = performance.filter(
    (p) => p.date.startsWith(currentMonth)
  );
  
  const totalServices = currentPerformance.length;
  const totalRevenue = currentPerformance.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalCommissions = currentPerformance.reduce((acc, curr) => acc + curr.commission, 0);
  
  // Dados para o gráfico de evolução
  const performanceData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().slice(0, 10);
    
    const dayPerformance = performance.filter((p) => p.date === dayStr);
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      revenue: dayPerformance.reduce((acc, curr) => acc + curr.revenue, 0),
      commission: dayPerformance.reduce((acc, curr) => acc + curr.commission, 0),
    };
  }).reverse();

  const handleSaveGoal = () => {
    // TODO: Implementar salvamento da meta
    toast({
      title: "Meta definida",
      description: "A meta foi definida com sucesso para o profissional.",
    });
    setIsGoalDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{professionalName}</h2>
          <p className="text-muted-foreground">Dashboard de desempenho</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Target className="h-4 w-4" />
                Definir Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Definir Meta Mensal</DialogTitle>
                <DialogDescription>
                  Configure as metas para {professionalName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label>Meta de Serviços</label>
                  <Input
                    type="number"
                    min="0"
                    value={newGoal.serviceTarget}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        serviceTarget: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label>Meta de Faturamento</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newGoal.revenueTarget}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        revenueTarget: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label>Meta de Comissões</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newGoal.commissionsTarget}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        commissionsTarget: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveGoal}>Salvar Meta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Serviços Realizados
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            {currentGoal && (
              <p className="text-xs text-muted-foreground">
                Meta: {currentGoal.serviceTarget} serviços
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            {currentGoal && (
              <p className="text-xs text-muted-foreground">
                Meta: {formatCurrency(currentGoal.revenueTarget)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Comissões
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCommissions)}
            </div>
            {currentGoal && (
              <p className="text-xs text-muted-foreground">
                Meta: {formatCurrency(currentGoal.commissionsTarget)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução de Desempenho</CardTitle>
          <CardDescription>
            Últimos 30 dias de faturamento e comissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Faturamento"
                  stroke="#dc8c95"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  name="Comissões"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
