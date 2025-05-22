import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Save, Users, PlusCircle, UserPlus, Trash2, Edit, Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserManagement, UserProfile, UserSpecialty, UserRole } from "@/hooks/useUserManagement";
import { PermissionsManager } from "@/components/usuarios/PermissionsManager";
import { useToast } from "@/hooks/use-toast";

export default function Usuarios() {
  const { toast } = useToast();
  const [realtimeSubscriptions, setRealtimeSubscriptions] = useState<any[]>([]);
  const { 
    users, 
    roles, 
    specialties, 
    isLoading,
    isRolesLoading,
    addRole, 
    updateRole, 
    deleteRole, 
    addSpecialty, 
    assignRoleToUser, 
    assignSpecialtiesToUser, 
    updateUserProfile,
    getAvailablePermissions,
    hasPermission,
    updateRolePermissions,
    fetchUsers,
    fetchRoles,
    fetchSpecialties
  } = useUserManagement();

  // Configurar assinaturas em tempo real
  useEffect(() => {
    // Função para configurar todas as assinaturas
    const setupRealtimeSubscriptions = () => {
      // Limpar assinaturas anteriores
      realtimeSubscriptions.forEach(subscription => {
        if (subscription) subscription.unsubscribe();
      });
      
      console.log('Configurando assinaturas em tempo real para módulo de Usuários');

      // Assinatura para perfis de usuários
      const profilesSubscription = supabase
        .channel('profiles-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          console.log('Mudança detectada na tabela profiles');
          fetchUsers();
        })
        .subscribe();
      
      // Assinatura para funções de usuários
      const rolesSubscription = supabase
        .channel('user-roles-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => {
          console.log('Mudança detectada na tabela user_roles');
          fetchRoles();
        })
        .subscribe();
      
      // Assinatura para especialidades
      const specialtiesSubscription = supabase
        .channel('user-specialties-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'specialties' }, () => {
          console.log('Mudança detectada na tabela specialties');
          fetchSpecialties();
        })
        .subscribe();
      
      // Assinatura para atribuições de funções
      const roleAssignmentsSubscription = supabase
        .channel('role-assignments-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_role_assignments' }, () => {
          console.log('Mudança detectada na tabela user_role_assignments');
          fetchUsers();
        })
        .subscribe();
      
      // Assinatura para especialidades de usuários
      const userSpecialtiesSubscription = supabase
        .channel('user-specialties-assignments-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_specialties' }, () => {
          console.log('Mudança detectada na tabela user_specialties');
          fetchUsers();
        })
        .subscribe();
      
      // Salvar todas as assinaturas para limpeza posterior
      setRealtimeSubscriptions([
        profilesSubscription,
        rolesSubscription,
        specialtiesSubscription,
        roleAssignmentsSubscription,
        userSpecialtiesSubscription
      ]);
    };
    
    // Configurar assinaturas
    setupRealtimeSubscriptions();
    
    // Limpar assinaturas ao desmontar
    return () => {
      realtimeSubscriptions.forEach(subscription => {
        if (subscription) subscription.unsubscribe();
      });
    };
  }, []);
  
  // Estados para o modal de novo usuário
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formTab, setFormTab] = useState("general");
  
  // Estados para os campos do formulário
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formStatus, setFormStatus] = useState("Ativo");
  const [formIsProfessional, setFormIsProfessional] = useState(false);
  const [formPhone, setFormPhone] = useState("");
  const [formExperienceLevel, setFormExperienceLevel] = useState("beginner");
  const [formHireDate, setFormHireDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formSelectedSpecialties, setFormSelectedSpecialties] = useState<number[]>([]);
  
  // Estados para o modal de nova função
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [formRoleName, setFormRoleName] = useState("");
  const [formRoleDescription, setFormRoleDescription] = useState("");
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [formRoleIsProfessional, setFormRoleIsProfessional] = useState(false);
  
  // Estados para o modal de nova especialidade
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [formSpecialtyName, setFormSpecialtyName] = useState("");
  const [formSpecialtyColor, setFormSpecialtyColor] = useState("#3B82F6");
  const [editingSpecialty, setEditingSpecialty] = useState<UserSpecialty | null>(null);

  // Estados para o modal de permissões
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Estados para o modal de confirmação de exclusão
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"user" | "role" | "specialty">("user");
  const [deleteItemId, setDeleteItemId] = useState<string | number>("");
  const [deleteItemName, setDeleteItemName] = useState("");
  
  // Função para abrir o modal de confirmação de exclusão de usuário
  const confirmDeleteUser = (user: UserProfile) => {
    console.log("Confirmando exclusão do usuário:", user.id, user.name);
    setDeleteType("user");
    setDeleteItemId(user.id);
    setDeleteItemName(user.name || user.email || "");
    setIsDeleteConfirmOpen(true);
  };
  
  // Função para abrir o modal de confirmação de exclusão de função
  const confirmDeleteRole = (role: UserRole) => {
    setDeleteType("role");
    setDeleteItemId(role.id);
    setDeleteItemName(role.name);
    setIsDeleteConfirmOpen(true);
  };

  // Função para abrir o modal de edição de usuário
  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setFormName(user.name || "");
    setFormEmail(user.email);
    setFormRole(user.role_id?.toString() || "");
    // Não precisamos mais definir o status, pois foi removido do modal
    setFormPhone(user.phone || "");
    setFormSelectedSpecialties(user.specialties?.map(s => s.id) || []);
    setFormIsProfessional(!!user.is_professional);
    
    setIsUserModalOpen(true);
  };

  // Função para abrir o modal de novo usuário
  const handleAddUser = () => {
    setEditingUser(null);
    
    // Limpar os campos do formulário
    setFormName("");
    setFormEmail("");
    
    // Definir Administrador como função padrão - MCP PULSEDADOS
    const adminRole = roles.find(role => role.name === "Administrador");
    setFormRole(adminRole ? adminRole.id.toString() : "");
    
    setFormPhone("");
    setFormStatus("Ativo");
    setFormIsProfessional(false);
    setFormExperienceLevel("beginner");
    setFormHireDate(new Date().toISOString().split('T')[0]);
    setFormSelectedSpecialties([]);
    
    setFormTab("general");
    setIsUserModalOpen(true);
  };

  // Função para abrir o modal de nova função
  const handleAddRole = () => {
    setEditingRole(null);
    setFormRoleName("");
    setFormRoleDescription("");
    setFormRoleIsProfessional(false);
    setIsRoleModalOpen(true);
  };
  
  // Função para abrir o modal de edição de função
  const handleEditRole = (role: UserRole) => {
    setEditingRole(role);
    setFormRoleName(role.name);
    setFormRoleDescription(role.description || "");
    setFormRoleIsProfessional(role.is_professional || false);
    setIsRoleModalOpen(true);
  };
  
  // Função para abrir o modal de nova especialidade
  const handleAddSpecialty = () => {
    setEditingSpecialty(null);
    setFormSpecialtyName("");
    setFormSpecialtyColor("#3B82F6");
    setIsSpecialtyModalOpen(true);
  };

  // Função para abrir o modal de edição de especialidade
  const handleEditSpecialty = (specialty: UserSpecialty) => {
    setEditingSpecialty(specialty);
    setFormSpecialtyName(specialty.name || "");
    setFormSpecialtyColor(specialty.color || "#3B82F6");
    setIsSpecialtyModalOpen(true);
  };

  // Função para abrir o modal de gerenciamento de permissões
  const handleOpenPermissions = (role: UserRole) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

  // Função para abrir o modal de confirmação de exclusão de especialidade
  const confirmDeleteSpecialty = (specialty: UserSpecialty) => {
    setDeleteType("specialty");
    setDeleteItemId(specialty.id);
    setDeleteItemName(specialty.name || "");
    setIsDeleteConfirmOpen(true);
  };

  // Função para salvar o usuário (novo ou editado)
  const handleSaveUser = async () => {
    if (!formName || !formEmail || !formRole) {
      // Exibir mensagem de erro
      toast({
        variant: "destructive",
        title: "Erro ao salvar usuário",
        description: "Nome, e-mail e função são obrigatórios",
        className: "shadow-xl"
      });
      return;
    }
    
    try {
      setIsUserModalOpen(false);
      
      if (editingUser) {
        // Verificar se o usuário é um administrador (role_id = 1)
        const isAdmin = parseInt(formRole) === 1 || editingUser.role_id === 1;
        
        // Editar usuário existente
        await updateUserProfile(editingUser.id, {
          name: formName,
          email: formEmail,
          role_id: parseInt(formRole),
          phone: formPhone,
          specialties: formSelectedSpecialties.map(id => {
            const specialty = specialties.find(s => s.id === id);
            return {
              id,
              name: specialty?.name || "",
              color: specialty?.color || "#000000"
            };
          })
        });
        
        // Se for um administrador, atualizar também o nome do estabelecimento
        if (isAdmin) {
          try {
            // 1. Buscar perfil do administrador para obter o ID do estabelecimento
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("establishment")
              .eq("id", editingUser.id)
              .single();
              
            if (profileError) throw profileError;
            
            // 2. Atualizar o nome do estabelecimento para todos os usuários deste estabelecimento
            if (profileData && profileData.establishment) {
              const { error: updateError } = await supabase
                .from("profiles")
                .update({ establishment: formName })
                .eq("establishment", profileData.establishment);
                
              if (updateError) throw updateError;
              
              console.log(`Nome do estabelecimento atualizado para: ${formName}`);
            }
          } catch (error: any) {
            console.error("Erro ao atualizar nome do estabelecimento:", error.message);
          }
        }
        
        toast({
          title: "Usuário atualizado",
          description: isAdmin 
            ? "Usuário e nome do estabelecimento atualizados com sucesso" 
            : "Usuário atualizado com sucesso",
          variant: "success"
        });
      } else {
        // Criar novo usuário usando o sistema de autenticação do Supabase
        
        // Verificar se os campos de senha foram preenchidos
        const passwordInput = document.getElementById("password") as HTMLInputElement;
        const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;
        
        if (!passwordInput || !passwordInput.value) {
          throw new Error("Senha é obrigatória para novos usuários");
        }
        
        if (passwordInput.value !== confirmPasswordInput.value) {
          throw new Error("As senhas não coincidem");
        }
        
        // Obter o estabelecimento do usuário logado
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;
        
        if (!currentUserId) {
          throw new Error("Usuário não autenticado");
        }
        
        // Buscar o perfil do usuário logado para obter o estabelecimento
        const { data: currentUserProfile, error: currentUserError } = await supabase
          .from("profiles")
          .select("establishment")
          .eq("id", currentUserId)
          .single();
        
        if (currentUserError) {
          throw new Error("Erro ao obter informações do estabelecimento");
        }
        
        // Criar o usuário no sistema de autenticação do Supabase com todos os metadados necessários
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formEmail,
          password: passwordInput.value,
          options: {
            data: {
              name: formName,
              establishment: currentUserProfile.establishment // Incluindo o establishment nos metadados
            },
          }
        });
        
        if (authError) {
          throw authError;
        }
        
        if (!authData.user) {
          throw new Error("Erro ao criar usuário");
        }
        
        const userId = authData.user.id;
        
        // Adicionar um pequeno atraso para garantir que o trigger do Supabase tenha tempo de executar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar se o email já foi ativado - MCP PULSEDADOS
        const emailStatus = authData.user.email_confirmed_at ? "Ativado" : "Ativação Pendente";
        
        // Atualizar campos adicionais na tabela profiles
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            name: formName,
            phone: formPhone,
            status: emailStatus, // Status baseado na confirmação do email
            establishment: currentUserProfile.establishment // Vincula ao mesmo estabelecimento do usuário logado
          })
          .eq("id", userId);
        
        if (updateError) {
          console.error("Erro ao atualizar perfil:", updateError);
          // Não interromper o fluxo aqui, tentar continuar com a atribuição de função
        }
        
        try {
          // Buscar o ID da função Administrador se não for definida - MCP PULSEDADOS
          let roleId = parseInt(formRole);
          
          if (!roleId) {
            // Buscar o ID da função "Administrador"
            const adminRole = roles.find(role => role.name === "Administrador");
            if (adminRole) {
              roleId = adminRole.id;
            }
          }
          
          // Atribuir função ao usuário (padrão: Administrador)
          await assignRoleToUser(userId, roleId);
          
          // Atribuir especialidades ao usuário se for um profissional
          if (formIsProfessional && formSelectedSpecialties.length > 0) {
            await assignSpecialtiesToUser(
              userId, 
              formSelectedSpecialties
            );
          }
        } catch (roleError: any) {
          console.error("Erro ao atribuir função/especialidades:", roleError);
          // Não interromper o fluxo aqui, o usuário já foi criado
        }
        
        // Recarregar lista de usuários
        fetchUsers();
        
        toast({
          title: "Usuário criado",
          description: "Novo usuário criado com sucesso",
          variant: "success"
        });
      }
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao salvar usuário",
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
    }
  };

  // Função para salvar uma função (nova ou editada)
  const handleSaveRole = async () => {
    if (!formRoleName) return;
    
    if (editingRole) {
      // Atualizar função existente
      await updateRole(editingRole.id, {
        name: formRoleName,
        description: formRoleDescription,
        is_professional: formRoleIsProfessional
      });
    } else {
      // Adicionar nova função
      await addRole({
        name: formRoleName,
        description: formRoleDescription,
        permissions: {},
        is_professional: formRoleIsProfessional
      });
    }
    
    setIsRoleModalOpen(false);
  };
  
  // Função para salvar uma especialidade (nova ou editada)
  const handleSaveSpecialty = async () => {
    if (!formSpecialtyName || !formSpecialtyColor) return;
    
    try {
      if (editingSpecialty) {
        // Atualizar uma especialidade existente
        const { error } = await supabase
          .from("specialties")
          .update({
            name: formSpecialtyName,
            color: formSpecialtyColor
          })
          .eq("id", editingSpecialty.id);
          
        if (error) throw error;
        
        toast({
          title: "Especialidade atualizada",
          description: "A especialidade foi atualizada com sucesso",
          variant: "success"
        });
      } else {
        // Adicionar uma nova especialidade
        const { error } = await supabase
          .from("specialties")
          .insert({
            name: formSpecialtyName,
            color: formSpecialtyColor
          });
          
        if (error) throw error;
        
        toast({
          title: "Especialidade adicionada",
          description: "A especialidade foi adicionada com sucesso",
          variant: "success"
        });
      }
      
      // Limpar o formulário e fechar o modal
      setFormSpecialtyName("");
      setFormSpecialtyColor("#3B82F6");
      setEditingSpecialty(null);
      setIsSpecialtyModalOpen(false);
      
      // Recarregar lista de especialidades
      fetchSpecialties();
    } catch (error: any) {
      console.error("Erro ao salvar especialidade:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao salvar especialidade",
        description: error.message || "Tente novamente mais tarde"
      });
    }
  };
  
  // Função para excluir uma especialidade
  const handleDeleteSpecialty = async (specialtyId: number) => {
    try {
      // 1. Verificar se há profissionais usando esta especialidade
      const { data: usersWithSpecialty, error: checkError } = await supabase
        .from("user_specialties")
        .select("user_id")
        .eq("specialty_id", specialtyId);
      
      if (checkError) throw checkError;
      
      // 2. Alertar se houver usuários com esta especialidade, mas permitir exclusão
      if (usersWithSpecialty && usersWithSpecialty.length > 0) {
        toast({
          variant: "warning",
          title: "Atenção",
          description: `Esta especialidade está sendo usada por ${usersWithSpecialty.length} profissional(is). Ao excluir, ela será removida desses profissionais.`
        });
      }
      
      // 3. Remover todas as associações com profissionais
      const { error: removeError } = await supabase
        .from("user_specialties")
        .delete()
        .eq("specialty_id", specialtyId);
      
      if (removeError) throw removeError;
      
      // 4. Excluir a especialidade
      const { error: deleteError } = await supabase
        .from("specialties")
        .delete()
        .eq("id", specialtyId);
        
      if (deleteError) throw deleteError;
      
      // 5. Atualizar estado local e buscar atualizações
      fetchSpecialties();
      
      toast({
        title: "Especialidade excluída",
        description: "A especialidade foi excluída com sucesso",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Erro ao excluir especialidade:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir especialidade",
        description: error.message || "Tente novamente mais tarde"
      });
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  // Função para excluir um usuário
  const handleDeleteUser = async (userId: string) => {
    try {
      // 1. Verificar se há atribuições de função relacionadas
      const { error: roleAssignError } = await supabase
        .from("user_role_assignments")
        .delete()
        .eq("user_id", userId);
        
      if (roleAssignError) throw roleAssignError;
      
      // 2. Verificar se há especialidades relacionadas
      const { error: specialtiesError } = await supabase
        .from("user_specialties")
        .delete()
        .eq("user_id", userId);
        
      if (specialtiesError) throw specialtiesError;
      
      // 3. Excluir perfil do usuário
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
        
      if (profileError) throw profileError;
      
      // 4. Atualizar lista de usuários
      fetchUsers();
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: error.message || "Tente novamente mais tarde"
      });
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };
  
  // Função para excluir uma função
  const handleDeleteRole = async (roleId: number) => {
    try {
      // 1. Verificar se há usuários utilizando esta função
      const { data: usersWithRole, error: checkError } = await supabase
        .from("user_role_assignments")
        .select("user_id")
        .eq("role_id", roleId);
      
      if (checkError) throw checkError;
      
      // 2. Se houver usuários com esta função, não permitir a exclusão
      if (usersWithRole && usersWithRole.length > 0) {
        throw new Error(`Esta função está sendo usada por ${usersWithRole.length} usuário(s). Remova a associação antes de excluir.`);
      }
      
      // 3. Excluir a função
      await deleteRole(roleId);
      
      toast({
        title: "Função excluída",
        description: "A função foi excluída com sucesso",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Erro ao excluir função:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir função",
        description: error.message || "Tente novamente mais tarde"
      });
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  // Função para gerenciar permissões de uma função
  const handleSavePermissions = async (permissions: Record<string, any>) => {
    try {
      // O ID da função e as permissões são gerenciados pelo componente PermissionsManager
      const { data, error } = await supabase
        .from("user_roles")
        .update({ permissions })
        .eq("id", selectedRole?.id)
        .select();
      
      if (error) throw error;
      
      if (data) {
        // Atualizar a lista de funções
        fetchRoles();
        
        toast({
          title: "Permissões atualizadas",
          description: "As permissões da função foram atualizadas com sucesso",
          variant: "success"
        });
        
        setIsPermissionsModalOpen(false);
        return true;
      } else {
        throw new Error("Não foi possível atualizar as permissões");
      }
    } catch (error: any) {
      console.error("Erro ao salvar permissões:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao salvar permissões",
        description: error.message || "Tente novamente mais tarde"
      });
      return false;
    }
  };

  // Executar exclusão confirmada
  const handleConfirmedDelete = () => {
    if (deleteType === "user" && deleteItemId) {
      handleDeleteUser(deleteItemId as string);
    } else if (deleteType === "role" && deleteItemId) {
      handleDeleteRole(deleteItemId as number);
    } else if (deleteType === "specialty" && deleteItemId) {
      handleDeleteSpecialty(deleteItemId as number);
    }
  };

  return (
    <PageLayout>
      {/* Modal de Novo Usuário */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="border-b pb-4 mb-2">
            <DialogTitle className="text-2xl text-indigo-800 font-semibold flex items-center gap-2">
              {editingUser ? (
                <>
                  <Edit className="h-5 w-5 text-indigo-600" />
                  Editar Usuário
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                  Novo Usuário
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-indigo-600/80">
              {editingUser ? "Edite as informações do usuário" : "Cadastre um novo usuário no sistema"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Nome e Email em duas colunas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-sm font-medium text-indigo-700">
                  {parseInt(formRole) === 1 || (editingUser && editingUser.role_id === 1) ? 
                    "Nome do Estabelecimento" : 
                    "Nome"}
                </Label>
                <Input 
                  id="userName"
                  type="text" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  placeholder="Nome completo"
                  className="border-indigo-200 focus-visible:ring-indigo-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail" className="text-sm font-medium text-indigo-700">
                  E-mail
                </Label>
                <Input 
                  id="userEmail"
                  type="email" 
                  value={formEmail} 
                  onChange={e => setFormEmail(e.target.value)} 
                  placeholder="email@exemplo.com"
                  className="border-indigo-200 focus-visible:ring-indigo-400"
                />
              </div>
            </div>
            
            {/* Função e WhatsApp em duas colunas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-indigo-700">
                  Função
                </Label>
                <Select
                  value={formRole}
                  onValueChange={setFormRole}
                >
                  <SelectTrigger className="border-indigo-200 focus:ring-indigo-300">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem 
                        key={role.id}
                        value={role.id.toString()}
                        className="cursor-pointer hover:bg-indigo-50 focus:bg-indigo-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {role.is_professional ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-700 px-2 py-0">
                              Pro
                            </Badge>
                          ) : null}
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-indigo-700">
                  WhatsApp
                </Label>
                <Input 
                  id="phone" 
                  value={formPhone} 
                  onChange={(e) => {
                    // Aplicar máscara de telefone brasileiro (99) 99999-9999
                    const value = e.target.value;
                    const numericValue = value.replace(/\D/g, '');
                    
                    let maskedValue = '';
                    if (numericValue.length <= 11) {
                      if (numericValue.length > 2) {
                        maskedValue += `(${numericValue.substring(0, 2)})`;
                      } else {
                        maskedValue += numericValue;
                        setFormPhone(maskedValue);
                        return;
                      }
                      
                      if (numericValue.length > 2) {
                        maskedValue += ' ';
                        if (numericValue.length <= 7) {
                          maskedValue += numericValue.substring(2);
                        } else {
                          maskedValue += numericValue.substring(2, 7);
                        }
                      }
                      
                      if (numericValue.length > 7) {
                        maskedValue += '-' + numericValue.substring(7);
                      }
                    }
                    
                    setFormPhone(maskedValue);
                  }} 
                  placeholder="(99) 99999-9999"
                  className="border-indigo-200 focus-visible:ring-indigo-400"
                />
              </div>
            </div>
            
            {/* Campos de senha (apenas para novos usuários) */}
            {!editingUser && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-indigo-700">
                    Senha
                  </Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Digite a senha"
                    className="border-indigo-200 focus-visible:ring-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-indigo-700">
                    Confirmar Senha
                  </Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    placeholder="Confirme a senha"
                    className="border-indigo-200 focus-visible:ring-indigo-400"
                  />
                </div>
              </div>
            )}

            {/* É profissional e Switch em uma linha */}
            <div className="border-t border-b border-indigo-100 py-3 px-2 bg-indigo-50/50 rounded-md">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label htmlFor="isProfessional" className="text-indigo-800 font-medium">
                    É um profissional?
                  </Label>
                  <p className="text-xs text-indigo-600/80">Profissionais podem ter especialidades e receber agendamentos</p>
                </div>
                <Switch 
                  id="isProfessional"
                  checked={formIsProfessional} 
                  onCheckedChange={setFormIsProfessional}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>

            {/* Especialidades (condicional apenas se for profissional) */}
            {formIsProfessional && (
              <div className="space-y-2">
                <Label htmlFor="specialties" className="text-sm font-medium text-indigo-700">
                  Especialidades
                </Label>
                <div className="border border-indigo-200 rounded-md p-4 space-y-3 max-h-48 overflow-y-auto bg-white">
                  {specialties.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-2">Nenhuma especialidade cadastrada</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddSpecialty}
                        className="text-xs"
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Adicionar Especialidade
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {specialties.map(specialty => (
                        <div key={specialty.id} className="flex items-center space-x-2 p-2 border border-indigo-50 rounded hover:bg-indigo-50/50 transition-colors">
                          <Checkbox
                            id={`specialty-${specialty.id}`}
                            checked={formSelectedSpecialties.includes(specialty.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormSelectedSpecialties([...formSelectedSpecialties, specialty.id]);
                              } else {
                                setFormSelectedSpecialties(
                                  formSelectedSpecialties.filter(id => id !== specialty.id)
                                );
                              }
                            }}
                            className="text-indigo-600 border-indigo-300"
                          />
                          <Label 
                            htmlFor={`specialty-${specialty.id}`}
                            className="flex items-center space-x-2 cursor-pointer text-sm flex-1"
                          >
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: specialty.color }}
                            />
                            <span className="font-medium">{specialty.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 border-t pt-4 mt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsUserModalOpen(false)}
              className="sm:mr-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveUser}
              className="bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white border-0 px-6"
            >
              <Save className="mr-2 h-4 w-4" />
              {editingUser ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Nova Função */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-indigo-800 font-semibold">
              {editingRole ? "Editar Função" : "Nova Função"}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? "Edite as informações da função" : "Cadastre uma nova função"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="text-right text-indigo-700">Nome</Label>
              <Input
                id="roleName"
                value={formRoleName}
                onChange={(e) => setFormRoleName(e.target.value)}
                className="col-span-3 border-indigo-200 focus-visible:ring-indigo-400"
                placeholder="Nome da função"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleDescription" className="text-right text-indigo-700">Descrição</Label>
              <Input
                id="roleDescription"
                value={formRoleDescription}
                onChange={(e) => setFormRoleDescription(e.target.value)}
                className="col-span-3 border-indigo-200 focus-visible:ring-indigo-400"
                placeholder="Descrição da função"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleIsProfessional">É profissional?</Label>
              <Switch 
                id="roleIsProfessional"
                checked={formRoleIsProfessional} 
                onCheckedChange={setFormRoleIsProfessional}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveRole}
              className="bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white border-0"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Nova Especialidade */}
      <Dialog open={isSpecialtyModalOpen} onOpenChange={setIsSpecialtyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-emerald-800 font-semibold">
              {editingSpecialty ? "Editar Especialidade" : "Nova Especialidade"}
            </DialogTitle>
            <DialogDescription>
              {editingSpecialty ? "Edite as informações da especialidade" : "Cadastre uma nova especialidade"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialtyName" className="text-right text-emerald-700">Nome</Label>
              <Input
                id="specialtyName"
                value={formSpecialtyName}
                onChange={(e) => setFormSpecialtyName(e.target.value)}
                className="col-span-3 border-emerald-200 focus-visible:ring-emerald-400"
                placeholder="Nome da especialidade"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialtyColor" className="text-right text-emerald-700">Cor</Label>
              <Input
                id="specialtyColor"
                type="color"
                value={formSpecialtyColor}
                onChange={(e) => setFormSpecialtyColor(e.target.value)}
                className="w-20 p-1 border-emerald-200 focus-visible:ring-emerald-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsSpecialtyModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveSpecialty}
              className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white border-0"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Gerenciamento de Permissões */}
      <Dialog 
        open={isPermissionsModalOpen} 
        onOpenChange={setIsPermissionsModalOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle>Gerenciamento de Permissões</DialogTitle>
            <DialogDescription>
              Configure as permissões para a função: <span className="font-medium">{selectedRole?.name}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedRole && (
            <div className="py-3 max-h-[75vh] overflow-auto">
              <PermissionsManager
                role={selectedRole}
                permissions={getAvailablePermissions()}
                onSave={handleSavePermissions}
                isLoading={isRolesLoading}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação de exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600 font-semibold">Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {deleteType === "user" ? "o usuário" : deleteType === "role" ? "a função" : "a especialidade"} <span className="font-medium text-red-500">{deleteItemName}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 pb-2">
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                Esta ação não pode ser desfeita.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirmedDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Conteúdo Principal da Página */}
      <div className="mt-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-indigo-800">Gerenciamento de Usuários</h2>
          <Button 
            onClick={handleAddUser}
            className="bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white border-0"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="flex h-10 w-full rounded-md bg-slate-100 p-1">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=inactive]:text-slate-500 rounded-none flex-1 flex items-center justify-center"
            >
              <Users className="h-4 w-4 mr-1.5" />
              Usuários
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=inactive]:text-slate-500 rounded-none flex-1 flex items-center justify-center"
            >
              <Shield className="h-4 w-4 mr-1.5" />
              Funções
            </TabsTrigger>
            <TabsTrigger 
              value="specialties" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=inactive]:text-slate-500 rounded-none flex-1 flex items-center justify-center"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Especialidades
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">Nenhum usuário cadastrado</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-indigo-800">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role_id === 1 ? "outline" : "default"} className={user.role_id === 1 ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : ""}>
                            {user.role_id === 1 ? "Administrador" : "Usuário"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditUser(user)}
                              className="h-8 border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => confirmDeleteUser(user)} 
                              className="h-8 border-red-200 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          <TabsContent value="roles" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Funções de Usuários</h3>
              <Button 
                onClick={handleAddRole}
                className="bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white border-0"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Função
              </Button>
            </div>
            
            {isRolesLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
              </div>
            ) : roles.length === 0 ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">Nenhuma função cadastrada</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium text-indigo-800">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <Badge variant={role.is_professional ? "outline" : "default"} className={role.is_professional ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : ""}>
                            {role.is_professional ? "Profissional" : "Administrativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenPermissions(role)}
                              className="p-1 h-8 border-purple-200 hover:bg-purple-50 text-purple-700"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditRole(role)}
                              className="p-1 h-8 border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => confirmDeleteRole(role)} 
                              className="p-1 h-8 border-red-200 hover:bg-red-50 text-red-600"
                              disabled={role.name === "Administrador"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          <TabsContent value="specialties" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Especialidades de Profissionais</h3>
              <Button 
                onClick={handleAddSpecialty}
                className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white border-0"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Especialidade
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
              </div>
            ) : specialties.length === 0 ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">Nenhuma especialidade cadastrada</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialties.map((specialty) => (
                      <TableRow key={specialty.id}>
                        <TableCell className="font-medium text-emerald-800">{specialty.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full" 
                              style={{ backgroundColor: specialty.color }}
                            />
                            <span className="text-sm">{specialty.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditSpecialty(specialty)}
                              className="p-1 h-8 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => confirmDeleteSpecialty(specialty)} 
                              className="p-1 h-8 border-red-200 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
