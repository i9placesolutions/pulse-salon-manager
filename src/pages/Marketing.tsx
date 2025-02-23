import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, 
  Gift, 
  Users, 
  UserPlus,
  Send,
  BarChart,
  Star,
  Bell,
  Calendar,
  Percent,
  MailCheck,
  Target,
  Zap,
  Clock,
  Filter,
  Settings,
} from "lucide-react";

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

interface CampaignFormData {
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  targetAudience: 'all' | 'vip' | 'inactive' | 'birthday';
  channels: string[];
}

interface CouponFormData {
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  minPurchaseValue: number;
  restrictions: string[];
  services: string[];
}

interface AutomationRule {
  name: string;
  trigger: 'inactive' | 'birthday' | 'after_service' | 'vip_status';
  days: number;
  action: 'discount' | 'message' | 'coupon';
  value: number;
  message?: string;
  channels: string[];
}

export default function Marketing() {
  const [selectedCampaignType, setSelectedCampaignType] = useState<string | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignFormData, setCampaignFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    type: '',
    startDate: '',
    endDate: '',
    discountType: 'percentage',
    discountValue: 0,
    targetAudience: 'all',
    channels: [],
  });

  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponFormData, setCouponFormData] = useState<CouponFormData>({
    code: '',
    name: '',
    type: 'percentage',
    value: 0,
    startDate: '',
    endDate: '',
    maxUses: 100,
    minPurchaseValue: 0,
    restrictions: [],
    services: [],
  });

  const [showAutomationForm, setShowAutomationForm] = useState(false);
  const [automationRule, setAutomationRule] = useState<AutomationRule>({
    name: '',
    trigger: 'inactive',
    days: 30,
    action: 'message',
    value: 0,
    message: '',
    channels: [],
  });

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

  const handleCreateCampaign = () => {
    setShowCampaignForm(true);
  };

  const handleCreateCoupon = () => {
    setShowCouponForm(true);
  };

  const handleCreateAutomation = () => {
    setShowAutomationForm(true);
  };

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
        <Card>
          <CardHeader>
            <CardTitle>Nova Mensagem</CardTitle>
            <CardDescription>Envie uma mensagem personalizada para seus clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="message-title">Título</Label>
                <Input 
                  id="message-title"
                  placeholder="Ex: Novidades da Semana"
                  value={messageFormData.title}
                  onChange={(e) => setMessageFormData({
                    ...messageFormData,
                    title: e.target.value
                  })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message-content">Mensagem</Label>
                <Textarea 
                  id="message-content"
                  placeholder="Digite sua mensagem..."
                  className="min-h-[100px]"
                  value={messageFormData.message}
                  onChange={(e) => setMessageFormData({
                    ...messageFormData,
                    message: e.target.value
                  })}
                />
              </div>

              <div className="space-y-4">
                <Label>Destinatários</Label>
                <RadioGroup
                  value={messageFormData.recipients}
                  onValueChange={(value: 'all' | 'vip' | 'inactive' | 'custom') => 
                    setMessageFormData({
                      ...messageFormData,
                      recipients: value
                    })
                  }
                >
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="recipients-all" />
                      <Label htmlFor="recipients-all">Todos os clientes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vip" id="recipients-vip" />
                      <Label htmlFor="recipients-vip">Clientes VIP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="recipients-inactive" />
                      <Label htmlFor="recipients-inactive">Clientes Inativos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="recipients-custom" />
                      <Label htmlFor="recipients-custom">Seleção Personalizada</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>Canais de Envio</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="msg-channel-whatsapp"
                      checked={messageFormData.channels.includes('whatsapp')}
                      onCheckedChange={(checked) => {
                        const channels = checked 
                          ? [...messageFormData.channels, 'whatsapp']
                          : messageFormData.channels.filter(c => c !== 'whatsapp');
                        setMessageFormData({ ...messageFormData, channels });
                      }}
                    />
                    <Label htmlFor="msg-channel-whatsapp">WhatsApp</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="msg-channel-email"
                      checked={messageFormData.channels.includes('email')}
                      onCheckedChange={(checked) => {
                        const channels = checked 
                          ? [...messageFormData.channels, 'email']
                          : messageFormData.channels.filter(c => c !== 'email');
                        setMessageFormData({ ...messageFormData, channels });
                      }}
                    />
                    <Label htmlFor="msg-channel-email">E-mail</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="msg-channel-notification"
                      checked={messageFormData.channels.includes('notification')}
                      onCheckedChange={(checked) => {
                        const channels = checked 
                          ? [...messageFormData.channels, 'notification']
                          : messageFormData.channels.filter(c => c !== 'notification');
                        setMessageFormData({ ...messageFormData, channels });
                      }}
                    />
                    <Label htmlFor="msg-channel-notification">Notificação no Sistema</Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="schedule-time">Agendar Envio (Opcional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    id="schedule-time" 
                    type="date"
                    value={messageFormData.scheduledFor}
                    onChange={(e) => setMessageFormData({
                      ...messageFormData,
                      scheduledFor: e.target.value
                    })}
                  />
                  <Input type="time" defaultValue="09:00" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMessageForm(false)}>
                Cancelar
              </Button>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agendar Campanha</CardTitle>
            <CardDescription>Configure uma campanha para ser executada automaticamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="schedule-title">Título da Campanha</Label>
                <Input 
                  id="schedule-title"
                  placeholder="Ex: Promoção de Fim de Semana"
                  value={scheduleFormData.title}
                  onChange={(e) => setScheduleFormData({
                    ...scheduleFormData,
                    title: e.target.value
                  })}
                />
              </div>

              <div className="space-y-4">
                <Label>Tipo de Campanha</Label>
                <RadioGroup
                  value={scheduleFormData.type}
                  onValueChange={(value: 'message' | 'discount' | 'coupon') => 
                    setScheduleFormData({
                      ...scheduleFormData,
                      type: value
                    })
                  }
                >
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="message" id="type-message" />
                      <Label htmlFor="type-message">Mensagem</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="discount" id="type-discount" />
                      <Label htmlFor="type-discount">Desconto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="coupon" id="type-coupon" />
                      <Label htmlFor="type-coupon">Cupom</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {scheduleFormData.type === 'message' && (
                <div className="grid gap-2">
                  <Label htmlFor="schedule-message">Mensagem</Label>
                  <Textarea 
                    id="schedule-message"
                    placeholder="Digite sua mensagem..."
                    className="min-h-[100px]"
                    value={scheduleFormData.message}
                    onChange={(e) => setScheduleFormData({
                      ...scheduleFormData,
                      message: e.target.value
                    })}
                  />
                </div>
              )}

              {(scheduleFormData.type === 'discount' || scheduleFormData.type === 'coupon') && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Desconto</Label>
                    <RadioGroup
                      value={scheduleFormData.discountType}
                      onValueChange={(value: 'percentage' | 'fixed') => 
                        setScheduleFormData({
                          ...scheduleFormData,
                          discountType: value
                        })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id="discount-percentage" />
                        <Label htmlFor="discount-percentage">Porcentagem (%)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="discount-fixed" />
                        <Label htmlFor="discount-fixed">Valor Fixo (R$)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="discount-value">Valor do Desconto</Label>
                    <Input 
                      id="discount-value"
                      type="number"
                      placeholder={scheduleFormData.discountType === 'percentage' ? '10' : '50'}
                      value={scheduleFormData.discountValue}
                      onChange={(e) => setScheduleFormData({
                        ...scheduleFormData,
                        discountValue: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Período da Campanha</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="schedule-start">Data de Início</Label>
                    <Input 
                      id="schedule-start"
                      type="date"
                      value={scheduleFormData.startDate}
                      onChange={(e) => setScheduleFormData({
                        ...scheduleFormData,
                        startDate: e.target.value
                      })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="schedule-end">Data de Término</Label>
                    <Input 
                      id="schedule-end"
                      type="date"
                      value={scheduleFormData.endDate}
                      onChange={(e) => setScheduleFormData({
                        ...scheduleFormData,
                        endDate: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Público-alvo</Label>
                <RadioGroup
                  value={scheduleFormData.recipients}
                  onValueChange={(value: 'all' | 'vip' | 'inactive' | 'custom') => 
                    setScheduleFormData({
                      ...scheduleFormData,
                      recipients: value
                    })
                  }
                >
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="schedule-all" />
                      <Label htmlFor="schedule-all">Todos os clientes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vip" id="schedule-vip" />
                      <Label htmlFor="schedule-vip">Clientes VIP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="schedule-inactive" />
                      <Label htmlFor="schedule-inactive">Clientes Inativos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="schedule-custom" />
                      <Label htmlFor="schedule-custom">Seleção Personalizada</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>Canais de Comunicação</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="schedule-channel-whatsapp"
                      checked={scheduleFormData.channels.includes('whatsapp')}
                      onCheckedChange={(checked) => {
                        const channels = checked 
                          ? [...scheduleFormData.channels, 'whatsapp']
                          : scheduleFormData.channels.filter(c => c !== 'whatsapp');
                        setScheduleFormData({ ...scheduleFormData, channels });
                      }}
                    />
                    <Label htmlFor="schedule-channel-whatsapp">WhatsApp</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="schedule-channel-email"
                      checked={scheduleFormData.channels.includes('email')}
                      onCheckedChange={(checked) => {
                        const channels = checked 
                          ? [...scheduleFormData.channels, 'email']
                          : scheduleFormData.channels.filter(c => c !== 'email');
                        setScheduleFormData({ ...scheduleFormData, channels });
                      }}
                    />
                    <Label htmlFor="schedule-channel-email">E-mail</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="schedule-channel-notification"
                      checked={scheduleFormData.channels.includes('notification')}
                      onCheckedChange={(checked) => {
                        const channels = checked 
                          ? [...scheduleFormData.channels, 'notification']
                          : scheduleFormData.channels.filter(c => c !== 'notification');
                        setScheduleFormData({ ...scheduleFormData, channels });
                      }}
                    />
                    <Label htmlFor="schedule-channel-notification">Notificação no Sistema</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleForm(false)}>
                Cancelar
              </Button>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Campanha
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketingMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className={metric.change > 0 ? 'text-green-500' : 'text-red-500'}>
                  {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                </span>
                <span className="ml-1">{metric.description}</span>
              </p>
            </CardContent>
          </Card>
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
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all ${
                      selectedCampaignType === type.type 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedCampaignType(type.type)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <type.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">{type.title}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedCampaignType && !showCampaignForm && (
                <div className="mt-6">
                  <Button onClick={handleCreateCampaign} className="w-full">
                    Configurar Nova Campanha
                  </Button>
                </div>
              )}

              {showCampaignForm && (
                <div className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalhes da Campanha</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Informações Básicas</h4>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="campaign-name">Nome da Campanha</Label>
                            <Input 
                              id="campaign-name" 
                              placeholder="Ex: Promoção Dia das Mães"
                              value={campaignFormData.name}
                              onChange={(e) => setCampaignFormData({
                                ...campaignFormData,
                                name: e.target.value
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="campaign-description">Descrição</Label>
                            <Textarea 
                              id="campaign-description"
                              placeholder="Descreva sua campanha"
                              value={campaignFormData.description}
                              onChange={(e) => setCampaignFormData({
                                ...campaignFormData,
                                description: e.target.value
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Período da Campanha</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="start-date">Data de Início</Label>
                            <Input 
                              id="start-date" 
                              type="date"
                              value={campaignFormData.startDate}
                              onChange={(e) => setCampaignFormData({
                                ...campaignFormData,
                                startDate: e.target.value
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="end-date">Data de Término</Label>
                            <Input 
                              id="end-date" 
                              type="date"
                              value={campaignFormData.endDate}
                              onChange={(e) => setCampaignFormData({
                                ...campaignFormData,
                                endDate: e.target.value
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Configuração do Desconto</h4>
                        <RadioGroup
                          value={campaignFormData.discountType}
                          onValueChange={(value: 'percentage' | 'fixed') => 
                            setCampaignFormData({
                              ...campaignFormData,
                              discountType: value
                            })
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" />
                            <Label htmlFor="percentage">Porcentagem (%)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" />
                            <Label htmlFor="fixed">Valor Fixo (R$)</Label>
                          </div>
                        </RadioGroup>
                        <div className="grid gap-2">
                          <Label htmlFor="discount-value">
                            {campaignFormData.discountType === 'percentage' ? 'Porcentagem' : 'Valor'}
                          </Label>
                          <Input 
                            id="discount-value"
                            type="number"
                            placeholder={campaignFormData.discountType === 'percentage' ? '10' : '50'}
                            value={campaignFormData.discountValue}
                            onChange={(e) => setCampaignFormData({
                              ...campaignFormData,
                              discountValue: Number(e.target.value)
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Público-alvo</h4>
                        <RadioGroup
                          value={campaignFormData.targetAudience}
                          onValueChange={(value: 'all' | 'vip' | 'inactive' | 'birthday') =>
                            setCampaignFormData({
                              ...campaignFormData,
                              targetAudience: value
                            })
                          }
                        >
                          <div className="grid gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="all-clients" />
                              <Label htmlFor="all-clients">Todos os clientes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="vip" id="vip-clients" />
                              <Label htmlFor="vip-clients">Clientes VIP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="inactive" id="inactive-clients" />
                              <Label htmlFor="inactive-clients">Clientes Inativos</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="birthday" id="birthday-clients" />
                              <Label htmlFor="birthday-clients">Aniversariantes do Mês</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Canais de Comunicação</h4>
                        <div className="grid gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch id="whatsapp" />
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="email" />
                            <Label htmlFor="email">E-mail</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="notification" />
                            <Label htmlFor="notification">Notificação no Sistema</Label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCampaignForm(false)}>
                          Cancelar
                        </Button>
                        <Button variant="outline">
                          Salvar Rascunho
                        </Button>
                        <Button>
                          Criar Campanha
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cupons">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Cupons</CardTitle>
              <CardDescription>Crie e gerencie cupons promocionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Button onClick={handleCreateCoupon}>
                      <Gift className="mr-2 h-4 w-4" />
                      Criar Novo Cupom
                    </Button>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrar
                    </Button>
                  </div>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {showCouponForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Novo Cupom</CardTitle>
                      <CardDescription>Configure os detalhes do cupom promocional</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="coupon-code">Código do Cupom</Label>
                          <Input 
                            id="coupon-code" 
                            placeholder="Ex: VERAO2024"
                            value={couponFormData.code}
                            onChange={(e) => setCouponFormData({
                              ...couponFormData,
                              code: e.target.value.toUpperCase()
                            })}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="coupon-name">Nome da Promoção</Label>
                          <Input 
                            id="coupon-name"
                            placeholder="Ex: Promoção de Verão"
                            value={couponFormData.name}
                            onChange={(e) => setCouponFormData({
                              ...couponFormData,
                              name: e.target.value
                            })}
                          />
                        </div>

                        <div className="space-y-4">
                          <Label>Tipo de Desconto</Label>
                          <RadioGroup
                            value={couponFormData.type}
                            onValueChange={(value: 'percentage' | 'fixed') => 
                              setCouponFormData({
                                ...couponFormData,
                                type: value
                              })
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="percentage" id="coupon-percentage" />
                              <Label htmlFor="coupon-percentage">Porcentagem (%)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fixed" id="coupon-fixed" />
                              <Label htmlFor="coupon-fixed">Valor Fixo (R$)</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="coupon-value">
                            {couponFormData.type === 'percentage' ? 'Porcentagem de Desconto' : 'Valor do Desconto'}
                          </Label>
                          <Input 
                            id="coupon-value"
                            type="number"
                            placeholder={couponFormData.type === 'percentage' ? '10' : '50'}
                            value={couponFormData.value}
                            onChange={(e) => setCouponFormData({
                              ...couponFormData,
                              value: Number(e.target.value)
                            })}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCouponForm(false)}>
                          Cancelar
                        </Button>
                        <Button>
                          Salvar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aniversarios">
          <Card>
            <CardHeader>
              <CardTitle>Aniversários</CardTitle>
              <CardDescription>Gerencie os aniversários dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Button>
                      <Calendar className="mr-2 h-4 w-4" />
                      Novo Aniversário
                    </Button>
                  </div>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automacao">
          <Card>
            <CardHeader>
              <CardTitle>Automação</CardTitle>
              <CardDescription>Configure regras de automação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Button>
                      <Zap className="mr-2 h-4 w-4" />
                      Nova Regra
                    </Button>
                  </div>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>Visualize e analise os dados de suas campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Button>
                      <BarChart className="mr-2 h-4 w-4" />
                      Gerar Relatório
                    </Button>
                  </div>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
