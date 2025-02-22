
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StockMovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "entrada" | "saida";
}

export function StockMovementForm({
  open,
  onOpenChange,
  type,
}: StockMovementFormProps) {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Movimentação registrada",
      description: `A ${type} foi registrada com sucesso!`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "entrada" ? "Nova Entrada" : "Nova Saída"}
          </DialogTitle>
          <DialogDescription>
            {type === "entrada"
              ? "Registre uma nova entrada no estoque."
              : "Registre uma nova saída do estoque."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="product">Produto</label>
              <Input id="product" placeholder="Selecione o produto" />
            </div>
            <div className="space-y-2">
              <label htmlFor="quantity">Quantidade</label>
              <Input id="quantity" type="number" min="1" />
            </div>
            {type === "entrada" ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="supplier">Fornecedor</label>
                  <Input id="supplier" placeholder="Selecione o fornecedor" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="invoice">Nota Fiscal (opcional)</label>
                  <Input id="invoice" type="text" />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label htmlFor="reason">Motivo</label>
                <select
                  id="reason"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="uso">Uso Interno</option>
                  <option value="venda">Venda</option>
                  <option value="descarte">Descarte</option>
                  <option value="perda">Perda</option>
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">
              {type === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
