import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Bell, Zap, BarChart, MessageSquare, History, Gift, Percent, Phone, User as UserIcon } from "lucide-react";
import { MetricsCard } from "@/components/marketing/MetricsCard";
import { BirthdayAutomation } from "@/components/marketing/BirthdayAutomation";
import { MessageCampaignDialog } from "@/components/marketing/MessageCampaignDialog";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { AutomationSection } from "@/components/marketing/AutomationSection";
import { CampaignTypesSection } from "@/components/marketing/CampaignTypesSection";
import { CampaignHistory } from "@/components/marketing/CampaignHistory";
import { MarketingReports } from "@/components/marketing/MarketingReports";
import { MessageHistory } from "@/components/marketing/MessageHistory";
import type { MessageStatus } from "@/components/marketing/MessageHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MessageCampaignData } from "@/types/marketing";
import { useLocation } from 'react-router-dom';
import { sendBulkMessage, sendBulkMediaMessage, WhatsAppContact, fetchWhatsAppContacts, listCampaignMessages } from "@/lib/uazapiService";
import { toast } from "@/components/ui/use-toast";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormCard } from "@/components/shared/FormCard";
import { whatsAppService } from "@/lib/whatsappApi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

// Importar serviços de marketing do Supabase
import { 
  fetchMarketingCampaigns, 
  fetchCampaignsByType, 
  fetchMarketingMessages, 
  saveMarketingMessage, 
  updateMessageStatus, 
  fetchWhatsAppContactsFromDB, 
  saveWhatsAppContacts,
  fetchMarketingMetrics,
  MarketingMessage,
  MarketingMetrics
} from "@/lib/marketingService";

