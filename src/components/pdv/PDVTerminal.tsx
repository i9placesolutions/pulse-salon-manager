
import { usePDVData } from "@/hooks/usePDVData";
import { SearchBar } from "./SearchBar";
import { ProductGrid } from "./ProductGrid";
import { ClientPanel } from "./ClientPanel";
import { CartPanel } from "./CartPanel";
import { Client, SaleItem } from "@/types/pdv";

interface PDVTerminalProps {
  onViewOrders: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClient: Client | null;
  cartItems: SaleItem[];
  cartTotal: number;
  handleAddToCart: (product: any) => void;
  handleChangeQuantity: (id: string, quantity: number) => void;
  handleRemoveFromCart: (id: string) => void;
  handleOpenPaymentDialog: () => void;
  setIsClientDialogOpen: (isOpen: boolean) => void;
}

export function PDVTerminal({ 
  onViewOrders,
  searchTerm,
  setSearchTerm,
  selectedClient,
  cartItems,
  cartTotal,
  handleAddToCart,
  handleChangeQuantity,
  handleRemoveFromCart,
  handleOpenPaymentDialog,
  setIsClientDialogOpen
}: PDVTerminalProps) {
  const { filteredProducts } = usePDVData();

  // Handlers for cart operations
  const handleIncrement = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      handleChangeQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrement = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      handleChangeQuantity(id, item.quantity - 1);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Product section (left side) */}
      <div className="md:col-span-2 space-y-6">
        <div className="space-y-4">
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onViewOrders={onViewOrders}
          />
          
          <ProductGrid 
            products={filteredProducts}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
      
      {/* Client and Cart section (right side) */}
      <div className="space-y-4">
        <ClientPanel 
          selectedClient={selectedClient}
          onSelectClient={() => setIsClientDialogOpen(true)}
        />
        
        <CartPanel
          cartItems={cartItems}
          cartTotal={cartTotal}
          selectedClient={selectedClient}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemoveFromCart}
          onFinalizeSale={handleOpenPaymentDialog}
        />
      </div>
    </div>
  );
}
