
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CreditCard,
  EyeIcon,
  FileDown,
  Receipt,
  Search,
  Trash,
  User,
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Sale } from "@/types/pdv";
import { OrderDialog } from "./OrderDialog";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface OrderListProps {
  orders: Sale[];
  onCancel: (orderId: string) => void;
  onPrintReceipt: (order: Sale) => void;
}

export function OrderList({ orders, onCancel, onPrintReceipt }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  // Apply filters
  const filteredOrders = orders.filter(order => {
    // Search filter
    const searchMatch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.clientName && order.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.clientPhone && order.clientPhone.includes(searchTerm));
    
    // Status filter
    const statusMatch = !statusFilter || order.status === statusFilter;
    
    // Payment filter
    const paymentMatch = !paymentFilter || 
      order.payments.some(payment => payment.method === paymentFilter);
    
    // Date filter
    let dateMatch = true;
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    
    if (dateFilter === "today") {
      dateMatch = 
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear();
    } else if (dateFilter === "week") {
      const weekStart = new Date();
      weekStart.setDate(today.getDate() - today.getDay());
      dateMatch = orderDate >= weekStart;
    } else if (dateFilter === "month") {
      dateMatch = 
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear();
    }
    
    return searchMatch && statusMatch && paymentMatch && dateMatch;
  });

  const handleViewOrder = (order: Sale) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleCancelOrder = () => {
    if (selectedOrder) {
      onCancel(selectedOrder.id);
      setIsOrderDialogOpen(false);
    }
  };

  const handlePrintReceipt = () => {
    if (selectedOrder) {
      onPrintReceipt(selectedOrder);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Finalizado
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pendente
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 gap-1">
            Dinheiro
          </span>
        );
      case "credit":
        return (
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-purple-50 text-purple-700 gap-1">
            Crédito
          </span>
        );
      case "debit":
        return (
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 gap-1">
            Débito
          </span>
        );
      case "pix":
        return (
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-green-50 text-green-700 gap-1">
            PIX
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-gray-50 text-gray-700 gap-1">
            {method}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, cliente ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              <SelectItem value="completed">Finalizado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Forma de Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas formas</SelectItem>
              <SelectItem value="cash">Dinheiro</SelectItem>
              <SelectItem value="credit">Cartão de Crédito</SelectItem>
              <SelectItem value="debit">Cartão de Débito</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos períodos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <h4 className="font-medium leading-none">Período personalizado</h4>
                    <p className="text-sm text-muted-foreground">
                      Selecione um intervalo de datas
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-1">
                        <label className="text-xs">Data inicial</label>
                        <Input type="date" className="h-8" />
                      </div>
                      <div className="grid gap-1">
                        <label className="text-xs">Data final</label>
                        <Input type="date" className="h-8" />
                      </div>
                    </div>
                    <Button size="sm" className="mt-2">Aplicar</Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="icon">
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Receipt className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{order.clientName || "Cliente não identificado"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    {order.payments.length > 0 ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <div className="flex gap-1">
                            {order.payments.length > 1 ? (
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              getPaymentMethodBadge(order.payments[0].method)
                            )}
                            {order.payments.length > 1 && (
                              <span className="text-xs">Múltiplo</span>
                            )}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-48 p-2">
                          <div className="space-y-1">
                            {order.payments.map((payment, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-xs">{getPaymentMethodBadge(payment.method)}</span>
                                <span className="text-xs font-medium">{formatCurrency(payment.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewOrder(order)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {order.status !== "cancelled" && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onPrintReceipt(order)}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          {order.status !== "completed" && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedOrder(order);
                                onCancel(order.id);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <OrderDialog
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        order={selectedOrder}
        onPrintReceipt={handlePrintReceipt}
        onCancel={handleCancelOrder}
      />
    </div>
  );
}
