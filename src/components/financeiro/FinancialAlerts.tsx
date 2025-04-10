import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isPast, isFuture, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, AlertTriangle, XCircle, AlertCircle, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { AccountReceivable, Expense } from "@/types/financial";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/lib/utils";

interface FinancialAlertsProps {
  expenses: Expense[];
  accountsReceivable: AccountReceivable[];
  onActionClick?: (item: Expense | AccountReceivable, action: string) => void;
}

interface Alert {
  id: string;
  type: 'expense' | 'receivable';
  title: string;
  message: string;
  value: number;
  date: string;
  severity: 'high' | 'medium' | 'low';
  item: Expense | AccountReceivable;
}

export function FinancialAlerts({ 
  expenses, 
  accountsReceivable,
  onActionClick 
}: FinancialAlertsProps) {
  const [expanded, setExpanded] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Função para processar datas em diferentes formatos - Memoizada para reutilização
  const parseDate = useMemo(() => (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Formatos possíveis: dd/MM/yyyy ou yyyy-MM-dd
    let date;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    } else {
      date = parseISO(dateStr);
    }
    
    return isValid(date) ? date : null;
  }, []);

  // Usar useMemo para processar alertas só quando as dependências mudarem
  useEffect(() => {
    // Processar contas a pagar vencidas ou próximas de vencer
    const processedAlerts = useMemo(() => {
      // Processar contas a pagar vencidas ou próximas de vencer
      const expenseAlerts = expenses
        .filter(expense => expense.status !== 'Pago')
        .map(expense => {
          const dueDate = parseDate(expense.date);
          if (!dueDate) return null;
          
          const daysToExpire = differenceInDays(dueDate, new Date());
          let severity: 'high' | 'medium' | 'low' = 'low';
          let message = '';
          
          if (isPast(dueDate)) {
            severity = 'high';
            message = `Conta vencida há ${Math.abs(daysToExpire)} dias`;
          } else if (daysToExpire <= 3) {
            severity = 'medium';
            message = daysToExpire === 0 
              ? 'Vence hoje' 
              : `Vence em ${daysToExpire} ${daysToExpire === 1 ? 'dia' : 'dias'}`;
          } else if (daysToExpire <= 7) {
            severity = 'low';
            message = `Vence em ${daysToExpire} dias`;
          } else {
            return null; // Ignora contas que vencem em mais de 7 dias
          }
          
          return {
            id: `expense-${expense.id}`,
            type: 'expense' as const,
            title: expense.name,
            message,
            value: expense.value,
            date: expense.date,
            severity,
            item: expense
          };
        })
        .filter(Boolean) as Alert[];
      
      // Processar contas a receber vencidas
      const receivableAlerts = accountsReceivable
        .filter(acc => acc.status !== 'Pago')
        .map(account => {
          const dueDate = parseDate(account.dueDate);
          if (!dueDate) return null;
          
          const daysOverdue = differenceInDays(new Date(), dueDate);
          let severity: 'high' | 'medium' | 'low' = 'low';
          let message = '';
          
          if (isPast(dueDate)) {
            severity = daysOverdue > 30 ? 'high' : 'medium';
            message = `Pagamento atrasado há ${daysOverdue} dias`;
          } else {
            return null; // Ignora contas que ainda não venceram
          }
          
          return {
            id: `receivable-${account.id}`,
            type: 'receivable' as const,
            title: `Cliente ${account.client}: Parcela ${account.installment}`,
            message,
            value: account.value,
            date: account.dueDate,
            severity,
            item: account
          };
        })
        .filter(Boolean) as Alert[];
      
      // Combinar e ordenar alertas
      return [...expenseAlerts, ...receivableAlerts].sort((a, b) => {
        // Primeiro ordenar por severidade (high -> medium -> low)
        const severityOrder = { high: 0, medium: 1, low: 2 };
        const severityDiff = severityOrder[a.severity as keyof typeof severityOrder] - 
                            severityOrder[b.severity as keyof typeof severityOrder];
        
        if (severityDiff !== 0) return severityDiff;
        
        // Se mesma severidade, ordenar por data (mais próximo primeiro)
        const dateA = parseDate(a.date) || new Date();
        const dateB = parseDate(b.date) || new Date();
        return dateA.getTime() - dateB.getTime();
      });
    }, [expenses, accountsReceivable, parseDate]);
    
    setAlerts(processedAlerts);
  }, [expenses, accountsReceivable, parseDate]);

  if (alerts.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Alertas Financeiros</CardTitle>
            <Badge variant="outline" className="ml-2">
              {alerts.length}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-2 pt-1">
          {alerts.map(alert => (
            <Alert 
              key={alert.id}
              variant={
                alert.severity === 'high' 
                  ? 'destructive' 
                  : alert.severity === 'medium' 
                    ? 'default' 
                    : 'default'
              }
            >
              <div className="flex items-start justify-between">
                <div>
                  {alert.severity === 'high' ? (
                    <XCircle className="h-4 w-4" />
                  ) : alert.severity === 'medium' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription className="mt-1 flex flex-col">
                    <span>{alert.message}</span>
                    <span className="font-medium">{formatCurrency(alert.value)}</span>
                  </AlertDescription>
                </div>
                
                {onActionClick && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className={cn(
                      alert.type === 'expense' 
                        ? "bg-red-100 hover:bg-red-200 text-red-700" 
                        : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                    )}
                    onClick={() => onActionClick?.(alert.item, alert.type === 'expense' ? "pagar" : "cobrar")}
                  >
                    {alert.type === 'expense' ? "PAGUEI" : "RECEBIDO"}
                  </Button>
                )}
              </div>
            </Alert>
          ))}
          
          {alerts.length > 3 && (
            <Button variant="ghost" className="w-full text-sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Mostrar menos" : `Ver todos os ${alerts.length} alertas`}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
} 