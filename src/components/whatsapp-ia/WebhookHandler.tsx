import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Check, AlertTriangle, Copy } from 'lucide-react';
import WhatsAppGPTService from '../../services/whatsapp/whatsappGptService';

interface WebhookHandlerProps {
  instanceId: string;
  instanceToken: string;
  establishmentId: string;
}

export const WebhookHandler: React.FC<WebhookHandlerProps> = ({
  instanceId,
  instanceToken,
  establishmentId
}) => {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [configuring, setConfiguring] = useState<boolean>(false);
  const [configured, setConfigured] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Gerar URL do webhook Vercel
  const generateVercelWebhookUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/webhook/whatsapp?establishmentId=${establishmentId}`;
  };

  // Configurar webhook
  const handleConfigureWebhook = async () => {
    try {
      setConfiguring(true);
      setError(null);

      const service = new WhatsAppGPTService(establishmentId);
      
      // Inicialize o serviço com as credenciais da instância
      const initialized = await service.initialize();
      
      if (!initialized) {
        throw new Error('Não foi possível inicializar o serviço de WhatsApp');
      }
      
      // URL do webhook
      const webhookUrlToUse = webhookUrl || generateVercelWebhookUrl();
      
      // Configurar webhook
      const success = await service.configureWebhook(webhookUrlToUse);
      
      if (!success) {
        throw new Error('Falha ao configurar webhook');
      }
      
      setConfigured(true);
      setWebhookUrl(webhookUrlToUse);
    } catch (error: any) {
      console.error('Erro ao configurar webhook:', error);
      setError(error.message || 'Erro ao configurar webhook');
    } finally {
      setConfiguring(false);
    }
  };

  // Copiar URL do webhook para a área de transferência
  const handleCopyWebhookUrl = () => {
    const url = webhookUrl || generateVercelWebhookUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-semibold mb-2">Configuração de Webhook</h3>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            O webhook é necessário para receber mensagens do WhatsApp e processá-las com IA.
            A URL deve ser publicamente acessível.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Label htmlFor="webhook-url">URL do Webhook</Label>
          <div className="flex gap-2">
            <Input
              id="webhook-url"
              placeholder={generateVercelWebhookUrl()}
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <Button 
              variant="outline" 
              onClick={handleCopyWebhookUrl}
              title="Copiar URL"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            URL do webhook que receberá as notificações de mensagens do WhatsApp. 
            Deixe em branco para usar a URL padrão da Vercel.
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div>
            {configured && (
              <Alert variant="success" className="p-2">
                <Check className="h-4 w-4" />
                <AlertTitle>Webhook Configurado</AlertTitle>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="p-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <Button 
            onClick={handleConfigureWebhook}
            disabled={configuring || !instanceToken}
          >
            {configuring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {configured ? 'Reconfigurar Webhook' : 'Configurar Webhook'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookHandler;
