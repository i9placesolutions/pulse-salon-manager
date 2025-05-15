import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QrCode, Copy, MessageCircle, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEstablishmentConfigs } from "@/hooks/useEstablishmentConfigs";
import { supabase } from "@/lib/supabaseClient";

interface BookingSectionProps {
  profile?: any;
  copyBookingLink?: () => void;
  openWhatsApp?: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ 
  profile, 
  copyBookingLink: externalCopyBookingLink, 
  openWhatsApp: externalOpenWhatsApp 
}) => {
  const { 
    bookingConfig, 
    isLoading, 
    saveBookingConfig 
  } = useEstablishmentConfigs();
  
  const { toast } = useToast();
  
  const [customUrl, setCustomUrl] = useState(
    profile?.customUrl || bookingConfig.customUrl
  );
  const [allowCancellation, setAllowCancellation] = useState(bookingConfig.allowClientCancellation);
  const [requireConfirmation, setRequireConfirmation] = useState(bookingConfig.requireConfirmation);
  const [enabled, setEnabled] = useState(bookingConfig.enabled);
  const [advanceDays, setAdvanceDays] = useState(bookingConfig.advanceBookingDays.toString());
  const [minHours, setMinHours] = useState(bookingConfig.minAdvanceHours.toString());

  const [saving, setSaving] = useState(false);
  
  const copyBookingLink = () => {
    if (externalCopyBookingLink) {
      externalCopyBookingLink();
      return;
    }
    const bookingLink = `https://app.pulsesalon.com.br/p/${customUrl || "meu-estabelecimento"}`;
    navigator.clipboard.writeText(bookingLink);
  };
  
  const openWhatsApp = () => {
    if (externalOpenWhatsApp) {
      externalOpenWhatsApp();
      return;
    }
    // Aqui você pode usar o número de WhatsApp do perfil se tiver
    const message = `Olá! Você pode agendar seu horário online através do link: https://app.pulsesalon.com.br/p/${customUrl || "meu-estabelecimento"}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('=== INICIANDO SALVAMENTO DAS CONFIGURAÇÕES DE AGENDA ===');
      
      // Verificar se a URL personalizada está preenchida
      if (!customUrl || customUrl.trim() === '') {
        throw new Error('A URL personalizada não pode estar vazia.');
      }
      
      // Primeiro salvamos os valores localmente para o profile, se existir
      if (profile && typeof profile === 'object') {
        profile.customUrl = customUrl;
      }
      
      // Montar objeto de configuração com todos os dados da agenda
      const bookingConfigData = {
        customUrl,
        enabled,
        allowClientCancellation: allowCancellation,
        requireConfirmation,
        advanceBookingDays: parseInt(advanceDays) || 30,
        minAdvanceHours: parseInt(minHours) || 1
      };
      
      // Usar o hook para salvar as configurações (já inclui atualização da URL personalizada)
      const saved = await saveBookingConfig(bookingConfigData);
      
      if (!saved) {
        throw new Error('Não foi possível salvar as configurações da agenda.');
      }
      
      console.log('=== CONFIGURAÇÕES DE AGENDA SALVAS COM SUCESSO ===');
    } catch (error: any) {
      console.error('Erro ao salvar configurações de agenda:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro ao salvar as configurações da agenda. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6 border-purple-200 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* QR Code */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center">
              <div className="w-48 h-48 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg mb-2 shadow-inner">
                <QrCode className="w-24 h-24 text-purple-500" />
              </div>
              <p className="text-sm text-center text-purple-600 max-w-[12rem] font-medium">
                Escaneie o QR Code para acessar sua agenda online
              </p>
            </div>
            
            {/* Links e Compartilhamento */}
            <div className="flex-grow space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-purple-700">Link de Agendamento</h3>
                <p className="text-sm text-purple-600 mb-4">
                  Compartilhe este link com seus clientes para que eles possam agendar online:
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customUrl" className="text-purple-700">URL Personalizada</Label>
                    <div className="flex">
                      <div className="bg-purple-50 border border-purple-200 rounded-l-md px-3 flex items-center text-purple-700 text-sm">
                        app.pulsesalon.com.br/p/
                      </div>
                      <Input 
                        id="customUrl"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="rounded-l-none border-l-0 border-purple-200 focus-visible:ring-purple-400"
                      />
                      <Button 
                        onClick={handleSave}
                        className="ml-2 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
                        disabled={saving}
                      >
                        {saving ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      Digite sua URL personalizada e clique no botão para salvar.
                    </p>
                  </div>
                  
                  <div className="pt-2 flex gap-2">
                    <Button 
                      onClick={copyBookingLink} 
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Copy className="h-4 w-4 mr-2 text-purple-600" />
                      Copiar Link
                    </Button>
                    
                    <Button 
                      onClick={openWhatsApp}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Compartilhar no WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 text-purple-700">Configurações da Agenda Online</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
              <div className="space-y-0.5">
                <Label htmlFor="enabled" className="text-purple-800">Agenda Online Ativa</Label>
                <p className="text-sm text-purple-600">
                  Permite que clientes agendem horários online
                </p>
              </div>
              <Switch 
                id="enabled" 
                checked={enabled} 
                onCheckedChange={setEnabled}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-md bg-blue-50 border border-blue-200">
              <div className="space-y-0.5">
                <Label htmlFor="allowCancellation" className="text-blue-800">Permitir Cancelamento</Label>
                <p className="text-sm text-blue-600">
                  Clientes podem cancelar agendamentos online
                </p>
              </div>
              <Switch 
                id="allowCancellation" 
                checked={allowCancellation} 
                onCheckedChange={setAllowCancellation}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-md bg-indigo-50 border border-indigo-200">
              <div className="space-y-0.5">
                <Label htmlFor="requireConfirmation" className="text-indigo-800">Confirmação Obrigatória</Label>
                <p className="text-sm text-indigo-600">
                  Agendamentos precisam ser confirmados pelo estabelecimento
                </p>
              </div>
              <Switch 
                id="requireConfirmation" 
                checked={requireConfirmation} 
                onCheckedChange={setRequireConfirmation}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2 p-3 rounded-md bg-blue-50 border border-blue-200">
                <Label htmlFor="advanceDays" className="text-blue-700">Dias de Antecedência</Label>
                <Input 
                  id="advanceDays" 
                  type="number" 
                  min="1" 
                  max="90" 
                  value={advanceDays}
                  onChange={(e) => setAdvanceDays(e.target.value)}
                  className="border-blue-200 focus-visible:ring-blue-400"
                />
                <p className="text-xs text-blue-600">
                  Máximo de dias à frente para agendamento
                </p>
              </div>
              
              <div className="space-y-2 p-3 rounded-md bg-indigo-50 border border-indigo-200">
                <Label htmlFor="minHours" className="text-indigo-700">Antecedência Mínima (horas)</Label>
                <Input 
                  id="minHours" 
                  type="number" 
                  min="1" 
                  max="48" 
                  value={minHours}
                  onChange={(e) => setMinHours(e.target.value)}
                  className="border-indigo-200 focus-visible:ring-indigo-400"
                />
                <p className="text-xs text-indigo-600">
                  Mínimo de horas antes para agendar
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                className="w-full gap-2 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isLoading || saving}
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar Configurações</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
