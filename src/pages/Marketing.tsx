
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Gift, Bell, Zap, BarChart } from "lucide-react";
import { MetricsCard } from "@/components/marketing/MetricsCard";
import { CouponManagement } from "@/components/marketing/CouponManagement";
import { BirthdayAutomation } from "@/components/marketing/BirthdayAutomation";
import { MessageCampaignDialog } from "@/components/marketing/MessageCampaignDialog";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { AutomationSection } from "@/components/marketing/AutomationSection";
import { CampaignTypesSection } from "@/components/marketing/CampaignTypesSection";
import { marketingMetrics } from "@/components/marketing/marketingConstants";
import type { MessageCampaignData } from "@/types/marketing";

export default function Marketing() {
  const [selectedCampaignType, setSelectedCampaignType] = useState<string | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageCampaignData, setMessageCampaignData] = useState<MessageCampaignData>({
    title: "",
    message: "",
    recipients: "all",
    channels: [],
    scheduleDate: "",
    scheduleTime: ""
  });

  const handleNewMessage = () => {
    setShowMessageDialog(true);
  };

  const handleSubmitMessage = () => {
    console.log("Submitting:", messageCampaignData);
    setShowMessageDialog(false);
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

      <Tabs defaultValue="campanhas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-4">
          <TabsTrigger value="campanhas" className="gap-2">
            <Target className="h-4 w-4" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="cupons" className="gap-2">
            <Gift className="h-4 w-4" />
            Cupons
          </TabsTrigger>
          <TabsTrigger value="aniversarios" className="gap-2">
            <Bell className="h-4 w-4" />
            Aniversários
          </TabsTrigger>
          <TabsTrigger value="automacao" className="gap-2">
            <Zap className="h-4 w-4" />
            Automação
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="gap-2">
            <BarChart className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas">
          <CampaignTypesSection 
            selectedType={selectedCampaignType}
            onTypeSelect={setSelectedCampaignType}
          />
        </TabsContent>

        <TabsContent value="cupons">
          <CouponManagement onCreateCoupon={() => {}} />
        </TabsContent>

        <TabsContent value="aniversarios">
          <BirthdayAutomation />
        </TabsContent>

        <TabsContent value="automacao">
          <AutomationSection />
        </TabsContent>

        <TabsContent value="relatorios">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Relatórios de Marketing</h2>
                <p className="text-sm text-muted-foreground">
                  Analise o desempenho das suas campanhas
                </p>
              </div>
              <Button>
                <BarChart className="mr-2 h-4 w-4" />
                Exportar Relatório
              </Button>
            </div>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {/* Add ReChart component here */}
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Campanhas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Black Friday', 'Natal', 'Aniversariantes', 'Reativação'].map((campaign) => (
                        <div key={campaign} className="flex items-center justify-between">
                          <span>{campaign}</span>
                          <span className="text-green-600">+{Math.floor(Math.random() * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Engajamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Taxa de Abertura</span>
                        <span>75%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Taxa de Clique</span>
                        <span>45%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Taxa de Conversão</span>
                        <span>28%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ROI Médio</span>
                        <span>3.2x</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
