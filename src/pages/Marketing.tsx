import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Gift, Users, Star, Bell, Calendar, Percent, Target, Zap, BarChart } from "lucide-react";
import { MessageForm } from "@/components/marketing/MessageForm";
import { MetricsCard } from "@/components/marketing/MetricsCard";
import { CampaignCard } from "@/components/marketing/CampaignCard";
import { ScheduleForm } from "@/components/marketing/ScheduleForm";
import { CouponManagement } from "@/components/marketing/CouponManagement";
import { BirthdayAutomation } from "@/components/marketing/BirthdayAutomation";

const marketingMetrics = [
  {
    title: "Campanhas Ativas",
    value: "12",
    change: 12.5,
    icon: Target,
    description: "este mês"
  },
  {
    title: "Cupons Ativos",
    value: "45",
    change: 8.2,
    icon: Gift,
    description: "em circulação"
  },
  {
    title: "Taxa de Conversão",
    value: "24%",
    change: 5.3,
    icon: Zap,
    description: "média das campanhas"
  },
  {
    title: "Economia Gerada",
    value: "R$ 2.450",
    change: 15.8,
    icon: Percent,
    description: "para clientes"
  },
];

const campaignTypes = [
  {
    id: 1,
    type: "discount",
    title: "Desconto Direto",
    description: "Ofereça descontos percentuais ou valores fixos",
    icon: Percent,
  },
  {
    id: 2,
    type: "coupon",
    title: "Cupom Promocional",
    description: "Crie códigos promocionais exclusivos",
    icon: Gift,
  },
  {
    id: 3,
    type: "cashback",
    title: "Cashback",
    description: "Recompense clientes com dinheiro de volta",
    icon: Star,
  },
  {
    id: 4,
    type: "vip",
    title: "Bônus VIP",
    description: "Benefícios exclusivos para clientes VIP",
    icon: Users,
  },
];

interface MessageFormData {
  title: string;
  message: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom';
  selectedClients: string[];
  channels: string[];
  scheduledFor?: string;
}

interface ScheduleFormData {
  title: string;
  type: 'message' | 'discount' | 'coupon';
  message?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  startDate: string;
  endDate: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom';
  channels: string[];
}

export default function Marketing() {
  const [selectedCampaignType, setSelectedCampaignType] = useState<string | null>(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageFormData, setMessageFormData] = useState<MessageFormData>({
    title: '',
    message: '',
    recipients: 'all',
    selectedClients: [],
    channels: [],
  });
  
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState<ScheduleFormData>({
    title: '',
    type: 'message',
    startDate: '',
    endDate: '',
    recipients: 'all',
    channels: [],
  });

  const handleNewMessage = () => {
    setShowMessageForm(true);
  };

  const handleScheduleCampaign = () => {
    setShowScheduleForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Marketing e Campanhas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas campanhas promocionais e programas de fidelidade
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewMessage}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Button>
          <Button variant="outline" onClick={handleScheduleCampaign}>
            <Calendar className="mr-2 h-4 w-4" />
            Agendar Campanha
          </Button>
        </div>
      </div>

      {showMessageForm && (
        <MessageForm 
          data={messageFormData}
          onChange={setMessageFormData}
          onClose={() => setShowMessageForm(false)}
        />
      )}

      {showScheduleForm && (
        <ScheduleForm 
          data={scheduleFormData}
          onChange={setScheduleFormData}
          onClose={() => setShowScheduleForm(false)}
        />
      )}

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
          <Card>
            <CardHeader>
              <CardTitle>Nova Campanha</CardTitle>
              <CardDescription>
                Selecione o tipo de campanha e configure seus detalhes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {campaignTypes.map((type) => (
                  <CampaignCard
                    key={type.id}
                    {...type}
                    isSelected={selectedCampaignType === type.type}
                    onClick={() => setSelectedCampaignType(type.type)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cupons">
          <CouponManagement onCreateCoupon={() => {}} />
        </TabsContent>

        <TabsContent value="aniversarios">
          <BirthdayAutomation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
