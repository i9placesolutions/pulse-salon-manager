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

  const handleCreateCampaign = () => {
    setShowCampaignForm(true);
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
                    <Button>
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

                <div className="rounded-lg border">
                  <div className="p-4 text-sm text-center text-muted-foreground">
                    Nenhum cupom criado ainda
                  </div>
                </div>
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
              <Button>
                <Zap className="mr-2 h-4 w-4" />
                Criar Nova Automação
              </Button>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Automações Ativas</h4>
                
                <div className="rounded-lg border">
                  <div className="p-4 text-sm text-center text-muted-foreground">
                    Nenhuma automação configurada
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Campanhas</CardTitle>
              <CardDescription>
                Analise o desempenho das suas campanhas
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

              <div className="rounded-lg border">
                <div className="p-4 text-sm text-center text-muted-foreground">
                  Selecione uma campanha para visualizar seus resultados
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
