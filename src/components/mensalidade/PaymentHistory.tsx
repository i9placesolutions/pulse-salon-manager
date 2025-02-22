
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Invoice } from "@/types/subscription";
import { formatCurrency } from "@/utils/currency";

interface PaymentHistoryProps {
  invoices: Invoice[];
}

export function PaymentHistory({ invoices }: PaymentHistoryProps) {
  const getBadgeVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  Fatura {new Date(invoice.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vencimento: {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium">{formatCurrency(invoice.amount)}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={getBadgeVariant(invoice.status)}>
                  {getStatusText(invoice.status)}
                </Badge>
                {invoice.downloadUrl && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={invoice.downloadUrl} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
