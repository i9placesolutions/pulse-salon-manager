import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Phone, Mail, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function ConfigGeral() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificação do tipo de arquivo
    if (!file.type.includes("image/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    // Verificação do tamanho do arquivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoUrl(e.target?.result as string);
      toast({
        title: "Logo carregada com sucesso",
        description: "A logo foi atualizada e será salva quando você clicar em Salvar Alterações."
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Salão</CardTitle>
          <CardDescription>
            Configure as informações básicas do seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Salão</Label>
              <Input id="name" placeholder="Digite o nome do seu salão" />
            </div>
            <div className="grid gap-2">
              <Label>Logo do Salão</Label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                {logoUrl ? (
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-border">
                    <img 
                      src={logoUrl} 
                      alt="Logo do salão" 
                      className="h-full w-full object-cover" 
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6 bg-white"
                      onClick={triggerFileInput}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all"
                    onClick={triggerFileInput}
                  >
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Upload</span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  <p>Formatos aceitos: JPG, PNG, GIF</p>
                  <p>Tamanho máximo: 5MB</p>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Contatos</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <Input placeholder="Telefone do salão" />
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Input placeholder="E-mail do salão" />
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
          <CardDescription>
            Configure os horários de atendimento do seu salão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia) => (
              <div key={dia} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id={`dia-${dia}`} />
                  <Label htmlFor={`dia-${dia}`}>{dia}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="time" className="w-24" />
                  <span>às</span>
                  <Input type="time" className="w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
