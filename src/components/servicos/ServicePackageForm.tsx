import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ServicePackage, Service } from "@/types/service";
import { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";
import { Plus, X, Package, ShoppingBag } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";

// Mock de serviços para seleção
const mockAvailableServices: Service[] = [
  {
    id: 1,
    name: "Corte Feminino",
    description: "Corte feminino tradicional",
    category: "Corte",
    duration: 60,
    price: 80,
    status: "active",
    commission: {
      type: "percentage",
      value: 50
    },
    professionals: [1, 2],
    products: []
  },
  {
    id: 2,
    name: "Coloração",
    description: "Coloração completa",
    category: "Tintura",
    duration: 120,
    price: 150,
    status: "active",
    commission: {
      type: "percentage",
      value: 40
    },
    professionals: [1, 3],
    products: []
  },
  {
    id: 3,
    name: "Manicure",
    description: "Esmaltação simples",
    category: "Manicure",
    duration: 45,
    price: 50,
    status: "active",
    commission: {
      type: "percentage",
      value: 60
    },
    professionals: [3],
    products: []
  },
];

// Mock de produtos para seleção
const mockAvailableProducts: Product[] = [
  {
    id: 1,
    name: "Shampoo Profissional",
    price: 45,
    stock: 10,
    category: "Cabelo",
  },
  {
    id: 2,
    name: "Condicionador",
    price: 40,
    stock: 15,
    category: "Cabelo",
  },
  {
    id: 3,
    name: "Máscara Capilar",
    price: 60,
    stock: 8,
    category: "Tratamento",
  },
];

interface ServicePackageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (servicePackage: Partial<ServicePackage>) => void;
  servicePackage?: ServicePackage;
}

interface PackageService {
  id: number;
  name: string;
  price: number;
}

