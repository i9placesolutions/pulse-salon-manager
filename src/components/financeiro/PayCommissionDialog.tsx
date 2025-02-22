
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Professional } from "@/types/financial";

interface PayCommissionDialogProps {
  professional: Professional;
}

export function PayCommissionDialog({ professional }: PayCommissionDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Comissão paga",
      description: `Comissão paga para ${professional.name}`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="mr-2 h-4 w-4" />
          Pagar Comissão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pagar Comissão</DialogTitle>
          <DialogDescription>
            Registre o pagamento de comissão para {professional.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="value">Valor da Comissão</label>
              <Input 
                id="value" 
                type="number" 
                placeholder="0,00" 
                step="0.01" 
                defaultValue={professional.commission}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="method">Forma de Pagamento</label>
              <select 
                id="method" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="pix">Pix</option>
                <option value="transferencia">Transferência</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="date">Data do Pagamento</label>
              <Input 
                id="date" 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Confirmar Pagamento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
