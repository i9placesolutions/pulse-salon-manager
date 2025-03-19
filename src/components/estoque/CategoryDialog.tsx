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

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (category: string) => void;
}

export function CategoryDialog({ 
  open, 
  onOpenChange, 
  onSave 
}: CategoryDialogProps) {
  const [categoryName, setCategoryName] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive"
      });
      return;
    }
    
    onSave(categoryName.trim());
    setCategoryName("");
    onOpenChange(false);
    
    toast({
      title: "Categoria cadastrada",
      description: "A nova categoria foi cadastrada com sucesso!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Cadastre uma nova categoria para seus produtos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="categoryName" className="text-sm font-medium">
                Nome da Categoria
              </label>
              <Input 
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Cabelo, Tratamento, Maquiagem"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="pink">Adicionar Categoria</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
