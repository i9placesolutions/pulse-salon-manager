import React, { createContext, useContext, useState } from 'react';

export interface SaleFilters {
  startDate: Date | null;
  endDate: Date | null;
  status: string | null;
  clientId: string | null;
  minAmount: number | null;
  maxAmount: number | null;
}

export interface CashierSession {
  id: string;
  openingDate: string;
  closingDate: string | null;
  initialAmount: number;
  finalAmount: number;
  status: 'open' | 'closed';
  userId: string;
  sales: any[];
  withdrawals: any[];
  supplies: any[];
}

export interface PDVState {
  cashierSession: CashierSession | null;
  currentSale: any | null;
  draftSales: any[];
  pendingSales: any[];
  completedSales: any[];
  filters: SaleFilters;
  isDayStarted?: boolean;
}

interface AppStateContextType {
  pdvState: PDVState;
  setPdvState: React.Dispatch<React.SetStateAction<PDVState>>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pdvState, setPdvState] = useState<PDVState>({
    cashierSession: null,
    currentSale: null,
    draftSales: [],
    pendingSales: [],
    completedSales: [],
    filters: {
      startDate: null,
      endDate: null,
      status: null,
      clientId: null,
      minAmount: null,
      maxAmount: null
    }
  });

  return (
    <AppStateContext.Provider value={{ pdvState, setPdvState }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}; 