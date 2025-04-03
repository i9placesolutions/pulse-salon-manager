import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Gift, Save, Check, ChevronsUpDown, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Mock de serviços para seleção
const availableServices = [
  { id: "1", name: "Corte Feminino", price: 120 },
  { id: "2", name: "Corte Masculino", price: 70 },
  { id: "3", name: "Hidratação", price: 90 },
  { id: "4", name: "Coloração", price: 180 },
  { id: "5", name: "Escova", price: 80 },
  { id: "6", name: "Manicure", price: 60 },
  { id: "7", name: "Pedicure", price: 70 },
  { id: "8", name: "Design de Sobrancelhas", price: 50 },
  { id: "9", name: "Massagem Relaxante", price: 120 },
  { id: "10", name: "Limpeza de Pele", price: 150 },
];

interface CouponFormData {
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  minPurchaseValue: number;
  restrictions: string[];
  services: string[];
}

interface CouponFormProps {
  data: CouponFormData;
  onClose: () => void;
  onChange: (data: CouponFormData) => void;
  onSave: () => void;
}

export function CouponForm({ data, onClose, onChange, onSave }: CouponFormProps) {
  // Estado para controlar se a opção de serviços específicos está selecionada
  const [applicationType, setApplicationType] = useState<string>(data.services.length === 0 ? "all" : "specific");
  const [searchTerm, setSearchTerm] = useState("");
  // Estado local para os serviços selecionados
  const [selectedServices, setSelectedServices] = useState<string[]>(data.services);

  // Atualizar o data.services quando selectedServices mudar
  useEffect(() => {
    onChange({ ...data, services: selectedServices });
    console.log("Serviços atualizados:", selectedServices);
  }, [selectedServices]);

  // Filtra serviços com base no termo de busca
  const filteredServices = availableServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para alternar a seleção de um serviço
  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => {
      const isSelected = prev.includes(serviceId);
      if (isSelected) {
        console.log(`Removendo serviço ${serviceId}`);
        return prev.filter(id => id !== serviceId);
      } else {
        console.log(`Adicionando serviço ${serviceId}`);
        return [...prev, serviceId];
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Cupom</CardTitle>
        <CardDescription>Configure um novo cupom promocional</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="coupon-code">Código do Cupom</Label>
            <Input 
              id="coupon-code"
              placeholder="Ex: SALAO10"
              value={data.code}
              onChange={(e) => onChange({ ...data, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="coupon-name">Nome da Promoção</Label>
            <Input 
              id="coupon-name"
              placeholder="Ex: Desconto de Boas-vindas"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>Tipo de Desconto</Label>
            <RadioGroup
              value={data.type}
              onValueChange={(value: 'percentage' | 'fixed') => 
                onChange({ ...data, type: value })
              }
            >
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="discount-percentage" />
                  <Label htmlFor="discount-percentage">Porcentagem (%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="discount-fixed" />
                  <Label htmlFor="discount-fixed">Valor Fixo (R$)</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="discount-value">Valor do Desconto</Label>
            <Input 
              id="discount-value"
              type="number"
              placeholder={data.type === 'percentage' ? '10' : '50'}
              value={data.value}
              onChange={(e) => onChange({ ...data, value: Number(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Validade</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Data de Início</Label>
                <Input 
                  id="start-date"
                  type="date"
                  value={data.startDate}
                  onChange={(e) => onChange({ ...data, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">Data de Término</Label>
                <Input 
                  id="end-date"
                  type="date"
                  value={data.endDate}
                  onChange={(e) => onChange({ ...data, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="max-uses">Limite de Uso</Label>
            <Input 
              id="max-uses"
              type="number"
              placeholder="Ex: 100"
              value={data.maxUses}
              onChange={(e) => onChange({ ...data, maxUses: Number(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="min-purchase">Valor Mínimo da Compra</Label>
            <Input 
              id="min-purchase"
              type="number"
              placeholder="Ex: 100"
              value={data.minPurchaseValue}
              onChange={(e) => onChange({ ...data, minPurchaseValue: Number(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Aplicação do Cupom</Label>
            <Select 
              value={applicationType}
              onValueChange={(value) => {
                setApplicationType(value);
                if (value === "all") {
                  setSelectedServices([]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a aplicação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                <SelectItem value="specific">Serviços específicos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {applicationType === "specific" && (
            <div className="grid gap-2">
              <Label>Selecione os serviços</Label>
              
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar serviço..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="border rounded-md p-1 max-h-[200px] overflow-y-auto">
                {filteredServices.map((service) => {
                  const isSelected = selectedServices.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button" 
                      className={`flex items-center w-full p-3 text-left hover:bg-slate-100 rounded-md ${
                        isSelected ? "bg-slate-100" : ""
                      }`}
                      onClick={() => toggleServiceSelection(service.id)}
                    >
                      <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                        isSelected ? "bg-primary border-primary" : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.name}</span>
                        <span className="text-sm text-muted-foreground">
                          R$ {service.price.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {filteredServices.length === 0 && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Nenhum serviço encontrado
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {selectedServices.length} serviço(s) selecionado(s)
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            <Gift className="mr-2 h-4 w-4" />
            Criar Cupom
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
