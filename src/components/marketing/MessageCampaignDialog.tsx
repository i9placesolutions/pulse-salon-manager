import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Send, Info, Upload, Image, X } from "lucide-react";
import { MessageForm } from "./MessageForm";
import { RecipientSelector } from "./RecipientSelector";
import { ScheduleForm } from "./ScheduleForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sendAdvancedMessage } from "@/lib/uazapiService";
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
      // Obter os valores de delay dos campos de entrada
      const minDelayInput = document.getElementById('min-delay-input') as HTMLInputElement;
      const maxDelayInput = document.getElementById('max-delay-input') as HTMLInputElement;
      
      const minDelay = minDelayInput ? parseInt(minDelayInput.value) || 3 : 3;
      const maxDelay = maxDelayInput ? parseInt(maxDelayInput.value) || 8 : 8;
      
      // Verificar se há destinatários selecionados
      if (!data.selectedContactIds || data.selectedContactIds.length === 0) {
        throw new Error("Selecione pelo menos um destinatário");
      }
      
      // Verificar se há mensagem
      if (!data.message || data.message.trim() === "") {
        throw new Error("A mensagem não pode estar vazia");
      }
      
      let resultado;
      
      console.log('Enviando mensagem com o novo endpoint avançado:', {
        destinatários: data.selectedContactIds,
        mensagem: data.message,
        tem_midia: !!data.mediaUrl,
        minDelay,
        maxDelay
      });
      
      // Utilizar o novo endpoint avançado para ambos os casos (com ou sem mídia)
      try {
        resultado = await sendAdvancedMessage(
          data.selectedContactIds,
          data.message,
          data.mediaUrl, // URL da mídia (opcional)
          data.mediaType, // Tipo da mídia (opcional)
          data.mediaName, // Nome do arquivo (opcional)
          minDelay,
          maxDelay
        );
        
        console.log('Resultado do envio avançado:', resultado);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw new Error(`Erro ao enviar mensagem: ${(error as Error).message}`);
      }
      
      console.log('Resultado do envio:', resultado);
      
      // Chamar o onSubmit fornecido pelas props para atualizar estado na aplicação
      await onSubmit();
      
      // Fechar o diálogo após o envio bem-sucedido
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert(`Erro ao enviar mensagem: ${(error as Error).message}`);
    } finally {
      setProcessingSubmit(false);
    }
  };

  // Manipulador para upload de arquivo do input padrão
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('Nenhum arquivo selecionado');
      return;
    }
    
    // Chama a função que processa o arquivo
    await handleUploadFile(file);
  };
  
  // Verifica se pode acessar o bucket pulsedados
  const checkBucket = async () => {
    try {
      // Usamos o bucket padrão definido no projeto do Supabase
      // No Supabase, este bucket já deve ter sido criado pelo administrador
      const bucketName = 'pulsedados';
      
      // Vamos apenas verificar se podemos listar arquivos no bucket
      // como forma de validar o acesso
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('marketing', {
          limit: 1 // Apenas para testar o acesso, limitamos a 1 resultado
        });
        
      if (error) {
        console.error('Erro ao acessar bucket:', error);
        alert('Não foi possível acessar o armazenamento. Por favor, tente novamente ou contate o suporte.');
        return false;
      }
      
      console.log('Bucket acessado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao verificar acesso ao bucket:', error);
      return false;
    }
  };
  
  // Função que lida com o upload do arquivo
  const handleUploadFile = async (file: File) => {
    // Verifica se o arquivo é uma mídia válida (imagem, vídeo ou documento)
    if (!file.type.startsWith('image/') && 
        !file.type.startsWith('video/') && 
        !file.type.startsWith('application/pdf') &&
        !file.type.startsWith('application/msword') &&
        !file.type.startsWith('application/vnd.openxmlformats-officedocument') &&
        !file.type.startsWith('application/vnd.ms-')) {
      alert('Tipo de arquivo não suportado. Por favor, selecione uma imagem, vídeo ou documento.');
      return;
    }
    
    // Verificar se o tamanho do arquivo é menor que 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo é muito grande. Por favor, selecione um arquivo menor que 5MB.');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      // Verificar e criar bucket se necessário
      const bucketReady = await checkBucket();
      
      if (!bucketReady) {
        throw new Error('Não foi possível preparar o armazenamento de arquivos');
      }
      
      const bucketName = 'pulsedados';
      
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `marketing/${fileName}`;
      
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Upload para o bucket do Supabase
      console.log(`Enviando para o bucket ${bucketName}`);
      const { data: uploadData, error } = await supabase.storage
        .from(bucketName)
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
        console.error('Upload falhou sem retornar dados');
        throw new Error('Upload falhou sem retornar dados');
      }
      
      console.log('Upload realizado com sucesso, obtendo URL pública...');
      
      // Obter a URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      console.log('Resultado da getPublicUrl:', urlData);
      
      if (!urlData || !urlData.publicUrl) {
        console.error('Falha ao obter URL pública');
        throw new Error('Não foi possível obter a URL pública da imagem');
      }
      
      console.log('Upload completado com sucesso!');
      console.log('URL da imagem:', urlData.publicUrl);
      
      // Atualizar os dados da mensagem com a URL da mídia
      const updatedData = {
        ...data,
        mediaUrl: urlData.publicUrl,
        mediaType: file.type,
        mediaName: file.name
      };
      
      console.log('Atualizando dados da mensagem com a mídia:', updatedData);
      onChange(updatedData);
      
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
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent 
        className="fixed right-0 top-0 bottom-0 h-screen w-[480px] max-w-[95vw] rounded-l-lg rounded-r-none overflow-y-auto border-l border-pink-200 shadow-xl"
        style={{ 
          marginRight: 0, 
          marginTop: 0,
          marginBottom: 0,
          height: '100vh', 
          maxHeight: '100vh',
          paddingTop: '1.5rem',
          paddingBottom: '5rem',
          overflowY: 'auto',
          transform: 'none',
          position: 'fixed',
          inset: 'auto 0 0 auto',
          transition: 'transform 0.2s ease'
        }}
      >
        <DialogHeader className="sticky top-0 pt-3 pb-3 bg-white border-b border-gray-100 z-10 shadow-sm">
          <DialogTitle className="text-xl font-semibold text-pink-700">Nova Mensagem</DialogTitle>
          <DialogDescription className="text-gray-600">
            Envie uma mensagem para seus clientes via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <MessageForm 
            title={data.title}
            message={data.message}
            onChange={handleMessageChange}
          />
          
          {/* Seção de upload de mídia */}
          <div className="grid gap-2">
            <Label>Mídia (opcional)</Label>
            {!data.mediaUrl ? (
              <div className="w-full border border-gray-200 rounded-md p-4">
                <div className="flex items-center space-x-3 mb-3 justify-center">
                  <svg className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="h-4 w-[1px] bg-gray-300"></div>
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <div className="h-4 w-[1px] bg-gray-300"></div>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-dashed border-pink-200 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Enviando..." : "Adicionar Mídia"}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Imagem, vídeo ou documento
                </p>
                
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  ref={fileInputRef}
                  disabled={uploading}
                />
                
                {uploading && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-center mt-1 text-gray-500">{uploadProgress}%</p>
                  </div>
                )}
                
                {uploadError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between bg-gray-50 p-3 border-b">
                    <div className="font-medium text-sm truncate">{data.mediaName}</div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                    {data.mediaType?.startsWith('image/') ? (
                      <img 
                        src={data.mediaUrl} 
                        alt={data.mediaName || 'Mídia'} 
                        className="object-cover w-full h-full"
                      />
                    ) : data.mediaType?.startsWith('video/') ? (
                      <div className="flex items-center justify-center h-full">
                        <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm ml-2">{data.mediaName}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <svg className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm ml-2">{data.mediaName}</p>
                      </div>
                    )}                      
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Configuração de Delay */}
          <div className="grid gap-2">
            <div className="flex items-center justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-xs text-blue-600 cursor-help">
                      <Info className="h-3 w-3 mr-1" />
                      Por que o delay é importante?
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>As mensagens serão enviadas com um intervalo de delay aleatório para evitar bloqueios do WhatsApp.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-1 p-3 border border-blue-100 rounded-md bg-blue-50/50">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Delay Mínimo (segundos)</Label>
                <Input
                  id="min-delay-input"
                  type="number"
                  min="1"
                  max="60"
                  defaultValue="3"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Delay Máximo (segundos)</Label>
                <Input
                  id="max-delay-input"
                  type="number"
                  min="1"
                  max="60"
                  defaultValue="8"
                  className="h-9"
                />
              </div>
              <div className="col-span-2 mt-1">
                <p className="text-xs text-gray-500">
                  Valores recomendados: entre 3 e 8 segundos. Valores muito baixos podem causar bloqueio temporário pela API do WhatsApp.
                </p>
              </div>
            </div>
          </div>

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
          
          {/* Espaço adicional para evitar sobreposição com os botões fixos */}
          <div className="pb-20"></div>
          {/* Rodapé com botões fixos na parte inferior */}
          <div className="fixed bottom-0 right-0 w-[480px] max-w-[95vw] bg-white border-t border-pink-100 p-4 shadow-md rounded-bl-lg">
            <div className="flex gap-2 justify-end">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={processingSubmit}>
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmitWithDelay}
                disabled={!isFormValid() || processingSubmit} 
                className="bg-pink-600 text-white hover:bg-pink-700"
              >
                {processingSubmit ? "Processando..." : data.scheduleDate ? "Agendar" : "Enviar"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
