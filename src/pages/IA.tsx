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
import { Server, Info, Loader, MessageSquare, Settings, Edit, Play, ExternalLink, RefreshCw, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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

// Interface para mensagens IA WhatsApp
interface WhatsAppMessage {
  id: string;
  sender: string;
  message: string;
  message_type: string;
  transcription?: string;
  edited_transcription?: string;
  ai_response?: string;
  response_sent?: string;
  status: string;
  appointment_id?: string;
  created_at: string;
  audio_url?: string;
  processing_error?: string;
}

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
  
  // Estados para a guia de mensagens
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [editedTranscription, setEditedTranscription] = useState("");
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);

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
          description: "Não foi possível carregar as configurações da IA.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [toast]);

  // Carregar mensagens
  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      
      const { data, error } = await supabase
        .from('whatsapp_ia_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) {
        throw error;
      }
      
      setMessages(data || []);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar o histórico de mensagens.",
        variant: "destructive"
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  // Carregar mensagens quando a guia for alterada para mensagens
  const handleTabChange = (value: string) => {
    if (value === "mensagens") {
      loadMessages();
    }
  };

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
          auto_response_enabled: isAutoResponseEnabled,
          establishment_id: establishmentId,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
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

  // Selecionar uma mensagem para visualizar detalhes
  const selectMessage = (message: WhatsAppMessage) => {
    setSelectedMessage(message);
    setEditedTranscription(message.edited_transcription || message.transcription || message.message || "");
  };

  // Atualizar transcrição editada
  const updateTranscription = async () => {
    if (!selectedMessage) return;
    
    try {
      setIsProcessingMessage(true);
      
      const { error } = await supabase
        .from('whatsapp_ia_messages')
        .update({ 
          edited_transcription: editedTranscription,
          status: 'transcrição_editada'
        })
        .eq('id', selectedMessage.id);
        
      if (error) {
        throw error;
      }
      
      // Atualizar mensagem selecionada
      setSelectedMessage({
        ...selectedMessage,
        edited_transcription: editedTranscription,
        status: 'transcrição_editada'
      });
      
      toast({
        title: "Transcrição atualizada",
        description: "A transcrição foi atualizada com sucesso.",
        variant: "default"
      });
      
      // Recarregar mensagens
      loadMessages();
      
    } catch (error) {
      console.error("Erro ao atualizar transcrição:", error);
      toast({
        title: "Erro ao atualizar transcrição",
        description: "Não foi possível atualizar a transcrição.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingMessage(false);
    }
  };

  // Processar mensagem novamente
  const reprocessMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      setIsProcessingMessage(true);
      
      // Obter token da instância WhatsApp
      const { data: configData, error: configError } = await supabase
        .from('whatsapp_ia_config')
        .select('evolution_token')
        .single();
        
      if (configError) {
        throw configError;
      }
      
      // Chamar API para processamento da intenção
      const response = await fetch('/api/ia-whatsapp/process-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interactionId: selectedMessage.id,
          text: editedTranscription,
          token: configData.evolution_token
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao processar mensagem');
      }
      
      toast({
        title: "Mensagem enviada para processamento",
        description: "A mensagem foi enviada para processamento. Aguarde a resposta da IA.",
        variant: "default"
      });
      
      // Recarregar mensagens após 3 segundos
      setTimeout(() => {
        loadMessages();
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      toast({
        title: "Erro ao processar mensagem",
        description: error.message || "Não foi possível processar a mensagem.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingMessage(false);
    }
  };

  // Formatar número de telefone
  const formatPhone = (phone: string) => {
    if (!phone) return "";
    
    // Remover @c.us ou .net se existir
    let formattedPhone = phone.replace(/@c\.us$/, "").replace(/\.net$/, "");
    
    // Formatar para padrão brasileiro se for número de 11 dígitos
    if (formattedPhone.length === 13 && formattedPhone.startsWith("55")) {
      const ddd = formattedPhone.substring(2, 4);
      const firstPart = formattedPhone.substring(4, 9);
      const secondPart = formattedPhone.substring(9);
      return `(${ddd}) ${firstPart}-${secondPart}`;
    }
    
    return formattedPhone;
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'recebida': 'bg-gray-200 text-gray-700',
      'transcrição_iniciada': 'bg-blue-100 text-blue-700',
      'transcrição_concluída': 'bg-blue-200 text-blue-800',
      'transcrição_editada': 'bg-purple-100 text-purple-700',
      'processando_intenção': 'bg-amber-100 text-amber-700',
      'intenção_processada': 'bg-green-100 text-green-700',
      'verificando_disponibilidade': 'bg-amber-200 text-amber-800',
      'criando_agendamento': 'bg-purple-200 text-purple-800',
      'agendamento_confirmado': 'bg-green-200 text-green-800',
      'erro_transcrição': 'bg-red-100 text-red-700',
      'erro_processamento': 'bg-red-200 text-red-800',
      'erro_agendamento': 'bg-red-300 text-red-900',
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="container py-6">
      <PageHeader 
        title="IA WhatsApp" 
        subtitle="Gerenciamento de agendamentos automáticos via WhatsApp" 
        variant="purple"
      />
      
      <div className="mt-6">
        <Tabs defaultValue="mensagens" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="mensagens" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="configuracao" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuração
            </TabsTrigger>
          </TabsList>
          
          {/* Guia de Mensagens */}
          <TabsContent value="mensagens">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Lista de mensagens */}
              <Card className="lg:col-span-7">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Histórico de Mensagens
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={loadMessages} disabled={loadingMessages}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingMessages ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                  </div>
                  <CardDescription>
                    Mensagens recebidas pelo WhatsApp e processadas pela IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data/Hora</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingMessages ? (
                          // Esqueleto de carregamento
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            </TableRow>
                          ))
                        ) : messages.length > 0 ? (
                          messages.map((message) => (
                            <TableRow 
                              key={message.id}
                              className={`cursor-pointer hover:bg-slate-50 ${selectedMessage?.id === message.id ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                              onClick={() => selectMessage(message)}
                            >
                              <TableCell className="font-medium">{formatPhone(message.sender)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {message.message_type === 'text' ? 'Texto' : 
                                   message.message_type === 'audio' ? 'Áudio' : 
                                   message.message_type === 'image' ? 'Imagem' : 
                                   message.message_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(message.status)}>
                                  {message.status?.replace(/_/g, ' ') || 'status desconhecido'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(message.created_at).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              Nenhuma mensagem encontrada
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Detalhes da mensagem */}
              <Card className="lg:col-span-5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Detalhes da Mensagem
                  </CardTitle>
                  <CardDescription>
                    Visualize e edite detalhes da mensagem selecionada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedMessage ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Mensagem Recebida</Label>
                          {selectedMessage.audio_url && (
                            <a 
                              href={selectedMessage.audio_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Ouvir áudio
                            </a>
                          )}
                        </div>
                        <div className="p-3 rounded-md bg-gray-50 min-h-[60px] break-words text-sm">
                          {selectedMessage.message || (
                            <span className="text-gray-400 italic">
                              {selectedMessage.message_type === 'audio' ? 'Mensagem de áudio' : 'Sem conteúdo de texto'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="transcription" className="flex items-center gap-2">
                          Transcrição
                          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setEditedTranscription(selectedMessage.transcription || selectedMessage.message || "")}>
                            <RefreshCw className="w-3 h-3 mr-1" />
                            <span className="text-xs">Restaurar</span>
                          </Button>
                        </Label>
                        <Textarea 
                          id="transcription" 
                          value={editedTranscription}
                          onChange={(e) => setEditedTranscription(e.target.value)}
                          className="min-h-[100px]"
                          placeholder="Transcrição do conteúdo da mensagem"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={updateTranscription} 
                            size="sm" 
                            className="flex items-center gap-1"
                            disabled={isProcessingMessage}
                          >
                            {isProcessingMessage ? <Spinner size="sm" /> : <Edit className="w-3 h-3" />}
                            <span>Atualizar Transcrição</span>
                          </Button>
                          <Button 
                            onClick={reprocessMessage} 
                            size="sm" 
                            variant="outline"
                            className="flex items-center gap-1"
                            disabled={isProcessingMessage}
                          >
                            {isProcessingMessage ? <Spinner size="sm" /> : <Play className="w-3 h-3" />}
                            <span>Reprocessar</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Resposta da IA</Label>
                        <div className="p-3 rounded-md bg-blue-50 min-h-[60px] break-words text-sm">
                          {selectedMessage.ai_response || (
                            <span className="text-blue-400 italic">
                              Nenhuma resposta da IA ainda
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Mensagem Enviada</Label>
                        <div className="p-3 rounded-md bg-green-50 min-h-[60px] break-words text-sm">
                          {selectedMessage.response_sent || (
                            <span className="text-green-400 italic">
                              Nenhuma resposta enviada ainda
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {selectedMessage.appointment_id && (
                        <Alert className="mt-4 bg-purple-50 border-purple-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-700" />
                            <AlertTitle className="text-purple-700">Agendamento Criado</AlertTitle>
                          </div>
                          <AlertDescription className="mt-1 text-purple-600">
                            ID do Agendamento: {selectedMessage.appointment_id}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {selectedMessage.processing_error && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTitle>Erro de Processamento</AlertTitle>
                          <AlertDescription className="mt-1">
                            {selectedMessage.processing_error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                      <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                      <p>Selecione uma mensagem para visualizar os detalhes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Guia de Configuração */}
          <TabsContent value="configuracao">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IA;
