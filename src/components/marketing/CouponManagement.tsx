
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Gift, Settings } from "lucide-react";
import { CouponForm } from "./CouponForm";

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

interface CouponManagementProps {
  onCreateCoupon: () => void;
}

export function CouponManagement({ onCreateCoupon }: CouponManagementProps) {
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

  const handleCreateCoupon = () => {
    setShowCouponForm(true);
  };

  const handleSaveCoupon = () => {
    onCreateCoupon();
    setShowCouponForm(false);
  };

  return (
    <>
      {showCouponForm ? (
        <CouponForm 
          data={couponFormData}
          onChange={setCouponFormData}
          onClose={() => setShowCouponForm(false)}
          onSave={handleSaveCoupon}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Cupons</CardTitle>
            <CardDescription>Crie e gerencie cupons promocionais</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </>
  );
}
