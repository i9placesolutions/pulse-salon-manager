import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EvolutionAPIService } from "@/services/whatsapp/evolutionApiService";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ArrowDown, Info, MessageSquare, RefreshCw, Settings, Webhook } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import OpenAIService from "@/services/openai/openaiService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState } from "@/contexts/AppStateContext";

// Componente Spinner atualizado para aceitar a prop size
const Spinner = ({ size = "default" }) => {
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
  const [establishmentName, setEstablishmentName] = useState("");
  const [promptTemplate, setPromptTemplate] = useState(
    `Você é um assistente de atendimento do salão {{estabelecimento}}.
Seja sempre cordial e profissional. 

Informações sobre o salão:
- Nome do estabelecimento: NOME_DO_ESTABELECIMENTO
- Endereço: {{endereco}}
- Telefone: {{telefone}}
- Horário de funcionamento: {{horario}}

Serviços oferecidos:
{{servicos}}

Sua principal função é:
1. Ajudar clientes a agendar horários
2. Responder dúvidas sobre serviços e preços
3. Confirmar agendamentos existentes
4. Reagendar ou cancelar horários quando solicitado

Se pedirem um agendamento, solicite: nome, telefone, serviço desejado e horário preferido.
Para qualquer pergunta que você não saiba responder, diga que vai encaminhar para um atendente humano.

Mantenha suas respostas concisas e profissionais.`
  );
  
  const [establishments, setEstablishments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationCount, setConversationCount] = useState(0);
  const [instanceStatus, setInstanceStatus] = useState("desconhecido");
  const [isAutoResponseEnabled, setIsAutoResponseEnabled] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Validação do formulário
  useEffect(() => {
    const isValid = 
      evolutionInstance.trim() !== "" && 
      evolutionToken.trim() !== "" && 
      openaiKey.trim() !== "" && 
      establishmentId.trim() !== "";
    
    setIsFormValid(isValid);
  }, [evolutionInstance, evolutionToken, openaiKey, establishmentId]);
  
  // Obter o contexto da aplicação para acessar os dados do usuário
  const appState = useAppState();
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        
        // Definir o ID do estabelecimento atual (ID fixo para testes)
        const estabelecimentoId = "wtpmedifsfbxctlssefd";
        setEstablishmentId(estabelecimentoId);
        
        // Buscar informações do estabelecimento pelo ID
        const { data: estabelecimentoData, error: estabelecimentoError } = await supabase
          .from('establishments')
          .select('id, name')
          .eq('id', estabelecimentoId)
          .single();
        
        if (estabelecimentoError) {
          console.error("Erro ao buscar estabelecimento:", estabelecimentoError);
        } else if (estabelecimentoData) {
          // Adicionar o estabelecimento na lista de estabelecimentos
          setEstablishments([estabelecimentoData]);
          // Guardar o nome do estabelecimento
          const nomeEstabelecimento = estabelecimentoData.name || "Não identificado";
          setEstablishmentName(nomeEstabelecimento);
          
          // Atualizar o template do prompt com o nome real do estabelecimento
          const novoPrompt = `Você é um assistente de atendimento do salão ${nomeEstabelecimento}.
Seja sempre cordial e profissional. 

Informações sobre o salão:
- Nome do estabelecimento: ${nomeEstabelecimento}
- Endereço: {{endereco}}
- Telefone: {{telefone}}
- Horário de funcionamento: {{horario}}

Serviços oferecidos:
{{servicos}}

Sua principal função é:
1. Ajudar clientes a agendar horários
2. Responder dúvidas sobre serviços e preços
3. Confirmar agendamentos existentes
4. Reagendar ou cancelar horários quando solicitado

Se pedirem um agendamento, solicite: nome, telefone, serviço desejado e horário preferido.
Para qualquer pergunta que você não saiba responder, diga que vai encaminhar para um atendente humano.

Mantenha suas respostas concisas e profissionais.`;
          
          setPromptTemplate(novoPrompt);
        }
        
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
          setPromptTemplate(data.prompt_template || promptTemplate);
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
    
    const loadMessageCount = async () => {
      try {
        const { count, error } = await supabase
          .from('whatsapp_ia_messages')
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        
        setConversationCount(count || 0);
      } catch (error) {
        console.error("Erro ao carregar contagem de mensagens:", error);
      }
    };
    
    const loadRecentMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('whatsapp_ia_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        setMessages(data || []);
      } catch (error) {
        console.error("Erro ao carregar mensagens recentes:", error);
      }
    };
    
    loadConfig();
    loadMessageCount();
    loadRecentMessages();
  }, [toast]);
  
  // Valores padrão para os campos
  useEffect(() => {
    // Definir a URL do webhook baseado no domínio correto
    setWebhookUrl("https://app.pulsesalon.com.br/api/ia-whatsapp/webhook");
  }, []);

  // Verificar status da instância
  const checkInstanceStatus = async () => {
    try {
      setLoading(true);
      
      if (!evolutionInstance || !evolutionToken) {
        toast({
          title: "Dados incompletos",
          description: "Preencha o nome da instância e o token.",
          variant: "destructive"
        });
        return;
      }
      
      const evolutionService = new EvolutionAPIService(
        "https://evolution-evolution.ad2edf.easypanel.host",
        evolutionToken,
        evolutionInstance
      );
      
      const status = await evolutionService.getInstanceStatus();
      setInstanceStatus(status.instance?.status || "desconhecido");
      
      toast({
        title: "Status verificado",
        description: `Status da instância: ${status.instance?.status || "desconhecido"}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      toast({
        title: "Erro ao verificar status",
        description: error.message || "Não foi possível verificar o status da instância.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
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
      
      // Definir URL do webhook caso esteja vazio
      const webhookUrlToSave = webhookUrl || `https://app.pulsesalon.com.br/api/ia-whatsapp/webhook`;
      
      const { data, error } = await supabase
        .from('whatsapp_ia_config')
        .upsert({
          evolution_instance: evolutionInstance,
          evolution_token: evolutionToken,
          openai_key: openaiKey,
          webhook_url: webhookUrlToSave,
          establishment_id: establishmentId,
          prompt_template: promptTemplate,
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
  
  // Testar integração com OpenAI
  const testOpenAI = async () => {
    try {
      setLoading(true);
      
      if (!openaiKey) {
        toast({
          title: "Chave da API não definida",
          description: "Informe a chave da API da OpenAI.",
          variant: "destructive"
        });
        return;
      }
      
      const openaiService = new OpenAIService(openaiKey);
      const response = await openaiService.testConnection();
      
      toast({
        title: "Teste bem-sucedido",
        description: "A conexão com a OpenAI foi estabelecida com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao testar OpenAI:", error);
      toast({
        title: "Erro na conexão com OpenAI",
        description: error.message || "Não foi possível estabelecer conexão com a OpenAI.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-6">
      <PageHeader 
        title="Inteligência Artificial" 
        subtitle="Configure e gerencie a integração do WhatsApp com ChatGPT" 
        variant="purple"
      />
      
      <Tabs defaultValue="config" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuração da Evolution API
                </CardTitle>
                <CardDescription>
                  Configure a integração com a Evolution API para WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evolution-url">URL da Evolution API</Label>
                  <Input 
                    id="evolution-url" 
                    value="https://evolution-evolution.ad2edf.easypanel.host" 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground">URL padrão da API, não pode ser alterada</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evolution-instance">Nome da Instância</Label>
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
                  <p className="text-xs text-muted-foreground">Token de autenticação para a Evolution API</p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="webhookUrl">URL do Webhook</Label>
                  <Input
                    id="webhookUrl"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="URL do webhook para receber notificações"
                    disabled={true} // Disable para não permitir edição
                  />
                  <p className="text-xs text-muted-foreground">URL para receber notificações do WhatsApp</p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Button 
                    variant="outline"
                    onClick={checkInstanceStatus}
                    disabled={loading || !evolutionInstance || !evolutionToken}
                  >
                    {loading ? <Spinner size="sm" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Verificar Status
                  </Button>
                  
                  <Badge variant={
                    instanceStatus === "connected" ? "secondary" : 
                    instanceStatus === "connecting" ? "outline" : 
                    instanceStatus === "disconnected" ? "destructive" : 
                    "outline"
                  }>
                    {instanceStatus === "connected" ? "Conectado" : 
                     instanceStatus === "connecting" ? "Conectando" : 
                     instanceStatus === "disconnected" ? "Desconectado" : 
                     "Status desconhecido"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Configuração do ChatGPT
                </CardTitle>
                <CardDescription>
                  Configure a integração com ChatGPT para respostas automáticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">Chave da API OpenAI</Label>
                  <Input 
                    id="openai-key" 
                    type="password"
                    placeholder="sk-..." 
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Chave de API da OpenAI para o ChatGPT</p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="establishmentId">Estabelecimento</Label>
                  <Select 
                    value={establishmentId} 
                    onValueChange={setEstablishmentId}
                    disabled={true} // Desabilitar para que não possa ser alterado
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o estabelecimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {establishments.map((establishment: any) => (
                        <SelectItem 
                          key={establishment.id} 
                          value={establishment.id}
                        >
                          {establishment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Estabelecimento atual (configurado automaticamente)</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt-template">Template do Prompt</Label>
                    <Button variant="ghost" size="sm" onClick={testOpenAI} disabled={loading || !openaiKey}>
                      {loading ? <Spinner size="sm" /> : "Testar conexão"}
                    </Button>
                  </div>
                  <Textarea 
                    id="prompt-template" 
                    placeholder="Template do prompt para o ChatGPT..." 
                    value={promptTemplate}
                    onChange={(e) => setPromptTemplate(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use &#123;&#123;estabelecimento&#125;&#125;, &#123;&#123;endereco&#125;&#125;, &#123;&#123;telefone&#125;&#125;, &#123;&#123;horario&#125;&#125;, &#123;&#123;servicos&#125;&#125; para inserir dados do estabelecimento
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="auto-response" 
                    checked={isAutoResponseEnabled}
                    onCheckedChange={setIsAutoResponseEnabled}
                  />
                  <Label htmlFor="auto-response">Habilitar respostas automáticas</Label>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={saveConfig} 
              disabled={loading || !isFormValid}
              size="lg"
            >
              {loading ? <Spinner size="sm" /> : null}
              Salvar Configurações
            </Button>
          </div>
          
          <Alert className="mt-4 bg-amber-50">
            <Info className="h-4 w-4" />
            <AlertTitle>Informação importante</AlertTitle>
            <AlertDescription>
              Após salvar as configurações, você precisará configurar o webhook na Evolution API. 
              O URL do webhook deve ser: <code className="bg-slate-100 px-1.5 py-0.5 rounded">
                https://app.pulsesalon.com.br/api/ia-whatsapp/webhook
              </code>
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="messages" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Histórico de Mensagens
                </span>
                <Badge variant="outline" className="ml-2">
                  {conversationCount} mensagens
                </Badge>
              </CardTitle>
              <CardDescription>
                Visualize as mensagens recebidas e respostas enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma mensagem registrada ainda
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <Accordion type="single" collapsible className="w-full">
                    {messages.map((message, index) => (
                      <AccordionItem key={message.id || index} value={message.id || `message-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                              <Badge variant={message.direction === 'incoming' ? 'outline' : 'secondary'} className="mr-2">
                                {message.direction === 'incoming' ? 'Recebida' : 'Enviada'}
                              </Badge>
                              <span className="font-medium">{message.sender_name || message.sender}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(message.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-2">
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                            
                            {message.response && (
                              <div className="flex items-center gap-2 mt-2">
                                <ArrowDown className="w-4 h-4 text-muted-foreground" />
                                <div className="bg-purple-50 p-3 rounded-lg w-full">
                                  <p className="whitespace-pre-wrap">{message.response}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Configuração do Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">URL do Webhook</h3>
                <p className="text-sm">O URL do webhook que deve ser configurado na Evolution API é:</p>
                <Alert>
                  <code className="bg-slate-100 px-2 py-1 rounded">
                    https://app.pulsesalon.com.br/api/ia-whatsapp/webhook
                  </code>
                </Alert>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-semibold">Configuração no Evolution API</h3>
                <p className="text-sm">Para configurar o webhook manualmente na Evolution API, siga os passos:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
                  <li>Acesse o painel da Evolution API</li>
                  <li>Navegue até a seção de webhooks</li>
                  <li>Configure um novo webhook com o URL fornecido acima</li>
                  <li>Defina os eventos para capturar mensagens recebidas</li>
                  <li>Salve as configurações</li>
                </ol>
              </div>
              
              <Alert variant="warning" className="mt-2">
                <Info className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Certifique-se de que o servidor da aplicação possui acesso à internet 
                  e que o URL do webhook esteja acessível publicamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Sobre a Integração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Funcionalidades</h3>
                <p className="text-sm">Esta integração permite:</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                  <li>Receber mensagens do WhatsApp via Evolution API</li>
                  <li>Processar mensagens com ChatGPT para gerar respostas automáticas</li>
                  <li>Transcrever áudios usando o modelo Whisper da OpenAI</li>
                  <li>Enviar respostas personalizadas com base no prompt configurado</li>
                  <li>Registrar histórico de conversas para análise posterior</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-semibold">Requisitos</h3>
                <p className="text-sm">Para utilizar esta integração, você precisa:</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                  <li>Uma conta na Evolution API com instância ativa</li>
                  <li>Uma chave de API válida da OpenAI</li>
                  <li>Acesso à internet para comunicação entre os serviços</li>
                  <li>Configuração de webhook na Evolution API</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IA;
