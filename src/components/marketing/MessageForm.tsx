import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X, FileIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MessageFormProps {
  title: string;
  message: string;
  onChange: (field: 'title' | 'message', value: string) => void;
  onMediaChange?: (mediaFile: { url: string; type: string; name?: string } | undefined) => void;
  mediaFile?: { url: string; type: string; name?: string };
}

export function MessageForm({ 
  title, 
  message, 
  onChange,
  onMediaChange,
  mediaFile
}: MessageFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onMediaChange) return;
    
    try {
      setIsUploading(true);
      
      // Aqui você pode implementar um upload real para seu servidor
      // Por enquanto, vamos simular com uma URL de arquivo local e FileReader
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64Data = reader.result as string;
        
        onMediaChange({
          url: base64Data,
          type: file.type,
          name: file.name
        });
        
        setIsUploading(false);
        toast.success("Arquivo carregado com sucesso");
      };
      
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Erro ao carregar arquivo");
        onMediaChange(undefined);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      setIsUploading(false);
      toast.error("Erro ao processar arquivo");
    }
  };

  const handleRemoveMedia = () => {
    if (onMediaChange) {
      onMediaChange(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Título</Label>
        <Input 
          id="title"
          placeholder="Ex: Promoção Especial"
          value={title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Mensagem</Label>
        <Textarea 
          id="message"
          placeholder="Digite sua mensagem... Use {nome} para inserir o nome do cliente"
          className="min-h-[120px] resize-y"
          value={message}
          onChange={(e) => onChange('message', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Dica: Use {"{nome}"} para inserir o nome do cliente na mensagem
        </p>
      </div>

      <div className="grid gap-2">
        <Label>Mídia</Label>
        {mediaFile ? (
          <div className="border rounded-md p-3 relative">
            <div className="flex items-center gap-2">
              <FileIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm truncate flex-1">{mediaFile.name || "Arquivo carregado"}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={handleRemoveMedia}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {mediaFile.type.startsWith('image') && (
              <div className="mt-2 max-h-32 overflow-hidden rounded">
                <img src={mediaFile.url} alt="Preview" className="w-full object-cover" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Carregando..." : "Adicionar Mídia"}
            </Button>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: imagens, vídeos, áudios e documentos (PDF, DOC, DOCX)
        </p>
      </div>
    </div>
  );
}
