import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  X, 
  Search, 
  Check,
  Loader2
} from "lucide-react";
import { Product } from "@/types/stock";
import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = "https://wtpmedifsfbxctlssefd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG1lZGlmc2ZieGN0bHNzZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTMwNzUsImV4cCI6MjA1OTg4OTA3NX0.Mmro8vKbusSP_HNCqX9f5XlrotRbeA8-HIGvQE07mwU";
const supabase = createClient(supabaseUrl, supabaseKey);
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Interface para os fornecedores
interface Supplier {
  id: string;
  name: string;
}

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
  const [formData, setFormData] = useState({
    product: "",
    productId: "",
    quantity: 0,
    supplierId: "",
    supplierName: "",
    invoice: "",
    invoiceFile: null as File | null,
    reason: "uso",
  });
  
  const [openProductCombobox, setOpenProductCombobox] = useState(false);
  const [openSupplierCombobox, setOpenSupplierCombobox] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  
  // Carregar produtos do Supabase
  useEffect(() => {
    async function fetchProducts() {
      setIsLoadingProducts(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        if (data) {
          // Converte os dados do formato do banco para o formato da aplicação
          const formattedProducts = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            barcode: item.barcode,
            category: item.category,
            measurementUnit: item.measurement_unit,
            measurementValue: item.measurement_value,
            supplierId: item.supplier_id,
            purchasePrice: item.purchase_price,
            salePrice: item.sale_price,
            quantity: item.quantity,
            minQuantity: item.min_quantity,
            expirationDate: item.expiration_date,
            lastUpdated: item.updated_at,
            commission: {
              type: item.commission_type,
              defaultValue: item.commission_value
            }
          }));
          
          setProducts(formattedProducts);
          setFilteredProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos",
          variant: "destructive"
        });
      } finally {
        setIsLoadingProducts(false);
      }
    }
    
    fetchProducts();
  }, [toast]);
  
  // Carregar fornecedores do Supabase (apenas para entradas)
  useEffect(() => {
    if (type === "entrada") {
      async function fetchSuppliers() {
        setIsLoadingSuppliers(true);
        try {
          const { data, error } = await supabase
            .from('suppliers')
            .select('id, name')
            .eq('status', 'active')
            .order('name');
            
          if (error) throw error;
          
          if (data) {
            setSuppliers(data);
            setFilteredSuppliers(data);
          }
        } catch (error) {
          console.error('Erro ao carregar fornecedores:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os fornecedores",
            variant: "destructive"
          });
        } finally {
          setIsLoadingSuppliers(false);
        }
      }
      
      fetchSuppliers();
    }
  }, [type, toast]);
  
  // Filtrar produtos com base no termo de pesquisa
  useEffect(() => {
    const filtered = searchTerm.trim() === "" 
      ? products 
      : products.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.barcode && product.barcode.includes(searchTerm))
        );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);
  
  // Filtrar fornecedores com base no termo de pesquisa
  useEffect(() => {
    const filtered = supplierSearchTerm.trim() === "" 
      ? suppliers 
      : suppliers.filter(supplier => 
          supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
        );
    setFilteredSuppliers(filtered);
  }, [supplierSearchTerm, suppliers]);
  
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormData(prev => ({ 
      ...prev, 
      product: product.name,
      productId: String(product.id)
    }));
    setOpenProductCombobox(false);
  };
  
  const handleSupplierSelect = (supplier: Supplier) => {
    setFormData(prev => ({ 
      ...prev, 
      supplierName: supplier.name,
      supplierId: supplier.id
    }));
    setOpenSupplierCombobox(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.productId || formData.quantity <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um produto e informe a quantidade",
        variant: "destructive"
      });
      return;
    }
    
    // Validar fornecedor para entrada
    if (type === "entrada" && !formData.supplierId) {
      toast({
        title: "Fornecedor obrigatório",
        description: "Selecione um fornecedor para a entrada",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Registrar a movimentação no banco
      const { data: movementData, error: movementError } = await supabase
        .from('stock_movements')
        .insert([
          {
            product_id: formData.productId,
            movement_type: type,
            quantity: formData.quantity,
            supplier_id: type === "entrada" ? formData.supplierId : null,
            invoice_number: formData.invoice || null,
            reason: type === "saida" ? formData.reason : null,
            notes: null
          }
        ])
        .select();
        
      if (movementError) throw movementError;
      
      // 2. Atualizar a quantidade do produto
      // Para entrada: adicionar quantidade, para saída: subtrair quantidade
      const newQuantity = type === "entrada" 
        ? (selectedProduct?.quantity || 0) + formData.quantity
        : (selectedProduct?.quantity || 0) - formData.quantity;
      
      if (newQuantity < 0) {
        throw new Error("A quantidade em estoque não pode ficar negativa");
      }
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', formData.productId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Movimentação registrada",
        description: `A ${type} foi registrada com sucesso!`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error(`Erro ao registrar ${type}:`, error);
      toast({
        title: "Erro",
        description: error.message || `Não foi possível registrar a ${type}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
                {type === "entrada" ? "Nova Entrada" : "Nova Saída"}
              </SheetTitle>
              <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </SheetClose>
            </div>
            <SheetDescription className="text-blue-100">
              {type === "entrada"
                ? "Registre uma nova entrada no estoque."
                : "Registre uma nova saída do estoque."}
            </SheetDescription>
          </SheetHeader>
        </div>
        
        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <form id="movementForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="product">Produto</label>
                <Popover open={openProductCombobox} onOpenChange={setOpenProductCombobox}>
                  <PopoverTrigger asChild>
                    <div>
                      <Input 
                        id="product" 
                        placeholder={isLoadingProducts ? "Carregando produtos..." : "Pesquisar produto"}
                        value={formData.product}
                        onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                        onClick={() => setOpenProductCombobox(true)}
                        className="w-full"
                        disabled={isLoadingProducts}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start" sideOffset={5}>
                    <Command>
                      <CommandInput 
                        placeholder="Pesquisar produto..." 
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                      />
                      <CommandList>
                        {isLoadingProducts ? (
                          <div className="py-6 text-center">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Carregando produtos...</p>
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                            <CommandGroup>
                              {filteredProducts.map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={product.name}
                                  onSelect={() => handleProductSelect(product)}
                                  className="flex items-center"
                                >
                                  <span>{product.name}</span>
                                  {selectedProduct?.id === product.id && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedProduct && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Categoria: {selectedProduct.category} | 
                    Estoque atual: {selectedProduct.quantity} | 
                    Preço: R$ {selectedProduct.salePrice.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity">Quantidade</label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                />
              </div>
              {type === "entrada" ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="supplier">Fornecedor</label>
                    <Popover open={openSupplierCombobox} onOpenChange={setOpenSupplierCombobox}>
                      <PopoverTrigger asChild>
                        <div>
                          <Input 
                            id="supplier" 
                            placeholder={isLoadingSuppliers ? "Carregando fornecedores..." : "Selecione o fornecedor"}
                            value={formData.supplierName}
                            onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                            onClick={() => setOpenSupplierCombobox(true)}
                            className="w-full"
                            disabled={isLoadingSuppliers}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" sideOffset={5}>
                        <Command>
                          <CommandInput 
                            placeholder="Pesquisar fornecedor..." 
                            value={supplierSearchTerm}
                            onValueChange={setSupplierSearchTerm}
                          />
                          <CommandList>
                            {isLoadingSuppliers ? (
                              <div className="py-6 text-center">
                                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Carregando fornecedores...</p>
                              </div>
                            ) : (
                              <>
                                <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                                <CommandGroup>
                                  {filteredSuppliers.map((supplier) => (
                                    <CommandItem
                                      key={supplier.id}
                                      value={supplier.name}
                                      onSelect={() => handleSupplierSelect(supplier)}
                                      className="flex items-center"
                                    >
                                      <span>{supplier.name}</span>
                                      {formData.supplierId === supplier.id && (
                                        <Check className="ml-auto h-4 w-4" />
                                      )}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="invoice">Número da Nota Fiscal</label>
                    <Input 
                      id="invoice" 
                      type="text"
                      value={formData.invoice}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoice: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="invoiceFile">Anexar Nota Fiscal (PDF)</label>
                    <Input
                      id="invoiceFile"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData(prev => ({ ...prev, invoiceFile: file }));
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="reason">Motivo</label>
                  <select
                    id="reason"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  >
                    <option value="uso">Uso Interno</option>
                    <option value="venda">Venda</option>
                    <option value="servico">Serviço</option>
                    <option value="descarte">Descarte</option>
                    <option value="perda">Perda</option>
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>
        
        {/* Rodapé fixo */}
        <div className="sticky bottom-0 z-10 bg-white border-t p-4 flex justify-end gap-2">
          <Button 
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant={type === "entrada" ? "pink" : "default"} 
            type="submit"
            form="movementForm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {type === "entrada" ? "Registrando..." : "Registrando..."}
              </>
            ) : (
              type === "entrada" ? "Registrar Entrada" : "Registrar Saída"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
