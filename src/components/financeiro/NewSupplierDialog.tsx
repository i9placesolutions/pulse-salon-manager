
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

export function NewSupplierDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Fornecedor cadastrado",
      description: "O novo fornecedor foi cadastrado com sucesso.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Fornecedor</DialogTitle>
          <DialogDescription>
            Cadastre um novo fornecedor no sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name">Nome da Empresa</label>
              <Input id="name" placeholder="Nome do fornecedor" />
            </div>
            <div className="space-y-2">
              <label htmlFor="document">CNPJ/CPF</label>
              <Input id="document" placeholder="Digite o documento" />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone">Telefone</label>
              <Input id="phone" placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">E-mail</label>
              <Input id="email" type="email" placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <label>Formas de Pagamento Aceitas</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="paymentMethods" value="pix" />
                  Pix
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="paymentMethods" value="cartao" />
                  Cartão
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="paymentMethods" value="boleto" />
                  Boleto
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Cadastrar Fornecedor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
