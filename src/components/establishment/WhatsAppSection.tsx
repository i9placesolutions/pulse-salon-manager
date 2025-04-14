import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { EstablishmentWhatsApp } from './EstablishmentWhatsApp';
import { WhatsAppInstancesViewer } from "./WhatsAppInstancesViewer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, AlertCircle } from 'lucide-react';

export const WhatsAppSection = () => {
  return (
    <TabsContent value="whatsapp" className="space-y-4">
      <div className="grid gap-4">
        <Card className="border-green-100 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-600"></div>
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/50 rounded-lg shadow-sm border border-green-200">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-green-800">Integração WhatsApp</CardTitle>
                <CardDescription className="text-green-600">Configure o envio de mensagens automáticas para seus clientes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-3 bg-green-50 p-3 rounded-lg border border-green-100 mb-4">
              <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-medium mb-1">Por que usar a integração com WhatsApp?</p>
                <p>
                  Automatize suas comunicações com clientes através do WhatsApp. 
                  Envie confirmações, lembretes de agendamento e mensagens de aniversário, 
                  garantindo uma experiência completa e mantendo os clientes informados.
                </p>
              </div>
            </div>
            
            <EstablishmentWhatsApp />
          </CardContent>
        </Card>
        
        <WhatsAppInstancesViewer />
      </div>
    </TabsContent>
  );
};
