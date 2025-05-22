
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ServicePackage } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
import { PackageHeader } from "./packages/PackageHeader";
import { PackageFormFields } from "./packages/PackageFormFields";
import { PackageTabContent } from "./packages/PackageTabContent";
import { PackageFormFooter } from "./packages/PackageFormFooter";
import { usePackageData } from "./packages/usePackageData";
import { supabase } from "@/lib/supabaseClient";

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
  id: string;
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
  const { 
    availableServices, 
    availableProducts, 
    isLoadingServices, 
    isLoadingProducts, 
    error 
  } = usePackageData();
  
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
  const [activeTab, setActiveTab] = useState<string>("services");
  const [isLoadingPackageData, setIsLoadingPackageData] = useState(false);

  useEffect(() => {
    const loadPackageData = async () => {
      if (!servicePackage) {
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
        return;
      }
      
      setIsLoadingPackageData(true);
      setFormData(servicePackage);
      
      try {
        // Carrega serviços do pacote a partir do Supabase
        if (servicePackage.services && servicePackage.services.length > 0) {
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('id, name, price')
            .in('id', servicePackage.services);
          
          if (servicesError) {
            console.error('Erro ao carregar serviços do pacote:', servicesError);
            toast({
              title: "Erro ao carregar serviços",
              description: "Não foi possível carregar os serviços deste pacote.",
              variant: "destructive",
            });
          } else if (servicesData) {
            const serviceDetails = servicesData.map(service => ({
              id: service.id,
              name: service.name,
              price: Number(service.price),
            }));
            
            setSelectedServices(serviceDetails);
          }
        }
        
        // Carrega produtos do pacote a partir do Supabase
        if (servicePackage.products && servicePackage.products.length > 0) {
          const productIds = servicePackage.products.map(p => p.productId);
          
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, name, sale_price')
            .in('id', productIds);
          
          if (productsError) {
            console.error('Erro ao carregar produtos do pacote:', productsError);
            toast({
              title: "Erro ao carregar produtos",
              description: "Não foi possível carregar os produtos deste pacote.",
              variant: "destructive",
            });
          } else if (productsData) {
            const productDetails = productsData.map(product => {
              const packageProduct = servicePackage.products?.find(p => p.productId === product.id);
              return {
                id: product.id.toString(),
                name: product.name,
                price: Number(product.sale_price),
                quantity: packageProduct?.quantity || 1
              };
            });
            
            setSelectedProducts(productDetails);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do pacote:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados do pacote.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPackageData(false);
      }
    };
    
    if (open) {
      loadPackageData();
    }
  }, [servicePackage, open, toast]);
  
  const handleAddService = (serviceId: number) => {
    const service = availableServices.find(s => s.id === serviceId);
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
    }
  };
  
  const handleRemoveService = (serviceId: number) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
    setFormData(prev => ({
      ...prev,
      services: (prev.services || []).filter(id => id !== serviceId),
    }));
  };
  
  const handleAddProduct = (productId: string, quantity: number) => {
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      const newProduct: PackageProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
      };
      
      setSelectedProducts([...selectedProducts, newProduct]);
      setFormData(prev => ({
        ...prev,
        products: [...(prev.products || []), { 
          productId: Number(product.id), // Convert to number for ServicePackage structure
          quantity: quantity 
        }],
      }));
    }
  };
  
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    setFormData(prev => ({
      ...prev,
      products: (prev.products || []).filter(item => String(item.productId) !== productId),
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
        <PackageHeader isEditing={!!servicePackage} />
        
        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <form className="space-y-6">
            <PackageFormFields 
              formData={formData} 
              setFormData={setFormData} 
            />

            <PackageTabContent 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedServices={selectedServices}
              selectedProducts={selectedProducts}
              availableServices={availableServices}
              availableProducts={availableProducts}
              handleAddService={handleAddService}
              handleRemoveService={handleRemoveService}
              handleAddProduct={handleAddProduct}
              handleRemoveProduct={handleRemoveProduct}
              calculateTotalPrice={calculateTotalPrice}
              calculateDiscountedPrice={calculateDiscountedPrice}
              discount={formData.discount || 0}
              isLoadingServices={isLoadingServices}
              isLoadingProducts={isLoadingProducts}
              isLoadingPackageData={isLoadingPackageData}
            />
          </form>
        </div>
        
        <PackageFormFooter 
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isSubmitDisabled={selectedServices.length === 0 || (formData.discount || 0) > 100}
          isEditing={!!servicePackage}
        />
      </SheetContent>
    </Sheet>
  );
}
