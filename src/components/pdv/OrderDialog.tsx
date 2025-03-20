
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ban, Printer, Clock, User, Phone, CreditCard, Tag } from "lucide-react";
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

  const formattedDate = order.createdAt 
    ? format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      })
    : "";
  
  const isCompletedOrPending = order.status === "completed" || order.status === "pending";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Pedido #{order.id}</DialogTitle>
          <DialogDescription>
            Detalhes do pedido realizado
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formattedDate}</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium 
                ${order.status === "completed" ? "bg-green-100 text-green-800" : 
                  order.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                  "bg-red-100 text-red-800"}`}
              >
                {order.status === "completed" ? "Finalizado" : 
                 order.status === "pending" ? "Pendente" : "Cancelado"}
              </div>
            </div>
            
            {order.clientName && (
              <div className="flex flex-col gap-1 p-3 bg-secondary rounded-md">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{order.clientName}</span>
                </div>
                {order.clientPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{order.clientPhone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded ml-2">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.price)}
                    </div>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pagamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.payments.map((payment, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {payment.method === "cash" && <Printer className="h-4 w-4" />}
                    {payment.method === "credit" && <CreditCard className="h-4 w-4" />}
                    {payment.method === "debit" && <CreditCard className="h-4 w-4" />}
                    {payment.method === "pix" && <Tag className="h-4 w-4" />}
                    <span className="capitalize">{payment.method}</span>
                  </div>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="sm:flex-1"
            onClick={() => onPrintReceipt(order)}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Recibo
          </Button>
          {isCompletedOrPending && (
            <Button 
              variant="destructive"
              className="sm:flex-1"
              onClick={() => onCancel(order.id)}
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancelar Pedido
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
