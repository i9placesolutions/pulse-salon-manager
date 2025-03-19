
import React, { createContext, useContext, useState } from 'react';
import type { PDVState, Sale, CashierSession, SaleFilters } from '@/types/pdv';

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
