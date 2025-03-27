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
  
  // Obter as cores com base no tipo da campanha selecionada
  const campaignTypeColors: Record<string, {
    border: string,
    gradient: string,
    bg: string,
    title: string,
    text: string,
    buttonBg: string,
    tableBg: string
  }> = {
    discount: {
      border: 'border-blue-200',
      gradient: 'from-blue-50 to-blue-100',
      bg: 'bg-blue-50',
      title: 'text-blue-700',
      text: 'text-blue-600',
      buttonBg: 'bg-blue-600',
      tableBg: 'bg-blue-50'
    },
    coupon: {
      border: 'border-purple-200',
      gradient: 'from-purple-50 to-purple-100',
      bg: 'bg-purple-50',
      title: 'text-purple-700',
      text: 'text-purple-600',
      buttonBg: 'bg-purple-600',
      tableBg: 'bg-purple-50'
    },
    cashback: {
      border: 'border-pink-200',
      gradient: 'from-pink-50 to-pink-100',
      bg: 'bg-pink-50',
      title: 'text-pink-700',
      text: 'text-pink-600',
      buttonBg: 'bg-pink-600',
      tableBg: 'bg-pink-50'
    },
    vip: {
      border: 'border-amber-200',
      gradient: 'from-amber-50 to-amber-100',
      bg: 'bg-amber-50',
      title: 'text-amber-700',
      text: 'text-amber-600',
      buttonBg: 'bg-amber-600',
      tableBg: 'bg-amber-50'
    }
  };
  
  // Definir as cores padrão ou com base no tipo selecionado
  const defaultColors = campaignTypeColors.discount;
  const colors = selectedCampaignData 
    ? campaignTypeColors[selectedCampaignData.type] || defaultColors
    : defaultColors;
  
  // Filtrar os usos com base na pesquisa
  const filteredUsage = selectedCampaignData?.usage.filter(usage => 
    usage.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    usage.serviceOrProduct.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleExportCampaign = () => {
    if (selectedCampaignData) {
      // Simulação de exportação
      toast({
        title: "Relatório exportado",
        description: `O relatório da campanha "${selectedCampaignData.name}" foi exportado com sucesso.`,
      });
    }
  };

  // Função para obter as cores de botão com base no tipo de campanha
  const getButtonVariant = (campaignId: string) => {
    const campaign = filteredCampaigns.find(c => c.id === campaignId);
    if (!campaign) return "default";
    
    if (selectedCampaign === campaignId) {
      return `bg-${campaign.type === 'discount' ? 'blue' : 
              campaign.type === 'coupon' ? 'purple' : 
              campaign.type === 'cashback' ? 'pink' : 'amber'}-600 hover:bg-${
              campaign.type === 'discount' ? 'blue' : 
              campaign.type === 'coupon' ? 'purple' : 
              campaign.type === 'cashback' ? 'pink' : 'amber'}-700 text-white`;
    }
    
    return `bg-white hover:bg-${campaign.type === 'discount' ? 'blue' : 
            campaign.type === 'coupon' ? 'purple' : 
            campaign.type === 'cashback' ? 'pink' : 'amber'}-50 text-${
            campaign.type === 'discount' ? 'blue' : 
            campaign.type === 'coupon' ? 'purple' : 
            campaign.type === 'cashback' ? 'pink' : 'amber'}-700 border border-${
            campaign.type === 'discount' ? 'blue' : 
            campaign.type === 'coupon' ? 'purple' : 
            campaign.type === 'cashback' ? 'pink' : 'amber'}-300`;
  };

  return (
    <Card className={`${colors.border} shadow-sm`}>
      <CardHeader className={`bg-gradient-to-r ${colors.gradient} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={colors.title}>Histórico de Campanhas</CardTitle>
            <CardDescription className={colors.text}>
              Acompanhe o desempenho das suas campanhas de marketing
            </CardDescription>
          </div>
          {selectedCampaignData && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCampaign}
              className={`flex items-center gap-1 border-${selectedCampaignData.type === 'discount' ? 'blue' : 
                          selectedCampaignData.type === 'coupon' ? 'purple' : 
                          selectedCampaignData.type === 'cashback' ? 'pink' : 'amber'}-300 text-${
                          selectedCampaignData.type === 'discount' ? 'blue' : 
                          selectedCampaignData.type === 'coupon' ? 'purple' : 
                          selectedCampaignData.type === 'cashback' ? 'pink' : 'amber'}-700`}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredCampaigns.length === 0 ? (
          <div className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {selectedCampaignType 
                ? `Você ainda não criou campanhas do tipo ${selectedCampaignType}. Crie uma nova na seção acima.`
                : "Você ainda não tem campanhas criadas. Crie sua primeira campanha na seção acima."}
            </p>
          </div>
        ) : (
          <div>
            <div className="border-b border-gray-200">
              <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {filteredCampaigns.map((campaign) => (
                  <Button
                    key={campaign.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCampaign(campaign.id)}
                    className={`whitespace-nowrap ${
                      selectedCampaign === campaign.id 
                        ? `bg-${campaign.type === 'discount' ? 'blue' : 
                           campaign.type === 'coupon' ? 'purple' : 
                           campaign.type === 'cashback' ? 'pink' : 'amber'}-600 text-white` 
                        : `text-${campaign.type === 'discount' ? 'blue' : 
                           campaign.type === 'coupon' ? 'purple' : 
                           campaign.type === 'cashback' ? 'pink' : 'amber'}-700 hover:bg-${
                           campaign.type === 'discount' ? 'blue' : 
                           campaign.type === 'coupon' ? 'purple' : 
                           campaign.type === 'cashback' ? 'pink' : 'amber'}-100`
                    }`}
                  >
                    {getCampaignTypeIcon(campaign.type)}
                    <span className="ml-1">{campaign.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {selectedCampaignData && (
              <div>
                {/* Métricas da Campanha */}
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 p-4 ${colors.bg} border-b ${colors.border}`}>
                  <div className="p-2 text-center">
                    <p className={`text-xs ${colors.text} mb-1`}>Usos Totais</p>
                    <h4 className={`text-lg font-bold ${colors.title}`}>{selectedCampaignData.metrics.totalUses}</h4>
                  </div>
                  <div className="p-2 text-center">
                    <p className={`text-xs ${colors.text} mb-1`}>Clientes</p>
                    <h4 className={`text-lg font-bold ${colors.title}`}>{selectedCampaignData.metrics.totalCustomers}</h4>
                  </div>
                  <div className="p-2 text-center">
                    <p className={`text-xs ${colors.text} mb-1`}>Conversão</p>
                    <h4 className={`text-lg font-bold ${colors.title}`}>{selectedCampaignData.metrics.conversionRate}%</h4>
                  </div>
                  <div className="p-2 text-center">
                    <p className={`text-xs ${colors.text} mb-1`}>Gasto Médio</p>
                    <h4 className={`text-lg font-bold ${colors.title}`}>R$ {selectedCampaignData.metrics.averageSpend.toFixed(2)}</h4>
                  </div>
                  <div className="p-2 text-center">
                    <p className={`text-xs ${colors.text} mb-1`}>Receita Total</p>
                    <h4 className={`text-lg font-bold ${colors.title}`}>R$ {selectedCampaignData.metrics.totalRevenue.toFixed(2)}</h4>
                  </div>
                  <div className="p-2 text-center">
                    <p className={`text-xs ${colors.text} mb-1`}>Taxa de Resgate</p>
                    <h4 className={`text-lg font-bold ${colors.title}`}>{selectedCampaignData.metrics.redemptionRate}%</h4>
                  </div>
                </div>

                {/* Detalhes da Campanha */}
                <div className={`p-4 border-b ${colors.border} flex flex-wrap gap-y-2`}>
                  <div className="flex items-center gap-2 mr-4 text-sm">
                    <Badge variant="outline" className={`${colors.bg} ${colors.title} ${colors.border}`}>
                      {selectedCampaignData.type === 'discount' ? 'Desconto' : 
                       selectedCampaignData.type === 'coupon' ? 'Cupom' : 
                       selectedCampaignData.type === 'cashback' ? 'Cashback' : 'VIP'}
                    </Badge>
                  </div>
                  <div className={`flex items-center gap-1 mr-4 text-sm ${colors.text}`}>
                    <Calendar className="h-4 w-4" />
                    <span>Início: {new Date(selectedCampaignData.startDate).toLocaleDateString()}</span>
                  </div>
                  {selectedCampaignData.endDate && (
                    <div className={`flex items-center gap-1 mr-4 text-sm ${colors.text}`}>
                      <Calendar className="h-4 w-4" />
                      <span>Fim: {new Date(selectedCampaignData.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className={`flex items-center gap-1 mr-4 text-sm ${colors.text}`}>
                    <Clock className="h-4 w-4" />
                    <span>Status: {selectedCampaignData.status === 'active' ? 'Ativa' : 
                                   selectedCampaignData.status === 'scheduled' ? 'Agendada' : 
                                   selectedCampaignData.status === 'completed' ? 'Concluída' : 'Rascunho'}</span>
                  </div>
                </div>

                {/* Utilizações */}
                <div>
                  <div className="p-4">
                    <h3 className={`text-lg font-medium ${colors.title} mb-3`}>Utilizações</h3>
                    <div className="relative mb-4">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.text}`} />
                      <Input 
                        placeholder="Buscar por cliente ou serviço..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-9 ${colors.border} focus-visible:ring-${selectedCampaignData.type === 'discount' ? 'blue' : 
                                  selectedCampaignData.type === 'coupon' ? 'purple' : 
                                  selectedCampaignData.type === 'cashback' ? 'pink' : 'amber'}-500`}
                      />
                    </div>

                    <div className={`rounded-md ${colors.border} overflow-hidden`}>
                      <Table>
                        <TableHeader className={colors.tableBg}>
                          <TableRow>
                            <TableHead className={colors.title}>Cliente</TableHead>
                            <TableHead className={colors.title}>Data</TableHead>
                            <TableHead className={colors.title}>Serviço/Produto</TableHead>
                            <TableHead className={`${colors.title} text-right`}>Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsage && filteredUsage.length > 0 ? (
                            filteredUsage.map((usage) => (
                              <TableRow key={usage.id} className={`hover:${colors.bg}/50`}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={usage.customer.avatar} />
                                      <AvatarFallback className={`${colors.bg} ${colors.title}`}>
                                        {usage.customer.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-gray-900">{usage.customer.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className={colors.text}>
                                  {new Date(usage.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className={colors.text}>{usage.serviceOrProduct}</TableCell>
                                <TableCell className={`text-right font-medium ${colors.title}`}>
                                  R$ {usage.amount.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                                Nenhum registro encontrado para esta busca.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
