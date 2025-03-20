
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/currency";
import { Service } from "@/types/service";
import { useToast } from "@/hooks/use-toast";

interface ServiceSelectorProps {
  availableServices: Service[];
  selectedServices: {
    id: number;
    name: string;
    price: number;
  }[];
  onAddService: (serviceId: number) => void;
  onRemoveService: (serviceId: number) => void;
}

export function ServiceSelector({
  availableServices,
  selectedServices,
  onAddService,
  onRemoveService
}: ServiceSelectorProps) {
  const { toast } = useToast();
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");

  const handleAddService = () => {
    if (!selectedServiceId) return;
    
    const serviceId = Number(selectedServiceId);
    // Evita adicionar serviço duplicado
    if (selectedServices.some(s => s.id === serviceId)) {
      toast({
        title: "Serviço já adicionado",
        description: "Este serviço já está incluído no pacote.",
        variant: "destructive",
      });
      return;
    }
    
    onAddService(serviceId);
    setSelectedServiceId("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select
          value={selectedServiceId.toString()}
          onValueChange={(value) => setSelectedServiceId(Number(value))}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione um serviço" />
          </SelectTrigger>
          <SelectContent>
            {availableServices.map((service) => (
              <SelectItem key={service.id} value={service.id.toString()}>
                {service.name} - {formatCurrency(service.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAddService}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      
      {selectedServices.length > 0 ? (
        <div className="space-y-2">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-2 bg-background rounded border">
              <span>{service.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{formatCurrency(service.price)}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveService(service.id)}
                  className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Nenhum serviço adicionado ao pacote.
        </div>
      )}
    </div>
  );
}
