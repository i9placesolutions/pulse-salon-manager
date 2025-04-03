
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, Expense, AccountReceivable } from "@/types/financial";
import { formatCurrency } from "@/utils/currency";
import { AlertTriangle, AlertCircle, ChevronRight, Bell, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FinancialAlertsProps {
  expenses: Expense[];
  receivables: AccountReceivable[];
}

export function FinancialAlerts({ expenses, receivables }: FinancialAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const today = new Date();
    const upcomingExpenses = expenses
      .filter(expense => {
        if (expense.status === 'Pago' || expense.status === 'Cancelado') return false;
        const dueDate = new Date(expense.dueDate);
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        );
        return daysUntilDue <= 5 && daysUntilDue >= -1;
      })
      .map(expense => {
        const dueDate = new Date(expense.dueDate);
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        );
        
        let severity = "warning";
        let message = "";
        
        if (daysUntilDue === 0) {
          severity = "critical";
          message = "Vence hoje";
        } else if (daysUntilDue < 0) {
          severity = "critical";
          message = "Atrasada";
        } else if (daysUntilDue === 1) {
          severity = "high";
          message = "Vence amanhã";
        } else {
          message = `Vence em ${daysUntilDue} dias`;
        }
        
        return {
          id: Number(`expense-${expense.id}`),
          type: "expense",
          title: expense.description,
          description: message, // Convertendo message para description
          message, // Mantendo message para compatibilidade
          value: expense.value,
          date: expense.dueDate,
          severity, // Mantendo severity para compatibilidade
          priority: severity === "critical" ? "high" : severity === "high" ? "medium" : "low" as 'high' | 'medium' | 'low',
          item: expense
        } as Alert;
      });
      
    const overdueReceivables = receivables
      .filter(receivable => {
        if (receivable.status === 'Pago' || receivable.status === 'Cancelado') return false;
        const dueDate = new Date(receivable.dueDate);
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        );
        return daysUntilDue <= 5;
      })
      .map(receivable => {
        const dueDate = new Date(receivable.dueDate);
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        );
        
        let severity = "info";
        let message = "";
        
        if (daysUntilDue === 0) {
          severity = "medium";
          message = "Vence hoje";
        } else if (daysUntilDue < 0) {
          severity = "high";
          message = `Atrasado há ${Math.abs(daysUntilDue)} dias`;
        } else if (daysUntilDue === 1) {
          severity = "low";
          message = "Vence amanhã";
        } else {
          message = `Vence em ${daysUntilDue} dias`;
        }
        
        return {
          id: Number(`receivable-${receivable.id}`),
          type: "receivable",
          title: `${receivable.client} - ${receivable.description || ''}`,
          description: message, // Convertendo message para description
          message, // Mantendo message para compatibilidade
          value: receivable.value,
          date: receivable.dueDate,
          severity, // Mantendo severity para compatibilidade
          priority: severity === "high" ? "high" : severity === "medium" ? "medium" : "low" as 'high' | 'medium' | 'low',
          item: receivable
        } as Alert;
      });
      
    const allAlerts = [...upcomingExpenses, ...overdueReceivables]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    setAlerts(allAlerts);
  }, [expenses, receivables]);

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      case "high":
        return <Badge variant="destructive" className="bg-red-400">Alta</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-yellow-400 text-yellow-600">Média</Badge>;
      case "warning":
        return <Badge variant="outline" className="border-amber-400 text-amber-600">Aviso</Badge>;
      case "low":
        return <Badge variant="outline" className="border-blue-400 text-blue-600">Baixa</Badge>;
      default:
        return <Badge variant="outline">Informação</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Alertas Financeiros</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMuted(!isMuted)}
          className="h-8 w-8"
        >
          {isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>Nenhum alerta financeiro no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex justify-between items-center border-b pb-3 last:border-0"
              >
                <div className="flex items-start gap-3">
                  {alert.type === "expense" ? (
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.severity === "critical" || alert.severity === "high" 
                        ? "text-destructive" 
                        : "text-amber-500"
                    }`} />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <div className="flex flex-wrap gap-2 items-center mt-1">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-sm text-muted-foreground">{alert.message}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium">
                    {formatCurrency(alert.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {alerts.length > 3 && (
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            className="w-full flex justify-center"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Mostrar menos" : `Mostrar mais ${alerts.length - 3} alertas`}
            <ChevronRight className={`h-4 w-4 transition-transform ${showAll ? "rotate-90" : ""}`} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
