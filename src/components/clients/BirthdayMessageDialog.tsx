import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Client } from "@/types/client";
import { Cake, Gift, Phone, Send, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BirthdayMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

export function BirthdayMessageDialog({
  isOpen,
  onClose,
  client,
}: BirthdayMessageDialogProps) {
  const [message, setMessage] = useState("");
  const [offer, setOffer] = useState("10% de desconto no próximo serviço");
  const [includeOffer, setIncludeOffer] = useState(true);
  const { toast } = useToast();

  // Gerar mensagem de aniversário padrão quando o componente for montado
  useEffect(() => {
    const defaultMessage = `Olá ${client.name.split(" ")[0]}, a equipe do Salão Pulse deseja um Feliz Aniversário! 🎉 Agradecemos sua confiança e desejamos um dia repleto de alegria.`;
    setMessage(defaultMessage);
  }, [client.name]);

  const getFormattedMessage = () => {
    if (includeOffer) {
      return `${message}\n\nComo presente de aniversário, oferecemos: ${offer} 🎁`;
    }
    return message;
  };

  const handleSendWhatsApp = () => {
    const formattedMessage = encodeURIComponent(getFormattedMessage());
    const phoneNumber = client.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phoneNumber}?text=${formattedMessage}`, "_blank");
    toast({
      title: "Mensagem preparada para WhatsApp",
      description: "O WhatsApp foi aberto com a mensagem personalizada.",
    });
    onClose();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getFormattedMessage());
    toast({
      title: "Mensagem copiada",
      description: "A mensagem de aniversário foi copiada para a área de transferência.",
    });
  };

  const getBirthdayAge = () => {
    const birthDate = new Date(client.birthDate);
    const birthYear = birthDate.getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex-1 flex flex-col">
            <h3 className="font-medium text-lg">
              <Cake className="h-5 w-5 text-[#db2777] inline mr-2" />
              Mensagem de Aniversário
            </h3>
            <p className="text-sm text-muted-foreground">Envie uma mensagem personalizada para os clientes no dia do aniversário.</p>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="bg-[#db2777]/10 rounded-lg p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#db2777]/20 flex items-center justify-center">
              <Cake className="h-6 w-6 text-[#db2777]" />
            </div>
            <div>
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-gray-600">
                {new Date(client.birthDate).toLocaleDateString("pt-BR")} • {getBirthdayAge()} anos
              </p>
              <p className="text-sm text-gray-600">{client.phone}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Mensagem de aniversário</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 pb-2">
            <Checkbox
              id="include-offer"
              checked={includeOffer}
              onCheckedChange={(checked) => setIncludeOffer(!!checked)}
            />
            <Label htmlFor="include-offer" className="cursor-pointer">
              Incluir oferta especial
            </Label>
          </div>

          {includeOffer && (
            <div className="space-y-1.5">
              <Label htmlFor="offer" className="flex items-center gap-1.5">
                <div className="flex-shrink-0">
                  <Gift className="h-4 w-4 text-[#db2777]" />
                </div>
                Oferta especial
              </Label>
              <Input
                id="offer"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="Descreva a oferta especial"
              />
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium">Prévia da mensagem:</p>
            <p className="text-sm mt-1 whitespace-pre-line">{getFormattedMessage()}</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCopyMessage}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="flex-1">
                Cancelar
              </Button>
            </DialogClose>
          </div>
          <Button onClick={handleSendWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4 mr-2" />
            Enviar WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 