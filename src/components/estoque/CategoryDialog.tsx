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
import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = "https://wtpmedifsfbxctlssefd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG1lZGlmc2ZieGN0bHNzZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTMwNzUsImV4cCI6MjA1OTg4OTA3NX0.Mmro8vKbusSP_HNCqX9f5XlrotRbeA8-HIGvQE07mwU";
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Salvar a categoria no Supabase
      const { data, error } = await supabase
        .from('product_categories')
        .insert([
          { 
            name: categoryName.trim(),
            description: description.trim() || null
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Chama a função de callback passando a categoria criada
      if (data && data.length > 0) {
        onSave(data[0].name);
      } else {
        onSave(categoryName.trim());
      }
      
      setCategoryName("");
      setDescription("");
      onOpenChange(false);
      
      toast({
        title: "Categoria cadastrada",
        description: "A nova categoria foi cadastrada com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Não foi possível cadastrar a categoria.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
                Nome da Categoria <span className="text-red-500">*</span>
              </label>
              <Input 
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Cabelo, Tratamento, Maquiagem"
                autoFocus
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <Input 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional para esta categoria"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="pink" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Adicionar Categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
