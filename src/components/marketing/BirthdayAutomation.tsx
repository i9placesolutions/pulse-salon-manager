
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Heart, Send, Clock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BirthdayAutomationConfig {
  isEnabled: boolean;
  messageTemplate: string;
  rewardType: 'discount' | 'service' | 'product';
  rewardValue: number;
  sendTime: string;
  channels: string[];
  validityDays: number;
}

export function BirthdayAutomation() {
  const [config, setConfig] = useState<BirthdayAutomationConfig>({
    isEnabled: false,
    messageTemplate: "Feliz aniversário, [nome]! 🎉\n\nPara celebrar seu dia especial, preparamos um presente para você: [benefício].\n\nVálido por [validade] dias.\n\nAproveite! 🎁",
    rewardType: 'discount',
    rewardValue: 20,
    sendTime: "09:00",
    channels: ['whatsapp'],
    validityDays: 30
  });

  const handleSaveConfig = () => {
    // To be implemented with backend
    console.log("Saving configuration:", config);
  };

  const handleTestMessage = () => {
    const testMessage = config.messageTemplate
      .replace("[nome]", "Maria Silva")
      .replace("[benefício]", getRewardText())
      .replace("[validade]", config.validityDays.toString());
    
    console.log("Test message:", testMessage);
  };

  const getRewardText = () => {
    switch (config.rewardType) {
      case 'discount':
        return `${config.rewardValue}% de desconto em qualquer serviço`;
      case 'service':
        return "um serviço gratuito à sua escolha*";
      case 'product':
        return "um produto especial de cuidados pessoais";
      default:
        return "";
    }
  };

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
                onValueChange={(value: 'discount' | 'service' | 'product') => 
                  setConfig({ ...config, rewardType: value })
                }
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
                    <RadioGroupItem value="product" id="reward-product" />
                    <Label htmlFor="reward-product">Produto Especial</Label>
                  </div>
                </div>
              </RadioGroup>
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

            <div className="grid gap-2">
              <Label>Canais de Envio</Label>
              <div className="space-y-2">
                {[
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'email', label: 'E-mail' },
                  { id: 'sms', label: 'SMS' }
                ].map(({ id, label }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Switch 
                      id={`channel-${id}`}
                      checked={config.channels.includes(id)}
                      onCheckedChange={(checked) => {
                        const channels = checked 
                          ? [...config.channels, id]
                          : config.channels.filter(c => c !== id);
                        setConfig({ ...config, channels });
                      }}
                    />
                    <Label htmlFor={`channel-${id}`}>{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="send-time">Horário de Envio</Label>
              <Input 
                id="send-time"
                type="time"
                value={config.sendTime}
                onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="message-template">Mensagem Personalizada</Label>
              <Textarea 
                id="message-template"
                value={config.messageTemplate}
                onChange={(e) => setConfig({ ...config, messageTemplate: e.target.value })}
                className="min-h-[150px]"
                placeholder="Use [nome], [benefício] e [validade] como variáveis na mensagem"
              />
              <p className="text-sm text-muted-foreground">
                Variáveis disponíveis: [nome], [benefício], [validade]
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
                messageTemplate: "Feliz aniversário, [nome]! 🎉\n\nPara celebrar seu dia especial, preparamos um presente para você: [benefício].\n\nVálido por [validade] dias.\n\nAproveite! 🎁",
                rewardType: 'discount',
                rewardValue: 20,
                sendTime: "09:00",
                channels: ['whatsapp'],
                validityDays: 30
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
