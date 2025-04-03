import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CashFlow } from "@/types/financial";
import { parseCurrency } from "@/utils/currency";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface NewCashFlowEntryDialogProps {
  onNewEntry: (entry: Omit<CashFlow, "id">) => void;
  type: "entrada" | "saida";
}

export function NewCashFlowEntryDialog({ onNewEntry, type }: NewCashFlowEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [relatedDocument, setRelatedDocument] = useState("");
  const [status, setStatus] = useState<"realizado" | "previsto">("realizado");
  const [isRecurring, setIsRecurring] = useState(false);

  // Opções de categoria baseadas no tipo (entrada ou saída)
  const categoryOptions = type === "entrada"
    ? ["Serviços", "Produtos", "Outros", "Assinaturas"]
    : ["Fornecedores", "Aluguel", "Salários", "Impostos", "Utilidades", "Marketing", "Outros"];

  // Opções de métodos de pagamento
  const paymentMethods = ["Pix", "Dinheiro", "Cartão", "Boleto", "Transferência"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !description || !value || !date) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const numericValue = parseCurrency(value);
    
    if (numericValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }
    
    const newEntry: Omit<CashFlow, "id"> = {
      date,
      type,
      category,
      description,
      value: numericValue,
      status,
      paymentMethod: paymentMethod || undefined,
      relatedDocument: relatedDocument || undefined,
      isRecurring: type === "saida" ? isRecurring : undefined,
    };
    
    onNewEntry(newEntry);
    
    toast({
      title: type === "entrada" ? "Entrada registrada" : "Saída registrada",
      description: `${type === "entrada" ? "Entrada" : "Saída"} de ${value} adicionada com sucesso.`,
    });
    
    // Limpa o formulário
    setCategory("");
    setDescription("");
    setValue("");
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("");
    setRelatedDocument("");
    setStatus("realizado");
    setIsRecurring(false);
    
    // Fecha o diálogo
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={type === "entrada" ? "default" : "destructive"}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          {type === "entrada" ? "Nova Entrada" : "Nova Saída"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "entrada" ? "Registrar Nova Entrada" : "Registrar Nova Saída"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes da {type === "entrada" ? "entrada" : "saída"} financeira.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                required
              >
                <SelectTrigger className="col-span-3" id="category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Valor (R$)
              </Label>
              <Input
                id="value"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-method" className="text-right">
                Método
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger className="col-span-3" id="payment-method">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as "realizado" | "previsto")}
                required
              >
                <SelectTrigger className="col-span-3" id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realizado">Realizado</SelectItem>
                  <SelectItem value="previsto">Previsto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right">
                Documento
              </Label>
              <Input
                id="document"
                placeholder="Nota fiscal, recibo, etc."
                value={relatedDocument}
                onChange={(e) => setRelatedDocument(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            {type === "saida" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label htmlFor="recurring">Recorrente</Label>
                </div>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox 
                    id="recurring" 
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(checked === true)}
                  />
                  <Label htmlFor="recurring" className="font-normal">
                    Esta é uma despesa recorrente
                  </Label>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 