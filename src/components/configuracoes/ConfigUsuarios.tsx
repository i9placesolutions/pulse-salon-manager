
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X, User, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PersonalInfo } from "@/components/profissionais/profile/PersonalInfo";

// Interface para usuários
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_professional: boolean;
  status: 'active' | 'inactive';
  avatar_url?: string;
  phone?: string;
  created_at: string;
  view_dashboard?: boolean;
  view_appointments?: boolean;
  view_clients?: boolean;
  view_services?: boolean;
  view_professionals?: boolean;
  view_pdv?: boolean;
  view_financial?: boolean;
  view_stock?: boolean;
  view_marketing?: boolean;
  view_messaging?: boolean;
  view_reports?: boolean;
  view_settings?: boolean;
  edit_appointments?: boolean;
  edit_clients?: boolean;
  edit_services?: boolean;
  edit_professionals?: boolean;
  edit_financial?: boolean;
  edit_stock?: boolean;
  edit_marketing?: boolean;
}

export function ConfigUsuarios() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<{[key: string]: boolean}>({});

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users_with_permissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        console.error("Erro ao buscar usuários:", error);
        return;
      }

      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuários ao carregar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Formatar a data de criação
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Selecionar um usuário para edição de permissões
  const handleEditPermissions = (user: User) => {
    setSelectedUser(user);
    setEditingPermissions(true);
    
    // Inicializar permissões temporárias com as permissões atuais do usuário
    const permissions: {[key: string]: boolean} = {};
    Object.keys(user).forEach(key => {
      if (key.startsWith('view_') || key.startsWith('edit_')) {
        permissions[key] = !!user[key as keyof User];
      }
    });
    
    setTempPermissions(permissions);
  };

  // Alternar uma permissão
  const togglePermission = (permission: string) => {
    setTempPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  // Salvar permissões
  const savePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_permissions')
        .update(tempPermissions)
        .eq('user_id', selectedUser.id);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar permissões",
          description: error.message,
        });
        return;
      }
      
      toast({
        variant: "success",
        title: "Permissões atualizadas",
        description: "As permissões do usuário foram atualizadas com sucesso.",
      });
      
      setEditingPermissions(false);
      fetchUsers(); // Recarregar usuários para mostrar as novas permissões
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar permissões",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edição de permissões
  const cancelPermissionsEdit = () => {
    setEditingPermissions(false);
    setSelectedUser(null);
  };

  // Alternar status do usuário (ativo/inativo)
  const toggleUserStatus = async (userId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('system_users')
        .update({ status: newStatus })
        .eq('id', userId);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: error.message,
        });
        return;
      }
      
      toast({
        variant: "success",
        title: "Status atualizado",
        description: `Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
      });
      
      fetchUsers(); // Recarregar usuários
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: err.message,
      });
    }
  };

  // Excluir usuário
  const deleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('system_users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir usuário",
          description: error.message,
        });
        return;
      }
      
      toast({
        variant: "success",
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
      
      fetchUsers(); // Recarregar usuários
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: err.message,
      });
    }
  };

  // Renderizar o avatar do usuário
  const renderAvatar = (user: User) => {
    if (user.avatar_url) {
      return (
        <img 
          src={user.avatar_url} 
          alt={user.name} 
          className="w-10 h-10 rounded-full object-cover" 
        />
      );
    }
    
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
        {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
      </div>
    );
  };

  // Obter o ícone e cor do cargo
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrador',
          color: 'bg-red-100 text-red-800',
          icon: <Shield className="w-3 h-3 mr-1" />
        };
      case 'manager':
        return {
          label: 'Gerente',
          color: 'bg-blue-100 text-blue-800',
          icon: <User className="w-3 h-3 mr-1" />
        };
      case 'professional':
        return {
          label: 'Profissional',
          color: 'bg-purple-100 text-purple-800',
          icon: <User className="w-3 h-3 mr-1" />
        };
      case 'receptionist':
        return {
          label: 'Recepcionista',
          color: 'bg-green-100 text-green-800',
          icon: <User className="w-3 h-3 mr-1" />
        };
      default:
        return {
          label: 'Usuário',
          color: 'bg-gray-100 text-gray-800',
          icon: <User className="w-3 h-3 mr-1" />
        };
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Erro ao carregar usuários: {error}. Por favor, tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Usuários</TabsTrigger>
          <TabsTrigger value="add">Adicionar Usuário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          {loading && users.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-500">Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-500 mb-4">Adicione usuários para gerenciar o acesso ao sistema.</p>
              <Button onClick={() => document.getElementById('add-user-tab')?.click()}>
                Adicionar Usuário
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Usuário</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Cargo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Data de Criação</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(user => {
                      const roleBadge = getRoleBadge(user.role);
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {renderAvatar(user)}
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                              {roleBadge.icon}
                              {roleBadge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                user.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                              }`}></span>
                              {user.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditPermissions(user)}
                                >
                                  <Pencil className="w-4 h-4 mr-1" />
                                  Permissões
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Permissões de Usuário</DialogTitle>
                                </DialogHeader>
                                
                                {selectedUser && (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-4 pb-4 border-b">
                                      {renderAvatar(selectedUser)}
                                      <div>
                                        <h3 className="font-medium">{selectedUser.name}</h3>
                                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Cargo: {getRoleBadge(selectedUser.role).label}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <h4 className="font-medium border-b pb-2">Permissões de Visualização</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_dashboard">Dashboard</Label>
                                          <Switch 
                                            id="view_dashboard" 
                                            checked={tempPermissions.view_dashboard} 
                                            onCheckedChange={() => togglePermission('view_dashboard')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_appointments">Agendamentos</Label>
                                          <Switch 
                                            id="view_appointments" 
                                            checked={tempPermissions.view_appointments} 
                                            onCheckedChange={() => togglePermission('view_appointments')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_clients">Clientes</Label>
                                          <Switch 
                                            id="view_clients" 
                                            checked={tempPermissions.view_clients} 
                                            onCheckedChange={() => togglePermission('view_clients')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_services">Serviços</Label>
                                          <Switch 
                                            id="view_services" 
                                            checked={tempPermissions.view_services} 
                                            onCheckedChange={() => togglePermission('view_services')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_professionals">Profissionais</Label>
                                          <Switch 
                                            id="view_professionals" 
                                            checked={tempPermissions.view_professionals} 
                                            onCheckedChange={() => togglePermission('view_professionals')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_pdv">PDV</Label>
                                          <Switch 
                                            id="view_pdv" 
                                            checked={tempPermissions.view_pdv} 
                                            onCheckedChange={() => togglePermission('view_pdv')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_financial">Financeiro</Label>
                                          <Switch 
                                            id="view_financial" 
                                            checked={tempPermissions.view_financial} 
                                            onCheckedChange={() => togglePermission('view_financial')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_stock">Estoque</Label>
                                          <Switch 
                                            id="view_stock" 
                                            checked={tempPermissions.view_stock} 
                                            onCheckedChange={() => togglePermission('view_stock')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_marketing">Marketing</Label>
                                          <Switch 
                                            id="view_marketing" 
                                            checked={tempPermissions.view_marketing} 
                                            onCheckedChange={() => togglePermission('view_marketing')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_messaging">Mensagens</Label>
                                          <Switch 
                                            id="view_messaging" 
                                            checked={tempPermissions.view_messaging} 
                                            onCheckedChange={() => togglePermission('view_messaging')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_reports">Relatórios</Label>
                                          <Switch 
                                            id="view_reports" 
                                            checked={tempPermissions.view_reports} 
                                            onCheckedChange={() => togglePermission('view_reports')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="view_settings">Configurações</Label>
                                          <Switch 
                                            id="view_settings" 
                                            checked={tempPermissions.view_settings} 
                                            onCheckedChange={() => togglePermission('view_settings')}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-4">
                                      <h4 className="font-medium border-b pb-2">Permissões de Edição</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="edit_appointments">Agendamentos</Label>
                                          <Switch 
                                            id="edit_appointments" 
                                            checked={tempPermissions.edit_appointments} 
                                            onCheckedChange={() => togglePermission('edit_appointments')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="edit_clients">Clientes</Label>
                                          <Switch 
                                            id="edit_clients" 
                                            checked={tempPermissions.edit_clients} 
                                            onCheckedChange={() => togglePermission('edit_clients')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="edit_services">Serviços</Label>
                                          <Switch 
                                            id="edit_services" 
                                            checked={tempPermissions.edit_services} 
                                            onCheckedChange={() => togglePermission('edit_services')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="edit_professionals">Profissionais</Label>
                                          <Switch 
                                            id="edit_professionals" 
                                            checked={tempPermissions.edit_professionals} 
                                            onCheckedChange={() => togglePermission('edit_professionals')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="edit_financial">Financeiro</Label>
                                          <Switch 
                                            id="edit_financial" 
                                            checked={tempPermissions.edit_financial} 
                                            onCheckedChange={() => togglePermission('edit_financial')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="edit_stock">Estoque</Label>
                                          <Switch 
                                            id="edit_stock" 
                                            checked={tempPermissions.edit_stock} 
                                            onCheckedChange={() => togglePermission('edit_stock')}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                          <Label htmlFor="edit_marketing">Marketing</Label>
                                          <Switch 
                                            id="edit_marketing" 
                                            checked={tempPermissions.edit_marketing} 
                                            onCheckedChange={() => togglePermission('edit_marketing')}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-end space-x-2 pt-4">
                                      <DialogClose asChild>
                                        <Button variant="outline" onClick={cancelPermissionsEdit}>
                                          <X className="w-4 h-4 mr-1" />
                                          Cancelar
                                        </Button>
                                      </DialogClose>
                                      <DialogClose asChild>
                                        <Button onClick={savePermissions}>
                                          <Check className="w-4 h-4 mr-1" />
                                          Salvar Permissões
                                        </Button>
                                      </DialogClose>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleUserStatus(user.id, user.status)}
                              className={user.status === 'active' ? 'text-amber-600' : 'text-green-600'}
                            >
                              {user.status === 'active' ? 'Desativar' : 'Ativar'}
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add" id="add-user-tab">
          <div className="p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Adicionar Novo Usuário</h3>
            <PersonalInfo />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
