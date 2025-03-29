import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types/service";
import { formatCurrency } from "@/utils/currency";

interface QuickPOSProps {
  services: Service[];
  professionals: { id: number; name: string }[];
  onSale?: (data: {
    serviceId: number;
    professionalId: number;
    price: number;
  }) => void;
}

export function QuickPOS({ services, professionals, onSale }: QuickPOSProps) {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<number | "">(""); 
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSale = () => {
    if (!selectedService || !selectedProfessional) {
      toast({
        title: "Dados incompletos",
        description: "Selecione o serviço e o profissional para continuar.",
        variant: "destructive",
      });
      return;
    }

    onSale?.({
      serviceId: selectedService.id,
      professionalId: Number(selectedProfessional),
      price: selectedService.price,
    });

    toast({
      title: "Venda registrada",
      description: "O serviço foi registrado com sucesso!",
    });

    // Reset form
    setSelectedService(null);
    setSelectedProfessional("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venda Rápida</CardTitle>
        <CardDescription>Registre serviços rapidamente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Serviços Disponíveis</label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <Button
                  key={service.id}
                  variant={selectedService?.id === service.id ? "default" : "outline"}
                  className="justify-start gap-2"
                  onClick={() => setSelectedService(service)}
                >
                  <span className="truncate">{service.name}</span>
                  <span className="ml-auto">{formatCurrency(service.price)}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profissional</label>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(Number(e.target.value) || "")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione um profissional...</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium">Resumo</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Serviço:</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duração:</span>
                  <span>{selectedService.duration}min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedService.price)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            className="w-full gap-2"
            onClick={handleSale}
            disabled={!selectedService || !selectedProfessional}
          >
            <ShoppingCart className="h-4 w-4" />
            Registrar Serviço
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
