
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Users,
  Crown,
  Clock,
  Image as ImageIcon,
  Link,
  Send,
  CalendarClock
} from "lucide-react";

export function WhatsAppConfig() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros de Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Clientes Agendados
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Aniversariantes do Mês
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Clientes Inativos
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Crown className="mr-2 h-4 w-4" />
              Clientes VIP
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mensagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="Digite sua mensagem... Use {nome} para personalizar"
              className="h-32"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <ImageIcon className="mr-2 h-4 w-4" />
                Anexar Imagem
              </Button>
              <Button variant="outline" className="flex-1">
                <Link className="mr-2 h-4 w-4" />
                Adicionar Link
              </Button>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Enviar Agora
              </Button>
              <Button variant="outline" className="flex-1">
                <CalendarClock className="mr-2 h-4 w-4" />
                Agendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
