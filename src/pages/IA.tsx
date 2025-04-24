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
import { EvolutionAPIService } from "@/services/whatsapp/evolutionApiService";

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
    const loadConfig = async () => {
      try {
        setLoading(true);
        
        // Definir o ID do estabelecimento atual
        const estabelecimentoId = "wtpmedifsfbxctlssefd";
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
          description: "Não foi possível carregar as configurações da IA.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [toast]);

  // Valores padrão para os campos
  useEffect(() => {
    // Definir a URL do webhook baseado no domínio correto
    setWebhookUrl("https://n8n-n8n-start.ad2edf.easypanel.host/webhook/whatsapp-ia-pulse");
  }, []);

  // Salvar configurações
  const saveConfig = async () => {
    try {
      setLoading(true);
      
      if (!isFormValid) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive"
        });
        return;
      }
      
      // Definir URL do webhook fixo
      const webhookUrlToSave = "https://n8n-n8n-start.ad2edf.easypanel.host/webhook/whatsapp-ia-pulse";
      
      const { data, error } = await supabase
        .from('whatsapp_ia_config')
        .upsert({
          evolution_instance: evolutionInstance,
          evolution_token: evolutionToken,
          openai_key: openaiKey,
          webhook_url: webhookUrlToSave,
          establishment_id: establishmentId,
          auto_response_enabled: isAutoResponseEnabled,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
      if (error) throw error;
      
      // Atualizar o webhook na Evolution API
      const evolutionService = new EvolutionAPIService(
        "https://evolution-evolution.ad2edf.easypanel.host",
        evolutionToken,
        evolutionInstance
      );
      
      await evolutionService.setWebhook(webhookUrlToSave);
      
      setWebhookUrl(webhookUrlToSave);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da IA foram salvas com sucesso.",
        variant: "default"
      });
      
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Não foi possível salvar as configurações da IA.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <PageHeader 
        title="Integração WhatsApp IA" 
        subtitle="Configuração da integração com n8n" 
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
              Configure a integração do WhatsApp com ChatGPT via n8n
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
              <Label htmlFor="evolution-token">Token da Evolution API</Label>
              <Input 
                id="evolution-token" 
                type="password"
                placeholder="a8f4b7c93e1d2a64b0f9c8d6a1e3b5" 
                value={evolutionToken}
                onChange={(e) => setEvolutionToken(e.target.value)}
              />
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
                O webhook <code className="bg-slate-100 px-1 py-0.5 rounded">https://n8n-n8n-start.ad2edf.easypanel.host/webhook/whatsapp-ia-pulse</code> será configurado automaticamente na Evolution API.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={saveConfig} 
              disabled={loading || !isFormValid}
            >
              {loading ? <Spinner size="sm" /> : null}
              Salvar Configurações
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Configuração no n8n</AlertTitle>
            <AlertDescription>
              A configuração de template do prompt, processamento de mensagens e outras opções avançadas devem ser feitas diretamente no <a href="https://n8n-n8n-start.ad2edf.easypanel.host/" target="_blank" rel="noopener noreferrer" className="text-primary underline">painel do n8n</a>.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default IA;
