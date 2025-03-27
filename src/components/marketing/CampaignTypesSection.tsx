import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CampaignCard } from "@/components/marketing/CampaignCard";
import { DiscountForm } from "@/components/marketing/DiscountForm";
import { CouponForm } from "@/components/marketing/CouponForm";
import { CashbackForm } from "@/components/marketing/CashbackForm";
import { VipBonusForm } from "@/components/marketing/VipBonusForm";
import { campaignTypes } from "./marketingConstants";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CampaignTypesSectionProps {
  selectedType: string | null;
  onTypeSelect: (type: string) => void;
}

export function CampaignTypesSection({ selectedType, onTypeSelect }: CampaignTypesSectionProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleCancel = () => {
    setIsFormVisible(false);
    onTypeSelect(null);
  };

  const handleSave = (data: any) => {
    console.log('Campanha salva:', data);
    toast({
      title: "Campanha criada com sucesso!",
      description: "Sua nova campanha foi criada e está pronta para uso.",
    });
    setIsFormVisible(false);
    onTypeSelect(null);
  };

  // Se um tipo foi selecionado mas o formulário ainda não está visível, mostrar o formulário
  if (selectedType && !isFormVisible) {
    setIsFormVisible(true);
  }

  // Renderizar o formulário correspondente ao tipo selecionado
  const renderForm = () => {
    switch (selectedType) {
      case 'discount':
        return <DiscountForm onSave={handleSave} onCancel={handleCancel} />;
      case 'coupon':
        return (
          <CouponForm
            data={{
              code: "",
              name: "",
              type: "percentage",
              value: 10,
              startDate: new Date().toISOString().split('T')[0],
              endDate: "",
              maxUses: 100,
              minPurchaseValue: 0,
              restrictions: [],
              services: [],
            }}
            onSave={() => handleSave({code: ""})}
            onClose={handleCancel}
            onChange={() => {}}
          />
        );
      case 'cashback':
        return <CashbackForm onSave={handleSave} onCancel={handleCancel} />;
      case 'vip':
        return <VipBonusForm onSave={handleSave} onCancel={handleCancel} />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-indigo-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-indigo-700">Nova Campanha</CardTitle>
            <CardDescription className="text-indigo-600/70">
              {isFormVisible 
                ? "Configure os detalhes da sua campanha" 
                : "Selecione o tipo de campanha e configure seus detalhes"}
            </CardDescription>
          </div>
          {isFormVisible && (
            <Button variant="outline" onClick={handleCancel} className="flex items-center gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isFormVisible ? (
          renderForm()
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
