
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";

interface ScheduleFormData {
  title: string;
  type: 'message' | 'discount' | 'coupon';
  message?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  startDate: string;
  endDate: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom';
  channels: string[];
}

interface ScheduleFormProps {
  data: ScheduleFormData;
  onClose: () => void;
  onChange: (data: ScheduleFormData) => void;
}

export function ScheduleForm({ data, onClose, onChange }: ScheduleFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Campanha</CardTitle>
        <CardDescription>Configure uma campanha para ser executada automaticamente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="schedule-title">Título da Campanha</Label>
            <Input 
              id="schedule-title"
              placeholder="Ex: Promoção de Fim de Semana"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>Tipo de Campanha</Label>
            <RadioGroup
              value={data.type}
              onValueChange={(value: 'message' | 'discount' | 'coupon') => 
                onChange({ ...data, type: value })
              }
            >
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="message" id="type-message" />
                  <Label htmlFor="type-message">Mensagem</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="discount" id="type-discount" />
                  <Label htmlFor="type-discount">Desconto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="coupon" id="type-coupon" />
                  <Label htmlFor="type-coupon">Cupom</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {data.type === 'message' && (
            <div className="grid gap-2">
              <Label htmlFor="schedule-message">Mensagem</Label>
              <Textarea 
                id="schedule-message"
                placeholder="Digite sua mensagem..."
                className="min-h-[100px]"
                value={data.message}
                onChange={(e) => onChange({ ...data, message: e.target.value })}
              />
            </div>
          )}

          {(data.type === 'discount' || data.type === 'coupon') && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Tipo de Desconto</Label>
                <RadioGroup
                  value={data.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    onChange({ ...data, discountType: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="discount-percentage" />
                    <Label htmlFor="discount-percentage">Porcentagem (%)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="discount-fixed" />
                    <Label htmlFor="discount-fixed">Valor Fixo (R$)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="discount-value">Valor do Desconto</Label>
                <Input 
                  id="discount-value"
                  type="number"
                  placeholder={data.discountType === 'percentage' ? '10' : '50'}
                  value={data.discountValue}
                  onChange={(e) => onChange({
                    ...data,
                    discountValue: Number(e.target.value)
                  })}
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Período da Campanha</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="schedule-start">Data de Início</Label>
                <Input 
                  id="schedule-start"
                  type="date"
                  value={data.startDate}
                  onChange={(e) => onChange({
                    ...data,
                    startDate: e.target.value
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule-end">Data de Término</Label>
                <Input 
                  id="schedule-end"
                  type="date"
                  value={data.endDate}
                  onChange={(e) => onChange({
                    ...data,
                    endDate: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Público-alvo</Label>
            <RadioGroup
              value={data.recipients}
              onValueChange={(value: 'all' | 'vip' | 'inactive' | 'custom') => 
                onChange({ ...data, recipients: value })
              }
            >
              <div className="grid gap-2">
                {[
                  { value: 'all', label: 'Todos os clientes' },
                  { value: 'vip', label: 'Clientes VIP' },
                  { value: 'inactive', label: 'Clientes Inativos' },
                  { value: 'custom', label: 'Seleção Personalizada' }
                ].map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`schedule-${value}`} />
                    <Label htmlFor={`schedule-${value}`}>{label}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Canais de Comunicação</Label>
            <div className="space-y-2">
              {[
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'email', label: 'E-mail' },
                { id: 'notification', label: 'Notificação no Sistema' }
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-2">
                  <Switch 
                    id={`schedule-channel-${id}`}
                    checked={data.channels.includes(id)}
                    onCheckedChange={(checked) => {
                      const channels = checked 
                        ? [...data.channels, id]
                        : data.channels.filter(c => c !== id);
                      onChange({ ...data, channels });
                    }}
                  />
                  <Label htmlFor={`schedule-channel-${id}`}>{label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Agendar Campanha
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
