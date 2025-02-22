
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Gift, 
  Users, 
  UserPlus, 
  Send,
  Plus,
  Calendar,
  Percent,
  Target,
  BarChart,
  Mail,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Dados mockados para demonstração
const marketingMetrics = [
  {
    title: "Mensagens Enviadas",
    value: "1,234",
    change: 12.5,
    icon: MessageSquare,
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
    title: "Clientes Retidos",
    value: "89%",
    change: 5.3,
    icon: Users,
    description: "taxa de retenção"
  },
  {
    title: "Novas Indicações",
    value: "28",
    change: 15.8,
    icon: UserPlus,
    description: "este mês"
  },
];

const messageTemplates = [
  { id: 1, name: "Boas-vindas", message: "Olá {cliente}, seja bem-vindo!" },
  { id: 2, name: "Aniversário", message: "Feliz aniversário, {cliente}! Temos um presente especial para você." },
  { id: 3, name: "Retorno", message: "Sentimos sua falta, {cliente}! Que tal agendar um horário?" },
];

const activeCoupons = [
  { id: 1, code: "BEMVINDO", discount: 20, type: "percentage", uses: 45, maxUses: 100, expires: "2024-04-01" },
  { id: 2, code: "INDIQUE10", discount: 10, type: "percentage", uses: 28, maxUses: 50, expires: "2024-03-15" },
];

export default function Marketing() {
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Marketing e Fidelização</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas campanhas e programas de fidelidade
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsNewCampaignOpen(true)}>
            <Send className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
          <Button onClick={() => setIsNewCouponOpen(true)}>
            <Gift className="mr-2 h-4 w-4" />
            Criar Cupom
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
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
                <span className={`mr-1 ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                </span>
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Abas de funcionalidades */}
      <Tabs defaultValue="automacao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automacao">Automação WhatsApp</TabsTrigger>
          <TabsTrigger value="cupons">Cupons</TabsTrigger>
          <TabsTrigger value="retencao">Retenção</TabsTrigger>
          <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="automacao" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {messageTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:bg-secondary/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    {template.name}
                    <Button size="icon" variant="ghost" onClick={() => setSelectedTemplate(template.id)}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.message}</p>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center p-6">
                <Button variant="ghost" className="h-20 w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cupons" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {activeCoupons.map((coupon) => (
              <Card key={coupon.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    {coupon.code}
                    <Button size="icon" variant="ghost">
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-primary">
                      {coupon.discount}% OFF
                    </p>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Usos: {coupon.uses}/{coupon.maxUses}</span>
                      <span>Expira: {new Date(coupon.expires).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="retencao" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Aniversariantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Campanhas automáticas para clientes aniversariantes
                </p>
                <Button variant="link" className="mt-2 h-auto p-0">
                  Configurar campanha
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Clientes Inativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recupere clientes que não visitam há mais de 30 dias
                </p>
                <Button variant="link" className="mt-2 h-auto p-0">
                  Configurar campanha
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Segmentação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Crie campanhas para grupos específicos de clientes
                </p>
                <Button variant="link" className="mt-2 h-auto p-0">
                  Criar segmento
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="indicacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programa de Indicações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Recompensa para quem indica</Label>
                  <div className="flex gap-2 mt-2">
                    <Input type="number" placeholder="10" className="w-24" />
                    <Button variant="outline">
                      <Percent className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Recompensa para indicado</Label>
                  <div className="flex gap-2 mt-2">
                    <Input type="number" placeholder="15" className="w-24" />
                    <Button variant="outline">
                      <Percent className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button className="w-full">Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Desempenho de Campanhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md">
                  [Gráfico de Desempenho]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Uso de Cupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md">
                  [Gráfico de Cupons]
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Nova Campanha */}
      <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Campanha</DialogTitle>
            <DialogDescription>
              Configure sua nova campanha de marketing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Campanha</Label>
              <Input placeholder="Ex: Promoção de Verão" />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea placeholder="Digite sua mensagem..." className="h-24" />
            </div>
            <div>
              <Label>Público-alvo</Label>
              <Input placeholder="Selecione o público" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCampaignOpen(false)}>
              Cancelar
            </Button>
            <Button>Criar Campanha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Novo Cupom */}
      <Dialog open={isNewCouponOpen} onOpenChange={setIsNewCouponOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Cupom</DialogTitle>
            <DialogDescription>
              Configure um novo cupom de desconto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Código do Cupom</Label>
              <Input placeholder="Ex: VERAO2024" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Desconto</Label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="10" />
                  <Button variant="outline">
                    <Percent className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <Label>Limite de Usos</Label>
                <Input type="number" placeholder="100" />
              </div>
            </div>
            <div>
              <Label>Data de Expiração</Label>
              <Input type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCouponOpen(false)}>
              Cancelar
            </Button>
            <Button>Criar Cupom</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
