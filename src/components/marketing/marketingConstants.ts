
import { Gift, Percent, Star, Target, Users, Zap } from "lucide-react";
import type { MarketingMetric, CampaignType } from "@/types/marketing";

export const marketingMetrics: MarketingMetric[] = [
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
  }
];

export const campaignTypes: CampaignType[] = [
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
  }
];
