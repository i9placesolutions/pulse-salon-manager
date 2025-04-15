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
  
  // Estados para o modal de nova especialidade
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [formSpecialtyName, setFormSpecialtyName] = useState("");
  const [formSpecialtyColor, setFormSpecialtyColor] = useState("#3B82F6");

  // Estados para o modal de permissões
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Estados para o modal de confirmação de exclusão
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"user" | "role">("user");
  const [deleteItemId, setDeleteItemId] = useState<string | number>("");
  const [deleteItemName, setDeleteItemName] = useState("");

  // Função para abrir o modal de edição de usuário
  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    
    // Preencher os campos do formulário com os dados do usuário
    setFormName(user.name || "");
    setFormEmail(user.email || "");
    setFormRole(user.role_id?.toString() || "");
    setFormStatus(user.status || "Ativo");
    setFormIsProfessional(user.is_professional || false);
    setFormPhone(user.phone || "");
    setFormExperienceLevel(user.experience_level || "beginner");
    setFormHireDate(user.hire_date || new Date().toISOString().split('T')[0]);
    setFormSelectedSpecialties(user.specialties?.map(s => s.id) || []);
    
    setFormTab("general");
    setIsUserModalOpen(true);
  };

  // Função para abrir o modal de novo usuário
  const handleAddUser = () => {
    setEditingUser(null);
    
    // Limpar os campos do formulário
    setFormName("");
    setFormEmail("");
    setFormRole("");
    setFormStatus("Ativo");
    setFormIsProfessional(false);
    setFormPhone("");
    setFormExperienceLevel("beginner");
    setFormHireDate(new Date().toISOString().split('T')[0]);
    setFormSelectedSpecialties([]);
    
    setFormTab("general");
    setIsUserModalOpen(true);
  };

  // Função para abrir o modal de nova função
  const handleAddRole = () => {
    setFormRoleName("");
    setFormRoleDescription("");
    setIsRoleModalOpen(true);
  };
  
  // Função para abrir o modal de nova especialidade
  const handleAddSpecialty = () => {
    setFormSpecialtyName("");
    setFormSpecialtyColor("#3B82F6");
    setIsSpecialtyModalOpen(true);
  };

  // Função para abrir o modal de gerenciamento de permissões
  const handleOpenPermissions = (role: UserRole) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

  // Função para abrir o modal de confirmação de exclusão de usuário
  const confirmDeleteUser = (user: UserProfile) => {
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

  // Função para salvar o usuário (novo ou editado)
  const handleSaveUser = async () => {
    if (!formName || !formEmail || !formRole) {
      // Exibir mensagem de erro
      return;
    }
    
    if (editingUser) {
      // Editar usuário existente
      await updateUserProfile(editingUser.id, {
        name: formName,
        email: formEmail,
        role_id: parseInt(formRole),
        status: formStatus,
        is_professional: formIsProfessional,
        phone: formPhone,
        experience_level: formExperienceLevel,
        hire_date: formHireDate,
        specialties: formSelectedSpecialties.map(id => {
          const specialty = specialties.find(s => s.id === id);
          return {
            id,
            name: specialty?.name || "",
            color: specialty?.color || "#000000"
          };
        })
      });
    } else {
      // Criar novo usuário (em uma aplicação real, isso seria feito via backend)
      // Aqui apenas simulamos via updateUserProfile para demonstração
      // Em produção, usar auth.signUp ou similar
    }
    
    setIsUserModalOpen(false);
  };

  // Função para salvar uma nova função
  const handleSaveRole = async () => {
    if (!formRoleName) return;
    
    await addRole({
      name: formRoleName,
      description: formRoleDescription,
      permissions: {}
    });
    
    setIsRoleModalOpen(false);
  };
  
  // Função para salvar uma nova especialidade
  const handleSaveSpecialty = async () => {
    if (!formSpecialtyName) return;
    
    await addSpecialty({
      name: formSpecialtyName,
      color: formSpecialtyColor
    });
    
    setIsSpecialtyModalOpen(false);
  };

  // Função para salvar as permissões
  const handleSavePermissions = async (permissions: Record<string, any>) => {
    if (!selectedRole) return false;
    return await updateRolePermissions(selectedRole.id, permissions);
  };

  // Função para renderizar o status do usuário com cor
  const renderStatus = (status: string | undefined) => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
      "Ativo": "bg-green-100 text-green-800 hover:bg-green-100",
      "Inativo": "bg-gray-100 text-gray-800 hover:bg-gray-100",
      "Pendente": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      "Bloqueado": "bg-red-100 text-red-800 hover:bg-red-100"
    };
    
    return (
      <Badge className={statusColors[status] || "bg-gray-100"}>
        {status}
      </Badge>
    );
  };

  // Função para renderizar a função do usuário com cor
  const renderRole = (role: string | null | undefined) => {
    if (!role) return <span className="text-gray-400">Não definido</span>;
    
    const roleColors: Record<string, string> = {
      "Administrador": "bg-purple-100 text-purple-800 hover:bg-purple-100",
      "Gerente": "bg-blue-100 text-blue-800 hover:bg-blue-100",
      "Recepcionista": "bg-green-100 text-green-800 hover:bg-green-100",
      "Profissional": "bg-orange-100 text-orange-800 hover:bg-orange-100"
    };
    
    return (
      <Badge className={roleColors[role] || "bg-gray-100"}>
        {role}
      </Badge>
    );
  };

  // Função para renderizar especialidades do usuário
  const renderSpecialties = (specialties: UserSpecialty[] | undefined) => {
    if (!specialties || specialties.length === 0) {
      return <span className="text-gray-400 text-xs">Nenhuma</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {specialties.map(specialty => (
          <div 
            key={specialty.id} 
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            style={{ 
              backgroundColor: `${specialty.color}20`, 
              color: specialty.color
            }}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: specialty.color }}
            />
            <span>{specialty.name}</span>
          </div>
        ))}
      </div>
    );
  };

  // Função para renderizar a data formatada
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Função para renderizar a data e hora formatadas
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Função para calcular tempo desde o último acesso
  const getTimeAgo = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Conversões para diferentes unidades de tempo
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'} atrás`;
    } else if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffMins > 0) {
      return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'} atrás`;
    } else {
      return 'Agora mesmo';
    }
  };

  // Função para excluir um usuário
  const handleDeleteUser = async (userId: string) => {
    try {
      // Primeiro, remover as associações de função e especialidades
      await supabase
        .from("user_role_assignments")
        .delete()
        .eq("user_id", userId);
        
      await supabase
        .from("user_specialties")
        .delete()
        .eq("user_id", userId);
      
      // Em seguida, excluir o perfil do usuário
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      
      if (error) throw error;
      
      // A lista de usuários será atualizada automaticamente pelo listener em tempo real
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
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
    }
  };

  // Função para excluir uma função
  const handleDeleteRole = async (roleId: number) => {
    try {
      // Primeiro verificar se há usuários com esta função
      const { data: users } = await supabase
        .from("user_role_assignments")
        .select("user_id")
        .eq("role_id", roleId);
      
      // Remover associações de usuários com esta função
      if (users && users.length > 0) {
        await supabase
          .from("user_role_assignments")
          .delete()
          .eq("role_id", roleId);
      }
      
      // Excluir a função
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
        description: error.message || "Tente novamente mais tarde",
        className: "shadow-xl"
      });
    }
  };

  // Executar exclusão confirmada
  const handleConfirmedDelete = async () => {
    if (deleteType === "user") {
      await handleDeleteUser(deleteItemId as string);
    } else {
      await handleDeleteRole(deleteItemId as number);
    }
    setIsDeleteConfirmOpen(false);
  };

  return (
    <PageLayout>
      <PageHeader 
        title="Gerenciamento de Usuários" 
        subtitle="Configure funções e permissões dos usuários do sistema"
        action={
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleAddRole}
              size="sm"
              variant="outline"
              className="border-indigo-300 hover:bg-indigo-50 text-indigo-700"
            >
              <Shield className="mr-2 h-4 w-4 text-indigo-600" />
              Nova Função
            </Button>
            <Button 
              onClick={handleAddSpecialty}
              size="sm"
              variant="outline"
              className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
            >
              <PlusCircle className="mr-2 h-4 w-4 text-emerald-600" />
              Nova Especialidade
            </Button>
            <Button 
              onClick={handleAddUser} 
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        }
      />
      
      <Alert className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 mb-6 shadow-sm">
        <AlertCircle className="h-4 w-4 text-indigo-600" />
        <AlertDescription className="text-sm text-indigo-700 font-medium">
          Gerencie usuários, funções e permissões de acesso ao sistema.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-6">
            <span className="text-gray-500">Carregando...</span>
          </div>
        ) : users.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum usuário encontrado no sistema.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            {/* Tabela de usuários */}
            <div className="rounded-md border">
              <div className="bg-muted/30 py-3 px-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                <h3 className="font-medium flex items-center gap-2 text-blue-800">
                  <Users className="h-4 w-4 text-blue-700" />
                  Usuários
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 text-xs">
                    {users.length}
                  </Badge>
                </h3>
              </div>
              <Table>
                <TableHeader className="bg-blue-50/50">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Especialidades</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-blue-800">{user.name}</span>
                          <span className="text-gray-500 text-xs">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderRole(user.role)}</TableCell>
                      <TableCell>{renderStatus(user.status)}</TableCell>
                      <TableCell>{renderSpecialties(user.specialties)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDateTime(user.last_sign_in_at)}</span>
                          <span className="text-gray-500 text-xs">
                            {getTimeAgo(user.last_sign_in_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                              <span className="sr-only">Ações</span>
                              <span className="text-xl rotate-90 text-blue-600">⋯</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border border-blue-100">
                            <DropdownMenuLabel className="text-blue-700">Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-blue-100" />
                            <DropdownMenuItem onClick={() => handleEditUser(user)} className="hover:bg-blue-50 text-blue-700">
                              <Edit className="mr-2 h-4 w-4 text-blue-600" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => confirmDeleteUser(user)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Tabela de funções */}
            <div className="rounded-md border">
              <div className="bg-muted/30 py-3 px-4 border-b bg-gradient-to-r from-indigo-50 to-indigo-100">
                <h3 className="font-medium flex items-center gap-2 text-indigo-800">
                  <Shield className="h-4 w-4 text-indigo-700" />
                  Funções
                  <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700 text-xs">
                    {roles.length}
                  </Badge>
                </h3>
              </div>
              <Table>
                <TableHeader className="bg-indigo-50/50">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium text-indigo-800">{role.name}</TableCell>
                      <TableCell className="text-indigo-700">{role.description}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{formatDate(role.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-indigo-50">
                                <span className="sr-only">Ações</span>
                                <span className="text-xl rotate-90 text-indigo-600">⋯</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border border-indigo-100">
                              <DropdownMenuLabel className="text-indigo-700">Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-indigo-100" />
                              <DropdownMenuItem onClick={() => handleOpenPermissions(role)} className="hover:bg-indigo-50 text-indigo-700">
                                <Shield className="mr-2 h-4 w-4 text-indigo-600" />
                                Permissões
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => confirmDeleteRole(role)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de Usuário */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-indigo-800 font-semibold">
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? "Edite as informações do usuário" : "Cadastre um novo usuário no sistema"}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={formTab} onValueChange={setFormTab} className="mt-4">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="general">Dados Gerais</TabsTrigger>
              <TabsTrigger value="professional" disabled={!formIsProfessional}>
                Profissional
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formEmail} 
                    onChange={(e) => setFormEmail(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select value={formRole} onValueChange={setFormRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is-professional" 
                    checked={formIsProfessional} 
                    onCheckedChange={setFormIsProfessional} 
                  />
                  <Label htmlFor="is-professional">Este usuário é um profissional</Label>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Marque esta opção se o usuário é um profissional que atende clientes
                </p>
              </div>
              
              {!editingUser && (
                <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="professional" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    value={formPhone} 
                    onChange={(e) => setFormPhone(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hire-date">Data de Contratação</Label>
                  <Input 
                    id="hire-date" 
                    type="date" 
                    value={formHireDate} 
                    onChange={(e) => setFormHireDate(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience-level">Nível de Experiência</Label>
                <Select value={formExperienceLevel} onValueChange={setFormExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                    <SelectItem value="expert">Especialista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Especialidades</Label>
                <div className="grid grid-cols-3 gap-2 border rounded-md p-2 max-h-48 overflow-y-auto">
                  {specialties.map((specialty) => (
                    <div key={specialty.id} className="flex items-center space-x-2">
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
                      />
                      <Label 
                        htmlFor={`specialty-${specialty.id}`}
                        className="flex items-center space-x-1 cursor-pointer text-sm"
                      >
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: specialty.color }}
                        />
                        <span>{specialty.name}</span>
                      </Label>
                    </div>
                  ))}
                  
                  {specialties.length === 0 && (
                    <p className="text-gray-500 text-sm col-span-3 py-2 text-center">
                      Nenhuma especialidade cadastrada
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveUser}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Nova Função */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-indigo-800 font-semibold">Nova Função</DialogTitle>
            <DialogDescription>
              Crie uma nova função para os usuários do sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="text-right text-indigo-700">
                Nome
              </Label>
              <Input
                id="roleName"
                value={formRoleName}
                onChange={(e) => setFormRoleName(e.target.value)}
                className="col-span-3 border-indigo-200 focus-visible:ring-indigo-400"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleDescription" className="text-right text-indigo-700">
                Descrição
              </Label>
              <Input
                id="roleDescription"
                value={formRoleDescription}
                onChange={(e) => setFormRoleDescription(e.target.value)}
                className="col-span-3 border-indigo-200 focus-visible:ring-indigo-400"
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
            <DialogTitle className="text-xl text-emerald-800 font-semibold">Nova Especialidade</DialogTitle>
            <DialogDescription>
              Cadastre uma nova especialidade para os profissionais
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialtyName" className="text-right text-emerald-700">
                Nome
              </Label>
              <Input
                id="specialtyName"
                value={formSpecialtyName}
                onChange={(e) => setFormSpecialtyName(e.target.value)}
                className="col-span-3 border-emerald-200 focus-visible:ring-emerald-400"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialtyColor" className="text-right text-emerald-700">
                Cor
              </Label>
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
    </PageLayout>
  );
}
