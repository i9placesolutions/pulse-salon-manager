import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Scissors, 
  Clock, 
  Calendar, 
  User, 
  CreditCard, 
  Check, 
  CalendarPlus,
  PhoneCall,
  Clock3, 
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface QuickServiceCardProps {
  id: number;
  clientName: string;
  serviceName: string;
  price: number;
  duration: number;
  status?: 'scheduled' | 'waiting' | 'completed' | 'cancelled';
  time?: string;
  professionalName?: string;
  onSchedule?: (id: number) => void;
  onComplete?: (id: number) => void;
  onCall?: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

export function QuickServiceCard({
  id,
  clientName,
  serviceName,
  price,
  duration,
  status = 'waiting',
  time,
  professionalName,
  onSchedule,
  onComplete,
  onCall,
  onViewDetails
}: QuickServiceCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  const getStatusColor = () => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'waiting': return 'Em espera';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Função para extrair iniciais para avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${isHovering ? 'shadow-md' : 'shadow-sm'}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar do cliente */}
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-base font-semibold text-primary">
              {getInitials(clientName)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-medium truncate">{clientName}</h3>
              
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium truncate">{serviceName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{duration} min</span>
              </div>
              
              {time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{time}</span>
                </div>
              )}
              
              {professionalName && (
                <div className="flex items-center gap-2 col-span-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Com {professionalName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 bg-muted/30 flex justify-between items-center">
        <div className="flex gap-2">
          {status === 'waiting' && onSchedule && (
            <Button variant="ghost" size="sm" onClick={() => onSchedule(id)}>
              <CalendarPlus className="h-4 w-4 mr-1" />
              <span className="text-xs">Agendar</span>
            </Button>
          )}
          
          {status === 'scheduled' && onComplete && (
            <Button variant="ghost" size="sm" onClick={() => onComplete(id)}>
              <Check className="h-4 w-4 mr-1" />
              <span className="text-xs">Concluir</span>
            </Button>
          )}
          
          {onCall && (
            <Button variant="ghost" size="sm" onClick={() => onCall(id)}>
              <PhoneCall className="h-4 w-4 mr-1" />
              <span className="text-xs">Contato</span>
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 items-center">
          {onViewDetails && (
            <Button variant="ghost" size="sm" className="p-1 h-8" onClick={() => onViewDetails(id)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails && onViewDetails(id)}>
                Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCall && onCall(id)}>
                Enviar mensagem
              </DropdownMenuItem>
              {status === 'waiting' && (
                <DropdownMenuItem onClick={() => onSchedule && onSchedule(id)}>
                  Agendar serviço
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
} 