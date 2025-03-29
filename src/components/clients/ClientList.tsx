import { useState } from "react";
import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Crown, 
  Scissors, 
  Calendar,
  Phone,
  User,
  Clock,
  Heart,
  MapPin,
  Star,
  Cake,
  Gift,
  CreditCard,
  Wallet,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  MoreHorizontal,
  Check,
  X,
  AlertCircle,
  Bookmark,
  Info,
  ExternalLink,
  Repeat
} from "lucide-react";
import { BirthdayMessageDialog } from "./BirthdayMessageDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ClientService } from "@/types/client";

interface ClientListProps {
  clients: Client[];
  onViewProfile: (client: Client) => void;
  showBirthdayInfo?: boolean;
  services?: ClientService[];
}

export function ClientList({ 
  clients, 
  onViewProfile, 
  showBirthdayInfo = false,
  services = []
}: ClientListProps) {
  const [selectedBirthdayClient, setSelectedBirthdayClient] = useState<Client | null>(null);
  const [isBirthdayMessageOpen, setIsBirthdayMessageOpen] = useState(false);
  const [expandedClient, setExpandedClient] = useState<number | null>(null);
  
  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  // Função para extrair o serviço preferido do cliente
  const getPreferredService = (client: Client) => {
    // Se o cliente tiver tags, use a primeira como serviço preferido
    if (client.tags && client.tags.length > 0) {
      return client.tags[0];
    }
    
    // Simulando que cliente tem serviço preferido
    const defaultServices = [
      "Corte Masculino",
      "Corte Feminino",
      "Barba",
      "Coloração",
      "Manicure",
      "Pedicure"
    ];
    
    // Usa o ID do cliente para selecionar um serviço da lista
    // Em uma implementação real, isso viria do backend
    return defaultServices[Number(client.id) % defaultServices.length];
  };

  // Função para extrair a data da última visita formatada
  const getFormattedLastVisit = (client: Client) => {
    if (!client.lastVisit) return "Primeira visita";
    const date = new Date(client.lastVisit);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Função para obter o dia do aniversário e idade
  const getBirthdayInfo = (client: Client) => {
    try {
      if (!client.birthDate) return { day: 0, age: 0 };
      
      const birthDate = new Date(client.birthDate);
      const day = birthDate.getDate();
      const birthYear = birthDate.getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      
      return { day, age };
    } catch (error) {
      console.error("Erro ao obter informações de aniversário:", error);
      return { day: 0, age: 0 };
    }
  };

  // Verificar se é aniversário hoje - método mais seguro
  const isBirthdayToday = (client: Client) => {
    try {
      if (!client || !client.birthDate) return false;
      
      const birthDate = new Date(client.birthDate);
      if (isNaN(birthDate.getTime())) return false; // Verifica se a data é válida
      
      const today = new Date();
      return birthDate.getDate() === today.getDate() && 
             birthDate.getMonth() === today.getMonth();
    } catch (error) {
      console.error("Erro ao verificar aniversário:", error);
      return false;
    }
  };

  const handleBirthdayMessage = (client: Client) => {
    setSelectedBirthdayClient(client);
    setIsBirthdayMessageOpen(true);
  };

  const toggleExpandClient = (clientId: number) => {
    setExpandedClient(prev => prev === clientId ? null : clientId);
  };

  // Obter os serviços de um cliente específico
  const getClientServices = (clientId: number) => {
    return services.filter(service => service.clientId === clientId);
  };

  // Obter o status do cliente
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

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {clients && clients.length > 0 ? clients.map((client) => {
        if (!client) return null;
        
        try {
          const birthdayInfo = getBirthdayInfo(client);
          const isTodayBirthday = isBirthdayToday(client);
          const clientServices = services && Array.isArray(services) ? getClientServices(Number(client.id)) : [];
          const isExpanded = expandedClient === Number(client.id);
          
          return (
            <Card 
              key={client.id} 
              className={cn(
                "overflow-hidden border-l-4 hover:shadow-md transition-all duration-300",
                isTodayBirthday ? 'bg-primary/5' : '',
                isExpanded ? 'shadow-md' : ''
              )}
              style={{ 
                borderLeftColor: isTodayBirthday ? '#EC4899' : 
                                client.status === 'vip' ? '#F59E0B' : 
                                client.status === 'inactive' ? '#9CA3AF' : '#84cc16' 
              }}
            >
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center gap-4">
                      {client.photo ? (
                        <img
                          src={client.photo}
                          alt={client.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                          {showBirthdayInfo ? (
                            <div className="flex flex-col items-center">
                              <span className="text-2xl font-bold text-primary">{birthdayInfo.day}</span>
                              <span className="text-xs text-primary/70">Dia</span>
                            </div>
                          ) : (
                            <span className="text-xl font-semibold text-primary">
                              {client.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-lg">{client.name}</h3>
                          {getClientStatusBadge(client.status)}
                          {isTodayBirthday && (
                            <Badge className="bg-[#db2777]/10 text-[#db2777] hover:bg-[#db2777]/10 animate-pulse">
                              <Cake className="h-3 w-3 mr-1 text-[#db2777]" />
                              Aniversário
                            </Badge>
                          )}
                          {client.cashback > 0 && (
                            <Badge className="bg-green-100 text-green-800">
                              <Wallet className="h-3 w-3 mr-1 text-green-600" />
                              {formatCurrency(client.cashback)}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-sm text-gray-600">{client.phone}</span>
                          </div>
                          
                          {showBirthdayInfo ? (
                            <div className="flex items-center text-xs">
                              <Cake className="h-3.5 w-3.5 text-[#db2777]" />
                              <span className="ml-1 text-[#db2777]">
                                Aniversariante do dia!
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Scissors className="h-3.5 w-3.5 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                Serviço frequente: {getPreferredService(client)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Última visita: {getFormattedLastVisit(client)}
                            </span>
                          </div>

                          {client.totalSpent !== undefined && (
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm text-gray-600">
                                Total gasto: <span className="font-medium">{formatCurrency(client.totalSpent)}</span>
                              </span>
                            </div>
                          )}

                          {client.tags && client.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Tag className="h-3.5 w-3.5 text-primary/70" />
                              <div className="flex flex-wrap gap-1">
                                {client.tags.map((tag, index) => (
                                  <Badge 
                                    key={`${client.id}-${tag}`} 
                                    variant="outline" 
                                    className="px-1.5 py-0 text-xs border-primary/20 text-primary/80"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-2 ml-auto mt-4 md:mt-0">
                      {showBirthdayInfo && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full bg-[#db2777]/10 text-[#db2777] border-[#db2777]/20 hover:bg-[#db2777]/20 w-full sm:w-auto"
                          onClick={() => handleBirthdayMessage(client)}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Enviar Oferta
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-dark w-full sm:w-auto"
                        onClick={() => handleWhatsApp(client.phone)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="rounded-full bg-primary hover:bg-primary-dark w-full sm:w-auto"
                        onClick={() => onViewProfile(client)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Ver Perfil
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpandClient(Number(client.id))}
                        className="rounded-full border border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-dark"
                        aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Seção expandida com serviços e mais informações */}
                  {isExpanded && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-150">
                      <div className="border-t pt-4 space-y-4">
                        {/* Linha de estatísticas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Visitas</p>
                                <p className="font-semibold">{client.visitsCount || 0}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total Gasto</p>
                                <p className="font-semibold">{formatCurrency(client.totalSpent || 0)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Wallet className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Cashback</p>
                                <p className="font-semibold">{formatCurrency(client.cashback || 0)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Star className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Pontos</p>
                                <p className="font-semibold">{client.points || 0}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Últimos serviços */}
                        {clientServices.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium flex items-center">
                              <Scissors className="h-4 w-4 mr-1.5 text-primary" />
                              Últimos Serviços
                            </h4>
                            <div className="grid gap-2">
                              {clientServices.slice(0, 3).map((service) => (
                                <div 
                                  key={service.id}
                                  className={cn(
                                    "p-3 rounded-md flex justify-between items-center text-sm",
                                    service.status === "completed" ? "bg-green-50" :
                                    service.status === "scheduled" ? "bg-blue-50" :
                                    service.status === "canceled" ? "bg-red-50" : "bg-gray-50"
                                  )}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{service.service}</span>
                                      {service.status === "completed" && (
                                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-none text-xs">
                                          <Check className="h-3 w-3 mr-0.5" />
                                          Concluído
                                        </Badge>
                                      )}
                                      {service.status === "scheduled" && (
                                        <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-none text-xs">
                                          <Calendar className="h-3 w-3 mr-0.5" />
                                          Agendado
                                        </Badge>
                                      )}
                                      {service.status === "canceled" && (
                                        <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-none text-xs">
                                          <X className="h-3 w-3 mr-0.5" />
                                          Cancelado
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                      <span>{new Date(service.date).toLocaleDateString('pt-BR')}</span>
                                      <span>•</span>
                                      <span>{service.professional}</span>
                                      <span>•</span>
                                      <span>{formatCurrency(service.value)}</span>
                                    </div>
                                  </div>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="cursor-pointer">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Ver detalhes
                                      </DropdownMenuItem>
                                      {service.status === "completed" && (
                                        <DropdownMenuItem className="cursor-pointer">
                                          <Repeat className="h-4 w-4 mr-2" />
                                          Repetir serviço
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))}
                            </div>
                            {clientServices.length > 3 && (
                              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary-dark" onClick={() => onViewProfile(client)}>
                                Ver todos os serviços
                                <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-md text-sm text-center text-gray-500">
                            Nenhum serviço registrado para este cliente
                          </div>
                        )}
                        
                        {/* Observações do cliente, se houver */}
                        {client.observations && (
                          <div className="bg-yellow-50 p-3 rounded-md">
                            <div className="flex gap-2">
                              <Info className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-yellow-700 mb-1">Observações</p>
                                <p className="text-sm text-yellow-800">{client.observations}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-0 bg-gradient-to-r from-primary/5 to-primary/0 border-t border-primary/10">
                <div className="w-full px-4 py-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">ID: {client.id}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary hover:bg-primary/10"
                    onClick={() => toggleExpandClient(Number(client.id))}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5 mr-1" />
                        Menos detalhes
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5 mr-1" />
                        Mais detalhes
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        } catch (error) {
          console.error(`Erro ao renderizar cliente ${client.id}:`, error);
          return null;
        }
      }) : (
        <div className="text-center py-12 border rounded-md border-dashed border-gray-300">
          <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">Tente ajustar seus filtros de busca</p>
        </div>
      )}

      {selectedBirthdayClient && (
        <BirthdayMessageDialog
          isOpen={isBirthdayMessageOpen}
          onClose={() => setIsBirthdayMessageOpen(false)}
          client={selectedBirthdayClient}
        />
      )}
    </div>
  );
}
