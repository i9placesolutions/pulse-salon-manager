import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, Search, Users, Calendar, Clock, Percent, Gift, Star, Crown, FileType } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { exportCampaignReport, downloadCSV, exportCampaignToPDF } from "@/utils/exportUtils";

// Tipos de dados para o histórico de campanhas
type CampaignUsage = {
  id: string;
  customer: {
    id: string;
    name: string;
    avatar?: string;
  };
  date: string;
  amount: number;
  serviceOrProduct: string;
};

type CampaignMetrics = {
  totalUses: number;
  totalCustomers: number;
  conversionRate: number;
  averageSpend: number;
  totalRevenue: number;
  redemptionRate: number;
};

interface CampaignData {
  id: string;
  name: string;
  type: 'discount' | 'coupon' | 'cashback' | 'vip';
  startDate: string;
  endDate?: string;
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  metrics: CampaignMetrics;
  usage: CampaignUsage[];
}

// Dados mockados para demonstração
const mockCampaigns: CampaignData[] = [
  {
    id: "camp1",
    name: "Desconto de Verão",
    type: "discount",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    status: "active",
    metrics: {
      totalUses: 124,
      totalCustomers: 87,
      conversionRate: 18.5,
      averageSpend: 180.5,
      totalRevenue: 22382,
      redemptionRate: 62.3
    },
    usage: [
      { id: "use1", customer: { id: "cust1", name: "Maria Silva", avatar: "/avatars/maria.jpg" }, date: "2025-03-05", amount: 150, serviceOrProduct: "Corte e Coloração" },
      { id: "use2", customer: { id: "cust2", name: "João Santos", avatar: "/avatars/joao.jpg" }, date: "2025-03-02", amount: 200, serviceOrProduct: "Barba e Cabelo" },
      { id: "use3", customer: { id: "cust3", name: "Ana Oliveira" }, date: "2025-02-28", amount: 180, serviceOrProduct: "Manicure e Pedicure" },
      { id: "use4", customer: { id: "cust4", name: "Carlos Mendes" }, date: "2025-02-25", amount: 120, serviceOrProduct: "Corte Masculino" },
    ]
  },
  {
    id: "camp2",
    name: "Cupom BEMVINDO10",
    type: "coupon",
    startDate: "2025-02-15",
    status: "active",
    metrics: {
      totalUses: 45,
      totalCustomers: 45,
      conversionRate: 22.8,
      averageSpend: 150.2,
      totalRevenue: 6759,
      redemptionRate: 45.0
    },
    usage: [
      { id: "use5", customer: { id: "cust5", name: "Renata Lima" }, date: "2025-03-07", amount: 180, serviceOrProduct: "Hidratação e Corte" },
      { id: "use6", customer: { id: "cust6", name: "Marcos Pereira" }, date: "2025-03-03", amount: 150, serviceOrProduct: "Barba Completa" },
    ]
  },
  {
    id: "camp3",
    name: "Cashback 5%",
    type: "cashback",
    startDate: "2025-02-01",
    endDate: "2025-04-30",
    status: "active",
    metrics: {
      totalUses: 87,
      totalCustomers: 65,
      conversionRate: 15.2,
      averageSpend: 220.5,
      totalRevenue: 19183.5,
      redemptionRate: 58.4
    },
    usage: [
      { id: "use7", customer: { id: "cust7", name: "Fernanda Costa" }, date: "2025-03-08", amount: 250, serviceOrProduct: "Tratamento Capilar" },
      { id: "use8", customer: { id: "cust8", name: "Roberto Alves" }, date: "2025-03-05", amount: 180, serviceOrProduct: "Corte e Barba" },
      { id: "use9", customer: { id: "cust9", name: "Juliana Martins" }, date: "2025-03-02", amount: 300, serviceOrProduct: "Coloração Completa" },
    ]
  },
  {
    id: "camp4",
    name: "Clube VIP Pulse",
    type: "vip",
    startDate: "2025-01-15",
    status: "active",
    metrics: {
      totalUses: 156,
      totalCustomers: 22,
      conversionRate: 95.8,
      averageSpend: 350.8,
      totalRevenue: 54724.8,
      redemptionRate: 87.2
    },
    usage: [
      { id: "use10", customer: { id: "cust10", name: "Amanda Souza", avatar: "/avatars/amanda.jpg" }, date: "2025-03-09", amount: 420, serviceOrProduct: "Pacote Completo" },
      { id: "use11", customer: { id: "cust11", name: "Paulo Ribeiro" }, date: "2025-03-07", amount: 380, serviceOrProduct: "Tratamento Premium" },
      { id: "use12", customer: { id: "cust12", name: "Luciana Gomes" }, date: "2025-03-04", amount: 450, serviceOrProduct: "Dia de Spa" },
    ]
  }
];

