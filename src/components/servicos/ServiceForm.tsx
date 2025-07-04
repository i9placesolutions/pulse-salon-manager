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
import { formatCurrency, parseCurrency, formatCurrencyInput } from "@/utils/currency";
import { Clock, Scissors, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabaseClient";

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
  const [customCategories, setCustomCategories] = useState<{id: number, name: string}[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  // Função para carregar categorias do Supabase
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao carregar categorias:', error);
        toast({
          title: "Erro ao carregar categorias",
          description: "Não foi possível carregar as categorias de serviços.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setCustomCategories(data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Função para salvar uma nova categoria no Supabase
  const saveCategory = async (categoryName: string) => {
    try {
      setSavingCategory(true);
      
      // Verificar se a categoria já existe
      const { data: existingCategory } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('name', categoryName.trim())
        .single();

      if (existingCategory) {
        toast({
          title: "Categoria já existe",
          description: `A categoria "${categoryName.trim()}" já existe no sistema.`,
          variant: "destructive",
        });
        return null;
      }
      
      // Inserir nova categoria
      const { data, error } = await supabase
        .from('service_categories')
        .insert({ name: categoryName.trim() })
        .select('id, name')
        .single();

      if (error) {
        console.error('Erro ao salvar categoria:', error);
        toast({
          title: "Erro ao salvar categoria",
          description: "Não foi possível salvar a nova categoria no banco de dados.",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      return null;
    } finally {
      setSavingCategory(false);
    }
  };

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
      
      // Carregar categorias do Supabase quando o modal é aberto
      loadCategories();
    }
  }, [service, open]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Obter o valor digitado
      const inputValue = e.target.value || "";
      
      // Formatar o valor para o padrão brasileiro enquanto o usuário digita
      const formattedValue = formatCurrencyInput(inputValue);
      setPriceInput(formattedValue);
      
      // Converter para valor numérico
      const numericValue = parseCurrency(formattedValue);
      setFormData((prev) => ({ ...prev, price: numericValue }));
    } catch (error) {
      console.error("Erro ao converter valor:", error);
      setPriceInput("R$ 0,00");
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
                  {!showNewCategoryInput ? (
                    <div className="space-y-2">
                      <Select
                        value={formData.category || ""}
                        onValueChange={(value) => {
                          if (value === "new_category") {
                            setShowNewCategoryInput(true);
                          } else {
                            setFormData({ ...formData, category: value });
                          }
                        }}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecione ou crie uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_category">+ Criar nova categoria</SelectItem>
                          {loadingCategories ? (
                            <SelectItem value="loading" disabled>Carregando categorias...</SelectItem>
                          ) : customCategories.length === 0 ? (
                            <SelectItem value="empty" disabled>Nenhuma categoria disponível</SelectItem>
                          ) : (
                            customCategories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Nome da nova categoria"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full"
                          disabled={savingCategory}
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          className="mt-0"
                          disabled={savingCategory}
                          onClick={async () => {
                            if (newCategory.trim()) {
                              // Salvar no Supabase
                              const savedCategory = await saveCategory(newCategory.trim());
                              
                              if (savedCategory) {
                                // Adicionar à lista local
                                setCustomCategories(prev => [...prev, savedCategory]);
                                // Atualizar o form
                                setFormData({ ...formData, category: savedCategory.name });
                                setNewCategory("");
                                setShowNewCategoryInput(false);
                                toast({
                                  title: "Categoria criada",
                                  description: `A categoria "${savedCategory.name}" foi criada com sucesso.`,
                                });
                              }
                            } else {
                              toast({
                                title: "Nome inválido",
                                description: "Digite um nome para a categoria.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          {savingCategory ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="mt-0"
                          disabled={savingCategory}
                          onClick={() => {
                            setShowNewCategoryInput(false);
                            setNewCategory("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
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
