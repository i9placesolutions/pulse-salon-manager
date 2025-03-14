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
  UserCheck
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  services: ClientService[];
  preferences?: ClientPreference[];
  coupons?: ClientCoupon[];
}

export function ClientProfileDialog({
  isOpen,
  onClose,
  client,
  services,
  preferences = [],
  coupons = [],
}: ClientProfileDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingMode, setIsEditingMode] = useState(false);

  if (!client) return null;

  const clientServices = services.filter(service => service.clientId === client.id);
  const clientPreferences = preferences.filter(pref => pref.clientId === client.id);
  const clientCoupons = coupons.filter(coupon => coupon.clientId === client.id);

  const completedServices = clientServices.filter(service => service.status === "completed");
  const scheduledServices = clientServices.filter(service => service.status === "scheduled");
  const canceledServices = clientServices.filter(service => service.status === "canceled");

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

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span>Perfil do Cliente</span>
              {getClientStatusBadge(client.status)}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                onClick={() => setIsEditingMode(!isEditingMode)}
              >
                {isEditingMode ? (
                  <>
                    <X className="h-4 w-4 mr-1.5" />
                    Cancelar Edição
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1.5" />
                    Editar Cliente
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                onClick={handleWhatsApp}
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                WhatsApp
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex-1">
                <User className="h-4 w-4 mr-1.5" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="services" className="flex-1">
                <Scissors className="h-4 w-4 mr-1.5" />
                Serviços
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex-1">
                <Heart className="h-4 w-4 mr-1.5" />
                Preferências
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex-1">
                <Gift className="h-4 w-4 mr-1.5" />
                Descontos
              </TabsTrigger>
            </TabsList>

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

            {/* Cupons e Descontos */}
            <TabsContent value="coupons">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Cupons e Descontos</CardTitle>
                      <CardDescription>
                        Ofertas especiais para {client.name}
                      </CardDescription>
                    </div>
                    {isEditingMode && (
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Novo Cupom
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {clientCoupons.length > 0 ? (
                    <div className="space-y-4">
                      {clientCoupons.map((coupon) => (
                        <div 
                          key={coupon.id} 
                          className={`p-3 ${coupon.isUsed ? 'bg-slate-100' : 'bg-green-50'} rounded-md flex justify-between items-start`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Gift className={`h-4 w-4 ${coupon.isUsed ? 'text-gray-400' : 'text-green-500'}`} />
                              <h4 className={`font-medium ${coupon.isUsed ? 'text-gray-500' : 'text-gray-900'}`}>
                                {coupon.discountType === 'percentage' 
                                  ? `${coupon.discount}% de desconto` 
                                  : `${formatCurrency(coupon.discount)} de desconto`}
                                {coupon.service && ` em ${coupon.service}`}
                              </h4>
                              {coupon.isUsed && (
                                <Badge variant="outline" className="text-gray-500 border-gray-300">
                                  Utilizado
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 ml-6">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Código:</span>
                                <code className="bg-gray-100 px-2 py-0.5 rounded">{coupon.code}</code>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span>Válido até: {formatDate(coupon.expirationDate)}</span>
                              </div>
                            </div>
                          </div>
                          {isEditingMode && !coupon.isUsed && (
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
                      <Gift className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                      <p>Nenhum cupom disponível para este cliente</p>
                      {isEditingMode && (
                        <Button variant="outline" size="sm" className="mt-3">
                          <Plus className="h-4 w-4 mr-1.5" />
                          Criar Novo Cupom
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Ações Rápidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button variant="outline" className="justify-start">
                        <Gift className="h-4 w-4 mr-1.5 text-primary" />
                        Enviar cupom de aniversário
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <UserCheck className="h-4 w-4 mr-1.5 text-primary" />
                        Aplicar desconto de indicação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 