
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
  profileState: {
    isProfileComplete: boolean;
    isFirstLogin: boolean;
    trialEndsAt: Date | null;
    subscriptionActive: boolean;
  };
  setProfileState: React.Dispatch<React.SetStateAction<{
    isProfileComplete: boolean;
    isFirstLogin: boolean;
    trialEndsAt: Date | null;
    subscriptionActive: boolean;
  }>>;
  updateProfileCompletion: (isComplete: boolean) => void;
  updateSubscriptionStatus: (isActive: boolean) => void;
  establishmentName: string;
  setEstablishmentName: (name: string) => void;
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

// Data atual + 7 dias para o período de teste (atualizado de 7 dias)
const trialEndDate = new Date();
trialEndDate.setDate(trialEndDate.getDate() + 7);

const initialProfileState = {
  isProfileComplete: false,
  isFirstLogin: true,
  trialEndsAt: trialEndDate,
  subscriptionActive: false,
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogsState, setDialogsState] = useState(initialDialogsState);
  const [profileState, setProfileState] = useState(initialProfileState);
  const [establishmentName, setEstablishmentName] = useState('Meu Salão');

  useEffect(() => {
    console.log('AppStateProvider inicializado', { dialogsState, profileState });
    
    // Verificar no localStorage se já tem perfil completo
    const storedProfileComplete = localStorage.getItem('profileComplete');
    const storedFirstLogin = localStorage.getItem('firstLogin');
    const storedTrialEnds = localStorage.getItem('trialEndsAt');
    const storedSubscription = localStorage.getItem('subscriptionActive');
    const storedName = localStorage.getItem('establishmentName');
    
    if (storedName) {
      setEstablishmentName(storedName);
    }
    
    if (storedProfileComplete || storedFirstLogin || storedTrialEnds || storedSubscription) {
      setProfileState(prev => ({
        ...prev,
        isProfileComplete: storedProfileComplete === 'true',
        isFirstLogin: storedFirstLogin === 'true',
        trialEndsAt: storedTrialEnds ? new Date(storedTrialEnds) : prev.trialEndsAt,
        subscriptionActive: storedSubscription === 'true'
      }));
    }
  }, []);

  // Função para atualizar o estado de conclusão do perfil
  const updateProfileCompletion = (isComplete: boolean) => {
    setProfileState(prev => ({ ...prev, isProfileComplete: isComplete }));
    localStorage.setItem('profileComplete', isComplete.toString());
  };

  // Função para atualizar o estado da assinatura
  const updateSubscriptionStatus = (isActive: boolean) => {
    setProfileState(prev => ({ ...prev, subscriptionActive: isActive }));
    localStorage.setItem('subscriptionActive', isActive.toString());
  };

  // Atualizar o localStorage quando o nome do estabelecimento mudar
  useEffect(() => {
    localStorage.setItem('establishmentName', establishmentName);
  }, [establishmentName]);

  return (
    <AppStateContext.Provider 
      value={{ 
        dialogsState, 
        setDialogsState, 
        profileState, 
        setProfileState, 
        updateProfileCompletion, 
        updateSubscriptionStatus,
        establishmentName,
        setEstablishmentName
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}; 
