import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types/service";
import { formatCurrency, parseCurrency } from "@/utils/currency";
import { Clock, Scissors, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (service: Partial<Service>) => void;
  service?: Service;
}

export function ServiceForm({
  open,
  onOpenChange,
  onSubmit,
  service,
}: ServiceFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Service>>({
    name: "",
    description: "",
    category: "",
    duration: 30,
    price: 0,
    status: "active",
    professionals: [],
    products: [],
  });

  const [priceInput, setPriceInput] = useState("R$ 0,00");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Efeito que inicializa o formulário quando o modal é aberto
  useEffect(() => {
    if (open) {
      if (service) {
        setFormData({
          ...service,
          commission: undefined
        });
        setPriceInput(formatCurrency(service.price || 0));
      } else {
        setFormData({
          name: "",
          description: "",
          category: "",
          duration: 30,
          price: 0,
          status: "active",
          professionals: [],
          products: [],
        });
        setPriceInput("R$ 0,00");
      }
    }
  }, [service, open]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value || "R$ 0,00";
      setPriceInput(value);
      
      const numericValue = parseCurrency(value);
      setFormData((prev) => ({ ...prev, price: numericValue }));
    } catch (error) {
      console.error("Erro ao converter valor:", error);
      setFormData((prev) => ({ ...prev, price: 0 }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoadingSubmit(true);
      const serviceData = {
        ...formData,
        commission: undefined
      };
      onSubmit(serviceData);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o serviço. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
        {/* Cabeçalho fixo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
          <SheetHeader className="p-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl flex items-center gap-2 text-white">
                <Scissors className="h-5 w-5 text-white" />
                {service ? "Editar Serviço" : "Novo Serviço"}
              </SheetTitle>
              <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </SheetClose>
            </div>
            <SheetDescription className="text-blue-100">
              Preencha as informações abaixo para {service ? "atualizar" : "criar"} um serviço
            </SheetDescription>
          </SheetHeader>
        </div>
        
        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome do serviço <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Corte Feminino"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do serviço..."
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corte">Corte</SelectItem>
                      <SelectItem value="Tintura">Tintura</SelectItem>
                      <SelectItem value="Tratamento">Tratamento</SelectItem>
                      <SelectItem value="Manicure">Manicure</SelectItem>
                      <SelectItem value="Estética">Estética</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium">
                    Duração (minutos) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      min="1"
                      value={formData.duration || 30}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 30,
                        })
                      }
                      className="w-full pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Preço <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    placeholder="R$ 0,00"
                    value={priceInput}
                    onChange={handlePriceChange}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <span className="text-sm">Ativo</span>
                    <Switch
                      id="status"
                      checked={formData.status === "active"}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          status: checked ? "active" : "inactive",
                        })
                      }
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
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loadingSubmit}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? "Salvando..." : service ? "Atualizar" : "Criar"} Serviço
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
