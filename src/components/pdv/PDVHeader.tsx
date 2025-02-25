
import { Button } from "@/components/ui/button";
import { User, CircleDollarSign } from "lucide-react";

interface PDVHeaderProps {
  selectedClient: any;
  onOpenClientDialog: () => void;
  onCloseCashier: () => void;
}

export function PDVHeader({ 
  selectedClient, 
  onOpenClientDialog, 
  onCloseCashier 
}: PDVHeaderProps) {
  return (
    <div className="border-b bg-background p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-semibold">PDV</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onOpenClientDialog}
          >
            <User className="mr-2 h-4 w-4" />
            {selectedClient ? selectedClient.name : "Selecionar Cliente"}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCloseCashier}
          >
            <CircleDollarSign className="mr-2 h-4 w-4" />
            Fechar Caixa
          </Button>
        </div>
      </div>
    </div>
  );
}
