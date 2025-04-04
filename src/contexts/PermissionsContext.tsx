
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = 'admin' | 'manager' | 'professional' | 'receptionist' | 'user' | 'none';

interface Permissions {
  view_dashboard: boolean;
  view_appointments: boolean;
  view_clients: boolean;
  view_services: boolean;
  view_professionals: boolean;
  view_pdv: boolean;
  view_financial: boolean;
  view_stock: boolean;
  view_marketing: boolean;
  view_messaging: boolean;
  view_reports: boolean;
  view_settings: boolean;
  edit_appointments: boolean;
  edit_clients: boolean;
  edit_services: boolean;
  edit_professionals: boolean;
  edit_financial: boolean;
  edit_stock: boolean;
  edit_marketing: boolean;
}

interface PermissionsContextType {
  userRole: UserRole;
  permissions: Permissions;
  isLoading: boolean;
  hasPermission: (permission: keyof Permissions) => boolean;
  refreshPermissions: () => Promise<void>;
}

const defaultPermissions: Permissions = {
  view_dashboard: false,
  view_appointments: false,
  view_clients: false,
  view_services: false,
  view_professionals: false,
  view_pdv: false,
  view_financial: false,
  view_stock: false,
  view_marketing: false,
  view_messaging: false,
  view_reports: false,
  view_settings: false,
  edit_appointments: false,
  edit_clients: false,
  edit_services: false,
  edit_professionals: false,
  edit_financial: false,
  edit_stock: false,
  edit_marketing: false,
};

const PermissionsContext = createContext<PermissionsContextType>({
  userRole: 'none',
  permissions: defaultPermissions,
  isLoading: true,
  hasPermission: () => false,
  refreshPermissions: async () => {},
});

export const usePermissions = () => useContext(PermissionsContext);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions);
  const [isLoading, setIsLoading] = useState(true);

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = (permission: keyof Permissions) => {
    return permissions[permission];
  };

  // Função para buscar as permissões do usuário atual
  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('get_current_user_permissions');
      
      if (error) {
        console.error("Erro ao buscar permissões:", error);
        return;
      }
      
      if (data) {
        setUserRole(data.role as UserRole);
        setPermissions(data.permissions as Permissions);
      }
    } catch (error) {
      console.error("Erro ao buscar permissões:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para buscar as permissões ao carregar o componente
  useEffect(() => {
    const fetchInitialPermissions = async () => {
      await fetchPermissions();
    };

    // Verificar se o usuário está autenticado
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchInitialPermissions();
      } else if (event === 'SIGNED_OUT') {
        setUserRole('none');
        setPermissions(defaultPermissions);
      }
    });

    fetchInitialPermissions();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Função para atualizar as permissões
  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  return (
    <PermissionsContext.Provider
      value={{
        userRole,
        permissions,
        isLoading,
        hasPermission,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};
