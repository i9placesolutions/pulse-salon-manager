
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageFormData {
  title: string;
  message: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom';
  selectedClients: string[];
  channels: string[];
  scheduledFor?: string;
}

interface MessageFormProps {
  data: MessageFormData;
  onClose: () => void;
  onChange: (data: MessageFormData) => void;
}

export function MessageForm({ data, onClose, onChange }: MessageFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Mensagem</CardTitle>
        <CardDescription>Envie uma mensagem personalizada para seus clientes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="message-title">Título</Label>
            <Input 
              id="message-title"
              placeholder="Ex: Novidades da Semana"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message-content">Mensagem</Label>
            <Textarea 
              id="message-content"
              placeholder="Digite sua mensagem..."
              className="min-h-[100px]"
              value={data.message}
              onChange={(e) => onChange({ ...data, message: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>Destinatários</Label>
            <RadioGroup
              value={data.recipients}
              onValueChange={(value: 'all' | 'vip' | 'inactive' | 'custom') => 
                onChange({ ...data, recipients: value })
              }
            >
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="recipients-all" />
                  <Label htmlFor="recipients-all">Todos os clientes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vip" id="recipients-vip" />
                  <Label htmlFor="recipients-vip">Clientes VIP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="recipients-inactive" />
                  <Label htmlFor="recipients-inactive">Clientes Inativos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="recipients-custom" />
                  <Label htmlFor="recipients-custom">Seleção Personalizada</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Canais de Envio</Label>
            <div className="space-y-2">
              {['whatsapp', 'email', 'notification'].map((channel) => (
                <div key={channel} className="flex items-center space-x-2">
                  <Switch 
                    id={`msg-channel-${channel}`}
                    checked={data.channels.includes(channel)}
                    onCheckedChange={(checked) => {
                      const channels = checked 
                        ? [...data.channels, channel]
                        : data.channels.filter(c => c !== channel);
                      onChange({ ...data, channels });
                    }}
                  />
                  <Label htmlFor={`msg-channel-${channel}`}>
                    {channel === 'whatsapp' ? 'WhatsApp' : 
                     channel === 'email' ? 'E-mail' : 
                     'Notificação no Sistema'}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="schedule-time">Agendar Envio (Opcional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                id="schedule-time" 
                type="date"
                value={data.scheduledFor}
                onChange={(e) => onChange({ ...data, scheduledFor: e.target.value })}
              />
              <Input type="time" defaultValue="09:00" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Enviar Mensagem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
