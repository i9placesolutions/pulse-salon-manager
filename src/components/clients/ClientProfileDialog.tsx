import { useState } from "react";
import { Client, ClientPreference, ClientService, ClientCoupon } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Scissors, 
  Heart,
  Clock,
  Wallet,
  Tag,
  MessageSquare,
  Gift,
  Edit,
  Copy,
  Crown,
  Check,
  X,
  AlertCircle,
  BarChart4,
  Star,
  FileEdit,
  Trash2,
  Plus,
  RefreshCw,
  UserCheck,
  ShoppingBag,
  History,
  Download,
  Filter,
  FileText,
  Search,
  ChevronDown,
  CalendarIcon
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { format, isToday, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ClientProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  services: ClientService[];
  preferences?: ClientPreference[];
  coupons?: ClientCoupon[];
  onUpdate?: (client: Client) => void;
  onDelete?: (clientId: string) => void;
}

export function ClientProfileDialog({
  isOpen,
  onClose,
  client,
  services,
  preferences = [],
  coupons = [],
  onUpdate,
  onDelete
}: ClientProfileDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [orderFilterDate, setOrderFilterDate] = useState<Date | undefined>(new Date());
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>("all");
  const [orderSearchTerm, setOrderSearchTerm] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  if (!client) return null;

  const clientServices = services.filter(service => service.clientId === parseInt(client.id));
  const clientPreferences = preferences.filter(pref => pref.clientId === parseInt(client.id));
  const clientCoupons = coupons.filter(coupon => coupon.clientId === parseInt(client.id));

  const completedServices = clientServices.filter(service => service.status === "completed");
  const scheduledServices = clientServices.filter(service => service.status === "scheduled");
  const canceledServices = clientServices.filter(service => service.status === "canceled");

  // Funções de filtro para pedidos
  const getTodayOrders = () => {
    return clientServices.filter(service => isToday(new Date(service.date)));
  };

  const getFilteredOrders = () => {
    let filtered = [...clientServices];
    
    // Filtro por termo de busca
    if (orderSearchTerm) {
      const searchLower = orderSearchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.service.toLowerCase().includes(searchLower) ||
        service.professional.toLowerCase().includes(searchLower) ||
        service.paymentMethod.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro por data
    if (orderFilterDate) {
      filtered = filtered.filter(service => 
        format(new Date(service.date), 'yyyy-MM-dd') === format(orderFilterDate, 'yyyy-MM-dd')
      );
    }
    
    // Filtro por status
    if (orderFilterStatus !== "all") {
      filtered = filtered.filter(service => service.status === orderFilterStatus);
    }
    
    return filtered;
  };

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Calcular serviço mais frequente
  const getMostFrequentService = () => {
    if (completedServices.length === 0) return "Nenhum serviço";
    
    const serviceCounts: Record<string, number> = {};
    completedServices.forEach(service => {
      serviceCounts[service.service] = (serviceCounts[service.service] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostFrequent = "";
    Object.entries(serviceCounts).forEach(([service, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = service;
      }
    });
    
    return mostFrequent;
  };

  // Status do cliente com ícone
  const getClientStatusBadge = (status: string) => {
    switch(status) {
      case 'vip':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Crown className="h-3 w-3 mr-1 text-yellow-600" />
            VIP
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inativo
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="h-3 w-3 mr-1 text-green-600" />
            Ativo
          </Badge>
        );
      default:
        return null;
    }
  };

  // Status do pedido com ícone
  const getOrderStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="h-3 w-3 mr-1 text-green-600" />
            Concluído
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Calendar className="h-3 w-3 mr-1 text-blue-600" />
            Agendado
          </Badge>
        );
      case 'canceled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <X className="h-3 w-3 mr-1 text-red-600" />
            Cancelado
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank');
  };

  const handleGenerateOrderReport = () => {
    setIsGeneratingReport(true);
    
    // Simulando geração de relatório
    setTimeout(() => {
      setIsGeneratingReport(false);
      // Aqui entraria a lógica real de geração do relatório
      alert(`Relatório de histórico de pedidos para ${client.name} gerado com sucesso!`);
    }, 1500);
  };

  const handleResetOrderFilters = () => {
    setOrderFilterDate(new Date());
    setOrderFilterStatus("all");
    setOrderSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Perfil do Cliente
            {getClientStatusBadge(client.status)}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start border-b pb-0 gap-2">
            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <User className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Scissors className="h-4 w-4 mr-2" />
              Atendimentos
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Heart className="h-4 w-4 mr-2" />
              Preferências
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Crown className="h-4 w-4 mr-2" />
              Fidelidade
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto pt-4">
            {/* Visão Geral */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Informações Pessoais */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">Informações Pessoais</CardTitle>
                      {isEditingMode && (
                        <Button variant="ghost" size="sm">
                          <FileEdit className="h-4 w-4 mr-1.5" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 items-start mb-6">
                      {client.photo ? (
                        <img
                          src={client.photo}
                          alt={client.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                          <span className="text-2xl font-semibold text-primary">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{client.name}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>Nascimento: {formatDate(client.birthDate)}</span>
                          </div>
                          {client.cpf && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Copy className="h-4 w-4 text-primary" />
                              <span>CPF: {client.cpf}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {client.address && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">Endereço</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">{client.address}</p>
                      </div>
                    )}

                    {client.observations && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-yellow-700 mb-1">Observações</p>
                            <p className="text-sm text-yellow-800">{client.observations}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {client.tags && client.tags.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="font-medium">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-1 ml-6 mt-1">
                          {client.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="px-2 py-0.5 text-xs border-primary/20 text-primary/80"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Estatísticas */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Estatísticas</CardTitle>
                    <CardDescription>Resumo da atividade do cliente</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <div className="bg-slate-50 p-3 rounded-md flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total de Visitas</p>
                          <p className="font-semibold">{client.visitsCount || 0}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-md flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Gasto</p>
                          <p className="font-semibold">{formatCurrency(client.totalSpent || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-md flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cashback Disponível</p>
                          <p className="font-semibold">{formatCurrency(client.cashback || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-md flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pontos Acumulados</p>
                          <p className="font-semibold">{client.points || 0}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Última visita:</span>
                        <span className="font-medium">
                          {client.lastVisit ? formatDate(client.lastVisit) : "Primeira visita"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Serviço mais frequente:</span>
                        <span className="font-medium">{getMostFrequentService()}</span>
                      </div>
                    </div>

                    {client.status !== 'vip' && (
                      <div className="mt-4">
                        <Button 
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" 
                          size="sm"
                        >
                          <Crown className="h-4 w-4 mr-1.5" />
                          Promover para VIP
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Próximo agendamento */}
                {scheduledServices.length > 0 && (
                  <Card className="md:col-span-3">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Próximos Agendamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {scheduledServices.slice(0, 3).sort((a, b) => 
                          new Date(a.date).getTime() - new Date(b.date).getTime()
                        ).map((service) => (
                          <div key={service.id} className="bg-blue-50 p-3 rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="font-medium">{service.service}</p>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    <span>{formatDate(service.date)}</span>
                                    <span>•</span>
                                    <span>{service.professional}</span>
                                    <span>•</span>
                                    <span>{formatCurrency(service.value)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" className="h-8 px-2">
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 px-2 border-red-200 text-red-500 hover:bg-red-50">
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Serviços */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Histórico de Serviços</CardTitle>
                      <CardDescription>
                        Todos os serviços realizados para {client.name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {}}>
                        <Plus className="h-4 w-4 mr-1.5" />
                        Novo Serviço
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {}}>
                        <BarChart4 className="h-4 w-4 mr-1.5" />
                        Ver Análise
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {clientServices.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Profissional</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Pagamento</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientServices
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((service) => (
                            <TableRow key={service.id}>
                              <TableCell>{formatDate(service.date)}</TableCell>
                              <TableCell className="font-medium">{service.service}</TableCell>
                              <TableCell>{service.professional}</TableCell>
                              <TableCell>{formatCurrency(service.value)}</TableCell>
                              <TableCell>{service.paymentMethod}</TableCell>
                              <TableCell>
                                {service.status === "completed" && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <Check className="h-3 w-3 mr-1" />
                                    Concluído
                                  </Badge>
                                )}
                                {service.status === "scheduled" && (
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Agendado
                                  </Badge>
                                )}
                                {service.status === "canceled" && (
                                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                    <X className="h-3 w-3 mr-1" />
                                    Cancelado
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <FileEdit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <Scissors className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                      <p>Nenhum serviço registrado para este cliente</p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Adicionar Primeiro Serviço
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferências */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Preferências do Cliente</CardTitle>
                      <CardDescription>
                        Informações sobre as preferências de {client.name}
                      </CardDescription>
                    </div>
                    {isEditingMode && (
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Nova Preferência
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {clientPreferences.length > 0 ? (
                    <div className="space-y-4">
                      {clientPreferences.map((pref) => (
                        <div 
                          key={pref.id} 
                          className="p-3 bg-slate-50 rounded-md flex justify-between items-start"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-primary" />
                              <h4 className="font-medium">{pref.category}</h4>
                            </div>
                            <p className="mt-1 ml-6 text-sm text-gray-600">{pref.description}</p>
                          </div>
                          {isEditingMode && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <Heart className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                      <p>Nenhuma preferência registrada para este cliente</p>
                      {isEditingMode && (
                        <Button variant="outline" size="sm" className="mt-3">
                          <Plus className="h-4 w-4 mr-1.5" />
                          Adicionar Preferência
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Nova aba de Pedidos */}
            <TabsContent value="orders" className="mt-0 h-full">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Histórico de Pedidos</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateOrderReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Gerar Relatório
                </Button>
              </div>
              
              {/* Filtros de pedidos */}
              <div className="bg-muted/30 p-3 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="orderSearch" className="text-xs mb-1 block">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="orderSearch"
                        placeholder="Buscar serviço, profissional..."
                        className="pl-8"
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="orderDate" className="text-xs mb-1 block">Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {orderFilterDate ? (
                            format(orderFilterDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={orderFilterDate}
                          onSelect={setOrderFilterDate}
                          initialFocus
                          locale={ptBR}
                        />
                        <div className="p-3 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setOrderFilterDate(undefined)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Limpar data
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="orderStatus" className="text-xs mb-1 block">Status</Label>
                    <Select 
                      value={orderFilterStatus} 
                      onValueChange={setOrderFilterStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="completed">Concluídos</SelectItem>
                        <SelectItem value="scheduled">Agendados</SelectItem>
                        <SelectItem value="canceled">Cancelados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {getFilteredOrders().length} pedidos encontrados
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetOrderFilters}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Redefinir filtros
                  </Button>
                </div>
              </div>
              
              {/* Pedidos do dia */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Pedidos de Hoje
                </h4>
                
                {getTodayOrders().length > 0 ? (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="space-y-3">
                      {getTodayOrders().map((order) => (
                        <div key={order.id} className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                          <div className="flex justify-between">
                            <div className="font-medium">{order.service}</div>
                            {getOrderStatusBadge(order.status)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-6">
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {order.professional}
                              </span>
                              <span className="flex items-center gap-1">
                                <Wallet className="h-3.5 w-3.5" />
                                {formatCurrency(order.value)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum pedido realizado hoje</p>
                  </div>
                )}
              </div>
              
              {/* Lista de todos os pedidos filtrados */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <History className="h-4 w-4 text-primary" />
                  Histórico de Pedidos
                </h4>
                
                {getFilteredOrders().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Serviço/Produto</TableHead>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredOrders().map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{formatDate(order.date)}</TableCell>
                          <TableCell>{order.service}</TableCell>
                          <TableCell>{order.professional}</TableCell>
                          <TableCell>{formatCurrency(order.value)}</TableCell>
                          <TableCell>{order.paymentMethod}</TableCell>
                          <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                    <p className="text-muted-foreground">Nenhum pedido encontrado com os filtros atuais</p>
                    <Button 
                      variant="link" 
                      onClick={handleResetOrderFilters} 
                      className="mt-2"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 