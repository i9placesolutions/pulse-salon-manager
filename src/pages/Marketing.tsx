import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Bell, Zap, BarChart, MessageSquare, History } from "lucide-react";
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
    scheduleTime: ""
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

  const handleSubmitMessage = () => {
    console.log("Submitting:", messageCampaignData);
    
    // Adicionar a mensagem ao histórico com status inicial "enviando"
    const newMessage = {
      id: Date.now().toString(),
      titulo: messageCampaignData.title,
      mensagem: messageCampaignData.message,
      destinatarios: 25, // Simulação - seria calculado com base nos destinatários selecionados
      dataEnvio: new Date().toISOString(),
      status: "enviando",
      canal: "whatsapp",
      agendamento: messageCampaignData.scheduleDate ? 
        `${messageCampaignData.scheduleDate}T${messageCampaignData.scheduleTime || '00:00:00'}` : 
        undefined
    };
    
    setSentMessages(prev => [newMessage, ...prev]);
    setShowMessageDialog(false);
    
    // Simular mudança de status após alguns segundos
    setTimeout(() => {
      setSentMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? {...msg, status: "aguardando"} : msg
        )
      );
      
      // Depois de mais alguns segundos, mudar para entregue
      setTimeout(() => {
        setSentMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? {...msg, status: "entregue"} : msg
          )
        );
      }, 3000);
    }, 2000);
  };

  const handleMessageChange = (newData: MessageCampaignData) => {
    setMessageCampaignData(newData);
  };

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
            value="aniversarios" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded"
          >
            <Bell className="mr-2 h-4 w-4" />
            Aniversários
          </TabsTrigger>
          <TabsTrigger 
            value="automacao" 
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded"
          >
            <Zap className="mr-2 h-4 w-4" />
            Automação
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

        <TabsContent value="aniversarios">
          <BirthdayAutomation />
        </TabsContent>

        <TabsContent value="automacao">
          <AutomationSection />
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
