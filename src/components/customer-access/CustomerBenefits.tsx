
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface CustomerBenefitsProps {
  customerId: number;
  cashbackBalance: number;
}

export function CustomerBenefits({ customerId, cashbackBalance }: CustomerBenefitsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cupons e Benefícios</CardTitle>
        <CardDescription>Seus descontos disponíveis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Saldo de Cashback</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(cashbackBalance)}</p>
          </div>
          <Button variant="outline" className="w-full">
            <DollarSign className="mr-2 h-4 w-4" />
            Usar Cashback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
