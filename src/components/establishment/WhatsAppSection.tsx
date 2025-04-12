import React from 'react';
import { EstablishmentWhatsApp } from './EstablishmentWhatsApp';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WhatsAppSectionProps {
  profile?: any;
}

export const WhatsAppSection: React.FC<WhatsAppSectionProps> = ({ profile }) => {
  return (
    <div className="space-y-5">
      {/* Cabeçalho da seção */}
      <div className="bg-white rounded-lg border border-green-100 shadow-md overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-600"></div>
        <div className="p-5 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-50 rounded-lg shadow-sm border border-green-200">
                <MessageSquare className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-green-800">
                  Integração WhatsApp
                </h2>
                <p className="text-sm text-green-600">Configure o envio de mensagens automáticas para seus clientes</p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-green-50 text-green-700 border-green-200 px-3 py-1.5 text-xs font-medium"
            >
              Comunicação
            </Badge>
          </div>
        </div>

        <div className="p-5 border-t border-green-100">
          <div className="flex gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
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
        </div>
      </div>

      {/* Componente principal do WhatsApp */}
      <EstablishmentWhatsApp />
    </div>
  );
};
