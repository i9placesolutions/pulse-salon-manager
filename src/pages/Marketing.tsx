import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Bell, Zap, BarChart, MessageSquare, History, Gift } from "lucide-react";
import { MetricsCard } from "@/components/marketing/MetricsCard";
import { BirthdayAutomation } from "@/components/marketing/BirthdayAutomation";
import { MessageCampaignDialog } from "@/components/marketing/MessageCampaignDialog";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { AutomationSection } from "@/components/marketing/AutomationSection";
import { CampaignTypesSection } from "@/components/marketing/CampaignTypesSection";
import { CampaignHistory } from "@/components/marketing/CampaignHistory";
import { MarketingReports } from "@/components/marketing/MarketingReports";
import { marketingMetrics } from "@/components/marketing/marketingConstants";
import { MessageHistory } from "@/components/marketing/MessageHistory";
import { Button } from "@/components/ui/button";
import type { MessageCampaignData } from "@/types/marketing";
import { useLocation } from 'react-router-dom';
import { sendBulkMessage, WhatsAppContact, fetchWhatsAppContacts } from "@/lib/uazapiService";
import { toast } from "@/components/ui/use-toast";

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
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState("campanhas");

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

  const handleNewMessage = () => {
    setShowMessageDialog(true);
  };

  const handleSubmitMessage = async () => {
    try {
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
          
        // Para os outros casos, seria necessário ter uma API para buscar clientes VIP, inativos, etc.
        // Por enquanto estamos implementando apenas para contatos do WhatsApp
        default:
          // Simulação de números para outros tipos de destinatários
          targetNumbers = whatsappContacts.slice(0, 5).map(contact => contact.number);
          break;
      }
      
      // Criar o novo item de mensagem para o histórico
      const newMessage = {
        id: Date.now().toString(),
        titulo: messageCampaignData.title,
        mensagem: messageCampaignData.message,
        status: "enviando",
        data: new Date().toLocaleString(),
        destinos: targetNumbers.length,
        entregues: 0,
      };
      
      // Adicionar ao histórico de mensagens
      setSentMessages(prev => [newMessage, ...prev]);
      
      // Enviar mensagens com delay configurado (3-8 segundos)
      const results = await sendBulkMessage(
        targetNumbers,
        messageCampaignData.message,
        3,  // minDelay em segundos
        8   // maxDelay em segundos
      );
      
      // Atualizar o status da mensagem com base nos resultados
      const successCount = results.filter(r => r.success).length;
      
      setSentMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? {
                ...msg,
                status: successCount > 0 ? "enviado" : "erro",
                entregues: successCount,
                erro: successCount === 0 ? "Falha ao enviar mensagens" : undefined
              }
            : msg
        )
      );
      
      // Feedback para o usuário
      toast({
        title: successCount > 0 ? "Mensagens enviadas com sucesso" : "Erro ao enviar mensagens",
        description: `${successCount} de ${targetNumbers.length} mensagens foram entregues.`,
        variant: successCount > 0 ? "default" : "destructive",
      });
      
    } catch (error) {
      console.error("Erro ao enviar mensagens:", error);
      
      // Atualizar o status da mensagem para erro
      setSentMessages(prev => 
        prev.map(msg => 
          msg.id === prev[0].id 
            ? { ...msg, status: "erro", erro: "Falha na conexão com o serviço de mensagens" }
            : msg
        )
      );
      
      toast({
        title: "Erro ao enviar mensagens",
        description: "Ocorreu um erro ao tentar enviar as mensagens. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleMessageChange = (newData: MessageCampaignData) => {
    setMessageCampaignData(newData);
  };

  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([]);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await fetchWhatsAppContacts(100);
        setWhatsappContacts(response.contacts);
      } catch (error) {
        console.error("Erro ao carregar contatos:", error);
      }
    };

    if (showMessageDialog && whatsappContacts.length === 0) {
      loadContacts();
    }
  }, [showMessageDialog]);

  return (
    <div className="space-y-6">
      <MarketingHeader onNewMessage={handleNewMessage} />

      <MessageCampaignDialog 
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        data={messageCampaignData}
        onChange={handleMessageChange}
        onSubmit={handleSubmitMessage}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketingMetrics.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
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
          <TabsTrigger 
            value="relatorios" 
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded"
          >
            <BarChart className="mr-2 h-4 w-4" />
            Relatórios
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
            {sentMessages.length === 0 ? (
              <div className="bg-pink-50/60 border border-pink-200 rounded-lg p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-pink-400 mb-4" />
                <h3 className="text-lg font-medium text-pink-700">Nenhuma mensagem enviada</h3>
                <p className="text-pink-500 mt-2">
                  Clique em 'Nova Mensagem' para enviar sua primeira mensagem.
                </p>
              </div>
            ) : (
              <MessageHistory messages={sentMessages} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="relatorios">
          <MarketingReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
