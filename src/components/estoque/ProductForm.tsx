import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/stock";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = "https://wtpmedifsfbxctlssefd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG1lZGlmc2ZieGN0bHNzZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTMwNzUsImV4cCI6MjA1OTg4OTA3NX0.Mmro8vKbusSP_HNCqX9f5XlrotRbeA8-HIGvQE07mwU";
const supabase = createClient(supabaseUrl, supabaseKey);
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { 
  Plus, 
  Package, 
  FileText, 
  Tag, 
  Ruler, 
  DollarSign, 
  ShoppingCart, 
  Percent,
  AlertCircle,
  Info,
  X
} from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (product: Partial<Product>) => void;
  product?: Product;
}

export function ProductForm({ open, onOpenChange, onSubmit, product }: ProductFormProps) {
  const { toast } = useToast();
  
  // Função para formatar valor monetário no padrão brasileiro
  const formatCurrency = useCallback((value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).replace('R$', '').trim();
  }, []);
  
  // Função para converter string formatada para número
  const parseCurrency = useCallback((value: string): number => {
    // Remove R$, pontos e substitui vírgula por ponto
    const numericValue = value.replace('R$', '').replace(/\./g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
  }, []);
  
  const defaultProduct: Partial<Product> = {
    name: '',
    description: '',
    barcode: '',
    category: '',
    measurementUnit: 'unit',
    measurementValue: 1,
    supplierId: undefined, // Definido como undefined para evitar problemas no DB
    purchasePrice: 0,
    salePrice: 0,
    quantity: 0,
    minQuantity: 0,
    expirationDate: undefined,
    linkedServices: [],
    commission: {
      type: 'percentage',
      defaultValue: 0
    }
  };

  const [formData, setFormData] = useState<Partial<Product>>(
    product ? {
      ...defaultProduct,
      ...product,
      commission: {
        type: product.commission?.type || "percentage",
        defaultValue: product.commission?.defaultValue || 0
      }
    } : defaultProduct
  );
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Garante que todos os campos obrigatórios estejam preenchidos
    if (!formData.name || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    // Garante que o preço e a quantidade sejam números válidos
    if (isNaN(Number(formData.purchasePrice)) || isNaN(Number(formData.salePrice)) || isNaN(Number(formData.quantity))) {
      toast({
        title: "Valores inválidos",
        description: "Os valores de preço e quantidade devem ser números válidos",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepara os dados para o formato do banco
      const productData = {
        name: formData.name,
        description: formData.description || null,
        barcode: formData.barcode || null,
        category: formData.category,
        measurement_unit: formData.measurementUnit,
        measurement_value: formData.measurementValue,
        supplier_id: formData.supplierId || null,
        purchase_price: formData.purchasePrice,
        sale_price: formData.salePrice,
        quantity: formData.quantity,
        min_quantity: formData.minQuantity,
        expiration_date: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null,
        commission_type: formData.commission?.type || 'percentage',
        commission_value: formData.commission?.defaultValue || 0
      };
      
      let result;
      
      if (product?.id) {
        // Atualizar produto existente
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Criar novo produto
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      // Formata o resultado para o formato usado na aplicação
      if (result) {
        const formattedProduct = {
          id: result.id,
          name: result.name,
          description: result.description,
          barcode: result.barcode,
          category: result.category,
          measurementUnit: result.measurement_unit,
          measurementValue: result.measurement_value,
          supplierId: result.supplier_id,
          purchasePrice: result.purchase_price,
          salePrice: result.sale_price,
          quantity: result.quantity,
          minQuantity: result.min_quantity,
          expirationDate: result.expiration_date,
          commission: {
            type: result.commission_type,
            defaultValue: result.commission_value
          },
          lastUpdated: result.updated_at
        };
        
        // Chama o callback com os dados formatados
        onSubmit(formattedProduct);
      }
      
      toast({
        title: product ? "Produto atualizado" : "Produto cadastrado",
        description: product
          ? "O produto foi atualizado com sucesso!"
          : "O novo produto foi cadastrado com sucesso!",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o produto",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Carrega as categorias do Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from('product_categories')
          .select('name')
          .order('name');
          
        if (error) throw error;
        
        if (data) {
          const categoryNames = data.map(cat => cat.name);
          setCategories(categoryNames);
        }
      } catch (error: any) {
        console.error('Erro ao carregar categorias:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, [toast]);
  
  const handleAddCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setFormData(prev => ({ ...prev, category: newCategory }));
    }
  };

  const calculateProfit = () => {
    if (formData.salePrice && formData.purchasePrice) {
      const profit = formData.salePrice - formData.purchasePrice;
      const profitPercentage = (profit / formData.purchasePrice) * 100;
      return { profit, profitPercentage: profitPercentage.toFixed(2) };
    }
    return { profit: 0, profitPercentage: '0.00' };
  };

  const { profit, profitPercentage } = calculateProfit();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="!w-full !max-w-full sm:!max-w-full md:!max-w-full p-0 flex flex-col h-[100dvh]" 
        style={{ width: '100vw !important', maxWidth: '100% !important' }}
        side="right"
      >
        {/* Cabeçalho fixo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetHeader className="flex-1">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                <SheetTitle className="text-xl text-white">{product ? "Editar Produto" : "Novo Produto"}</SheetTitle>
              </div>
              <SheetDescription className="text-blue-100">
                {product
                  ? "Atualize as informações do produto."
                  : "Preencha as informações para cadastrar um novo produto."}
              </SheetDescription>
            </SheetHeader>
            
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-blue-700/50 focus:outline-none">
                <X className="h-5 w-5" />
                <span className="sr-only">Fechar</span>
              </Button>
            </SheetClose>
          </div>
        </div>
        
        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="space-y-5 bg-gray-50 p-5 rounded-xl border">
              <div className="flex items-center gap-2 border-b pb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Informações Básicas</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="font-medium flex items-center gap-1">
                    Nome do Produto
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    placeholder="Ex: Shampoo Hidratante 300ml"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="border-blue-200 focus-visible:ring-blue-400"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="font-medium flex items-center gap-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Descrição
                  </label>
                  <Input
                    id="description"
                    value={formData.description}
                    placeholder="Descreva brevemente o produto"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="border-blue-200 focus-visible:ring-blue-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="font-medium flex items-center gap-1">
                    <Tag className="h-4 w-4 text-gray-500" />
                    Categoria
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="productCategory"
                      className="flex h-10 w-full rounded-md border border-blue-200 bg-background px-3 py-2 text-sm focus-visible:ring-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      required
                      disabled={isLoadingCategories}
                    >
                      <option value="" disabled>
                        {isLoadingCategories ? "Carregando categorias..." : "Selecione uma categoria"}
                      </option>
                      {categories.length === 0 && !isLoadingCategories && (
                        <option value="" disabled>
                          Nenhuma categoria cadastrada
                        </option>
                      )}
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            type="button" 
                            size="icon" 
                            variant="outline" 
                            onClick={() => setIsCategoryDialogOpen(true)}
                            className="border-blue-300 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Adicionar nova categoria</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção: Medidas */}
            <div className="space-y-5 bg-gray-50 p-5 rounded-xl border">
              <div className="flex items-center gap-2 border-b pb-2">
                <Ruler className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Medidas</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="measurementUnit" className="font-medium flex items-center gap-1">
                    Unidade de Medida
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Como o produto é medido (unidade, peso, volume)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <select
                    id="measurementUnit"
                    className="flex h-10 w-full rounded-md border border-blue-200 bg-background px-3 py-2 text-sm focus-visible:ring-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    value={formData.measurementUnit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        measurementUnit: e.target.value as Product["measurementUnit"],
                      }))
                    }
                  >
                    <option value="unit">Unidade</option>
                    <option value="grams">Gramas</option>
                    <option value="milliliters">Mililitros</option>
                    <option value="package">Pacote</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="measurementValue" className="font-medium flex items-center gap-1">
                    Valor da Medida
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Quantidade em gramas, ml ou unidades por pacote</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <Input
                    id="measurementValue"
                    type="number"
                    placeholder={formData.measurementUnit === 'grams' ? 'Ex: 500' : 
                              formData.measurementUnit === 'milliliters' ? 'Ex: 300' : 
                              formData.measurementUnit === 'package' ? 'Ex: 12' : ''}
                    value={formData.measurementValue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        measurementValue: Number(e.target.value),
                      }))
                    }
                    className="border-blue-200 focus-visible:ring-blue-400"
                  />
                </div>
              </div>
            </div>
            
            {/* Seção: Preços */}
            <div className="space-y-5 bg-gray-50 p-5 rounded-xl border">
              <div className="flex items-center gap-2 border-b pb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Preços</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="purchasePrice" className="font-medium flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4 text-gray-500" />
                    Preço de Compra
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="purchasePrice"
                      type="text"
                      placeholder="0,00"
                      value={formData.purchasePrice ? formatCurrency(formData.purchasePrice) : ''}
                      onChange={(e) => {
                        const value = parseCurrency(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          purchasePrice: value,
                        }));
                      }}
                      className="border-blue-200 focus-visible:ring-blue-400 pl-8"
                      required
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      R$
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="salePrice" className="font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Preço de Venda
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="salePrice"
                      type="text"
                      placeholder="0,00"
                      value={formData.salePrice ? formatCurrency(formData.salePrice) : ''}
                      onChange={(e) => {
                        const value = parseCurrency(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          salePrice: value,
                        }));
                      }}
                      className="border-blue-200 focus-visible:ring-blue-400 pl-8"
                      required
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      R$
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mostrar lucro calculado */}
              {formData.salePrice > 0 && formData.purchasePrice > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <div className="text-sm flex justify-between">
                    <div>
                      <span className="font-medium text-blue-700">Lucro por unidade:</span> 
                      <span className="text-blue-800 ml-1">R$ {profit.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Margem:</span> 
                      <span className="text-blue-800 ml-1">{profitPercentage}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Seção: Estoque */}
            <div className="space-y-5 bg-gray-50 p-5 rounded-xl border">
              <div className="flex items-center gap-2 border-b pb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Estoque</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="quantity" className="font-medium flex items-center gap-1">
                    Quantidade atual
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: Number(e.target.value),
                      }))
                    }
                    className="border-blue-200 focus-visible:ring-blue-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="minQuantity" className="font-medium flex items-center gap-2">
                    Quantidade Mínima
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-3.5 w-3.5 text-yellow-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sistema alertará quando o estoque estiver abaixo deste valor</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <Input
                    id="minQuantity"
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minQuantity: Number(e.target.value),
                      }))
                    }
                    className="border-blue-200 focus-visible:ring-blue-400"
                  />
                </div>
              </div>
            </div>
            
            {/* Seção: Comissão */}
            <div className="space-y-5 bg-gray-50 p-5 rounded-xl border">
              <div className="flex items-center gap-2 border-b pb-2">
                <Percent className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Comissão</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="commissionType" className="font-medium flex items-center gap-1">
                    Tipo
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Porcentagem sobre o preço ou valor fixo</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <select
                    id="commissionType"
                    className="flex h-10 w-full rounded-md border border-blue-200 bg-background px-3 py-2 text-sm focus-visible:ring-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    value={formData.commission?.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        commission: {
                          ...prev.commission!,
                          type: e.target.value as 'percentage' | 'fixed',
                        },
                      }))
                    }
                  >
                    <option value="percentage">Porcentagem</option>
                    <option value="fixed">Valor Fixo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="commissionValue" className="font-medium">
                    Valor Padrão
                  </label>
                  <div className="relative">
                    <Input
                      id="commissionValue"
                      type="number"
                      step="0.01"
                      value={formData.commission?.defaultValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          commission: {
                            ...prev.commission!,
                            defaultValue: Number(e.target.value),
                          },
                        }))
                      }
                      className="border-blue-200 focus-visible:ring-blue-400 pl-8"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      {formData.commission?.type === 'percentage' ? '%' : 'R$'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  Você poderá definir comissões específicas por profissional após salvar o produto.
                </p>
              </div>
            </div>
            
            {/* Campos obrigatórios */}
            <div className="text-sm text-muted-foreground">
              <span className="text-red-500">*</span> Campos obrigatórios
            </div>
          </form>
        </div>
        
        {/* Rodapé fixo */}
        <div className="sticky bottom-0 mt-auto bg-white border-t px-6 py-4 shadow-sm">
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" form="product-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">&#9696;</span>
                  {product ? "Salvando..." : "Cadastrando..."}
                </>
              ) : (
                product ? "Salvar Alterações" : "Cadastrar Produto"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>

      <CategoryDialog 
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onSave={handleAddCategory}
      />
    </Sheet>
  );
}
