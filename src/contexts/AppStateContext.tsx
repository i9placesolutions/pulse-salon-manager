import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppStateContextType {
  dialogsState: {
    isOpeningDialogOpen: boolean;
    isClosingDialogOpen: boolean;
    isClientDialogOpen: boolean;
    isPaymentDialogOpen: boolean;
    isReportDialogOpen: boolean;
    isCashOperationDialogOpen: boolean;
    isOrderDialogOpen: boolean;
  };
  setDialogsState: React.Dispatch<React.SetStateAction<{
    isOpeningDialogOpen: boolean;
    isClosingDialogOpen: boolean;
    isClientDialogOpen: boolean;
    isPaymentDialogOpen: boolean;
    isReportDialogOpen: boolean;
    isCashOperationDialogOpen: boolean;
    isOrderDialogOpen: boolean;
  }>>;
}

const initialDialogsState = {
  isOpeningDialogOpen: false,
  isClosingDialogOpen: false,
  isClientDialogOpen: false,
  isPaymentDialogOpen: false,
  isReportDialogOpen: false,
  isCashOperationDialogOpen: false,
  isOrderDialogOpen: false,
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogsState, setDialogsState] = useState(initialDialogsState);

  useEffect(() => {
    console.log('AppStateProvider inicializado', { dialogsState });
  }, []);

  return (
    <AppStateContext.Provider value={{ dialogsState, setDialogsState }}>
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
