
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  userAvatar: string | null;
  setUserAvatar: (url: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
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
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    console.log('AppStateProvider inicializado', { dialogsState, profileState });
    
    // Verificar no localStorage se já tem perfil completo
    const storedProfileComplete = localStorage.getItem('profileComplete');
    const storedFirstLogin = localStorage.getItem('firstLogin');
    const storedTrialEnds = localStorage.getItem('trialEndsAt');
    const storedSubscription = localStorage.getItem('subscriptionActive');
    const storedName = localStorage.getItem('establishmentName');
    const storedUserAvatar = localStorage.getItem('userAvatar');
    const storedUserName = localStorage.getItem('userName');
    const storedUserEmail = localStorage.getItem('userEmail');
    
    if (storedName) {
      setEstablishmentName(storedName);
    }
    
    if (storedUserAvatar) {
      setUserAvatar(storedUserAvatar);
    }
    
    if (storedUserName) {
      setUserName(storedUserName);
    }
    
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
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
    
    // Buscar dados do usuário no Supabase
    loadUserData();
  }, []);

  // Função para carregar dados do usuário logado
  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUserEmail(session.user.email || '');
      
      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileData && !profileError) {
        setEstablishmentName(profileData.establishment_name);
        localStorage.setItem('establishmentName', profileData.establishment_name);
      }
      
      // Buscar dados detalhados do estabelecimento
      const { data: detailsData, error: detailsError } = await supabase
        .from('establishment_details')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (detailsData && !detailsError) {
        if (detailsData.logo_url) {
          setUserAvatar(detailsData.logo_url);
          localStorage.setItem('userAvatar', detailsData.logo_url);
        }
        
        if (detailsData.responsible_name) {
          setUserName(detailsData.responsible_name);
          localStorage.setItem('userName', detailsData.responsible_name);
        }
      }
    }
  };

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

  // Atualizar o localStorage quando o avatar do usuário mudar
  useEffect(() => {
    if (userAvatar) {
      localStorage.setItem('userAvatar', userAvatar);
    }
  }, [userAvatar]);

  // Atualizar o localStorage quando o nome do usuário mudar
  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  // Atualizar o localStorage quando o email do usuário mudar
  useEffect(() => {
    localStorage.setItem('userEmail', userEmail);
  }, [userEmail]);

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
        setEstablishmentName,
        userAvatar,
        setUserAvatar,
        userName,
        setUserName,
        userEmail,
        setUserEmail
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
