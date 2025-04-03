import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ServicePackage, PackageService } from "@/types/service";

interface ServicePackageFormProps {
  onSave: (packageData: ServicePackage) => void;
  onCancel: () => void;
  initialPackage?: ServicePackage;
}

export function ServicePackageForm({ onSave, onCancel, initialPackage }: ServicePackageFormProps) {
  const [selectedService, setSelectedService] = useState<PackageService | null>(null);
  const [serviceData, setServiceData] = useState<Partial<ServicePackage>>(
    initialPackage || {
      name: "",
      description: "",
      services: [],
      discount: 0,
      status: "active",
      price: 0,
      expirationDays: 30,
    }
  );
  const [availableServices, setAvailableServices] = useState<PackageService[]>([]);
  const [serviceDiscount, setServiceDiscount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Simular a obtenção de serviços do backend
    setAvailableServices([
      { id: 1, name: "Corte de Cabelo", price: 60 },
      { id: 2, name: "Barba", price: 40 },
      { id: 3, name: "Coloração", price: 120 },
      { id: 4, name: "Hidratação", price: 90 },
      { id: 5, name: "Penteado", price: 80 },
    ]);
  }, []);

  const handleAddService = () => {
    if (!selectedService) {
      toast({
        title: "Selecione um serviço",
        description: "É necessário selecionar um serviço para adicionar ao pacote.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o serviço já está no pacote
    const isServiceAlreadyAdded = serviceData.services?.some(s => {
      if (typeof s === 'object' && 'serviceId' in s) {
        return s.serviceId === selectedService.id;
      }
      return false;
    });

    if (isServiceAlreadyAdded) {
      toast({
        title: "Serviço já adicionado",
        description: "Este serviço já faz parte do pacote.",
        variant: "destructive",
      });
      return;
    }

    // Adicionar serviço ao pacote
    setServiceData((prev) => ({
      ...prev,
      services: [
        ...(prev.services || []),
        {
          serviceId: selectedService.id,
          discount: serviceDiscount,
        },
      ],
    }));

    setSelectedService(null);
    setServiceDiscount(0);
  };

  const handleRemoveService = (serviceIndex: number) => {
    const updatedServices = serviceData.services?.filter((_, index) => index !== serviceIndex);
    setServiceData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

  const getDiscountedPrice = (originalPrice: number, discount: number) => {
    return originalPrice - (originalPrice * discount) / 100;
  };

  const getServiceName = (serviceId: number | string) => {
    const service = availableServices.find((s) => s.id === serviceId);
    return service ? service.name : "Serviço não encontrado";
  };

  const getServicePrice = (serviceId: number | string) => {
    const service = availableServices.find((s) => s.id === serviceId);
    return service ? service.price : 0;
  };

  const calculateTotalPrice = () => {
    let total = 0;

    serviceData.services?.forEach((serviceItem) => {
      if (typeof serviceItem === 'object' && 'serviceId' in serviceItem) {
        const servicePrice = getServicePrice(serviceItem.serviceId);
        const discountedPrice = getDiscountedPrice(servicePrice, serviceItem.discount);
        total += discountedPrice;
      }
    });

    // Aplicar desconto adicional do pacote
    if (serviceData.discount) {
      total = getDiscountedPrice(total, serviceData.discount);
    }

    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceData.name) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para o pacote.",
        variant: "destructive",
      });
      return;
    }

    if (!serviceData.services || serviceData.services.length === 0) {
      toast({
        title: "Adicione serviços",
        description: "O pacote deve conter pelo menos um serviço.",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = calculateTotalPrice();

    onSave({
      ...serviceData,
      price: totalPrice,
    } as ServicePackage);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Pacote</CardTitle>
          <CardDescription>
            Preencha os detalhes do pacote de serviços.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="name">Nome do Pacote</Label>
            <Input
              id="name"
              value={serviceData.name || ""}
              onChange={(e) =>
                setServiceData({ ...serviceData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={serviceData.description || ""}
              onChange={(e) =>
                setServiceData({ ...serviceData, description: e.target.value })
              }
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="discount">Desconto (%)</Label>
            <Input
              type="number"
              id="discount"
              value={serviceData.discount || 0}
              onChange={(e) =>
                setServiceData({
                  ...serviceData,
                  discount: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="expirationDays">Validade (dias)</Label>
            <Input
              type="number"
              id="expirationDays"
              value={serviceData.expirationDays || 30}
              onChange={(e) =>
                setServiceData({
                  ...serviceData,
                  expirationDays: parseInt(e.target.value),
                })
              }
            />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Serviços do Pacote</CardTitle>
            <CardDescription>
              Adicione serviços ao pacote e defina descontos individuais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Select
                onValueChange={(value) => {
                  const selected = availableServices.find(
                    (s) => s.id === Number(value)
                  );
                  setSelectedService(selected || null);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar Serviço" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Desconto (%)"
                value={serviceDiscount}
                onChange={(e) => setServiceDiscount(Number(e.target.value))}
                className="w-24"
              />
              <Button type="button" onClick={handleAddService}>
                Adicionar
              </Button>
            </div>
            {serviceData.services && serviceData.services.length > 0 ? (
              <ul className="list-none space-y-2">
                {serviceData.services.map((serviceItem, index) => {
                  if (typeof serviceItem === 'object' && 'serviceId' in serviceItem) {
                    return (
                      <li
                        key={index}
                        className="flex items-center justify-between border p-2 rounded-md"
                      >
                        <span>
                          {getServiceName(serviceItem.serviceId)} - Desconto:{" "}
                          {serviceItem.discount}%
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveService(index)}
                        >
                          Remover
                        </Button>
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhum serviço adicionado.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Pacote</Button>
      </div>
    </form>
  );
}
