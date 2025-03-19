import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ban, Printer } from "lucide-react";
import { Sale } from "@/types/pdv";

interface OrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: Sale | null;
  onPrintReceipt: (order: Sale) => void;
  onCancel: (orderId: string) => void;
}

export function OrderDialog({
  isOpen,
  onOpenChange,
  order,
  onPrintReceipt,
  onCancel,
}: OrderDialogProps) {
  if (!order) return null;

  const orderDate = new Date(order.createdAt);
  const formattedDate = format(orderDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  const isCompletedOrder = order.status === "completed";
  const isCancelledOrder = order.status === "cancelled";

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "cash":
        return "Dinheiro";
      case "credit":
        return "Cartão de Crédito";
      case "debit":
        return "Cartão de Débito";
      case "pix":
        return "PIX";
      default:
        return method;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pedido {order.id}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(order.status)}`}>
              {order.status === "completed" ? "Finalizado" : 
               order.status === "pending" ? "Pendente" : "Cancelado"}
            </span>
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Cliente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{order.clientName || "Cliente não identificado"}</span>
                </div>
                {order.clientPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.clientPhone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="font-medium">Itens do Pedido</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-sm text-muted-foreground">Item</th>
                    <th className="px-4 py-2 text-left font-medium text-sm text-muted-foreground">Qtd</th>
                    <th className="px-4 py-2 text-left font-medium text-sm text-muted-foreground">Valor</th>
                    <th className="px-4 py-2 text-left font-medium text-sm text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-2">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            {item.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-2">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/20">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-medium">
                      Total:
                    </td>
                    <td className="px-4 py-2 font-bold">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Pagamentos</h3>
            <div className="space-y-2">
              {order.payments.map((payment, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{getPaymentMethodName(payment.method)}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-row-reverse sm:justify-start sm:flex-row">
          {!isCancelledOrder && (
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => onPrintReceipt(order)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Recibo
            </Button>
          )}
          {!isCancelledOrder && !isCompletedOrder && (
            <Button 
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => onCancel(order.id)}
            >
              Cancelar Pedido
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
