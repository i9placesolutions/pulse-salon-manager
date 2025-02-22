
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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewRevenueDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Receita registrada",
      description: "A nova receita foi registrada com sucesso.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-green-50 hover:bg-green-100 text-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Receita</DialogTitle>
          <DialogDescription>
            Registre uma nova receita no sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="client">Cliente</label>
              <Input id="client" placeholder="Nome do cliente" />
            </div>
            <div className="space-y-2">
              <label htmlFor="service">Serviço</label>
              <Input id="service" placeholder="Descrição do serviço" />
            </div>
            <div className="space-y-2">
              <label htmlFor="value">Valor</label>
              <Input id="value" type="number" placeholder="0,00" step="0.01" />
            </div>
            <div className="space-y-2">
              <label htmlFor="method">Forma de Pagamento</label>
              <select 
                id="method" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="pix">Pix</option>
                <option value="cartao">Cartão</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Registrar Receita</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
