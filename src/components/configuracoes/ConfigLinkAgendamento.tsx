import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, QrCode, Eye, MessageCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ConfigLinkAgendamento() {
  const [customUrl, setCustomUrl] = useState("meu-salao");
  const { toast } = useToast();
  
  const copyBookingLink = () => {
    const link = `https://pulse-salon.com.br/${customUrl}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link de agendamento foi copiado para a área de transferência.",
    });
  };

  const openPreview = () => {
    window.open(`/public-booking/${customUrl}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <Card className="border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-100">
          <CardTitle className="text-purple-700">Link de Agendamento Personalizado</CardTitle>
          <CardDescription>
            Configure e compartilhe o link para seus clientes realizarem agendamentos online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="custom-url" className="text-purple-700">URL Personalizada</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-600">pulse-salon.com.br/</span>
              <Input
                id="custom-url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="meu-salao"
                className="flex-1 border-purple-200 focus:border-purple-400"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Esta URL será usada para o link de agendamento público que você pode compartilhar com seus clientes.
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="text-purple-700 font-medium mb-2">Link de Agendamento para Clientes</h3>
            <p className="text-sm text-gray-600 mb-3">
              Compartilhe este link com seus clientes para que eles possam agendar serviços diretamente pelo site:
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-white flex-1 p-2 border border-purple-200 rounded text-sm text-purple-800 font-mono">
                https://pulse-salon.com.br/{customUrl}
              </div>
              <Button 
                className="gap-2 whitespace-nowrap bg-purple-600 hover:bg-purple-700" 
                size="sm" 
                onClick={copyBookingLink}
              >
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Card className="border border-purple-100 bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <QrCode className="h-8 w-8 text-purple-600 mt-2" />
                  <h3 className="font-medium text-purple-700">QR Code</h3>
                  <p className="text-sm text-gray-500">
                    Gere um QR code para que seus clientes possam acessar a página de agendamento facilmente.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 border-purple-200 text-purple-600 hover:bg-purple-50">
                    Gerar QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-purple-100 bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Eye className="h-8 w-8 text-purple-600 mt-2" />
                  <h3 className="font-medium text-purple-700">Pré-visualizar</h3>
                  <p className="text-sm text-gray-500">
                    Veja como seus clientes visualizarão sua página de agendamento.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                    onClick={openPreview}
                  >
                    Visualizar Página
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-4 p-4 bg-pink-50 rounded-lg border border-pink-100">
            <h3 className="text-pink-700 font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Dica de Compartilhamento
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Adicione seu link de agendamento à biografia do Instagram, como mensagem automática no WhatsApp 
              e em suas redes sociais para que os clientes possam agendar a qualquer momento.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-pink-600 border-pink-200 hover:bg-pink-50">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Instagram
              </Button>
              <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Facebook
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 