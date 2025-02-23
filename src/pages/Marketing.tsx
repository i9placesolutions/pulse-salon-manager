
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
import { MarketingReports } from "@/components/marketing/MarketingReports";
import { marketingMetrics } from "@/components/marketing/marketingConstants";
import type { MessageCampaignData } from "@/types/marketing";

export default function Marketing() {
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
          <MarketingReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
