import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface WebhookTesterProps {
  instanceToken: string;
}

export const WebhookTester: React.FC<WebhookTesterProps> = ({ instanceToken }) => {
  const [webhookUrl, setWebhookUrl] = useState('https://app.pulsesalon.com.br/api/webhook/whatsapp');
  const [configuring, setConfiguring] = useState(false);
  const [checking, setChecking] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const { toast } = useToast();

  const configureWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: 'URL necessária',
        description: 'Por favor, informe a URL do webhook.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setConfiguring(true);
      
      const payload = {
        enabled: true,
        url: webhookUrl,
        events: [
          "connection",
          "history",
          "messages",
          "messages_update",
          "call",
          "contacts",
          "presence",
          "groups",
          "labels",
          "chats",
          "chat_labels",
          "blocks",
          "leads"
        ],
        excludeMessages: [
          "wasSentByApi"
        ],
        addUrlEvents: true,
        addUrlTypesMessages: true,
        action: "add"
      };
      
      console.log('Configurando webhook com payload:', payload);
      
      const response = await axios.post(
        'https://i9place3.uazapi.com/webhook',
        payload,
        {
          headers: {
            'token': instanceToken,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Resposta da configuração:', response.data);
      
      if (response.status === 200) {
        toast({
          title: 'Webhook configurado',
          description: 'O webhook foi configurado com sucesso!',
        });
        
        // Após configurar, verifica o status
        checkWebhookStatus();
      } else {
        toast({
          title: 'Erro',
          description: `Falha ao configurar webhook: ${response.statusText}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      toast({
        title: 'Erro',
        description: `Falha ao configurar webhook: ${error.response?.data?.error || error.message}`,
        variant: 'destructive',
      });
    } finally {
      setConfiguring(false);
    }
  };

  const checkWebhookStatus = async () => {
    try {
      setChecking(true);
      
      const response = await axios.get(
        'https://i9place3.uazapi.com/webhook',
        {
          headers: {
            'token': instanceToken
          }
        }
      );
      
      console.log('Status do webhook:', response.data);
      setWebhookStatus(response.data);
      
      toast({
        title: 'Status verificado',
        description: 'Status do webhook obtido com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao verificar status do webhook:', error);
      toast({
        title: 'Erro',
        description: `Falha ao verificar status: ${error.response?.data?.error || error.message}`,
        variant: 'destructive',
      });
      setWebhookStatus(null);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuração do Webhook</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="webhook-url">URL do Webhook</label>
          <div className="flex gap-2">
            <Input
              id="webhook-url"
              placeholder="https://app.pulsesalon.com.br/api/webhook/whatsapp"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <Button 
              onClick={configureWebhook}
              disabled={configuring}
            >
              {configuring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando
                </>
              ) : 'Configurar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Esta URL receberá as notificações do WhatsApp para processamento pela IA.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status do Webhook</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkWebhookStatus}
              disabled={checking}
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : 'Verificar'}
            </Button>
          </div>

          {webhookStatus ? (
            <div className="space-y-3 mt-2">
              <div className="flex gap-2 items-center">
                <Badge variant={webhookStatus.enabled ? "default" : "secondary"} className={webhookStatus.enabled ? "bg-green-500 hover:bg-green-600" : ""}>
                  {webhookStatus.enabled ? 'Ativo' : 'Inativo'}
                </Badge>
                {webhookStatus.url && (
                  <span className="text-sm truncate">{webhookStatus.url}</span>
                )}
              </div>

              {webhookStatus.events && webhookStatus.events.length > 0 && (
                <div>
                  <span className="text-xs font-medium">Eventos configurados:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {webhookStatus.events.map((event: string) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              Nenhuma informação disponível. Clique em verificar para consultar o status.
            </div>
          )}
        </div>

        <Alert>
          <AlertTitle>Configuração necessária no servidor</AlertTitle>
          <AlertDescription>
            <p className="text-sm">
              Certifique-se de que o endpoint <strong>/api/webhook/whatsapp</strong> esteja configurado no servidor do app.pulsesalon.com.br para processar as mensagens recebidas.
            </p>
            <p className="text-sm mt-2">
              Este endpoint deve estar preparado para receber e processar os eventos do WhatsApp conforme documentação da Uazapi.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
