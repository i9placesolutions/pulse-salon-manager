
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send } from "lucide-react";
import { MessageForm } from "./MessageForm";
import { RecipientSelector } from "./RecipientSelector";
import { ScheduleForm } from "./ScheduleForm";

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

  const handleMessageChange = (field: 'title' | 'message', value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleRecipientsChange = (value: 'all' | 'vip' | 'inactive' | 'custom') => {
    onChange({ ...data, recipients: value });
  };

  const handleScheduleDateChange = (date: string) => {
    onChange({ ...data, scheduleDate: date });
  };

  const handleScheduleTimeChange = (time: string) => {
    onChange({ ...data, scheduleTime: time });
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
          <MessageForm 
            title={data.title}
            message={data.message}
            onChange={handleMessageChange}
          />

          <RecipientSelector 
            value={data.recipients}
            onChange={handleRecipientsChange}
          />

          <div className="grid gap-2">
            <Label>Canal de Envio</Label>
            <div className="flex items-center gap-2">
              <Switch checked={true} disabled />
              <Label>WhatsApp</Label>
            </div>
          </div>

          <ScheduleForm 
            date={data.scheduleDate || ''}
            time={data.scheduleTime || ''}
            onDateChange={handleScheduleDateChange}
            onTimeChange={handleScheduleTimeChange}
          />

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
