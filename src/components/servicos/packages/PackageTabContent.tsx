
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingBag } from "lucide-react";
import { ServiceSelector } from "./ServiceSelector";
import { ProductSelector } from "./ProductSelector";
import { PackagePriceSummary } from "./PackagePriceSummary";
import { Service } from "@/types/service";
import { Product } from "@/types/product";
import { Loader2 } from "lucide-react";

interface PackageProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PackageService {
  id: number;
  name: string;
  price: number;
}

interface PackageTabContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedServices: PackageService[];
  selectedProducts: PackageProduct[];
  availableServices: Service[];
  availableProducts: Product[];
  handleAddService: (serviceId: number) => void;
  handleRemoveService: (serviceId: number) => void;
  handleAddProduct: (productId: string, quantity: number) => void;
  handleRemoveProduct: (productId: string) => void;
  calculateTotalPrice: () => number;
  calculateDiscountedPrice: () => number;
  discount: number;
  isLoadingServices?: boolean;
  isLoadingProducts?: boolean;
  isLoadingPackageData?: boolean;
}

export function PackageTabContent({
  activeTab,
  setActiveTab,
  selectedServices,
  selectedProducts,
  availableServices,
  availableProducts,
  handleAddService,
  handleRemoveService,
  handleAddProduct,
  handleRemoveProduct,
  calculateTotalPrice,
  calculateDiscountedPrice,
  discount,
  isLoadingServices = false,
  isLoadingProducts = false,
  isLoadingPackageData = false
}: PackageTabContentProps) {
  const showPriceSummary = selectedServices.length > 0 || selectedProducts.length > 0;

  return (
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
        
        <TabsContent value="services">
          {isLoadingServices || isLoadingPackageData ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-muted-foreground">
                Carregando serviços...
              </span>
            </div>
          ) : (
            <ServiceSelector 
              availableServices={availableServices}
              selectedServices={selectedServices}
              onAddService={handleAddService}
              onRemoveService={handleRemoveService}
            />
          )}
        </TabsContent>
        
        <TabsContent value="products">
          {isLoadingProducts || isLoadingPackageData ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-muted-foreground">
                Carregando produtos...
              </span>
            </div>
          ) : (
            <ProductSelector 
              availableProducts={availableProducts}
              selectedProducts={selectedProducts}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
            />
          )}
        </TabsContent>
      </Tabs>
      
      {showPriceSummary && (
        <PackagePriceSummary 
          totalPrice={calculateTotalPrice()}
          discountedPrice={calculateDiscountedPrice()}
          discount={discount}
        />
      )}
    </div>
  );
}
