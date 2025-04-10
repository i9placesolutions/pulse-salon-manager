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
  Check
} from "lucide-react";
import { Product } from "@/types/stock";
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

// Mock de produtos para autocompletar
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Shampoo Professional",
    description: "Shampoo para cabelos normais",
    barcode: "7891234567890",
    category: "Cabelo",
    measurementUnit: "unit",
    supplierId: 1,
    purchasePrice: 30.90,
    salePrice: 45.90,
    quantity: 15,
    minQuantity: 20,
    lastUpdated: "2024-03-07",
    commission: {
      type: "percentage",
      defaultValue: 10
    }
  },
  {
    id: 2,
    name: "Condicionador Hidratante",
    description: "Condicionador para cabelos secos",
    category: "Cabelo",
    measurementUnit: "unit",
    supplierId: 1,
    purchasePrice: 25.90,
    salePrice: 39.90,
    quantity: 25,
    minQuantity: 15,
    lastUpdated: "2024-03-07",
    commission: {
      type: "percentage",
      defaultValue: 10
    }
  },
  {
    id: 3,
    name: "Máscara Capilar",
    description: "Máscara de tratamento intensivo",
    category: "Tratamento",
    measurementUnit: "grams",
    measurementValue: 500,
    supplierId: 2,
    purchasePrice: 40.90,
    salePrice: 59.90,
    quantity: 8,
    minQuantity: 10,
    lastUpdated: "2024-03-06",
    commission: {
      type: "percentage",
      defaultValue: 12
    }
  }
];

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
    productId: 0,
    quantity: 0,
    supplier: "",
    invoice: "",
    invoiceFile: null as File | null,
    reason: "uso",
  });
  
  const [openProductCombobox, setOpenProductCombobox] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Filtrar produtos com base no termo de pesquisa
  useEffect(() => {
    const filtered = searchTerm.trim() === "" 
      ? mockProducts 
      : mockProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.barcode && product.barcode.includes(searchTerm))
        );
    setFilteredProducts(filtered);
  }, [searchTerm]);
  
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormData(prev => ({ 
      ...prev, 
      product: product.name,
      productId: product.id
    }));
    setOpenProductCombobox(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de envio do arquivo
    toast({
      title: "Movimentação registrada",
      description: `A ${type} foi registrada com sucesso!`,
    });
    onOpenChange(false);
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
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="product"
                        placeholder="Digite para buscar produtos..."
                        value={formData.product}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, product: e.target.value }));
                          setSearchTerm(e.target.value);
                          if (!openProductCombobox) {
                            setOpenProductCombobox(true);
                          }
                        }}
                        className="pl-9"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[300px]" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar produtos..." 
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum produto encontrado</CommandEmpty>
                        <CommandGroup>
                          {filteredProducts.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => handleProductSelect(product)}
                            >
                              {product.name}
                              {selectedProduct?.id === product.id && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
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
                    <Input 
                      id="supplier" 
                      placeholder="Selecione o fornecedor" 
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    />
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
        <div className="sticky bottom-0 z-10 bg-white border-t p-4 flex justify-end">
          <Button 
            variant={type === "entrada" ? "pink" : "default"} 
            type="submit"
            form="movementForm"
          >
            {type === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
