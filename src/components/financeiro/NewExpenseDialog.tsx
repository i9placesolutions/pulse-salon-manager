
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

export function NewExpenseDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Despesa registrada",
      description: "A nova despesa foi registrada com sucesso.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-red-50 hover:bg-red-100 text-red-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
          <DialogDescription>
            Registre uma nova despesa no sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name">Nome da Despesa</label>
              <Input id="name" placeholder="Ex: Aluguel, Água, Luz" />
            </div>
            <div className="space-y-2">
              <label htmlFor="value">Valor</label>
              <Input id="value" type="number" placeholder="0,00" step="0.01" />
            </div>
            <div className="space-y-2">
              <label htmlFor="category">Categoria</label>
              <select 
                id="category" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="fixo">Fixo</option>
                <option value="variavel">Variável</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="dueDate">Data de Vencimento</label>
              <Input id="dueDate" type="date" />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="recurring" />
              <label htmlFor="recurring">Despesa Recorrente</label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Registrar Despesa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
