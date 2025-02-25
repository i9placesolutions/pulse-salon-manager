
import { useState } from "react";
import type { PDVState, Sale, SaleItem, Payment } from "@/types/pdv";
import { useToast } from "@/hooks/use-toast";

export function usePDV() {
  const { toast } = useToast();
  const [state, setState] = useState<PDVState>({
    cashierSession: null,
    currentSale: null,
    recentSales: [],
    isDayStarted: false,
    isProcessingPayment: false
  });
  const [isOpenCashierDialog, setIsOpenCashierDialog] = useState(false);
  const [isCloseCashierDialog, setIsCloseCashierDialog] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<Payment[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("cash");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [surcharge, setSurcharge] = useState(0);
  const [surchargeType, setSurchargeType] = useState<'fixed' | 'percentage'>('fixed');

  const updateCartTotals = (items: SaleItem[]) => {
    const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
    setCartSubtotal(subtotal);
    
    let total = subtotal;
    
    if (discount > 0) {
      const discountValue = discountType === 'percentage' 
        ? (subtotal * discount) / 100 
        : discount;
      total = total - discountValue;
    }
    
    if (surcharge > 0) {
      const surchargeValue = surchargeType === 'percentage'
        ? (subtotal * surcharge) / 100
        : surcharge;
      total = total + surchargeValue;
    }
    
    total = Math.max(0, total);
    
    setCartTotal(total);
    setRemainingAmount(total);
  };

  const addToCart = (product: any) => {
    const newItem: SaleItem = {
      id: Date.now(),
      type: product.category.toLowerCase() === "serviço" ? "service" : "product",
      name: product.name,
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price
    };
    setCart(prev => [...prev, newItem]);
    updateCartTotals([...cart, newItem]);
  };

  const updateItemQuantity = (itemId: number, newQuantity: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        };
      }
      return item;
    });
    setCart(updatedCart);
    updateCartTotals(updatedCart);
  };

  const removeFromCart = (itemId: number) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    updateCartTotals(updatedCart);
  };

  const addPayment = () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    const amount = Number(paymentAmount);
    const newPayment: Payment = {
      id: Date.now(),
      method: selectedPaymentMethod as any,
      amount,
      status: 'completed',
      date: new Date()
    };
    if (selectedPaymentMethod === 'cash' && amount > remainingAmount) {
      setChangeAmount(amount - remainingAmount);
    }
    setPaymentMethods(prev => [...prev, newPayment]);
    setRemainingAmount(prev => Math.max(0, prev - amount));
    setPaymentAmount("");
  };

  const finalizeSale = () => {
    if (remainingAmount > 0) {
      toast({
        title: "Erro ao finalizar venda",
        description: "Ainda há valor pendente para pagamento",
        variant: "destructive"
      });
      return;
    }
    const newSale: Sale = {
      id: Date.now(),
      items: cart,
      total: cartTotal,
      subtotal: cartTotal,
      payments: paymentMethods,
      status: 'completed',
      date: new Date(),
      cashierSessionId: state.cashierSession?.id || 0,
      client: selectedClient
    };
    setState(prev => ({
      ...prev,
      recentSales: [...prev.recentSales, newSale]
    }));
    setCart([]);
    setPaymentMethods([]);
    setSelectedClient(null);
    setCartTotal(0);
    setRemainingAmount(0);
    setChangeAmount(0);
    setIsCheckoutOpen(false);
    toast({
      title: "Venda finalizada",
      description: "Venda realizada com sucesso!"
    });
  };

  const handleOpenCashier = () => {
    if (!openingAmount || Number(openingAmount) <= 0) {
      toast({
        title: "Erro ao abrir caixa",
        description: "Informe um valor inicial válido.",
        variant: "destructive"
      });
      return;
    }
    setState(prev => ({
      ...prev,
      cashierSession: {
        id: Date.now(),
        openingDate: new Date(),
        initialAmount: Number(openingAmount),
        status: 'open',
        userId: 1,
        sales: [],
        withdrawals: [],
        supplies: []
      },
      isDayStarted: true
    }));
    setIsOpenCashierDialog(false);
    toast({
      title: "Caixa aberto",
      description: `Caixa aberto com saldo inicial de R$ ${Number(openingAmount).toFixed(2)}`
    });
  };

  const handleCloseCashier = () => {
    if (!state.cashierSession) return;
    const totalSales = state.recentSales.reduce((acc, sale) => acc + sale.total, 0);
    const finalAmount = state.cashierSession.initialAmount + totalSales;
    setState(prev => ({
      ...prev,
      cashierSession: {
        ...prev.cashierSession!,
        status: 'closed',
        closingDate: new Date(),
        finalAmount,
        differences: {
          expected: finalAmount,
          actual: finalAmount,
          difference: 0
        }
      },
      isDayStarted: false
    }));
    setIsCloseCashierDialog(false);
    toast({
      title: "Caixa fechado",
      description: "O caixa foi fechado com sucesso!"
    });
  };

  return {
    state,
    isOpenCashierDialog,
    setIsOpenCashierDialog,
    isCloseCashierDialog,
    setIsCloseCashierDialog,
    openingAmount,
    setOpeningAmount,
    searchTerm,
    setSearchTerm,
    cart,
    selectedClient,
    setSelectedClient,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isClientDialogOpen,
    setIsClientDialogOpen,
    paymentMethods,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentAmount,
    setPaymentAmount,
    cartSubtotal,
    cartTotal,
    remainingAmount,
    changeAmount,
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    surcharge,
    setSurcharge,
    surchargeType,
    setSurchargeType,
    updateCartTotals,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    addPayment,
    finalizeSale,
    handleOpenCashier,
    handleCloseCashier
  };
}