// Função para retornar o ícone de acordo com o tipo de campanha
function getCampaignTypeIcon(type: string) {
  switch (type) {
    case 'discount':
      return <Percent className="h-4 w-4" />;
    case 'coupon':
      return <Gift className="h-4 w-4" />;
    case 'cashback':
      return <Star className="h-4 w-4" />;
    case 'vip':
      return <Crown className="h-4 w-4" />;
    default:
      return <Percent className="h-4 w-4" />;
  }
}

interface CampaignHistoryProps {
  selectedCampaignType: string | null;
}

// Componente para o histórico de campanhas
export function CampaignHistory({ selectedCampaignType }: CampaignHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtra as campanhas com base no tipo selecionado, se houver
  const filteredCampaigns = selectedCampaignType 
    ? mockCampaigns.filter(campaign => campaign.type === selectedCampaignType)
    : mockCampaigns;
  
  // Atualiza a campanha selecionada quando o tipo de campanha mudar
  const [selectedCampaign, setSelectedCampaign] = useState<string>(
    filteredCampaigns.length > 0 ? filteredCampaigns[0].id : ""
  );
  
  // Atualiza o ID da campanha selecionada quando filteredCampaigns muda
  useEffect(() => {
    if (filteredCampaigns.length > 0) {
      setSelectedCampaign(filteredCampaigns[0].id);
    } else {
      setSelectedCampaign("");
    }
  }, [selectedCampaignType]);

  // Filtrar a campanha selecionada
  const selectedCampaignData = filteredCampaigns.find(camp => camp.id === selectedCampaign);
  
  // Filtrar os usos com base na pesquisa
  const filteredUsage = selectedCampaignData?.usage.filter(usage => 
    usage.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    usage.serviceOrProduct.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2">
        <div className="flex-1">
          <div className="flex items-center">
            {selectedCampaignType && (
              <div className={`rounded-lg p-2 mr-3 ${selectedCampaignType === 'discount' ? 'bg-orange-100 text-orange-600' : 
                 selectedCampaignType === 'coupon' ? 'bg-purple-100 text-purple-600' : 
                 selectedCampaignType === 'cashback' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {getCampaignTypeIcon(selectedCampaignType)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-neutral flex items-center gap-2">
                Histórico de Campanhas
                {selectedCampaignType && (
                  <Badge className={`ml-2 ${selectedCampaignType === 'discount' ? 'bg-orange-500' : 
                    selectedCampaignType === 'coupon' ? 'bg-purple-500' : 
                    selectedCampaignType === 'cashback' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                    {selectedCampaignType === 'discount' ? 'Desconto Direto' : 
                    selectedCampaignType === 'coupon' ? 'Cupom Promocional' : 
                    selectedCampaignType === 'cashback' ? 'Cashback' : 'Programa VIP'}
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedCampaignType 
                  ? `Acompanhe os resultados, conversões e impacto das suas campanhas de ${selectedCampaignType === 'discount' ? 'desconto direto' : 
                    selectedCampaignType === 'coupon' ? 'cupom promocional' : 
                    selectedCampaignType === 'cashback' ? 'cashback' : 'programa VIP'}`
                  : 'Visualize métricas detalhadas e o histórico de uso das suas campanhas'}
              </p>
            </div>
          </div>
        </div>
        {selectedCampaignType ? (
          // Quando um tipo de campanha está selecionado, mostra apenas o nome da campanha atual sem opção de mudança
          <div className="bg-white border border-muted rounded-md px-4 py-2.5 shadow-sm w-full md:w-[350px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${selectedCampaignType === 'discount' ? 'bg-orange-100' : 
                selectedCampaignType === 'coupon' ? 'bg-purple-100' : 
                selectedCampaignType === 'cashback' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                {getCampaignTypeIcon(selectedCampaignType)}
              </div>
              <div>
                <span className="font-medium">{selectedCampaignData?.name || "Campanha não selecionada"}</span>
                {selectedCampaignData && (
                  <Badge variant={selectedCampaignData.status === 'active' ? "default" : "secondary"} className="ml-2 text-xs">
                    {selectedCampaignData.status === 'active' ? 'Ativa' : 
                     selectedCampaignData.status === 'completed' ? 'Concluída' : 'Agendada'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Quando nenhum tipo específico está selecionado, permite a seleção entre todas as campanhas
          <Select 
            value={selectedCampaign} 
            onValueChange={setSelectedCampaign}
          >
            <SelectTrigger className="bg-white border border-muted hover:border-primary/50 transition-all shadow-sm w-full md:w-[350px]">
              <SelectValue placeholder="Selecione uma campanha" />
            </SelectTrigger>
            <SelectContent>
              {filteredCampaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  <div className="flex items-center gap-3">
                    {getCampaignTypeIcon(campaign.type)}
                    <span>{campaign.name}</span>
                    <Badge variant={campaign.status === 'active' ? "default" : "secondary"} className="ml-2 text-xs">
                      {campaign.status === 'active' ? 'Ativa' : campaign.status === 'completed' ? 'Concluída' : 'Agendada'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {!selectedCampaignData && (
        <div className="flex items-center justify-center h-48">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mx-auto">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">Nenhuma campanha encontrada</h3>
            <p className="text-sm text-muted-foreground max-w-md">Não existem campanhas ativas para o filtro selecionado. Crie uma nova campanha ou selecione outro tipo de campanha.</p>
          </div>
        </div>
      )}
      
      {selectedCampaignData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`group overflow-hidden border-l-4 ${selectedCampaignType === 'discount' ? 'border-l-orange-500' : 
              selectedCampaignType === 'coupon' ? 'border-l-purple-500' : 
              selectedCampaignType === 'cashback' ? 'border-l-blue-500' : 'border-l-emerald-500'} 
              shadow-sm hover:shadow-md transition-all bg-white`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Usos</p>
                    <h3 className="text-3xl font-bold mt-2 flex items-end gap-2">
                      <span>{selectedCampaignData.metrics.totalUses}</span>
                      <span className="text-sm font-normal text-muted-foreground mb-1">usos</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5">Último uso: {new Date(selectedCampaignData.usage[0]?.date || Date.now()).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className={`p-2.5 rounded-full ${selectedCampaignType === 'discount' ? 'bg-orange-100 text-orange-600' : 
                    selectedCampaignType === 'coupon' ? 'bg-purple-100 text-purple-600' : 
                    selectedCampaignType === 'cashback' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group overflow-hidden border border-muted shadow-sm hover:shadow-md transition-all bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Clientes Únicos</p>
                    <h3 className="text-3xl font-bold mt-2 flex items-end gap-2">
                      <span>{selectedCampaignData.metrics.totalCustomers}</span>
                      <span className="text-sm font-normal text-muted-foreground mb-1">clientes</span>
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                      <span>Taxa de retorno:</span>
                      <Badge variant="outline" className="ml-1 font-mono">
                        {(selectedCampaignData.metrics.totalUses / Math.max(1, selectedCampaignData.metrics.totalCustomers)).toFixed(1)}x
                      </Badge>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-100 text-slate-600 rounded-full">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group overflow-hidden border border-muted shadow-sm hover:shadow-md transition-all bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Resgate</p>
                    <h3 className="text-3xl font-bold mt-2 flex items-end gap-2">
                      <span>{selectedCampaignData.metrics.redemptionRate}%</span>
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                      <span>Conversão:</span>
                      <Badge variant="outline" className="ml-1 font-mono">
                        {selectedCampaignData.metrics.conversionRate}%
                      </Badge>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-100 text-slate-600 rounded-full">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group overflow-hidden border border-muted shadow-sm hover:shadow-md transition-all bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Receita Gerada</p>
                    <h3 className="text-3xl font-bold mt-2 flex items-end gap-2">
                      <span>R${selectedCampaignData.metrics.totalRevenue.toLocaleString('pt-BR')}</span>
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                      <span>Ticket médio:</span>
                      <Badge variant="outline" className="ml-1 font-mono">
                        R${selectedCampaignData.metrics.averageSpend.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-100 text-slate-600 rounded-full">
                    <Percent className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-muted shadow-sm bg-white">
                  <Tabs defaultValue="details" className="w-full">
                    <CardHeader className="pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Detalhes da Campanha</h3>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Download className="h-4 w-4" />
                            Exportar
                          </Button>
                        </div>
                      </div>
                      <TabsList className="w-full justify-start gap-4">
                        <TabsTrigger value="details" className={`data-[state=active]:${selectedCampaignType === 'discount' ? 'bg-orange-100 text-orange-700' : 
                          selectedCampaignType === 'coupon' ? 'bg-purple-100 text-purple-700' : 
                          selectedCampaignType === 'cashback' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          <FileType className="h-4 w-4 mr-2" />
                          Detalhes
                        </TabsTrigger>
                        <TabsTrigger value="usage" className={`data-[state=active]:${selectedCampaignType === 'discount' ? 'bg-orange-100 text-orange-700' : 
                          selectedCampaignType === 'coupon' ? 'bg-purple-100 text-purple-700' : 
                          selectedCampaignType === 'cashback' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          <Clock className="h-4 w-4 mr-2" />
                          Histórico de Uso
                        </TabsTrigger>
                      </TabsList>
                    </CardHeader>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      <Card className="border border-muted/30 shadow-sm bg-muted/5 hover:border-muted/50 transition-colors">
                        <CardHeader className="pb-2">
                          <h3 className="text-base font-semibold flex items-center gap-2">
                            <FileType className="h-4 w-4 text-primary" />
                            Informações da Campanha
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-muted/30">
                              <span className="text-muted-foreground font-medium">Nome</span>
                              <span className="font-medium">{selectedCampaignData.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm py-1.5">
                              <span className="text-muted-foreground font-medium">Tipo:</span>
                              <span className="font-medium flex items-center gap-1">
                                {getCampaignTypeIcon(selectedCampaignData.type)}
                                {selectedCampaignData.type === 'discount' ? 'Desconto' : 
                                 selectedCampaignData.type === 'coupon' ? 'Cupom' : 
                                 selectedCampaignData.type === 'cashback' ? 'Cashback' : 'Programa VIP'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm py-1.5">
                              <span className="text-muted-foreground font-medium">Data de Início:</span>
                              <span className="font-medium">{new Date(selectedCampaignData.startDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                            {selectedCampaignData.endDate && (
                              <div className="grid grid-cols-2 gap-3 text-sm py-1.5">
                                <span className="text-muted-foreground font-medium">Data de Término:</span>
                                <span className="font-medium">{new Date(selectedCampaignData.endDate).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 text-sm py-1.5">
                              <span className="text-muted-foreground font-medium">Status:</span>
                              <Badge variant={selectedCampaignData.status === 'active' ? "default" : "secondary"}>
                                {selectedCampaignData.status === 'active' ? 'Ativa' : 
                                 selectedCampaignData.status === 'completed' ? 'Concluída' : 
                                 selectedCampaignData.status === 'scheduled' ? 'Agendada' : 'Rascunho'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-muted/30 shadow-sm bg-muted/5 hover:border-muted/50 transition-colors">
                        <CardHeader className="pb-2">
                          <h3 className="text-base font-semibold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Métricas de Desempenho
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-muted/30">
                              <span className="text-muted-foreground font-medium">Taxa de Conversão</span>
                              <span className="font-medium text-primary">{selectedCampaignData.metrics.conversionRate}%</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm py-1.5">
                              <span className="text-muted-foreground font-medium">Gasto Médio:</span>
                              <span className="font-medium">R$ {selectedCampaignData.metrics.averageSpend.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm py-1.5">
                              <span className="text-muted-foreground font-medium">Receita Total:</span>
                              <span className="font-medium">R$ {selectedCampaignData.metrics.totalRevenue.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm py-1.5">
                              <span className="text-muted-foreground font-medium">Taxa de Uso:</span>
                              <span className="font-medium">{selectedCampaignData.metrics.redemptionRate}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => {
                          if (selectedCampaignData) {
                            exportCampaignReport(
                              selectedCampaignData,
                              selectedCampaignData.usage,
                              `relatorio-${selectedCampaignData.name.toLowerCase().replace(/\s+/g, '-')}`
                            );
                            toast({
                              title: "Relatório exportado",
                              description: "O relatório foi exportado com sucesso.",
                            });
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Exportar CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => {
                          if (selectedCampaignData) {
                            try {
                              // Realiza a exportação do PDF
                              const result = exportCampaignToPDF(
                                selectedCampaignData,
                                selectedCampaignData.usage,
                                `relatorio-pdf-${selectedCampaignData.name.toLowerCase().replace(/\s+/g, '-')}`
                              );
                              
                              if (result) {
                                toast({
                                  title: "Relatório PDF exportado",
                                  description: "O relatório em PDF foi gerado com sucesso.",
                                });
                              }
                            } catch (error: any) {
                              console.error("Erro ao exportar PDF:", error);
                              toast({
                                title: "Erro ao exportar",
                                description: `Falha ao gerar o PDF: ${error?.message || 'Erro desconhecido'}`,
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                      >
                        <FileType className="h-4 w-4" />
                        Exportar PDF
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="usage" className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                      <div className="relative flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por cliente ou serviço..."
                            className="pl-10 pr-4 h-10 bg-white border-muted shadow-sm focus:border-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                          Mostrando {filteredUsage.length} de {selectedCampaignData?.usage.length || 0} registros
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => {
                          if (selectedCampaignData) {
                            downloadCSV(
                              filteredUsage,
                              [
                                { key: (item: any) => item.customer.name, label: 'Cliente' },
                                { key: 'date', label: 'Data' },
                                { key: 'serviceOrProduct', label: 'Serviço/Produto' },
                                { key: 'amount', label: 'Valor (R$)' },
                              ],
                              `historico-uso-${selectedCampaignData.name.toLowerCase().replace(/\s+/g, '-')}` 
                            );
                            toast({
                              title: "Histórico exportado",
                              description: "O histórico de uso foi exportado com sucesso.",
                            });
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Exportar CSV
                      </Button>
                    </div>
                    
                    <div className="rounded-lg border border-muted overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className={`${selectedCampaignType === 'discount' ? 'bg-orange-50 border-orange-100' : 
                            selectedCampaignType === 'coupon' ? 'bg-purple-50 border-purple-100' : 
                            selectedCampaignType === 'cashback' ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'} 
                            border-b hover:bg-opacity-80`}>
                            <TableHead className="font-semibold">Cliente</TableHead>
                            <TableHead className="font-semibold">Data</TableHead>
                            <TableHead className="font-semibold">Serviço/Produto</TableHead>
                            <TableHead className="text-right font-semibold">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsage.length > 0 ? (
                            filteredUsage.map((usage, index) => (
                              <TableRow key={usage.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-50/80'}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border border-muted shadow-sm">
                                      {usage.customer.avatar && <AvatarImage src={usage.customer.avatar} alt={usage.customer.name} />}
                                      <AvatarFallback className={`${selectedCampaignType === 'discount' ? 'bg-orange-100 text-orange-700' : 
                                        selectedCampaignType === 'coupon' ? 'bg-purple-100 text-purple-700' : 
                                        selectedCampaignType === 'cashback' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {usage.customer.name.split(' ').map(part => part[0]).join('').substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <span className="font-medium text-neutral-800 block">{usage.customer.name}</span>
                                      <span className="text-xs text-muted-foreground">Cliente #{usage.customer.id}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{new Date(usage.date).toLocaleDateString('pt-BR')}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(usage.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}h
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{usage.serviceOrProduct}</div>
                                  <Badge variant="outline" className="mt-0.5 text-xs font-normal">
                                    {selectedCampaignType === 'discount' ? 'Desconto Aplicado' : 
                                     selectedCampaignType === 'coupon' ? 'Cupom Utilizado' : 
                                     selectedCampaignType === 'cashback' ? 'Cashback Gerado' : 'Benefício VIP'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className={`font-bold ${selectedCampaignType === 'discount' ? 'text-orange-600' : 
                                    selectedCampaignType === 'coupon' ? 'text-purple-600' : 
                                    selectedCampaignType === 'cashback' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                    R$ {usage.amount.toFixed(2)}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <Search className="h-8 w-8 text-muted-foreground opacity-20" />
                                  <p className="text-muted-foreground font-medium">Nenhum registro encontrado</p>
                                  <p className="text-xs text-muted-foreground">Tente modificar os critérios de busca</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
        </div>
      )}
    </div>
  );
}
