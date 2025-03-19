
import { Button } from "@/components/ui/button";
import { Lock, DollarSign, Clock } from "lucide-react";

interface PDVHeaderProps {
  isCashierClosed: boolean;
  onOpenCashier: () => void;
  onCloseCashier: () => void;
  onWithdrawal: () => void;
  onSupply: () => void;
  onReports: () => void;
}

export function PDVHeader({
  isCashierClosed,
  onOpenCashier,
  onCloseCashier,
  onWithdrawal,
  onSupply,
  onReports
}: PDVHeaderProps) {
  return (
    <div className="border-b">
      <div className="container mx-auto py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">PDV</h1>
        <div className="flex gap-2">
          {isCashierClosed ? (
            <Button 
              variant="outline" 
              onClick={onOpenCashier}
            >
              <Lock className="mr-2 h-4 w-4" />
              Abrir Caixa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onWithdrawal}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Retirada
              </Button>
              <Button
                variant="outline"
                onClick={onSupply}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Suprimento
              </Button>
              <Button 
                variant="outline" 
                className="text-red-600"
                onClick={onCloseCashier}
              >
                <Lock className="mr-2 h-4 w-4" />
                Fechar Caixa
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            onClick={onReports}
          >
            <Clock className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
        </div>
      </div>
    </div>
  );
}
