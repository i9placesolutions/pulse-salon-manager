
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
  CalendarClock,
  PauseCircle,
  PlayCircle,
  XCircle,
  ImportIcon,
  History,
  List,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Dados mockados para exemplo
const activeDispatches = [
  {
    id: 1,
    status: 'in_progress',
    recipients: 150,
    delivered: 45,
    failed: 2,
    messageContent: "Olá {nome}, temos uma promoção especial para você!",
    type: 'manual',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    status: 'paused',
    recipients: 200,
    delivered: 100,
    failed: 5,
    messageContent: "Feliz aniversário, {nome}!",
    type: 'automatic',
    createdAt: new Date().toISOString()
  }
];

export function WhatsAppConfig() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Painel de Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros de Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setSelectedFilter('scheduled')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Clientes Agendados
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setSelectedFilter('birthday')}
            >
              <Users className="mr-2 h-4 w-4" />
              Aniversariantes do Mês
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setSelectedFilter('inactive')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Clientes Inativos
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setSelectedFilter('vip')}
            >
              <Crown className="mr-2 h-4 w-4" />
              Clientes VIP
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <ImportIcon className="mr-2 h-4 w-4" />
              Importar Contatos da API
            </Button>
          </CardContent>
        </Card>

        {/* Painel de Mensagem */}
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

      {/* Painel de Controle de Disparos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Controle de Disparos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeDispatches.map((dispatch) => (
              <div key={dispatch.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant={dispatch.status === 'in_progress' ? 'default' : 'secondary'}>
                      {dispatch.status === 'in_progress' ? 'Em Andamento' : 'Pausado'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(dispatch.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {dispatch.status === 'in_progress' ? (
                      <Button size="icon" variant="outline">
                        <PauseCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="outline">
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="outline" className="text-destructive">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm">{dispatch.messageContent}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round((dispatch.delivered / dispatch.recipients) * 100)}%</span>
                  </div>
                  <Progress value={(dispatch.delivered / dispatch.recipients) * 100} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Enviadas: {dispatch.delivered}/{dispatch.recipients}</span>
                    <span>Falhas: {dispatch.failed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline">
              <History className="mr-2 h-4 w-4" />
              Histórico de Envios
            </Button>
            <Button variant="outline">
              <List className="mr-2 h-4 w-4" />
              Ver Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Envio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Total Enviado</h3>
            </div>
            <p className="text-2xl font-bold mt-2">1,234</p>
            <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h3 className="font-medium">Taxa de Erro</h3>
            </div>
            <p className="text-2xl font-bold mt-2">1.2%</p>
            <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <h3 className="font-medium">Taxa de Entrega</h3>
            </div>
            <p className="text-2xl font-bold mt-2">98.8%</p>
            <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
