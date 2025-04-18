import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Bell, Zap, BarChart, MessageSquare, History, Gift, Percent } from "lucide-react";
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
import { sendBulkMessage, WhatsAppContact, fetchWhatsAppContacts } from "@/lib/uazapiService";
import { toast } from "@/components/ui/use-toast";

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

// Importar client Supabase
import { supabase } from '@/lib/supabaseClient';

export default function Marketing() {
  const location = useLocation();
  const [selectedCampaignType, setSelectedCampaignType] = useState<string | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
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

  // Controles para assinaturas em tempo real
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  
  // Estado para controlar atualizações em tempo real
  const [campaignsRefreshTrigger, setCampaignsRefreshTrigger] = useState(0);
  
  // Referências para assinaturas ativas
  const subscriptions = {
    campaigns: null as any,
    messages: null as any
  };

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
      setLoading(true);
      try {
        // Carregar mensagens do Supabase
        await loadMessages();
        
        // Carregar contatos do Supabase
        await loadContacts();
        
        // Carregar métricas do Supabase
        await loadMetrics();
        
        // Configurar assinaturas em tempo real
        setupRealTimeSubscriptions();
        
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados iniciais.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
    
    // Limpar assinaturas ao desmontar o componente
    return () => {
      cleanupRealTimeSubscriptions();
    };
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
      // Salvar a mensagem no Supabase
      const savedMessage = await saveMarketingMessage(messageCampaignData);
      if (!savedMessage) {
        throw new Error('Falha ao salvar mensagem');
      }
      
      // Se não for agendada, enviar imediatamente
      if (!messageCampaignData.scheduleDate) {
        // Preparar lista de números de destino conforme o tipo de destinatário selecionado
        let targetNumbers: string[] = [];
        
        switch (messageCampaignData.recipients) {
          case 'phone':
            if (messageCampaignData.selectedContactIds && messageCampaignData.selectedContactIds.length > 0) {
              // Filtrar contatos selecionados e obter seus números
              const selectedContacts = whatsappContacts.filter(contact => 
                messageCampaignData.selectedContactIds?.includes(contact.id)
              );
              targetNumbers = selectedContacts.map(contact => contact.number);
            }
            break;
            
          case 'all':
            // Todos os contatos disponíveis
            targetNumbers = whatsappContacts.map(contact => contact.number);
            break;
            
          // Implementar outros casos conforme necessário (vip, inativos, etc.)
        }
        
        if (targetNumbers.length === 0) {
          throw new Error('Nenhum número de destinatário encontrado');
        }
        
        let successes = 0;
        let failures = 0;
        
        // Enviar mensagens em lote
        if (messageCampaignData.channels.includes('whatsapp')) {
          // Enviar WhatsApp (usando UazAPI como exemplo)
          try {
            const response = await sendBulkMessage(targetNumbers, messageCampaignData.message);
            
            // Verificar resultado do envio em lote
            if (response && response.success) {
              successes = targetNumbers.length;
            } else {
              failures = targetNumbers.length;
            }
          } catch (error) {
            console.error("Erro ao enviar mensagens em lote:", error);
            failures = targetNumbers.length;
          }
        }
        
        // Outros canais (e-mail, SMS) seriam implementados aqui
        
        // Atualizar status da mensagem com estatísticas
        await updateMessageStatus(
          savedMessage.id || '', 
          'sent',
          {
            successful_sends: successes,
            failed_sends: failures
          }
        );
        
        // Adicionar a mensagem enviada à lista e reordenar
        const updatedMessage: MarketingMessage = {
          ...savedMessage,
          status: 'sent',
          successful_sends: successes,
          failed_sends: failures
        };
        setSentMessages(prevMessages => [updatedMessage, ...prevMessages]);
        
        // Notificar usuário
        toast({
          title: "Mensagem enviada",
          description: `Mensagem enviada para ${successes} destinatário(s). Falhas: ${failures}`,
          variant: successes > 0 ? "default" : "destructive",
        });
      } else {
        // Para mensagens agendadas
        toast({
          title: "Mensagem agendada",
          description: `A mensagem foi agendada para ${messageCampaignData.scheduleDate} às ${messageCampaignData.scheduleTime}`,
        });
        
        // Adicionar à lista de mensagens com status agendada
        const scheduledMessage: MarketingMessage = {
          ...savedMessage,
          status: 'scheduled'
        };
        setSentMessages(prevMessages => [scheduledMessage, ...prevMessages]);
      }
      
      // Fechar o diálogo e resetar o formulário
      setShowMessageDialog(false);
      setMessageCampaignData({
        title: "",
        message: "",
        recipients: "all",
        channels: ["whatsapp"],
        scheduleDate: "",
        scheduleTime: "",
        selectedContactIds: []
      });
    } catch (error) {
      console.error("Erro ao enviar/agendar mensagem:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao processar mensagem",
        variant: "destructive",
      });
    }
  };

  const handleMessageChange = (newData: MessageCampaignData) => {
    setMessageCampaignData(newData);
  };

  // Carregar mensagens do Supabase
  const loadMessages = async () => {
    console.log('Carregando mensagens...');
    try {
      const messages = await fetchMarketingMessages();
      setSentMessages(messages);
      return messages;
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      return [];
    }
  };

  // Carregar contatos do banco de dados ou da API
  const loadContacts = async () => {
    try {
      // Primeiro tenta carregar contatos do banco de dados
      let contacts = await fetchWhatsAppContactsFromDB();
      
      // Se não houver contatos no banco, busca da API
      if (contacts.length === 0) {
        const response = await fetchWhatsAppContacts();
        contacts = response.contacts || [];
        
        // Salva os contatos obtidos no banco de dados para uso futuro
        if (contacts.length > 0) {
          await saveWhatsAppContacts(contacts);
        }
      }
      
      setWhatsappContacts(contacts);
      return contacts;
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
      return [];
    }
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
    <div className="container mx-auto py-6 space-y-8">
      <MarketingHeader />

      <MessageCampaignDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        data={messageCampaignData}
        onChange={handleMessageChange}
        onSubmit={handleSubmitMessage}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