export default function Marketing() {
  const location = useLocation();
  const [selectedCampaignType, setSelectedCampaignType] = useState<string | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  // Define a interface localmente para incluir os campos de mídia
  interface MessageCampaignData {
    title: string;
    message: string;
    recipients: 'all' | 'vip' | 'inactive' | 'custom' | 'phone';
    channels: string[];
    scheduleDate?: string;
    scheduleTime?: string;
    selectedContactIds?: string[];
    // Campos para imagem
    mediaUrl?: string;
    mediaType?: string;
    mediaName?: string;
  }
  
  const [messageCampaignData, setMessageCampaignData] = useState<MessageCampaignData>({
    title: "",
    message: "",
    recipients: "all",
    channels: ["whatsapp"], // WhatsApp is now the default channel
    scheduleDate: "",
    scheduleTime: "",
    selectedContactIds: []
  });
  
  // Estado para armazenar as mensagens enviadas
  const [sentMessages, setSentMessages] = useState<MarketingMessage[]>([]);
  
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState("campanhas");
  
  // Estado para armazenar campanhas de marketing
  const [campaigns, setCampaigns] = useState<any[]>([]);
  
  // Estado para armazenar contatos de WhatsApp
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([]);
  
  // Estado para armazenar métricas de marketing
  const [marketingMetricsData, setMarketingMetricsData] = useState<MarketingMetrics | null>(null);
  
  // Estado para controlar o carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // Estados para WhatsApp
  const [whatsappToken, setWhatsappToken] = useState<string>("");
  

  const [loadingWhatsAppContacts, setLoadingWhatsAppContacts] = useState(false);
  const [contactsExpanded, setContactsExpanded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Controles para assinaturas em tempo real
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  
  // Estado para controlar atualizações em tempo real
  const [campaignsRefreshTrigger, setCampaignsRefreshTrigger] = useState(0);
  
  // Referências para assinaturas ativas
  const subscriptions = {
    campaigns: null as any,
    messages: null as any
  };

  // Carregar token do WhatsApp para o usuário logado
  useEffect(() => {
    const loadWhatsAppToken = async () => {
      try {
        // Obter usuário atual do Supabase
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Erro ao obter usuário:", userError);
          return;
        }
        
        if (userData?.user?.id) {
          setCurrentUserId(userData.user.id);
          
          // Primeiro verificar nas configurações do estabelecimento
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("whatsapp_config")
            .eq("id", userData.user.id)
            .single();
            
          let token = null;
          
          if (!profileError && profileData?.whatsapp_config?.instanceToken) {
            token = profileData.whatsapp_config.instanceToken;
            console.log("Token encontrado nas configurações:", token);
          } else {
            // Tentar obter o token do localStorage
            const storedToken = localStorage.getItem('whatsapp_instance_token');
            if (storedToken) {
              token = storedToken;
              console.log("Token encontrado no localStorage:", token);
            } else {
              console.log("Nenhum token encontrado para o usuário");
            }
          }
          
          if (token) {
            setWhatsappToken(token);
            // Salvar token localmente para uso em outras partes do app
            localStorage.setItem('whatsapp_instance_token', token);
            
            // Carregar contatos com o token encontrado
            loadContacts(token);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar token do WhatsApp:", error);
      }
    };
    
    loadWhatsAppToken();
  }, []);
  
  // Processar parâmetros de consulta
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const campaignType = params.get('type');
    
    // Definir a aba ativa
    if (tab) {
      setActiveTab(tab);
    }
    
    // Definir o tipo de campanha, se especificado
    if (campaignType) {
      setSelectedCampaignType(campaignType);
    }
  }, [location.search]);
  
  // Carregar dados iniciais e configurar assinaturas em tempo real
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Carregar token do WhatsApp se não estiver presente
        if (!whatsappToken) {
          try {
            // Buscar token salvo no banco
            const userSettings = await supabase
              .from('user_settings')
              .select('whatsapp_token')
              .eq('user_id', currentUserId)
              .single();
            
            if (userSettings && userSettings.data && userSettings.data.whatsapp_token) {
              setWhatsappToken(userSettings.data.whatsapp_token);
              console.log('Token do WhatsApp carregado com sucesso');
            }
          } catch (error) {
            console.error('Erro ao carregar token do WhatsApp:', error);
          }
        }
        
        // Carregar campanhas, mensagens e contatos
        await loadMessages();
        
        // Carregar contatos se tivermos um token
        if (whatsappToken) {
          await loadContacts(whatsappToken);
        }
        
        // Carregar métricas
        await loadMetrics();
        
        // Configurar intervalo para atualizar status a cada 30 segundos
        const intervalId = setInterval(async () => {
          console.log('Atualizando status das mensagens...');
          await loadMessages();
        }, 30000);
        
        setLoading(false);
        
        // Limpar intervalo ao desmontar o componente
        return () => clearInterval(intervalId);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        setLoading(false);
      }
    };
    
    loadInitialData();
    
    // Limpar assinaturas ao desmontar o componente
    return () => {
      cleanupRealTimeSubscriptions();
    };
  }, [whatsappToken]); // Adicionar whatsappToken como dependência
  


  // Carregar configuração inicial ao montar o componente
  useEffect(() => {
    const init = async () => {
      // Inicializar componentes
      setupRealTimeSubscriptions();
      loadMessages();
      loadMetrics();
    };
    
    init();
  }, []);
  
  // Configurar assinaturas em tempo real com o Supabase
  const setupRealTimeSubscriptions = () => {
    if (!realTimeEnabled) return;
    
    try {
      // Assinar mudanças na tabela de mensagens
      subscriptions.messages = supabase
        .channel('marketing-messages-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'marketing_messages' 
          }, 
          (payload) => {
            console.log('Mudança detectada em mensagens:', payload);
            // Recarregar mensagens quando houver alterações
            loadMessages();
          }
        )
        .subscribe();
      
      // Assinar mudanças na tabela de campanhas
      subscriptions.campaigns = supabase
        .channel('marketing-campaigns-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'marketing_campaigns' 
          }, 
          (payload) => {
            console.log('Mudança detectada em campanhas:', payload);
            // Recarregar métricas e forçar atualização de campanhas
            loadMetrics();
            // Incrementar o contador para forçar atualização em CampaignHistory
            setCampaignsRefreshTrigger(prev => prev + 1);
          }
        )
        .subscribe();
        
      console.log('Assinaturas em tempo real configuradas');
    } catch (error) {
      console.error('Erro ao configurar assinaturas em tempo real:', error);
      setRealTimeEnabled(false);
    }
  };
  
  // Limpar assinaturas em tempo real
  const cleanupRealTimeSubscriptions = () => {
    try {
      // Remover todas as assinaturas ativas
      if (subscriptions.messages) {
        supabase.removeChannel(subscriptions.messages);
      }
      
      if (subscriptions.campaigns) {
        supabase.removeChannel(subscriptions.campaigns);
      }
      
      console.log('Assinaturas em tempo real removidas');
    } catch (error) {
      console.error('Erro ao limpar assinaturas:', error);
    }
  };

  const handleNewMessage = () => {
    setShowMessageDialog(true);
  };

  const handleSubmitMessage = async () => {
    try {
      const token = localStorage.getItem('whatsapp_instance_token');
      if (!token) {
        toast({
          title: "Erro",
          description: "Token de instância do WhatsApp não encontrado. Verifique sua configuração.",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar se mensagem está programada ou é imediata
      const isScheduled = messageCampaignData.scheduleDate && messageCampaignData.scheduleTime;
      
      // Formatar data de agendamento se aplicavel
      let scheduleDateTime = null;
      if (isScheduled) {
        const [year, month, day] = messageCampaignData.scheduleDate!.split('-');
        const [hour, minute] = messageCampaignData.scheduleTime!.split(':');
        scheduleDateTime = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
      }
      
      // Obter lista de destinatários baseado na seleção
      let recipients: string[] = [];
      
      if (messageCampaignData.recipients === 'custom' || messageCampaignData.recipients === 'phone') {
        // Obter os IDs selecionados
        if (messageCampaignData.selectedContactIds && messageCampaignData.selectedContactIds.length > 0) {
          recipients = messageCampaignData.selectedContactIds;
        } else {
          toast({
            title: "Erro",
            description: "Selecione pelo menos um contato para enviar a mensagem.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Para outros tipos, usamos todos os contatos disponíveis
        recipients = whatsappContacts.map(contact => contact.number);
      }
      
      if (recipients.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum destinatário encontrado para enviar a mensagem.",
          variant: "destructive",
        });
        return;
      }
      
      // Construir objeto para salvar no banco de dados
      const messageToSave: MessageCampaignData = {
        title: messageCampaignData.title,
        message: messageCampaignData.message,
        recipients: messageCampaignData.recipients,
        channels: messageCampaignData.channels,
        scheduleDate: messageCampaignData.scheduleDate,
        scheduleTime: messageCampaignData.scheduleTime,
        selectedContactIds: recipients,
        mediaUrl: messageCampaignData.mediaUrl,
        mediaType: messageCampaignData.mediaType,
        mediaName: messageCampaignData.mediaName
      };
      
      let response;
      let folderId;
      
      // Se não for agendada, enviar imediatamente
      if (!isScheduled) {
        if (messageCampaignData.mediaUrl) {
          // Enviar mensagem com mídia
          response = {
            success: true,
            data: await sendBulkMediaMessage(
              recipients,
              messageCampaignData.mediaUrl,
              messageCampaignData.message,
              3,
              8,
              token
            )
          };
        } else {
          // Enviar mensagem de texto
          response = await sendBulkMessage(
            recipients,
            messageCampaignData.message,
            3,
            8,
            token
          );
        }
        
        // Extrair o folder_id
        folderId = response.success && response.data ? response.data.folder_id : undefined;
      }
      
      // Salvar mensagem no banco com o folder_id
      const savedMessage = await saveMarketingMessage(messageToSave, folderId);
      
      if (!savedMessage) {
        throw new Error('Falha ao salvar mensagem');
      }
      
      const messageId = savedMessage.id;
      
      // Se a mensagem não for agendada, enviar imediatamente
      if (!isScheduled) {
        // Atualizar status para "sent"
        await updateMessageStatus(messageId, 'sent');
        
        let result;
        
        // Verificar se existe mídia para enviar
        if (messageCampaignData.mediaUrl) {
          // Enviar mensagem com mídia
          result = await sendBulkMediaMessage(
            recipients,
            messageCampaignData.mediaUrl,
            messageCampaignData.message, // A mensagem vai como legenda
            3, // minDelay em segundos
            8, // maxDelay em segundos
            token // Token da instância do WhatsApp
          );
          
          // Contar sucessos e falhas
          const successCount = result.filter((r: any) => r.success).length;
          const failureCount = result.filter((r: any) => !r.success).length;
          
          // Atualizar status da mensagem no banco de dados
          await updateMessageStatus(messageId, 'sent', {
            successful_sends: successCount,
            failed_sends: failureCount
          });
          
          toast({
            title: "Envio concluído",
            description: `Mensagem com imagem enviada para ${successCount} de ${recipients.length} destinatários.`,
            variant: "default",
          });
          
        } else {
          // Enviar mensagem sem mídia (apenas texto)
          result = await sendBulkMessage(
            recipients,
            messageCampaignData.message,
            3, // minDelay em segundos
            8, // maxDelay em segundos
            token // Token da instância do WhatsApp
          );
          
          // Contar sucessos e falhas
          const successCount = result.results.filter(r => r.success).length;
          const failureCount = result.results.filter(r => !r.success).length;
          
          // Atualizar status da mensagem no banco de dados
          await updateMessageStatus(messageId, 'sent', {
            successful_sends: successCount,
            failed_sends: failureCount
          });
          
          toast({
            title: "Envio concluído",
            description: `Mensagem enviada para ${successCount} de ${recipients.length} destinatários.`,
            variant: "default",
          });
        }
      } else {
        // Mensagem agendada, apenas atualizar status
        await updateMessageStatus(messageId, 'scheduled');
        
        toast({
          title: "Mensagem agendada",
          description: `Mensagem agendada para ${messageCampaignData.scheduleDate} às ${messageCampaignData.scheduleTime}.`,
          variant: "default",
        });
      }
      
      // Limpar formulário e fechar o diálogo
      setMessageCampaignData({
        title: "",
        message: "",
        recipients: "all",
        channels: ["whatsapp"],
        scheduleDate: "",
        scheduleTime: "",
        selectedContactIds: [],
        mediaUrl: undefined,
        mediaType: undefined,
        mediaName: undefined
      });
      
      // Recarregar mensagens
      loadMessages();
      
      // Fechar o diálogo
      setShowMessageDialog(false);
      
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado ao enviar a mensagem.",
        variant: "destructive",
      });
    }
  };
  const handleMessageChange = (newData: MessageCampaignData) => {
    setMessageCampaignData(newData);
  };

  // Funções já declaradas mais abaixo, removendo para evitar redeclaração
  
  // Carregar mensagens do Supabase e atualizar status da API UazApi
  const loadMessages = async () => {
    console.log('Carregando mensagens...');
    try {
      // Carregar mensagens do banco de dados
      const messages = await fetchMarketingMessages();
      
      // Para teste direto, vamos atribuir status para cada mensagem
      const updatedMessages = [...messages];
      
      // Para fins de demonstração, atribuir status variados para ver na interface
      updatedMessages.forEach((msg, index) => {
        // Distribuir status diferentes para demonstração
        if (index % 3 === 0) {
          msg.status = 'enviado';
        } else if (index % 3 === 1) {
          msg.status = 'enviando';
        } else {
          msg.status = 'aguardando';
        }
        
        // Adicionar algumas contagens para demonstração
        msg.total_recipients = 10;
        msg.successful_sends = index % 3 === 0 ? 10 : index % 3 === 1 ? 5 : 0;
        msg.failed_sends = index % 3 === 0 ? 0 : index % 3 === 1 ? 0 : 0;
      });

      // Comente o código abaixo quando quiser ativar a API real
      // Se tiver token do WhatsApp, buscar status atualizados da API
      if (false && whatsappToken) { // Desativado temporariamente
        try {
          // Para cada mensagem que tenha folder_id, buscar status atualizado
          for (const msg of updatedMessages) {
            if (msg.channel === 'whatsapp' && msg.folder_id) {
              try {
                console.log(`Buscando status da campanha ${msg.folder_id}`);
                const campaignData = await listCampaignMessages(msg.folder_id, undefined, 1, 1000, whatsappToken);
                
                if (campaignData && campaignData.messages && campaignData.messages.length > 0) {
                  // Contar mensagens por status
                  const statusCounts = campaignData.messages.reduce((acc: any, m: any) => {
                    acc[m.message_status] = (acc[m.message_status] || 0) + 1;
                    return acc;
                  }, {});
                  
                  // Atualizar contagens
                  const total = campaignData.messages.length;
                  const sentCount = statusCounts['Sent'] || 0;
                  const failedCount = statusCounts['Failed'] || 0;
                  const scheduledCount = statusCounts['Scheduled'] || 0;
                  
                  msg.total_recipients = total;
                  msg.successful_sends = sentCount;
                  msg.failed_sends = failedCount;
                  
                  // Definir status geral com base nas contagens
                  if (scheduledCount === total) {
                    msg.status = 'aguardando'; // Status em português
                  } else if (sentCount === total) {
                    msg.status = 'enviado'; // Status em português
                  } else if (failedCount === total) {
                    msg.status = 'falha'; // Status em português
                  } else if (sentCount > 0 && sentCount < total) {
                    msg.status = 'enviando'; // Status em português
                  }
                }
              } catch (apiError) {
                console.error(`Erro ao buscar status da campanha ${msg.folder_id}:`, apiError);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao buscar status das mensagens:', error);
        }
      }
      
      // Atualizar lista de mensagens
      console.log('Atualizando mensagens com status:', updatedMessages);
      setSentMessages(updatedMessages);
      return updatedMessages;
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      return [];
    }
  };

  // Carregar contatos do banco de dados ou da API
  const loadContacts = async (tokenToUse?: string) => {
    console.log('Carregando contatos...');
    setLoading(true);
    try {
      // Se tiver token, buscar contatos da API
      if (tokenToUse) {
        // fetchWhatsAppContacts espera (limite, dataCriacao, token)
        const apiContacts = await fetchWhatsAppContacts(100, undefined, tokenToUse);
        // Garantir que apiContacts é um array antes de atribuir
        const contactsArray = Array.isArray(apiContacts) ? apiContacts : 
                            (apiContacts && apiContacts.contacts ? apiContacts.contacts : []);
        
        setWhatsappContacts(contactsArray);
        
        // Salvar contatos no banco de dados para acesso offline
        // Garantir que é um array antes de salvar
        await saveWhatsAppContacts(contactsArray);
        
        return contactsArray;
      } else {
        // Se não tiver token, buscar do banco
        const dbContacts = await fetchWhatsAppContactsFromDB();
        setWhatsappContacts(dbContacts);
        return dbContacts;
      }
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contatos do WhatsApp.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Função para atualizar os contatos do WhatsApp
  const refreshWhatsAppContacts = () => {
    if (whatsappToken) {
      loadContacts();
    } else {
      toast({
        title: "Erro",
        description: "Token da instância WhatsApp não encontrado.",
        variant: "destructive"
      });
    }
  };
  
  // Mostrar todos os contatos ou apenas os iniciais
  const toggleContactsExpanded = () => {
    setContactsExpanded(prev => !prev);
  };

  // Carregar métricas do Supabase
  const loadMetrics = async () => {
    try {
      const metrics = await fetchMarketingMetrics();
      setMarketingMetricsData(metrics);
      return metrics;
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      return null;
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Marketing"
        subtitle="Gerencie suas campanhas e automações de marketing"
      />
      <MessageCampaignDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        data={messageCampaignData}
        onChange={handleMessageChange}
        onSubmit={handleSubmitMessage}
      />
      
      <FormCard variant="blue" className="mb-4" title="Métricas de Desempenho">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {loading ? (
          // Esqueletos de carregamento para as métricas
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="p-2 rounded-full bg-gray-200 h-8 w-8 animate-pulse"></div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <MetricsCard
              title="Campanhas Ativas"
              value={marketingMetricsData ? String(marketingMetricsData.activeCampaigns) : "0"}
              change={marketingMetricsData ? marketingMetricsData.campaignsGrowth : 0}
              icon={Target}
              description="este mês"
            />
            <MetricsCard
              title="Cupons Ativos"
              value={marketingMetricsData ? String(marketingMetricsData.activeCoupons) : "0"}
              change={marketingMetricsData ? marketingMetricsData.couponsGrowth : 0}
              icon={Gift}
              description="em circulação"
            />
            <MetricsCard
              title="Taxa de Conversão"
              value={marketingMetricsData ? `${marketingMetricsData.conversionRate.toFixed(1)}%` : "0%"}
              change={marketingMetricsData ? marketingMetricsData.conversionGrowth : 0}
              icon={Zap}
              description="média das campanhas"
            />
            <MetricsCard
              title="Economia Gerada"
              value={marketingMetricsData ? `R$ ${marketingMetricsData.customerSavings.toLocaleString('pt-BR')}` : "R$ 0"}
              change={marketingMetricsData ? marketingMetricsData.savingsGrowth : 0}
              icon={Percent}
              description="para clientes"
            />
          </>
        )}
      </div>
      </FormCard>

      <FormCard variant="blue" className="mb-0" title="Ações de Marketing">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gradient-to-r from-blue-50/70 to-purple-50/70 border border-indigo-200 p-1 rounded-lg">
          <TabsTrigger 
            value="campanhas" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded"
          >
            <Target className="mr-2 h-4 w-4" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger 
            value="automacao" 
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded"
          >
            <Zap className="mr-2 h-4 w-4" />
            Automação
          </TabsTrigger>
          <TabsTrigger 
            value="aniversarios" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded"
          >
            <Gift className="mr-2 h-4 w-4" />
            Aniversários
          </TabsTrigger>
          <TabsTrigger 
            value="mensagens" 
            className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Mensagens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas">
          <div className="grid gap-6 grid-cols-1">
            <CampaignTypesSection 
              selectedType={selectedCampaignType}
              onTypeSelect={setSelectedCampaignType}
            />
            <CampaignHistory 
              selectedCampaignType={selectedCampaignType}
              refreshTrigger={campaignsRefreshTrigger}
            />
          </div>
        </TabsContent>

        <TabsContent value="automacao">
          <AutomationSection />
        </TabsContent>
        
        <TabsContent value="aniversarios">
          <BirthdayAutomation />
        </TabsContent>

        <TabsContent value="mensagens">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pink-700">Histórico de Mensagens</h2>
              <Button onClick={handleNewMessage} variant="default" className="bg-pink-600 hover:bg-pink-700">
                Nova Mensagem
              </Button>
            </div>
            
            {/* Seção de Contatos do WhatsApp */}
            <Card className="border-pink-100">
              <CardHeader className="bg-pink-50 border-b border-pink-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-pink-700" />
                    <h3 className="font-medium text-pink-800">Contatos do WhatsApp</h3>
                    <Badge className="bg-pink-200 text-pink-800 hover:bg-pink-300">
                      {whatsappContacts.length}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshWhatsAppContacts}
                    disabled={loadingWhatsAppContacts}
                    className="text-pink-700 border-pink-200 hover:bg-pink-50"
                  >
                    {loadingWhatsAppContacts ? (
                      <>
                        <span>Carregando...</span>
                        <MessageSquare className="ml-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span>Atualizar</span>
                        <MessageSquare className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                {whatsappToken && (
                  <p className="text-xs text-gray-500 mt-1">Token: {whatsappToken.substring(0, 15)}...{whatsappToken.substring(whatsappToken.length - 10)}</p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {loadingWhatsAppContacts ? (
                  <div className="flex justify-center items-center py-8">
                    <MessageSquare className="h-8 w-8 text-pink-400 animate-pulse" />
                    <p className="ml-2 text-pink-700">Carregando contatos...</p>
                  </div>
                ) : whatsappContacts.length > 0 ? (
                  <ScrollArea className={contactsExpanded ? "h-64" : "max-h-40"}>
                    <div className="p-3 space-y-0.5">
                      {(contactsExpanded ? whatsappContacts : whatsappContacts.slice(0, 5)).map((contact) => (
                        <div 
                          key={contact.id} 
                          className="flex items-center justify-between p-2 hover:bg-pink-50 rounded-md border-b border-pink-50"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 bg-pink-100">
                              <AvatarFallback className="text-pink-700 text-xs">
                                {contact.name ? contact.name.substring(0, 2).toUpperCase() : "CT"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{contact.name || "Sem nome"}</p>
                              <p className="text-xs text-gray-500">{contact.number}</p>
                            </div>
                          </div>
                          <Badge 
                            className={contact.isMyContact ? 
                              "bg-green-100 text-green-800" : 
                              "bg-blue-100 text-blue-800"
                            }
                          >
                            <UserIcon className="h-3 w-3 mr-1" />
                            {contact.isMyContact ? "Na agenda" : "WhatsApp"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-pink-700">
                    <MessageSquare className="h-12 w-12 mx-auto text-pink-400 mb-2" />
                    <p>Nenhum contato encontrado</p>
                    <p className="text-sm text-gray-500 mt-1">Verifique a conexão do WhatsApp</p>
                  </div>
                )}
              </CardContent>
              {whatsappContacts.length > 5 && (
                <div className="p-2 border-t border-pink-100 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-pink-700 hover:bg-pink-50 w-full"
                    onClick={toggleContactsExpanded}
                  >
                    {contactsExpanded ? "Mostrar menos" : `Ver todos os ${whatsappContacts.length} contatos`}
                  </Button>
                </div>
              )}
            </Card>
            
            {loading ? (
              <div className="bg-pink-50/60 border border-pink-200 rounded-lg p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-pink-400 mb-4" />
                <h3 className="text-lg font-medium text-pink-700">Carregando mensagens...</h3>
              </div>
            ) : (
              <MessageHistory 
                messages={sentMessages.map(msg => ({
                  id: msg.id || '',
                  titulo: msg.title,
                  mensagem: msg.message,
                  status: msg.status as MessageStatus,
                  data: msg.created_at ? new Date(msg.created_at).toLocaleString() : new Date().toLocaleString(),
                  destinatarios: msg.total_recipients || 0,
                  sucessos: msg.successful_sends || 0,
                  falhas: msg.failed_sends || 0,
                  canal: (msg.channel as 'whatsapp' | 'email' | 'sms') || 'whatsapp',
                  agendamento: msg.schedule_date
                }))} 
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
      </FormCard>
    </PageLayout>
  );
}
