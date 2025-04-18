import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/pulseDadosClient';

// Tipos para diferentes áreas do sistema
interface UserState {
  currentUser: any | null;
  isAuthenticated: boolean;
  role: string | null;
  permissions: string[];
}

interface ClientState {
  selectedClient: any | null;
  recentClients: any[];
  clientsLoading: boolean;
}

interface AppointmentState {
  selectedAppointment: any | null;
  todayAppointments: any[];
  upcomingAppointments: any[];
  appointmentsLoading: boolean;
}

interface ProfessionalState {
  selectedProfessional: any | null;
  availableProfessionals: any[];
  professionalsLoading: boolean;
}

interface FinancialState {
  dailyRevenue: number;
  monthlyRevenue: number;
  pendingPayments: any[];
  financialLoading: boolean;
}

interface NotificationState {
  notifications: any[];
  unreadCount: number;
}

// Estado global da aplicação
interface AppStateContextType {
  // Estado original de diálogos
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
  
  // Estados globais para diferentes áreas
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
  
  clients: ClientState;
  setClients: React.Dispatch<React.SetStateAction<ClientState>>;
  
  appointments: AppointmentState;
  setAppointments: React.Dispatch<React.SetStateAction<AppointmentState>>;
  
  professionals: ProfessionalState;
  setProfessionals: React.Dispatch<React.SetStateAction<ProfessionalState>>;
  
  financial: FinancialState;
  setFinancial: React.Dispatch<React.SetStateAction<FinancialState>>;
  
  notifications: NotificationState;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationState>>;
  
  // Sistema de eventos global
  publishEvent: (eventName: string, data: any) => void;
  subscribeToEvent: (eventName: string, callback: (data: any) => void) => () => void;
  
  // Métodos de comunicação
  refreshData: (area: string) => Promise<void>;
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  shareData: (key: string, value: any) => void;
  getSharedData: (key: string) => any;
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

const initialUserState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  role: null,
  permissions: [],
};

const initialClientState: ClientState = {
  selectedClient: null,
  recentClients: [],
  clientsLoading: false,
};

const initialAppointmentState: AppointmentState = {
  selectedAppointment: null,
  todayAppointments: [],
  upcomingAppointments: [],
  appointmentsLoading: false,
};

const initialProfessionalState: ProfessionalState = {
  selectedProfessional: null,
  availableProfessionals: [],
  professionalsLoading: false,
};

const initialFinancialState: FinancialState = {
  dailyRevenue: 0,
  monthlyRevenue: 0,
  pendingPayments: [],
  financialLoading: false,
};

const initialNotificationState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogsState, setDialogsState] = useState(initialDialogsState);
  const [user, setUser] = useState(initialUserState);
  const [clients, setClients] = useState(initialClientState);
  const [appointments, setAppointments] = useState(initialAppointmentState);
  const [professionals, setProfessionals] = useState(initialProfessionalState);
  const [financial, setFinancial] = useState(initialFinancialState);
  const [notifications, setNotifications] = useState(initialNotificationState);
  
  // Cache para dados compartilhados entre componentes
  const [sharedDataCache] = useState<Map<string, any>>(new Map());
  
  // Sistema de eventos
  const [eventListeners] = useState<Map<string, Array<(data: any) => void>>>(new Map());
  
  // Publicar evento para todos os ouvintes
  const publishEvent = (eventName: string, data: any) => {
    const listeners = eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  };
  
  // Assinar a um evento
  const subscribeToEvent = (eventName: string, callback: (data: any) => void) => {
    if (!eventListeners.has(eventName)) {
      eventListeners.set(eventName, []);
    }
    
    const listeners = eventListeners.get(eventName)!;
    listeners.push(callback);
    
    // Retorna função para cancelar assinatura
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };
  
  // Atualizar dados
  const refreshData = async (area: string) => {
    try {
      switch(area) {
        case 'clients':
          setClients(prev => ({ ...prev, clientsLoading: true }));
          const { data: clientsData } = await supabase.from('clients').select('*').order('name', { ascending: true });
          setClients(prev => ({ 
            ...prev, 
            recentClients: clientsData || [],
            clientsLoading: false
          }));
          break;
          
        case 'appointments':
          setAppointments(prev => ({ ...prev, appointmentsLoading: true }));
          const today = new Date().toISOString().split('T')[0];
          
          const { data: todayAppts } = await supabase
            .from('appointments')
            .select('*')
            .eq('date', today);
            
          const { data: upcomingAppts } = await supabase
            .from('appointments')
            .select('*')
            .gt('date', today)
            .order('date', { ascending: true })
            .limit(10);
            
          setAppointments(prev => ({ 
            ...prev, 
            todayAppointments: todayAppts || [],
            upcomingAppointments: upcomingAppts || [],
            appointmentsLoading: false
          }));
          break;
          
        case 'professionals':
          setProfessionals(prev => ({ ...prev, professionalsLoading: true }));
          const { data: profsData } = await supabase.from('professionals').select('*').order('name', { ascending: true });
          setProfessionals(prev => ({ 
            ...prev, 
            availableProfessionals: profsData || [],
            professionalsLoading: false
          }));
          break;
          
        case 'financial':
          setFinancial(prev => ({ ...prev, financialLoading: true }));
          // Implementar busca de dados financeiros
          setFinancial(prev => ({ 
            ...prev,
            financialLoading: false
          }));
          break;
          
        case 'notifications':
          const { data: notifs } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
            
          setNotifications({
            notifications: notifs || [],
            unreadCount: notifs?.filter(n => !n.read)?.length || 0
          });
          break;
          
        default:
          console.warn(`Área desconhecida: ${area}`);
      }
    } catch (error) {
      console.error(`Erro ao atualizar dados de ${area}:`, error);
    }
  };
  
  // Exibir notificação
  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    publishEvent('notification', { message, type });
  };
  
  // Compartilhar dados entre componentes
  const shareData = (key: string, value: any) => {
    sharedDataCache.set(key, value);
  };
  
  // Obter dados compartilhados
  const getSharedData = (key: string) => {
    return sharedDataCache.get(key);
  };
  
  // Carregar dados do usuário no login
  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setUser({
            currentUser: userData.user,
            isAuthenticated: true,
            role: userData.user.app_metadata?.role || null,
            permissions: userData.user.app_metadata?.permissions || []
          });
        }
      }
    };
    
    fetchUserData();
    
    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            setUser({
              currentUser: userData.user,
              isAuthenticated: true,
              role: userData.user.app_metadata?.role || null,
              permissions: userData.user.app_metadata?.permissions || []
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(initialUserState);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  return (
    <AppStateContext.Provider value={{ 
      dialogsState, 
      setDialogsState,
      user,
      setUser,
      clients,
      setClients,
      appointments,
      setAppointments,
      professionals,
      setProfessionals,
      financial,
      setFinancial,
      notifications,
      setNotifications,
      publishEvent,
      subscribeToEvent,
      refreshData,
      showNotification,
      shareData,
      getSharedData
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState deve ser usado dentro de um AppStateProvider');
  }
  return context;
};
