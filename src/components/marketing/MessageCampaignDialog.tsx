
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Send, Upload, Users } from "lucide-react";

interface MessageCampaignData {
  title: string;
  message: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom';
  channels: string[];
  scheduleDate?: string;
  scheduleTime?: string;
}

interface MessageCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MessageCampaignData;
  onChange: (data: MessageCampaignData) => void;
  onSubmit: () => void;
}

export function MessageCampaignDialog({ 
  open, 
  onOpenChange, 
  data, 
  onChange, 
  onSubmit 
}: MessageCampaignDialogProps) {
  // WhatsApp is now always enabled and can't be disabled
  if (!data.channels.includes('whatsapp')) {
    onChange({ ...data, channels: ['whatsapp'] });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Mensagem</DialogTitle>
          <DialogDescription>
            Configure e envie mensagens para seus clientes via WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title"
                placeholder="Ex: Promoção Especial"
                value={data.title}
                onChange={(e) => onChange({ ...data, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea 
                id="message"
                placeholder="Digite sua mensagem..."
                className="min-h-[120px]"
                value={data.message}
                onChange={(e) => onChange({ ...data, message: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Mídia</Label>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="w-full" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Adicionar Mídia
                </Button>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </div>
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
              {data.recipients === 'custom' && (
                <Button variant="outline" className="w-full mt-2">
                  <Users className="mr-2 h-4 w-4" />
                  Selecionar Contatos
                </Button>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Canal de Envio</Label>
              <div className="flex items-center gap-2">
                <Switch checked={true} disabled />
                <Label>WhatsApp</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="schedule-date">Data (Opcional)</Label>
                <Input 
                  type="date"
                  id="schedule-date"
                  value={data.scheduleDate}
                  onChange={(e) => onChange({ ...data, scheduleDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="schedule-time">Horário</Label>
                <Input 
                  type="time"
                  id="schedule-time"
                  value={data.scheduleTime}
                  onChange={(e) => onChange({ ...data, scheduleTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={onSubmit}>
              <Send className="mr-2 h-4 w-4" />
              {data.scheduleDate ? "Agendar" : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
