import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Send, MessageSquare, Check, X, FileAudio, Edit, Play } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function IAWhatsApp() {
  const supabase = useSupabaseClient();
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInteraction, setSelectedInteraction] = useState<any>(null);
  const [editedTranscription, setEditedTranscription] = useState("");
  const [customResponse, setCustomResponse] = useState("");
  const [reprocessing, setReprocessing] = useState(false);

  // Carregar interações recentes
  useEffect(() => {
    fetchInteractions();
    
    // Configurar assinatura em tempo real
    const subscription = supabase
      .channel('whatsapp_interactions_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'whatsapp_interactions' 
      }, (payload) => {
        fetchInteractions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_interactions')
        .select('*, appointments(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error('Erro ao carregar interações:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter as interações do WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInteraction = (interaction: any) => {
    setSelectedInteraction(interaction);
    setEditedTranscription(interaction.transcription || interaction.content || "");
    setCustomResponse("");
  };

  const handleUpdateTranscription = async () => {
    if (!selectedInteraction) return;
    
    try {
      const { error } = await supabase
        .from('whatsapp_interactions')
        .update({ 
          transcription: editedTranscription,
          status: 'transcricao_editada'
        })
        .eq('id', selectedInteraction.id);

      if (error) throw error;
      
      toast({
        title: "Transcrição atualizada",
        description: "A transcrição foi atualizada com sucesso.",
      });
      
      // Reprocessar com a nova transcrição
      await reprocessInteraction();
    } catch (error) {
      console.error('Erro ao atualizar transcrição:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a transcrição.",
        variant: "destructive",
      });
    }
  };

  const handleSendCustomResponse = async () => {
    if (!selectedInteraction || !customResponse) return;
    
    try {
      // Obter token da instância
      const { data: instanceData, error: instanceError } = await supabase
        .from('whatsapp_instances')
        .select('token')
        .single();
        
      if (instanceError) throw instanceError;
      
      // Chamar API para enviar mensagem
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedInteraction.sender,
          message: customResponse,
          instanceToken: instanceData.token
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }
      
      // Atualizar status da interação
      const { error } = await supabase
        .from('whatsapp_interactions')
        .update({ 
          response_sent: customResponse,
          status: 'resposta_manual'
        })
        .eq('id', selectedInteraction.id);

      if (error) throw error;
      
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso.",
      });
      
      setCustomResponse("");
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
    }
  };

  const reprocessInteraction = async () => {
    if (!selectedInteraction) return;
    
    try {
      setReprocessing(true);
      
      // Chamar API para reprocessar com base no tipo
      const endpoint = selectedInteraction.type === 'text' 
        ? '/api/process-intent'
        : '/api/process-audio';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interactionId: selectedInteraction.id,
          text: editedTranscription,
          sender: selectedInteraction.sender,
          mediaId: selectedInteraction.message_id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao reprocessar mensagem');
      }
      
      toast({
        title: "Reprocessamento iniciado",
        description: "A mensagem está sendo reprocessada.",
      });
      
      // Atualizar dados
      await fetchInteractions();
    } catch (error) {
      console.error('Erro ao reprocessar:', error);
      toast({
        title: "Erro ao reprocessar",
        description: "Não foi possível reprocessar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setReprocessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, label: string }> = {
      'recebida': { color: 'bg-blue-500', label: 'Recebida' },
      'transcrevendo_audio': { color: 'bg-yellow-500', label: 'Transcrevendo' },
      'transcrito': { color: 'bg-green-500', label: 'Transcrito' },
      'transcricao_editada': { color: 'bg-purple-500', label: 'Editado' },
      'analisando_intencao': { color: 'bg-orange-500', label: 'Analisando' },
      'intencao_analisada': { color: 'bg-indigo-500', label: 'Analisado' },
      'verificando_disponibilidade': { color: 'bg-cyan-500', label: 'Verificando' },
      'sem_disponibilidade': { color: 'bg-red-500', label: 'Indisponível' },
      'sugerindo_horarios': { color: 'bg-teal-500', label: 'Sugerindo' },
      'horario_indisponivel': { color: 'bg-red-500', label: 'Horário Indisponível' },
      'servico_nao_encontrado': { color: 'bg-red-500', label: 'Serviço Não Encontrado' },
      'criando_agendamento': { color: 'bg-amber-500', label: 'Criando' },
      'agendamento_confirmado': { color: 'bg-emerald-500', label: 'Agendado' },
      'resposta_enviada': { color: 'bg-emerald-500', label: 'Respondido' },
      'resposta_manual': { color: 'bg-violet-500', label: 'Resp. Manual' },
      'erro_transcricao': { color: 'bg-red-700', label: 'Erro Transcrição' },
      'erro_analise': { color: 'bg-red-700', label: 'Erro Análise' },
      'erro_disponibilidade': { color: 'bg-red-700', label: 'Erro Disponibilidade' },
      'erro_agendamento': { color: 'bg-red-700', label: 'Erro Agendamento' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-500', label: status };
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">IA WhatsApp</h1>
        <Button onClick={fetchInteractions} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Interações */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Interações Recentes</CardTitle>
              <CardDescription>
                {loading ? 'Carregando...' : `${interactions.length} interações encontradas`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interactions.map((interaction) => (
                    <TableRow 
                      key={interaction.id}
                      className={`cursor-pointer ${selectedInteraction?.id === interaction.id ? 'bg-muted' : ''}`}
                      onClick={() => handleSelectInteraction(interaction)}
                    >
                      <TableCell className="font-medium">{interaction.sender.split('@')[0]}</TableCell>
                      <TableCell>{getStatusBadge(interaction.status)}</TableCell>
                      <TableCell>
                        {new Date(interaction.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {interactions.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        Nenhuma interação encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes da Interação */}
        <div className="md:col-span-2">
          {selectedInteraction ? (
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="details">Detalhes e Contexto</TabsTrigger>
                <TabsTrigger value="response">Resposta e Ações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Mensagem de {selectedInteraction.sender.split('@')[0]}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Recebida em: {new Date(selectedInteraction.created_at).toLocaleString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Tipo de Mensagem</h3>
                      <div className="flex items-center gap-2">
                        {selectedInteraction.type === 'media' || selectedInteraction.type === 'audio' ? (
                          <><FileAudio className="h-4 w-4 text-blue-500" /> Áudio</>
                        ) : (
                          <><MessageSquare className="h-4 w-4 text-green-500" /> Texto</>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Conteúdo Original</h3>
                      <div className="bg-muted p-3 rounded-md">
                        {selectedInteraction.content || "Conteúdo não disponível em texto"}
                      </div>
                    </div>
                    
                    {selectedInteraction.type === 'media' || selectedInteraction.type === 'audio' ? (
                      <div>
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-semibold mb-1">Transcrição do Áudio</h3>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditedTranscription(selectedInteraction.transcription || "")}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Restaurar
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={handleUpdateTranscription}
                            >
                              <Check className="h-3 w-3 mr-1" /> Salvar
                            </Button>
                          </div>
                        </div>
                        <Textarea 
                          value={editedTranscription}
                          onChange={(e) => setEditedTranscription(e.target.value)}
                          placeholder="Nenhuma transcrição disponível"
                          className="h-24"
                        />
                      </div>
                    ) : null}
                    
                    {selectedInteraction.ai_analysis && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Análise da IA</h3>
                        <div className="bg-muted p-3 rounded-md overflow-x-auto">
                          <pre className="text-xs">
                            {JSON.stringify(selectedInteraction.ai_analysis, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {selectedInteraction.appointment_id && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Dados do Agendamento</h3>
                        <div className="bg-muted p-3 rounded-md">
                          <div><strong>Serviço:</strong> {selectedInteraction.appointments?.service_id}</div>
                          <div><strong>Profissional:</strong> {selectedInteraction.appointments?.professional_id}</div>
                          <div><strong>Data:</strong> {selectedInteraction.appointments?.date}</div>
                          <div><strong>Hora:</strong> {selectedInteraction.appointments?.time}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={reprocessInteraction}
                      disabled={reprocessing}
                    >
                      {reprocessing ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Reprocessando</>
                      ) : (
                        <><Play className="h-4 w-4 mr-2" /> Forçar Novo Processamento</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="response">
                <Card>
                  <CardHeader>
                    <CardTitle>Resposta ao Cliente</CardTitle>
                    <CardDescription>
                      {selectedInteraction.status === 'agendamento_confirmado' 
                        ? 'Agendamento confirmado e respondido' 
                        : 'Gerencie a resposta enviada ao cliente'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedInteraction.response_sent && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Resposta Enviada</h3>
                        <div className="bg-muted p-3 rounded-md">
                          {selectedInteraction.response_sent}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Enviar Resposta Personalizada</h3>
                      <Textarea 
                        value={customResponse}
                        onChange={(e) => setCustomResponse(e.target.value)}
                        placeholder="Digite sua resposta manual..."
                        className="h-28"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      variant="default" 
                      disabled={!customResponse}
                      onClick={handleSendCustomResponse}
                    >
                      <Send className="h-4 w-4 mr-2" /> 
                      Enviar Resposta
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhuma interação selecionada</h3>
                <p className="text-muted-foreground">Selecione uma interação da lista para ver detalhes</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
