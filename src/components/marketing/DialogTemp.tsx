import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send, Info, Upload, Image, X } from "lucide-react";
import { MessageForm } from "./MessageForm";
import { RecipientSelector } from "./RecipientSelector";
import { ScheduleForm } from "./ScheduleForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export interface MessageCampaignData {
  title: string;
  message: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom' | 'phone';
  channels: string[];
  scheduleDate?: string;
  scheduleTime?: string;
  // Novos campos para contatos do WhatsApp
  selectedContactIds?: string[];
  // Campos para imagem
  mediaUrl?: string;
  mediaType?: string;
  mediaName?: string;
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Manipulador para upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Verifica se o arquivo é uma imagem válida
    if (!file.type.startsWith('image/')) {
      setUploadError('Apenas imagens são permitidas (JPG, PNG, GIF)');
      return;
    }
    
    // Verifica o tamanho do arquivo (limite de 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem deve ter no máximo 5MB');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(10);
      setUploadError(null);
      
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `marketing-messages/${fileName}`;
      
      // Simular progresso durante o upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);

      // Upload para o bucket do Supabase
      const { data: uploadData, error } = await supabase.storage
        .from('pulsedados')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Alterado para true para permitir sobrescrever em caso de conflito
        });
      
      // Limpar o intervalo e definir progresso como 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (error) {
        console.error('Erro do Supabase ao fazer upload:', error);
        throw new Error(`Erro ao fazer upload: ${error.message}`);
      }
      
      if (!uploadData) {
        throw new Error('Upload falhou sem retornar dados');
      }
      
      // Obter a URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('pulsedados')
        .getPublicUrl(filePath);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem');
      }
      
      console.log('Upload bem-sucedido:', urlData.publicUrl);
      
      // Atualizar os dados da mensagem com a URL da mídia
      onChange({
        ...data,
        mediaUrl: urlData.publicUrl,
        mediaType: file.type,
        mediaName: file.name
      });
      
      // Limpar referência do input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      setUploadError(error.message || 'Falha ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };
  
  // Remover imagem
  const handleRemoveImage = () => {
    onChange({
      ...data,
      mediaUrl: undefined,
      mediaType: undefined,
      mediaName: undefined
    });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[500px] sm:max-w-[540px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Mensagem</DialogTitle>
          <DialogDescription>
            Configure e envie mensagens para seus clientes via WhatsApp
          </DialogDescription>
        </DialogHeader>

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

          {/* Seção de upload de imagem */}
          <div className="grid gap-2">
            <Label>Imagem (opcional)</Label>
            
            {!data.mediaUrl ? (
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  ref={fileInputRef}
                  disabled={uploading}
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-24 border-dashed justify-center gap-2"
                  onClick={() => {
                    // Usar setTimeout para garantir que o click seja processado
                    setTimeout(() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }, 0);
                  }}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Image className="h-5 w-5 mr-2" />
                      Adicionar Mídia
                    </>
                  )}
                </Button>
                
                {uploading && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-center mt-1">{uploadProgress}%</p>
                  </div>
                )}
                
                {uploadError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Card className="mt-2 overflow-hidden border-pink-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Image className="h-4 w-4 mr-2 text-pink-600" />
                      <span className="text-sm truncate max-w-[200px]">
                        {data.mediaName}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Miniatura da imagem */}
                  <div className="mt-2 p-1 bg-pink-50 rounded">
                    <div className="relative h-28 w-full overflow-hidden rounded">
                      <img 
                        src={data.mediaUrl} 
                        alt="Pré-visualização" 
                        className="h-full w-full object-contain object-center"
                        onError={(e) => {
                          // Em caso de erro no carregamento da imagem
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMiA2QzIgNS40NDc3MiAyLjQ0NzcyIDUgMyA1SDIxQzIxLjU1MjMgNSAyMiA1LjQ0NzcyIDIyIDZWMThDMjIgMTguNTUyMyAyMS41NTIzIDE5IDIxIDE5SDNDMi40NDc3MiAxOSAyIDE4LjU1MjMgMiAxOFY2WiIgc3Ryb2tlPSIjZjQ3M6Igc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTggMTBDMTguNTUyMyAxMCAxOSA5LjU1MjI4IDE5IDlDMTkgOC40NDc3MSAxOC41NTIzIDggMTggOEMxNy40NDc3IDggMTcgOC40NDc3MSAxNyA5QzE3IDkuNTUyMjggMTcuNDQ3NyAxMCAxOCAxMFoiIHN0cm9rZT0iI2Y0NzM7IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMiAxNUwxOCAxMkwxNC41IDE1LjVNMTQgMTVMOSAxMUw1IDE0SDJNMTAgMTRMMTMgMTYuNSIgc3Ryb2tlPSIjZjQ3M6IgbCvybo2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4='
                        }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Imagem carregada com sucesso
                  </p>
                </CardContent>
              </Card>
            )}
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
      </DialogContent>
    </Dialog>
  );
}
