
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Gift, Settings } from "lucide-react";

interface CouponManagementProps {
  onCreateCoupon: () => void;
}

export function CouponManagement({ onCreateCoupon }: CouponManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Cupons</CardTitle>
        <CardDescription>Crie e gerencie cupons promocionais</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button onClick={onCreateCoupon}>
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
  );
}