interface PackageProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export function ServicePackageForm({
  open,
  onOpenChange,
  onSubmit,
  servicePackage,
}: ServicePackageFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<ServicePackage>>({
    name: "",
    description: "",
    services: [],
    products: [],
    discount: 10,
    status: "active",
  });

  const [selectedServices, setSelectedServices] = useState<PackageService[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<PackageProduct[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("services");

  useEffect(() => {
    if (servicePackage) {
      setFormData(servicePackage);
      
      // Carrega serviços (em uma aplicação real, você buscaria os dados dos serviços)
      const serviceDetails = servicePackage.services?.map(serviceId => {
        const service = mockAvailableServices.find(s => s.id === serviceId);
        return service ? {
          id: service.id,
          name: service.name,
          price: service.price
        } : null;
      }).filter(Boolean) as PackageService[];
      
      setSelectedServices(serviceDetails || []);
      
      // Carrega produtos (em uma aplicação real, você buscaria os dados dos produtos)
      const productDetails = servicePackage.products?.map(product => {
        const productInfo = mockAvailableProducts.find(p => p.id === product.productId);
        return productInfo ? {
          id: productInfo.id,
          name: productInfo.name,
          price: productInfo.price,
          quantity: product.quantity
        } : null;
      }).filter(Boolean) as PackageProduct[];
      
      setSelectedProducts(productDetails || []);
    } else {
      setFormData({
        name: "",
        description: "",
        services: [],
        products: [],
        discount: 10,
        status: "active",
      });
      setSelectedServices([]);
      setSelectedProducts([]);
    }
  }, [servicePackage, open]);
  
  const handleAddService = () => {
    if (!selectedServiceId) return;
    
    const serviceId = Number(selectedServiceId);
    // Evita adicionar serviço duplicado
    if (selectedServices.some(s => s.id === serviceId)) {
      toast({
        title: "Serviço já adicionado",
        description: "Este serviço já está incluído no pacote.",
        variant: "destructive",
      });
      return;
    }
    
    const service = mockAvailableServices.find(s => s.id === serviceId);
    if (service) {
      const newService = {
        id: service.id,
        name: service.name,
        price: service.price,
      };
      
      setSelectedServices([...selectedServices, newService]);
      setFormData(prev => ({
        ...prev,
        services: [...(prev.services || []), service.id],
      }));
      
      setSelectedServiceId("");
    }
  };
  
  const handleRemoveService = (serviceId: number) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
    setFormData(prev => ({
      ...prev,
      services: (prev.services || []).filter(id => id !== serviceId),
    }));
  };
  
  const handleAddProduct = () => {
    if (!selectedProductId || productQuantity <= 0) return;
    
    const productId = Number(selectedProductId);
    // Evita adicionar produto duplicado
    if (selectedProducts.some(p => p.id === productId)) {
      toast({
        title: "Produto já adicionado",
        description: "Este produto já está incluído no pacote.",
        variant: "destructive",
      });
      return;
    }
    
    const product = mockAvailableProducts.find(p => p.id === productId);
    if (product) {
      const newProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: productQuantity,
      };
      
      setSelectedProducts([...selectedProducts, newProduct]);
      setFormData(prev => ({
        ...prev,
        products: [...(prev.products || []), { productId: product.id, quantity: productQuantity }],
      }));
      
      setSelectedProductId("");
      setProductQuantity(1);
    }
  };
  
  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    setFormData(prev => ({
      ...prev,
      products: (prev.products || []).filter(item => item.productId !== productId),
    }));
  };

  const calculateTotalPrice = () => {
    const servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
    const productsTotal = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    return servicesTotal + productsTotal;
  };

  const calculateDiscountedPrice = () => {
    const total = calculateTotalPrice();
    const discount = (formData.discount || 0) / 100;
    return total * (1 - discount);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Limita o desconto a valores entre 0 e 100
    const limitedValue = isNaN(value) ? 0 : Math.min(Math.max(0, value), 100);
    setFormData({
      ...formData,
      discount: limitedValue,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha o nome do pacote.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedServices.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Adicione pelo menos um serviço ao pacote.",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(formData);
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
                <Package className="h-5 w-5 text-white" />
                {servicePackage ? "Editar Pacote" : "Novo Pacote de Serviços"}
              </SheetTitle>
              <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </SheetClose>
            </div>
            <SheetDescription className="text-blue-100">
              Crie um pacote com desconto em serviços e produtos combinados
            </SheetDescription>
          </SheetHeader>
        </div>
        
        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome do Pacote <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  placeholder="Ex: Dia da Noiva"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Descrição
                </label>
                <Textarea
                  id="description"
                  placeholder="Descrição detalhada do pacote..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="discount" className="text-sm font-medium">
                    Desconto (%) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleDiscountChange}
                    className="w-full"
                    required
                  />
                  {formData.discount && formData.discount > 100 && (
                    <p className="text-xs text-red-500 mt-1">
                      O desconto não pode ser maior que 100%
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <span className="text-sm">Ativo</span>
                    <Switch
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

              <div className="p-4 border rounded-md bg-muted/40 space-y-3">
                <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex items-center justify-between mb-3">
                    <TabsList>
                      <TabsTrigger value="services" className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Serviços
                      </TabsTrigger>
                      <TabsTrigger value="products" className="flex items-center gap-1">
                        <ShoppingBag className="h-4 w-4" />
                        Produtos
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="services" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Select value={selectedServiceId.toString()} onValueChange={(value) => setSelectedServiceId(Number(value))}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAvailableServices.map((service) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.name} - {formatCurrency(service.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddService}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    
                    {selectedServices.length > 0 ? (
                      <div className="space-y-2">
                        {selectedServices.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-2 bg-background rounded border">
                            <span>{service.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{formatCurrency(service.price)}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveService(service.id)}
                                className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        Nenhum serviço adicionado ao pacote.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="products" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Select value={selectedProductId.toString()} onValueChange={(value) => setSelectedProductId(Number(value))}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAvailableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - {formatCurrency(product.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                        className="w-[80px]"
                        placeholder="Qtd"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddProduct}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    
                    {selectedProducts.length > 0 ? (
                      <div className="space-y-2">
                        {selectedProducts.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-2 bg-background rounded border">
                            <div>
                              <span>{product.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                (Qtd: {product.quantity})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{formatCurrency(product.price * product.quantity)}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveProduct(product.id)}
                                className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        Nenhum produto adicionado ao pacote.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                
                {(selectedServices.length > 0 || selectedProducts.length > 0) && (
                  <div className="flex items-center justify-between pt-2 border-t mt-2">
                    <div>
                      <div className="text-sm font-medium">Valor Total</div>
                      <div className="text-sm text-muted-foreground">Desconto de {formData.discount}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm line-through text-muted-foreground">{formatCurrency(calculateTotalPrice())}</div>
                      <div className="font-medium text-primary">{formatCurrency(calculateDiscountedPrice())}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
        
        {/* Rodapé fixo */}
        <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
          <div className="flex flex-row gap-3 w-full justify-end">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={selectedServices.length === 0 || (formData.discount || 0) > 100}
            >
              {servicePackage ? "Atualizar" : "Criar"} Pacote
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
