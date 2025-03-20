
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ban, Eye, Printer, Search } from "lucide-react";
import { Sale } from "@/types/pdv";

interface OrderListProps {
  orders: Sale[];
  onCancel: (orderId: string) => void;
  onPrintReceipt: (order: Sale) => void;
  onViewOrder?: (order: Sale) => void;
}

export function OrderList({
  orders,
  onCancel,
  onPrintReceipt,
  onViewOrder,
}: OrderListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchTermLower) ||
        order.clientName?.toLowerCase().includes(searchTermLower) ||
        order.clientPhone?.includes(searchTerm)
      );
    }
    
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, cliente ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Finalizados</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.clientName || "-"}</TableCell>
                  <TableCell>
                    {order.createdAt
                      ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${order.status === "completed" ? "bg-green-100 text-green-800" : 
                        order.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"}`}
                    >
                      {order.status === "completed" ? "Finalizado" : 
                       order.status === "pending" ? "Pendente" : "Cancelado"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onViewOrder && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrintReceipt(order)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      {(order.status === "completed" || order.status === "pending") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onCancel(order.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
