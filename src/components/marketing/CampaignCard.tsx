import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CampaignCardProps {
  id: number;
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
}

// Mapeamento de cores por tipo de campanha
const campaignColorMap: Record<string, {
  border: string,
  ring: string,
  bg: string,
  activeBg: string,
  iconBg: string,
  icon: string,
  title: string,
  text: string
}> = {
  discount: {
    border: 'border-blue-500',
    ring: 'ring-blue-200',
    bg: 'bg-blue-50/50',
    activeBg: 'hover:bg-blue-50/40',
    iconBg: 'bg-blue-100',
    icon: 'text-blue-600',
    title: 'text-blue-700',
    text: 'text-blue-600/70'
  },
  coupon: {
    border: 'border-purple-500',
    ring: 'ring-purple-200',
    bg: 'bg-purple-50/50',
    activeBg: 'hover:bg-purple-50/40',
    iconBg: 'bg-purple-100',
    icon: 'text-purple-600',
    title: 'text-purple-700',
    text: 'text-purple-600/70'
  },
  cashback: {
    border: 'border-pink-500',
    ring: 'ring-pink-200',
    bg: 'bg-pink-50/50',
    activeBg: 'hover:bg-pink-50/40',
    iconBg: 'bg-pink-100',
    icon: 'text-pink-600',
    title: 'text-pink-700',
    text: 'text-pink-600/70'
  },
  vip: {
    border: 'border-amber-500',
    ring: 'ring-amber-200',
    bg: 'bg-amber-50/50',
    activeBg: 'hover:bg-amber-50/40',
    iconBg: 'bg-amber-100',
    icon: 'text-amber-600',
    title: 'text-amber-700',
    text: 'text-amber-600/70'
  }
};

export function CampaignCard({
  type,
  title,
  description,
  icon: Icon,
  isSelected,
  onClick
}: CampaignCardProps) {
  // Obter as cores com base no tipo da campanha ou usar um padrão se não encontrar
  const colors = campaignColorMap[type] || campaignColorMap.discount;
  
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? `${colors.border} ring-2 ${colors.ring} ${colors.bg}` 
          : `hover:border-gray-300 ${colors.activeBg}`
      }`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className={`p-3 ${colors.iconBg} rounded-full`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          <h3 className={`font-medium ${colors.title}`}>{title}</h3>
          <p className={`text-sm ${colors.text}`}>{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
