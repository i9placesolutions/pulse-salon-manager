import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export interface UserRole {
  id: number;
  name: string;
  description: string;
  permissions: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface UserSpecialty {
  id: number;
  name: string;
  color: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  role_id?: number;
  role_details?: UserRole | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_professional?: boolean;
  phone?: string | null;
  experience_level?: string | null;
  hire_date?: string | null;
  specialties?: UserSpecialty[];
  status?: string;
}

export interface Permission {
  module: string;
  action: string;
  title: string;
  icon?: string;
  color?: string;
}

export interface PermissionModule {
  name: string;
  title: string;
  icon: string;
  color: string;
  actions: {
    id: string;
    title: string;
  }[];
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [specialties, setSpecialties] = useState<UserSpecialty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [isSpecialtiesLoading, setIsSpecialtiesLoading] = useState(false);
  const { toast } = useToast();

  // Carregar todos os usuários
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Buscar perfis da tabela profiles sem depender da API admin
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
        
      if (profilesError) {
        console.error("Erro ao buscar profiles:", profilesError.message);
        throw profilesError;
      }
      
      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        return;
      }
      
      // Obter IDs dos usuários para buscar dados relacionados
      const userIds = profilesData.map((profile: any) => profile.id);
      
      // Buscar atribuições de funções
      const { data: roleAssignments, error: roleAssignmentsError } = await supabase
        .from("user_role_assignments")
        .select("user_id, role_id");
        
      if (roleAssignmentsError) {
        console.error("Erro ao buscar atribuições de funções:", roleAssignmentsError.message);
      }
      
      // Criar um mapa de atribuições de função por ID de usuário
      const roleAssignmentsMap = (roleAssignments || []).reduce((acc: Record<string, number>, ra: any) => {
        acc[ra.user_id] = ra.role_id;
        return acc;
      }, {});
      
      // Buscar detalhes das funções
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
        
      if (rolesError) {
        console.error("Erro ao buscar funções:", rolesError.message);
      }
      
      // Criar um mapa de funções por ID
      const rolesMap = (rolesData || []).reduce((acc: Record<string, any>, role: any) => {
        acc[role.id] = role;
        return acc;
      }, {});
      
      // Buscar especialidades dos usuários
      const { data: userSpecialties, error: userSpecialtiesError } = await supabase
        .from("user_specialties")
        .select("user_id, specialty_id");
        
      if (userSpecialtiesError) {
        console.error("Erro ao buscar especialidades dos usuários:", userSpecialtiesError.message);
      }
      
      // Agrupar especialidades por usuário
      const userSpecialtiesMap: Record<string, number[]> = {};
      (userSpecialties || []).forEach((us: any) => {
        if (!userSpecialtiesMap[us.user_id]) {
          userSpecialtiesMap[us.user_id] = [];
        }
        userSpecialtiesMap[us.user_id].push(us.specialty_id);
      });
      
      // Buscar detalhes das especialidades
      const { data: specialtiesData, error: specialtiesError } = await supabase
        .from("specialties")
        .select("*");
        
      if (specialtiesError) {
        console.error("Erro ao buscar especialidades:", specialtiesError.message);
      }
      
      // Criar um mapa de especialidades por ID
      const specialtiesMap = (specialtiesData || []).reduce((acc: Record<string, any>, specialty: any) => {
        acc[specialty.id] = specialty;
        return acc;
      }, {});
      
      // Mapear os dados para o formato necessário
      const formattedUsers = profilesData.map((profile: any) => {
        const userId = profile.id;
        const roleId = roleAssignmentsMap[userId];
        const roleDetails = roleId ? rolesMap[roleId] : null;
        const specialtyIds = userSpecialtiesMap[userId] || [];
        
        const userSpecialtiesDetails = specialtyIds.map((specialtyId: number) => {
          const specialty = specialtiesMap[specialtyId] || {};
          return {
            id: specialtyId,
            name: specialty.name || "Desconhecida",
            color: specialty.color || "#cccccc"
          };
        });
        
        // Definir se é profissional com base na função ou na presença de especialidades
        const isProfessional = 
          (roleDetails && roleDetails.name === "Profissional") || 
          profile.role === "Profissional" ||
          userSpecialtiesDetails.length > 0;
        
        return {
          id: userId,
          email: profile.email || "",
          name: profile.name || "",
          role: roleDetails?.name || profile.role || "Usuário",
          role_id: roleId,
          role_details: roleDetails,
          created_at: profile.created_at || "",
          last_sign_in_at: profile.last_sign_in_at || null,
          is_professional: isProfessional,
          phone: profile.whatsapp || null,
          experience_level: null,
          hire_date: null,
          specialties: userSpecialtiesDetails,
          status: "Ativo"
        };
      });

      // Buscar metadados adicionais de autenticação para obter last_sign_in_at
      try {
        // Em vez de usar a API admin, vamos obter dados de sessão do usuário atual
        const { data: sessionData } = await supabase.auth.getSession();
        
        // Buscar dados de sessões recentes da tabela auth.sessions usando RPC
        // Como não podemos acessar diretamente, vamos simular com dados de exemplo
        // Em uma aplicação real, esta informação viria de uma API segura no backend
        
        // Apenas para simulação - em produção isto viria do backend
        const mockLastSignIn: Record<string, string> = {};
        
        // Se tivermos sessão atual, podemos pelo menos atualizar esse usuário
        if (sessionData?.session?.user?.id) {
          const currentUserId = sessionData.session.user.id;
          mockLastSignIn[currentUserId] = new Date().toISOString();
        }
        
        // Atualizar os usuários com os tempos de acesso
        formattedUsers.forEach((user: UserProfile) => {
          // Se tiver um registro mock, usar; caso contrário, manter o que já temos
          if (mockLastSignIn[user.id]) {
            user.last_sign_in_at = mockLastSignIn[user.id];
          }
          
          // Se ainda não tiver data de acesso, mostrar "Nunca acessou"
          if (!user.last_sign_in_at) {
            user.last_sign_in_at = null;
          }
        });
      } catch (authFetchError: any) {
        console.error("Não foi possível obter dados de sessão:", authFetchError.message);
      }

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar funções disponíveis
  const fetchRoles = async () => {
    try {
      setIsRolesLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("id");
        
      if (error) throw error;
      
      setRoles(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar funções:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar funções",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
    } finally {
      setIsRolesLoading(false);
    }
  };

  // Carregar especialidades disponíveis
  const fetchSpecialties = async () => {
    try {
      setIsSpecialtiesLoading(true);
      const { data, error } = await supabase
        .from("specialties")
        .select("*")
        .order("name");
        
      if (error) throw error;
      
      setSpecialties(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar especialidades:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar especialidades",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
    } finally {
      setIsSpecialtiesLoading(false);
    }
  };

  // Adicionar uma nova função
  const addRole = async (role: Omit<UserRole, "id" | "created_at" | "updated_at">) => {
    try {
      setIsRolesLoading(true);
      
      const { data, error } = await supabase
        .from("user_roles")
        .insert([role])
        .select();
        
      if (error) throw error;
      
      if (data) {
        setRoles([...roles, data[0]]);
        toast({
          title: "Função adicionada",
          description: `Função "${role.name}" adicionada com sucesso`,
          variant: "success"
        });
        return data[0];
      }
    } catch (error: any) {
      console.error("Erro ao adicionar função:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar função",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
      return null;
    } finally {
      setIsRolesLoading(false);
    }
  };

  // Atualizar uma função existente
  const updateRole = async (id: number, updates: Partial<UserRole>) => {
    try {
      setIsRolesLoading(true);
      
      const { data, error } = await supabase
        .from("user_roles")
        .update(updates)
        .match({ id })
        .select();
        
      if (error) throw error;
      
      if (data) {
        setRoles(roles.map(role => role.id === id ? { ...role, ...data[0] } : role));
        toast({
          title: "Função atualizada",
          description: `Função atualizada com sucesso`,
          variant: "success"
        });
        return data[0];
      }
    } catch (error: any) {
      console.error("Erro ao atualizar função:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar função",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
      return null;
    } finally {
      setIsRolesLoading(false);
    }
  };

  // Excluir uma função
  const deleteRole = async (id: number) => {
    try {
      setIsRolesLoading(true);
      
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .match({ id });
        
      if (error) throw error;
      
      setRoles(roles.filter(role => role.id !== id));
      toast({
        title: "Função excluída",
        description: `Função excluída com sucesso`,
        variant: "success"
      });
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir função:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir função",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
      return false;
    } finally {
      setIsRolesLoading(false);
    }
  };

  // Adicionar uma nova especialidade
  const addSpecialty = async (specialty: Omit<UserSpecialty, "id" | "created_at">) => {
    try {
      setIsSpecialtiesLoading(true);
      
      const { data, error } = await supabase
        .from("specialties")
        .insert([specialty])
        .select();
        
      if (error) throw error;
      
      if (data) {
        setSpecialties([...specialties, data[0]]);
        toast({
          title: "Especialidade adicionada",
          description: `Especialidade "${specialty.name}" adicionada com sucesso`,
          variant: "success"
        });
        return data[0];
      }
    } catch (error: any) {
      console.error("Erro ao adicionar especialidade:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar especialidade",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
      return null;
    } finally {
      setIsSpecialtiesLoading(false);
    }
  };

  // Atribuir uma função a um usuário
  const assignRoleToUser = async (userId: string, roleId: number) => {
    try {
      console.log(`Atribuindo função ID ${roleId} ao usuário ID ${userId}`);
      
      // Verificar se o usuário já tem uma função atribuída
      const { data: existingAssignment, error: checkError } = await supabase
        .from("user_role_assignments")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Erro ao verificar atribuição de função:", checkError.message);
        throw checkError;
      }
      
      let result;
      
      if (existingAssignment) {
        // Atualizar atribuição existente
        const { data, error } = await supabase
          .from("user_role_assignments")
          .update({ role_id: roleId, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .select();
        
        if (error) throw error;
        result = data;
        console.log("Função atualizada:", result);
      } else {
        // Criar nova atribuição
        const { data, error } = await supabase
          .from("user_role_assignments")
          .insert({
            user_id: userId,
            role_id: roleId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (error) throw error;
        result = data;
        console.log("Função atribuída:", result);
      }
      
      // Também atualizar o campo role_id na tabela profiles para consistência
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role_id: roleId })
        .match({ id: userId });
        
      if (profileError) {
        console.error("Erro ao atualizar role_id no perfil:", profileError.message);
        // Não lançar erro aqui, pois a atribuição principal já foi feita
      }
      
      // Obter o nome da função para atualização local
      const role = roles.find(r => r.id === roleId);
      
      // Atualizar o usuário na lista local após atribuição bem-sucedida
      if (result) {
        // Recarregar usuários para garantir dados atualizados
        await fetchUsers();
      }
      
      return result;
    } catch (error: any) {
      console.error("Erro ao atribuir função:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao atribuir função",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
      throw error;
    }
  };

  // Atribuir especialidades a um usuário
  const assignSpecialtiesToUser = async (userId: string, specialtyIds: number[]) => {
    try {
      setIsLoading(true);
      
      // Primeiro remover quaisquer atribuições existentes
      const { error: deleteError } = await supabase
        .from("user_specialties")
        .delete()
        .match({ user_id: userId });
        
      if (deleteError) throw deleteError;
      
      if (specialtyIds.length === 0) {
        // Se não houver especialidades para adicionar, terminar aqui
        setUsers(users.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              specialties: []
            };
          }
          return user;
        }));
        
        toast({
          title: "Especialidades atualizadas",
          description: `Especialidades atualizadas com sucesso`,
          variant: "success"
        });
        return true;
      }
      
      // Preparar dados para inserção
      const specialtiesToInsert = specialtyIds.map(specialtyId => ({
        user_id: userId,
        specialty_id: specialtyId
      }));
      
      // Adicionar novas atribuições
      const { error } = await supabase
        .from("user_specialties")
        .insert(specialtiesToInsert);
        
      if (error) throw error;
      
      // Atualizar o usuário na lista
      setUsers(users.map(user => {
        if (user.id === userId) {
          const userSpecialties = specialtyIds.map(id => {
            const specialty = specialties.find(s => s.id === id);
            return {
              id,
              name: specialty?.name || "Desconhecida",
              color: specialty?.color || "#cccccc"
            };
          });
          
          return {
            ...user,
            specialties: userSpecialties,
            is_professional: true // Define como profissional se tiver especialidades
          };
        }
        return user;
      }));
      
      toast({
        title: "Especialidades atualizadas",
        description: `Especialidades atualizadas com sucesso`,
        variant: "success"
      });
      return true;
    } catch (error: any) {
      console.error("Erro ao atribuir especialidades:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao atribuir especialidades",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar um perfil de usuário
  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      
      // Extrair propriedades específicas para a tabela profiles
      const { role, role_id, role_details, specialties, is_professional, ...otherUpdates } = updates;
      
      // Mapear campos para a estrutura atual da tabela profiles
      const profileUpdates: Record<string, any> = {};
      if (otherUpdates.name !== undefined) profileUpdates.name = otherUpdates.name;
      if (otherUpdates.email !== undefined) profileUpdates.email = otherUpdates.email;
      if (otherUpdates.phone !== undefined) profileUpdates.whatsapp = otherUpdates.phone;
      if (otherUpdates.status !== undefined) profileUpdates.status = otherUpdates.status;
      if (is_professional !== undefined) profileUpdates.is_professional = is_professional;
      if (otherUpdates.experience_level !== undefined) profileUpdates.experience_level = otherUpdates.experience_level;
      if (otherUpdates.hire_date !== undefined) profileUpdates.hire_date = otherUpdates.hire_date;
      
      console.log("Atualizando perfil:", userId, profileUpdates);
      
      // Atualizar o perfil se houver campos a atualizar
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdates)
          .match({ id: userId });
          
        if (profileError) {
          console.error("Erro ao atualizar perfil:", profileError.message);
          throw profileError;
        }
      }
      
      // Se uma função for especificada, atualizá-la
      if (role_id !== undefined) {
        await assignRoleToUser(userId, role_id);
      }
      
      // Se especialidades forem especificadas, atualizá-las
      if (specialties !== undefined) {
        await assignSpecialtiesToUser(
          userId, 
          specialties.map(s => s.id)
        );
      }
      
      // Recarregar usuários para garantir dados atualizados
      await fetchUsers();
      
      toast({
        title: "Perfil atualizado",
        description: "Perfil do usuário atualizado com sucesso",
        variant: "success"
      });
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Obter lista de permissões disponíveis no sistema
  const getAvailablePermissions = (): PermissionModule[] => {
    return [
      {
        name: "agenda",
        title: "Agenda",
        icon: "Calendar",
        color: "violet",
        actions: [
          { id: "view", title: "Visualizar" },
          { id: "edit", title: "Editar" },
          { id: "delete", title: "Excluir" }
        ]
      },
      {
        name: "clients",
        title: "Clientes",
        icon: "Users",
        color: "blue",
        actions: [
          { id: "view", title: "Visualizar" },
          { id: "edit", title: "Editar" },
          { id: "delete", title: "Excluir" }
        ]
      },
      {
        name: "financial",
        title: "Financeiro",
        icon: "DollarSign",
        color: "green",
        actions: [
          { id: "view", title: "Visualizar" },
          { id: "edit", title: "Editar" },
          { id: "delete", title: "Excluir" }
        ]
      },
      {
        name: "inventory",
        title: "Estoque",
        icon: "Package",
        color: "amber",
        actions: [
          { id: "view", title: "Visualizar" },
          { id: "edit", title: "Editar" },
          { id: "delete", title: "Excluir" }
        ]
      },
      {
        name: "reports",
        title: "Relatórios",
        icon: "BarChart",
        color: "blue",
        actions: [
          { id: "view", title: "Visualizar" },
          { id: "export", title: "Exportar" },
          { id: "configure", title: "Configurar" }
        ]
      },
      {
        name: "settings",
        title: "Configurações",
        icon: "Settings",
        color: "gray",
        actions: [
          { id: "view", title: "Visualizar" },
          { id: "edit", title: "Editar" },
          { id: "system", title: "Sistema" }
        ]
      }
    ];
  };

  // Verificar se um papel possui uma permissão específica
  const hasPermission = (role: UserRole | null, module: string, action: string): boolean => {
    if (!role) return false;
    
    // Administrador tem todas as permissões
    if (role.name === "Administrador" || role.permissions?.all === true) {
      return true;
    }
    
    // Verifica as permissões específicas
    if (role.permissions && role.permissions[module]) {
      const modulePermission = role.permissions[module];
      
      // Pode ser um booleano ou um objeto com permissões específicas
      if (typeof modulePermission === "boolean") {
        return modulePermission;
      }
      
      if (typeof modulePermission === "object") {
        // Permissões específicas como { view: true, edit: false }
        return !!modulePermission[action];
      }
    }
    
    return false;
  };

  // Atualizar permissões de uma função
  const updateRolePermissions = async (
    roleId: number, 
    permissions: Record<string, any>
  ): Promise<boolean> => {
    try {
      setIsRolesLoading(true);
      
      const { data, error } = await supabase
        .from("user_roles")
        .update({ permissions })
        .match({ id: roleId })
        .select();
        
      if (error) throw error;
      
      if (data) {
        // Atualizar a lista de funções
        setRoles(roles.map(role => 
          role.id === roleId ? { ...role, permissions } : role
        ));
        
        toast({
          title: "Permissões atualizadas",
          description: "As permissões da função foram atualizadas com sucesso",
          variant: "success"
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Erro ao atualizar permissões:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar permissões",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
      return false;
    } finally {
      setIsRolesLoading(false);
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchSpecialties();
  }, []);

  return {
    users,
    roles,
    specialties,
    isLoading,
    isRolesLoading,
    isSpecialtiesLoading,
    fetchUsers,
    fetchRoles,
    fetchSpecialties,
    addRole,
    updateRole,
    deleteRole,
    addSpecialty,
    assignRoleToUser,
    assignSpecialtiesToUser,
    updateUserProfile,
    getAvailablePermissions,
    hasPermission,
    updateRolePermissions
  };
}
