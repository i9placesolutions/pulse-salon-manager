
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

export function CampaignCard({
  type,
  title,
  description,
  icon: Icon,
  isSelected,
  onClick
}: CampaignCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
