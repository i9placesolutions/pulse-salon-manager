import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Server, Info, Loader } from "lucide-react";

// Componente Spinner simples
const Spinner = ({ size = "sm" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  return (
    <div className="flex items-center justify-center">
      <Loader className={`${sizeClasses[size as keyof typeof sizeClasses]} animate-spin text-primary`} />
    </div>
  );
};

const IA = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [evolutionInstance, setEvolutionInstance] = useState("");
  const [evolutionToken, setEvolutionToken] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [establishmentId, setEstablishmentId] = useState("");
  const [isAutoResponseEnabled, setIsAutoResponseEnabled] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validação do formulário
  useEffect(() => {
    const isValid = 
      evolutionInstance.trim() !== "" && 
      evolutionToken.trim() !== "" && 
      openaiKey.trim() !== "";
    
    setIsFormValid(isValid);
  }, [evolutionInstance, evolutionToken, openaiKey]);

  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      // Definir o ID do estabelecimento atual
      const estabelecimentoId = "f99712db-5da1-4c3e-a9c6-887b0809a6b2"; // UUID válido do estabelecimento
      setEstablishmentId(estabelecimentoId);
      
      // Obter configurações salvas
      const { data, error } = await supabase
        .from('whatsapp_ia_config')
        .select('*')
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setEvolutionInstance(data.evolution_instance || "");
        setEvolutionToken(data.evolution_token || "");
        setOpenaiKey(data.openai_key || "");
        setWebhookUrl(data.webhook_url || "");
        setIsAutoResponseEnabled(data.auto_response_enabled || false);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações salvas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);
      
      // Definir URL do webhook fixo
      const webhookUrlToSave = "https://app.pulsesalon.com.br/api/webhook";
      
      console.log('Salvando configuração com token:', evolutionToken);
      
      const { data, error } = await supabase
        .from('whatsapp_ia_config')
        .upsert({
          openai_key: openaiKey,
          evolution_instance: evolutionInstance,
          evolution_token: evolutionToken,
          webhook_url: webhookUrlToSave,
          auto_response_enabled: isAutoResponseEnabled,
          establishment_id: establishmentId,
          instance_token: evolutionToken,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "As configurações foram salvas com sucesso."
      });
      
      // Atualizar o estado do webhook
      setWebhookUrl(webhookUrlToSave);
      
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="IA WhatsApp" 
        subtitle="Configure a integração do WhatsApp com IA" 
        variant="purple"
      />
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Configuração da Integração
            </CardTitle>
            <CardDescription>
              Configure a integração do WhatsApp com ChatGPT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evolution-instance">Nome da Instância WhatsApp</Label>
              <Input 
                id="evolution-instance" 
                placeholder="Nome da instância do WhatsApp" 
                value={evolutionInstance}
                onChange={(e) => setEvolutionInstance(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="evolution-token">Token da Evolution API/Uazapi</Label>
              <Input 
                id="evolution-token" 
                type="password"
                placeholder="Token da API (ex: 695fb204-5af9-4cfe-9f9f-676d2ca47e69)" 
                value={evolutionToken}
                onChange={(e) => setEvolutionToken(e.target.value)}
              />
              <small className="text-xs text-muted-foreground">
                Digite o token da sua instância. 
                {evolutionToken ? ` Valor atual: ${evolutionToken.substring(0, 10)}...` : ' Não configurado'}
              </small>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="openai-key">Chave da API OpenAI</Label>
              <Input 
                id="openai-key" 
                type="password"
                placeholder="sk-..." 
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="auto-response" 
                checked={isAutoResponseEnabled}
                onCheckedChange={setIsAutoResponseEnabled}
              />
              <Label htmlFor="auto-response">Habilitar respostas automáticas</Label>
            </div>
            
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                O webhook <code className="bg-slate-100 px-1 py-0.5 rounded">https://app.pulsesalon.com.br/api/webhook</code> será configurado automaticamente.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={saveConfig} 
              disabled={isSaving || !isFormValid}
            >
              {isSaving ? <Spinner size="sm" /> : null}
              Salvar Configurações
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default IA;
