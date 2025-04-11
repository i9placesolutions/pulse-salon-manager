import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send, Info } from "lucide-react";
import { MessageForm } from "./MessageForm";
import { RecipientSelector } from "./RecipientSelector";
import { ScheduleForm } from "./ScheduleForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

export interface MessageCampaignData {
  title: string;
  message: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom' | 'phone';
  channels: string[];
  scheduleDate?: string;
  scheduleTime?: string;
  // Novos campos para contatos do WhatsApp
  selectedContactIds?: string[];
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
  const [processingSubmit, setProcessingSubmit] = useState(false);

  // WhatsApp is now always enabled and can't be disabled
  if (!data.channels.includes('whatsapp')) {
    onChange({ ...data, channels: ['whatsapp'] });
  }

  const handleMessageChange = (field: 'title' | 'message', value: string) => {
    onChange({ ...data, [field]: value });
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

  const handleSelectedContactsChange = (contactIds: string[]) => {
    onChange({ ...data, selectedContactIds: contactIds });
  };

  const handleSubmitWithDelay = async () => {
    setProcessingSubmit(true);
    
    try {
      // Chamar o onSubmit fornecido pelas props
      await onSubmit();
      
      // Fechar o diálogo após o envio bem-sucedido
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setProcessingSubmit(false);
    }
  };

  // Verifica se o formulário está pronto para envio
  const isFormValid = () => {
    if (!data.title || !data.message) return false;
    
    // Verificar a validade baseada no tipo de destinatários
    if (data.recipients === 'phone' && (!data.selectedContactIds || data.selectedContactIds.length === 0)) {
      return false;
    }
    
    // Se for agendamento, verificar se tem data e hora
    if (data.scheduleDate && !data.scheduleTime) return false;
    
    return true;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova Mensagem</SheetTitle>
          <SheetDescription>
            Configure e envie mensagens para seus clientes via WhatsApp
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <MessageForm 
            title={data.title}
            message={data.message}
            onChange={handleMessageChange}
          />

          <RecipientSelector 
            value={data.recipients}
            onChange={handleRecipientsChange}
            selectedContactIds={data.selectedContactIds || []}
            onSelectedContactsChange={handleSelectedContactsChange}
          />

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Canal de Envio</Label>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-xs text-blue-600 cursor-help">
                      <Info className="h-3 w-3 mr-1" />
                      Configuração de Delay
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>As mensagens serão enviadas com um intervalo aleatório entre 3 e 8 segundos para evitar bloqueios do WhatsApp.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
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
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processingSubmit}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitWithDelay}
              disabled={!isFormValid() || processingSubmit}
            >
              <Send className="mr-2 h-4 w-4" />
              {processingSubmit ? "Processando..." : data.scheduleDate ? "Agendar" : "Enviar"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
