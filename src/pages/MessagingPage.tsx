import { useState } from "react";
import { WhatsAppSender } from "@/components/messaging/WhatsAppSender";
import { MAIN_INSTANCE_TOKEN } from "@/lib/whatsappApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function MessagingPage() {
  const [useMainInstance, setUseMainInstance] = useState(true);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Mensagens WhatsApp</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Configuração da Instância</CardTitle>
          <CardDescription>
            Escolha qual instância usar para enviar mensagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Switch 
              id="useMainInstance" 
              checked={useMainInstance} 
              onCheckedChange={setUseMainInstance}
            />
            <Label htmlFor="useMainInstance" className="font-medium">
              Usar instância principal do sistema
            </Label>
          </div>
          
          {useMainInstance ? (
            <Alert className="mt-4 bg-blue-50 border-blue-200">
              <InfoIcon className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700">Usando token principal</AlertTitle>
              <AlertDescription className="text-blue-600">
                As mensagens serão enviadas usando a instância principal (token: {MAIN_INSTANCE_TOKEN.substring(0, 8)}...{MAIN_INSTANCE_TOKEN.substring(MAIN_INSTANCE_TOKEN.length - 8)})
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mt-4 bg-amber-50 border-amber-200">
              <InfoIcon className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-700">Usando token do estabelecimento</AlertTitle>
              <AlertDescription className="text-amber-600">
                As mensagens serão enviadas usando a instância configurada nas configurações deste estabelecimento.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <WhatsAppSender token={useMainInstance ? MAIN_INSTANCE_TOKEN : undefined} />
    </div>
  );
} 