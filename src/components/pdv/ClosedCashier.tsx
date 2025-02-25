
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { CashierOpenDialog } from "./CashierOpenDialog";

interface ClosedCashierProps {
  isOpenCashierDialog: boolean;
  setIsOpenCashierDialog: (open: boolean) => void;
  openingAmount: string;
  onOpeningAmountChange: (value: string) => void;
  handleOpenCashier: () => void;
}

export function ClosedCashier({
  isOpenCashierDialog,
  setIsOpenCashierDialog,
  openingAmount,
  onOpeningAmountChange,
  handleOpenCashier
}: ClosedCashierProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
      <Card className="w-[400px] p-6">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-2xl font-semibold">Caixa Fechado</h2>
          <p className="text-center text-muted-foreground">
            É necessário abrir o caixa para iniciar as operações do dia.
          </p>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => setIsOpenCashierDialog(true)}
          >
            Abrir Caixa
          </Button>
        </div>
      </Card>

      <CashierOpenDialog
        isOpen={isOpenCashierDialog}
        onOpenChange={setIsOpenCashierDialog}
        openingAmount={openingAmount}
        onOpeningAmountChange={onOpeningAmountChange}
        onConfirm={handleOpenCashier}
      />
    </div>
  );
}
