
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ServicePackage } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
import { PackageHeader } from "./packages/PackageHeader";
import { PackageFormFields } from "./packages/PackageFormFields";
import { PackageTabContent } from "./packages/PackageTabContent";
import { PackageFormFooter } from "./packages/PackageFormFooter";
import { useMockServiceData } from "./packages/useMockServiceData";

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
  const { mockAvailableServices, mockAvailableProducts } = useMockServiceData();
  
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
        // Ensure product.productId is treated as a string
        const productStringId = String(product.productId);
        const productInfo = mockAvailableProducts.find(p => p.id === productStringId);
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
  }, [servicePackage, open, mockAvailableServices, mockAvailableProducts]);
  
  const handleAddService = (serviceId: number) => {
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
    const product = mockAvailableProducts.find(p => p.id === productId);
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
              availableServices={mockAvailableServices}
              availableProducts={mockAvailableProducts}
              handleAddService={handleAddService}
              handleRemoveService={handleRemoveService}
              handleAddProduct={handleAddProduct}
              handleRemoveProduct={handleRemoveProduct}
              calculateTotalPrice={calculateTotalPrice}
              calculateDiscountedPrice={calculateDiscountedPrice}
              discount={formData.discount || 0}
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
