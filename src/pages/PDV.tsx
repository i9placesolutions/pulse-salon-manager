
import { ClosedCashier } from "@/components/pdv/ClosedCashier";
import { PDVHeader } from "@/components/pdv/PDVHeader";
import { ProductGrid } from "@/components/pdv/ProductGrid";
import { Cart } from "@/components/pdv/Cart";
import { PaymentDialog } from "@/components/pdv/PaymentDialog";
import { ClientSelectDialog } from "@/components/pdv/ClientSelectDialog";
import { CashierCloseDialog } from "@/components/pdv/CashierCloseDialog";
import { usePDV } from "@/hooks/usePDV";
import { mockProducts, mockClients } from "@/data/mockPdvData";

const PDV = () => {
  const pdv = usePDV();

  if (!pdv.state.isDayStarted) {
    return (
      <ClosedCashier
        isOpenCashierDialog={pdv.isOpenCashierDialog}
        setIsOpenCashierDialog={pdv.setIsOpenCashierDialog}
        openingAmount={pdv.openingAmount}
        onOpeningAmountChange={pdv.setOpeningAmount}
        handleOpenCashier={pdv.handleOpenCashier}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <PDVHeader
        selectedClient={pdv.selectedClient}
        onOpenClientDialog={() => pdv.setIsClientDialogOpen(true)}
        onCloseCashier={() => pdv.setIsCloseCashierDialog(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="container mx-auto">
            <ProductGrid
              products={mockProducts}
              searchTerm={pdv.searchTerm}
              onSearchChange={pdv.setSearchTerm}
              onProductClick={pdv.addToCart}
            />
          </div>
        </div>

        <div className="w-[400px] border-l bg-card">
          <Cart
            items={pdv.cart}
            selectedClient={pdv.selectedClient}
            cartSubtotal={pdv.cartSubtotal}
            cartTotal={pdv.cartTotal}
            discount={pdv.discount}
            discountType={pdv.discountType}
            surcharge={pdv.surcharge}
            surchargeType={pdv.surchargeType}
            onRemoveItem={pdv.removeFromCart}
            onUpdateQuantity={pdv.updateItemQuantity}
            onDiscountClick={() => {}} // TODO: Implement discount dialog
            onSurchargeClick={() => {}} // TODO: Implement surcharge dialog
            onRemoveDiscount={() => {
              pdv.setDiscount(0);
              pdv.updateCartTotals(pdv.cart);
            }}
            onRemoveSurcharge={() => {
              pdv.setSurcharge(0);
              pdv.updateCartTotals(pdv.cart);
            }}
            onCheckout={() => pdv.setIsCheckoutOpen(true)}
          />
        </div>
      </div>

      <PaymentDialog 
        isOpen={pdv.isCheckoutOpen} 
        onOpenChange={pdv.setIsCheckoutOpen} 
        cartTotal={pdv.cartTotal}
        selectedPaymentMethod={pdv.selectedPaymentMethod}
        onSelectPaymentMethod={pdv.setSelectedPaymentMethod}
        paymentAmount={pdv.paymentAmount}
        onPaymentAmountChange={pdv.setPaymentAmount}
        onAddPayment={pdv.addPayment}
        paymentMethods={pdv.paymentMethods}
        remainingAmount={pdv.remainingAmount}
        changeAmount={pdv.changeAmount}
        onFinalize={pdv.finalizeSale}
      />

      <ClientSelectDialog 
        isOpen={pdv.isClientDialogOpen} 
        onOpenChange={pdv.setIsClientDialogOpen}
        clients={mockClients}
        onSelect={pdv.setSelectedClient}
      />

      <CashierCloseDialog 
        isOpen={pdv.isCloseCashierDialog}
        onOpenChange={pdv.setIsCloseCashierDialog}
        initialAmount={pdv.state.cashierSession?.initialAmount || 0}
        sales={pdv.state.recentSales}
        onConfirm={pdv.handleCloseCashier}
      />
    </div>
  );
};

export default PDV;
