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

  const handleCreateCampaign = () => {
    setShowCampaignForm(true);
  };

  const handleCreateCoupon = () => {
    setShowCouponForm(true);
  };

  const handleCreateAutomation = () => {
    setShowAutomationForm(true);
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
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Agendar Campanha
          </Button>
        </div>
      </div>

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

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="coupon-start">Válido a partir de</Label>
                            <Input 
                              id="coupon-start" 
                              type="date"
                              value={couponFormData.startDate}
                              onChange={(e) => setCouponFormData({
                                ...couponFormData,
                                startDate: e.target.value
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="coupon-end">Válido até</Label>
                            <Input 
                              id="coupon-end" 
                              type="date"
                              value={couponFormData.endDate}
                              onChange={(e) => setCouponFormData({
                                ...couponFormData,
                                endDate: e.target.value
                              })}
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="coupon-max-uses">Limite de Usos</Label>
                          <Input 
                            id="coupon-max-uses"
                            type="number"
                            placeholder="100"
                            value={couponFormData.maxUses}
                            onChange={(e) => setCouponFormData({
                              ...couponFormData,
                              maxUses: Number(e.target.value)
                            })}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="min-purchase">Valor Mínimo da Compra</Label>
                          <Input 
                            id="min-purchase"
                            type="number"
                            placeholder="0"
                            value={couponFormData.minPurchaseValue}
                            onChange={(e) => setCouponFormData({
                              ...couponFormData,
                              minPurchaseValue: Number(e.target.value)
                            })}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCouponForm(false)}>
                          Cancelar
                        </Button>
                        <Button>
                          Criar Cupom
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!showCouponForm && (
                  <div className="rounded-lg border">
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      Nenhum cupom criado ainda
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aniversarios">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens de Aniversário</CardTitle>
              <CardDescription>
                Configure mensagens automáticas para aniversariantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="birthday-active" />
                  <Label htmlFor="birthday-active">Ativar mensagens de aniversário</Label>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="birthday-message">Mensagem Personalizada</Label>
                    <Textarea 
                      id="birthday-message"
                      placeholder="Ex: Feliz aniversário! Como presente especial, preparamos um desconto exclusivo para você..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Canais de Envio</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="birthday-whatsapp" />
                        <Label htmlFor="birthday-whatsapp">WhatsApp</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="birthday-email" />
                        <Label htmlFor="birthday-email">E-mail</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="birthday-time">Horário de Envio</Label>
                    <Input type="time" id="birthday-time" defaultValue="09:00" />
                  </div>

                  <div className="grid gap-2">
                    <Label>Benefício de Aniversário</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="birthday-discount" />
                        <Label htmlFor="birthday-discount">Oferecer desconto especial</Label>
                      </div>
                      <Input 
                        type="number" 
                        placeholder="Valor do desconto em %" 
                        className="max-w-[200px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    Testar Mensagem
                  </Button>
                  <Button>
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automacao">
          <Card>
            <CardHeader>
              <CardTitle>Automação de Marketing</CardTitle>
              <CardDescription>
                Configure regras automáticas para suas campanhas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleCreateAutomation}>
                <Zap className="mr-2 h-4 w-4" />
                Criar Nova Automação
              </Button>

              {showAutomationForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nova Regra de Automação</CardTitle>
                    <CardDescription>Configure as condições e ações da automação</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="automation-name">Nome da Regra</Label>
                        <Input 
                          id="automation-name"
                          placeholder="Ex: Reativação de Clientes Inativos"
                          value={automationRule.name}
                          onChange={(e) => setAutomationRule({
                            ...automationRule,
                            name: e.target.value
                          })}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Gatilho da Automação</Label>
                        <RadioGroup
                          value={automationRule.trigger}
                          onValueChange={(value: 'inactive' | 'birthday' | 'after_service' | 'vip_status') =>
                            setAutomationRule({
                              ...automationRule,
                              trigger: value
                            })
                          }
                        >
                          <div className="grid gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="inactive" id="trigger-inactive" />
                              <Label htmlFor="trigger-inactive">Cliente Inativo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="birthday" id="trigger-birthday" />
                              <Label htmlFor="trigger-birthday">Aniversário</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="after_service" id="trigger-service" />
                              <Label htmlFor="trigger-service">Após Atendimento</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="vip_status" id="trigger-vip" />
                              <Label htmlFor="trigger-vip">Status VIP Atingido</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="automation-days">Dias para Ativação</Label>
                        <Input 
                          id="automation-days"
                          type="number"
                          placeholder="30"
                          value={automationRule.days}
                          onChange={(e) => setAutomationRule({
                            ...automationRule,
                            days: Number(e.target.value)
                          })}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Ação</Label>
                        <RadioGroup
                          value={automationRule.action}
                          onValueChange={(value: 'discount' | 'message' | 'coupon') =>
                            setAutomationRule({
                              ...automationRule,
                              action: value
                            })
                          }
                        >
                          <div className="grid gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="discount" id="action-discount" />
                              <Label htmlFor="action-discount">Aplicar Desconto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="message" id="action-message" />
                              <Label htmlFor="action-message">Enviar Mensagem</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="coupon" id="action-coupon" />
                              <Label htmlFor="action-coupon">Gerar Cupom</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      {automationRule.action === 'message' && (
                        <div className="grid gap-2">
                          <Label htmlFor="automation-message">Mensagem</Label>
                          <Textarea 
                            id="automation-message"
                            placeholder="Digite sua mensagem..."
                            value={automationRule.message}
                            onChange={(e) => setAutomationRule({
                              ...automationRule,
                              message: e.target.value
                            })}
                          />
                        </div>
                      )}

                      {(automationRule.action === 'discount' || automationRule.action === 'coupon') && (
                        <div className="grid gap-2">
                          <Label htmlFor="automation-value">
                            {automationRule.action === 'discount' ? 'Porcentagem de Desconto' : 'Valor do Cupom'}
                          </Label>
                          <Input 
                            id="automation-value"
                            type="number"
                            placeholder="10"
                            value={automationRule.value}
                            onChange={(e) => setAutomationRule({
                              ...automationRule,
                              value: Number(e.target.value)
                            })}
                          />
                        </div>
                      )}

                      <div className="space-y-4">
                        <Label>Canais de Comunicação</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="channel-whatsapp"
                              checked={automationRule.channels.includes('whatsapp')}
                              onCheckedChange={(checked) => {
                                const channels = checked 
                                  ? [...automationRule.channels, 'whatsapp']
                                  : automationRule.channels.filter(c => c !== 'whatsapp');
                                setAutomationRule({ ...automationRule, channels });
                              }}
                            />
                            <Label htmlFor="channel-whatsapp">WhatsApp</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="channel-email"
                              checked={automationRule.channels.includes('email')}
                              onCheckedChange={(checked) => {
                                const channels = checked 
                                  ? [...automationRule.channels, 'email']
                                  : automationRule.channels.filter(c => c !== 'email');
                                setAutomationRule({ ...automationRule, channels });
                              }}
                            />
                            <Label htmlFor="channel-email">E-mail</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="channel-notification"
                              checked={automationRule.channels.includes('notification')}
                              onCheckedChange={(checked) => {
                                const channels = checked 
                                  ? [...automationRule.channels, 'notification']
                                  : automationRule.channels.filter(c => c !== 'notification');
                                setAutomationRule({ ...automationRule, channels });
                              }}
                            />
                            <Label htmlFor="channel-notification">Notificação no Sistema</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAutomationForm(false)}>
                        Cancelar
                      </Button>
                      <Button>
                        Criar Automação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!showAutomationForm && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Automações Ativas</h4>
                  <div className="rounded-lg border">
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      Nenhuma automação configurada
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho de Campanhas</CardTitle>
                <CardDescription>
                  Visualize o desempenho das suas campanhas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Button>
                    <BarChart className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Filtrar por Data
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Período de Análise</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="date" />
                        <Input type="date" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Tipo de Campanha</Label>
                      <RadioGroup defaultValue="all">
                        <div className="grid gap-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="filter-all" />
                            <Label htmlFor="filter-all">Todas</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="active" id="filter-active" />
                            <Label htmlFor="filter-active">Ativas</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="completed" id="filter-completed" />
                            <Label htmlFor="filter-completed">Concluídas</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="rounded-lg border">
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      Selecione os filtros para visualizar o relatório
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Conversão</CardTitle>
                <CardDescription>
                  Acompanhe as taxas de conversão por canal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">WhatsApp</p>
                      <p className="text-xs text-muted-foreground">Taxa de abertura: 68%</p>
                    </div>
                    <div className="h-4 w-48 rounded-full bg-secondary">
                      <div className="h-4 rounded-full bg-primary" style={{ width: "68%" }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">E-mail</p>
                      <p className="text-xs text-muted-foreground">Taxa de abertura: 45%</p>
                    </div>
                    <div className="h-4 w-48 rounded-full bg-secondary">
                      <div className="h-4 rounded-full bg-primary" style={{ width: "45%" }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Notificações</p>
                      <p className="text-xs text-muted-foreground">Taxa de abertura: 92%</p>
                    </div>
                    <div className="h-4 w-48 rounded-full bg-secondary">
                      <div className="h-4 rounded-full bg-primary" style={{ width: "92%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
