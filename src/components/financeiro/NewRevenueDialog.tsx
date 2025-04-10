import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, FileUp, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-green-50 hover:bg-green-100 text-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
        {/* Cabeçalho fixo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-teal-600 border-b">
          <SheetHeader className="p-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl flex items-center gap-2 text-white">
                <FileUp className="h-5 w-5 text-white" />
                Nova Receita
              </SheetTitle>
              <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </SheetClose>
            </div>
            <SheetDescription className="text-green-100">
              Registre uma nova receita no sistema.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/30 p-5 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Informações da Receita</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Input id="client" placeholder="Nome do cliente" className="w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço</Label>
                    <Input id="service" placeholder="Descrição do serviço" className="w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <Input id="value" type="number" placeholder="0,00" step="0.01" className="w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="method">Forma de Pagamento</Label>
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
              </div>
              
              <div className="bg-muted/30 p-5 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Informações Adicionais</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input id="date" type="date" className="w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <textarea 
                      id="notes" 
                      placeholder="Observações adicionais" 
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Rodapé fixo */}
        <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
          <div className="flex flex-row gap-3 w-full justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Registrar Receita
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
