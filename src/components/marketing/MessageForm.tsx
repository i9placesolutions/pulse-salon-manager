import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface MessageFormProps {
  title: string;
  message: string;
  onChange: (field: 'title' | 'message', value: string) => void;
}

export function MessageForm({ title, message, onChange }: MessageFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file);
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
          className="min-h-[120px]"
          value={message}
          onChange={(e) => onChange('message', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Dica: Use {"{nome}"} para inserir o nome do cliente na mensagem
        </p>
      </div>

      {/* Seção de mídia removida conforme solicitado */}
    </div>
  );
}
