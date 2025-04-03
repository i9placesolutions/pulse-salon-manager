import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Heart, Send, Clock, Search, Info, Check, ChevronsUpDown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Tipo para serviço
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface BirthdayAutomationConfig {
  isEnabled: boolean;
  messageTemplate: string;
  rewardType: 'discount' | 'service' | 'none';
  rewardValue: number;
  sendTime: string;
  validityDays: number;
  selectedServiceId?: string;
}

export function BirthdayAutomation() {
  // Serviços disponíveis (mock data)
  const [services] = useState<Service[]>([
    { id: "1", name: "Corte Feminino", price: 120, duration: 60 },
    { id: "2", name: "Corte Masculino", price: 70, duration: 30 },
    { id: "3", name: "Hidratação", price: 90, duration: 45 },
    { id: "4", name: "Coloração", price: 180, duration: 120 },
    { id: "5", name: "Escova", price: 80, duration: 45 },
    { id: "6", name: "Manicure", price: 60, duration: 40 },
    { id: "7", name: "Pedicure", price: 70, duration: 50 },
    { id: "8", name: "Design de Sobrancelhas", price: 50, duration: 30 },
    { id: "9", name: "Massagem Relaxante", price: 120, duration: 60 },
    { id: "10", name: "Limpeza de Pele", price: 150, duration: 75 },
  ]);

  const [config, setConfig] = useState<BirthdayAutomationConfig>({
    isEnabled: false,
    messageTemplate: "Feliz aniversário, {nome}! 🎉\n\nPara celebrar seu dia especial, preparamos um presente para você: [benefício].\n\nVálido por [validade] dias.\n\nAproveite! 🎁",
    rewardType: 'discount',
    rewardValue: 20,
    sendTime: "09:00",
    validityDays: 30,
    selectedServiceId: ""
  });

  const [searchTerm, setSearchTerm] = useState("");

  const handleSaveConfig = () => {
    // To be implemented with backend
    console.log("Saving configuration:", config);
  };

  const handleTestMessage = () => {
    let testMessage = "";
    
    if (config.rewardType === 'none') {
      // Para mensagem sem benefício, substituir apenas o nome
      testMessage = config.messageTemplate
        .replace("{nome}", "Maria Silva")
        .replace(/\[benefício\].*?\[validade\].*?dias\./gs, ""); // Remove a parte do benefício e validade
    } else {
      // Mensagem normal com benefício
      testMessage = config.messageTemplate
        .replace("{nome}", "Maria Silva")
        .replace("[benefício]", getRewardText())
        .replace("[validade]", config.validityDays.toString());
    }
    
    console.log("Test message:", testMessage);
  };

  const getSelectedService = () => {
    return services.find(s => s.id === config.selectedServiceId);
  };

  const getRewardText = () => {
    switch (config.rewardType) {
      case 'discount':
        return `${config.rewardValue}% de desconto em qualquer serviço`;
      case 'service': {
        const service = getSelectedService();
        return service 
          ? `um(a) ${service.name} gratuito(a)`
          : "um serviço gratuito à sua escolha*";
      }
      case 'none':
        return "nenhum benefício adicional";
      default:
        return "";
    }
  };

  const handleRewardTypeChange = (value: 'discount' | 'service' | 'none') => {
    if (value === 'none') {
      // Mudar o template da mensagem para remover menções a benefícios e validade
      setConfig({ 
        ...config, 
        rewardType: value,
        messageTemplate: "Feliz aniversário, {nome}! 🎉\n\nQueremos celebrar esta data especial com você.\n\nTenha um dia maravilhoso! 🎁"
      });
    } else if (config.rewardType === 'none') {
      // Se está mudando de 'none' para outro tipo, restaurar template com benefício
      setConfig({ 
        ...config, 
        rewardType: value,
        messageTemplate: "Feliz aniversário, {nome}! 🎉\n\nPara celebrar seu dia especial, preparamos um presente para você: [benefício].\n\nVálido por [validade] dias.\n\nAproveite! 🎁"
      });
    } else {
      // Apenas mudar o tipo sem alterar o template
      setConfig({ ...config, rewardType: value });
    }
  };

  // Filtra serviços com base no termo de busca
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Automação de Aniversários</CardTitle>
              <CardDescription>Configure mensagens e benefícios automáticos para aniversariantes</CardDescription>
            </div>
            <Switch 
              checked={config.isEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, isEnabled: checked })}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Tipo de Benefício</Label>
              <RadioGroup
                value={config.rewardType}
                onValueChange={handleRewardTypeChange}
              >
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="discount" id="reward-discount" />
                    <Label htmlFor="reward-discount">Desconto Percentual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="service" id="reward-service" />
                    <Label htmlFor="reward-service">Serviço Gratuito</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="reward-none" />
                    <Label htmlFor="reward-none">Sem Benefício</Label>
                  </div>
                </div>
              </RadioGroup>
              
              <Alert variant="info" className="mt-2">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Todas as informações do benefício ficarão registradas no histórico do cliente quando utilizadas.
                </AlertDescription>
              </Alert>
            </div>

            {config.rewardType === 'discount' && (
              <div className="grid gap-2">
                <Label htmlFor="reward-value">Valor do Desconto (%)</Label>
                <Input 
                  id="reward-value"
                  type="number"
                  value={config.rewardValue}
                  onChange={(e) => setConfig({ ...config, rewardValue: Number(e.target.value) })}
                  min={1}
                  max={100}
                />
              </div>
            )}
            
            {config.rewardType === 'service' && (
              <div className="grid gap-2">
                <Label htmlFor="service-select">Serviço Gratuito</Label>
                
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
                    const isSelected = config.selectedServiceId === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button" 
                        className={`flex items-center w-full p-3 text-left hover:bg-slate-100 rounded-md ${
                          isSelected ? "bg-slate-100" : ""
                        }`}
                        onClick={() => setConfig({
                          ...config,
                          selectedServiceId: isSelected ? "" : service.id
                        })}
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
                  {config.selectedServiceId ? "1 serviço selecionado" : "Nenhum serviço selecionado"}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Label htmlFor="send-time">Horário de Envio (WhatsApp)</Label>
                <Input 
                  id="send-time"
                  type="time"
                  value={config.sendTime}
                  onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            {config.rewardType !== 'none' && (
              <div className="grid gap-2">
                <Label htmlFor="validity">Validade do Benefício (dias)</Label>
                <Input 
                  id="validity"
                  type="number"
                  value={config.validityDays}
                  onChange={(e) => setConfig({ ...config, validityDays: Number(e.target.value) })}
                  min={1}
                  max={365}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message-template">Mensagem Personalizada</Label>
              <Textarea 
                id="message-template"
                value={config.messageTemplate}
                onChange={(e) => setConfig({ ...config, messageTemplate: e.target.value })}
                className="min-h-[150px]"
                placeholder={config.rewardType === 'none' 
                  ? "Use {nome} para inserir o nome do cliente" 
                  : "Use {nome}, [benefício] e [validade] como variáveis na mensagem"}
              />
              <p className="text-sm text-muted-foreground">
                {config.rewardType === 'none' 
                  ? "Variáveis disponíveis: {nome}" 
                  : "Variáveis disponíveis: {nome}, [benefício], [validade]"}
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleTestMessage}>
              <Send className="mr-2 h-4 w-4" />
              Testar Mensagem
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setConfig({
                isEnabled: false,
                messageTemplate: config.rewardType === 'none'
                  ? "Feliz aniversário, {nome}! 🎉\n\nQueremos celebrar esta data especial com você.\n\nTenha um dia maravilhoso! 🎁"
                  : "Feliz aniversário, {nome}! 🎉\n\nPara celebrar seu dia especial, preparamos um presente para você: [benefício].\n\nVálido por [validade] dias.\n\nAproveite! 🎁",
                rewardType: config.rewardType,
                rewardValue: 20,
                sendTime: "09:00",
                validityDays: 30,
                selectedServiceId: ""
              })}>
                Redefinir
              </Button>
              <Button onClick={handleSaveConfig}>
                <Heart className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
