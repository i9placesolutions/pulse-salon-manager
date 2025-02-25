
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CampaignCard } from "@/components/marketing/CampaignCard";
import { campaignTypes } from "./marketingConstants";

interface CampaignTypesSectionProps {
  selectedType: string | null;
  onTypeSelect: (type: string) => void;
}

export function CampaignTypesSection({ selectedType, onTypeSelect }: CampaignTypesSectionProps) {
  return (
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
              isSelected={selectedType === type.type}
              onClick={() => onTypeSelect(type.type)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
