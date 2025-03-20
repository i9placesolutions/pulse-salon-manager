
import { Button } from "@/components/ui/button";
import { CreditCard, Lock, Calculator, ArrowUp, ArrowDown, BarChart2 } from "lucide-react";

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
  onReports,
}: PDVHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto py-4">
        <div className="flex flex-wrap items-center gap-3">
          {isCashierClosed ? (
            <Button onClick={onOpenCashier}>
              <Lock className="mr-2 h-4 w-4" />
              Abrir Caixa
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onCloseCashier}>
                <Calculator className="mr-2 h-4 w-4" />
                Fechar Caixa
              </Button>
              
              <Button variant="outline" onClick={onWithdrawal}>
                <ArrowUp className="mr-2 h-4 w-4" />
                Retirada
              </Button>
              
              <Button variant="outline" onClick={onSupply}>
                <ArrowDown className="mr-2 h-4 w-4" />
                Suprimento
              </Button>
            </>
          )}
          
          <Button variant="outline" onClick={onReports}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
        </div>
      </div>
    </div>
  );
}
