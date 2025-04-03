import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send } from "lucide-react";
import { MessageForm } from "./MessageForm";
import { RecipientSelector } from "./RecipientSelector";
import { ScheduleForm } from "./ScheduleForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface MessageCampaignData {
  title: string;
  message: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom' | 'phone';
  channels: string[];
  scheduleDate?: string;
  scheduleTime?: string;
  mediaFile?: {
    url: string;
    type: string;
    name?: string;
  };
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

  const handleMediaChange = (mediaFile: { url: string; type: string; name?: string } | undefined) => {
    onChange({ ...data, mediaFile });
  };

  const handleRecipientsChange = (value: 'all' | 'vip' | 'inactive' | 'custom' | 'phone') => {
    onChange({ ...data, recipients: value });
  };

  const handleScheduleDateChange = (date: string) => {
    onChange({ ...data, scheduleDate: date });
  };

  const handleScheduleTimeChange = (time: string) => {
    onChange({ ...data, scheduleTime: time });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[95vw] max-w-[600px] sm:w-[600px] h-screen p-0 flex flex-col">
        {/* Cabeçalho fixo com cor diferenciada */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-200 px-6 py-4 sticky top-0 z-10">
          <SheetHeader className="pt-2">
            <SheetTitle className="text-xl text-pink-700">Nova Mensagem</SheetTitle>
            <SheetDescription className="text-pink-600">
              Configure e envie mensagens para seus clientes via WhatsApp
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Conteúdo com rolagem */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <MessageForm 
              title={data.title}
              message={data.message}
              onChange={handleMessageChange}
              onMediaChange={handleMediaChange}
              mediaFile={data.mediaFile}
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
          </div>
        </div>

        {/* Rodapé fixo com cor diferenciada */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-t border-pink-200 px-6 py-4 sticky bottom-0 z-10">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={onSubmit} className="bg-pink-600 hover:bg-pink-700">
              <Send className="mr-2 h-4 w-4" />
              {data.scheduleDate ? "Agendar" : "Enviar"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
