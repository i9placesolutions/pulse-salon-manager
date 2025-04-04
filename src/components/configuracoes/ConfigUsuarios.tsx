
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, CheckCircle, XCircle, Plus, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  SystemUser, 
  UserPermission, 
  UserWithPermissions 
} from "@/types/supabase";

export function ConfigUsuarios() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [permissions, setPermissions] = useState<Partial<UserPermission>>({});
  
  // Novos estados para o formulário de adição
  const [newUser, setNewUser] = useState<Partial<SystemUser>>({
    name: '',
    email: '',
    role: 'user',
    is_professional: false,
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users_with_permissions')
        .select('*');

      if (error) {
        throw error;
      }

      // Aqui adicionamos a conversão de tipo explícita
      setUsers(data as unknown as UserWithPermissions[]);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar usuários",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const openUserPermissions = async (user: UserWithPermissions) => {
    setSelectedUser(user);
    
    // Inicializar permissões com as do usuário selecionado
    const userPermissions: Partial<UserPermission> = {
      view_dashboard: user.view_dashboard,
      view_appointments: user.view_appointments,
      view_clients: user.view_clients,
      view_services: user.view_services,
      view_professionals: user.view_professionals,
      view_pdv: user.view_pdv,
      view_financial: user.view_financial,
      view_stock: user.view_stock,
      view_marketing: user.view_marketing,
      view_messaging: user.view_messaging,
      view_reports: user.view_reports,
      view_settings: user.view_settings,
      edit_appointments: user.edit_appointments,
      edit_clients: user.edit_clients,
      edit_services: user.edit_services,
      edit_professionals: user.edit_professionals,
      edit_financial: user.edit_financial,
      edit_stock: user.edit_stock,
      edit_marketing: user.edit_marketing
    };
    
    setPermissions(userPermissions);
    setOpenPermissionsDialog(true);
  };

  const handlePermissionChange = (permissionName: keyof UserPermission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permissionName]: value
    }));
  };

  const savePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('user_permissions')
        .update(permissions)
        .eq('user_id', selectedUser.id);
      
      if (error) throw error;
      
      toast({
        variant: "success",
        title: "Permissões atualizadas",
        description: `As permissões de ${selectedUser.name} foram atualizadas com sucesso.`,
      });
      
      // Atualizar a lista de usuários
      fetchUsers();
      setOpenPermissionsDialog(false);
    } catch (error: any) {
      console.error('Erro ao salvar permissões:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar permissões",
        description: error.message,
      });
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('system_users')
        .update({ status: newStatus })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        variant: "success",
        title: "Status atualizado",
        description: `O usuário foi ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
      });
      
      // Atualizar a lista de usuários
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('system_users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        variant: "success",
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
      
      // Atualizar a lista de usuários
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: error.message,
      });
    }
  };
  
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Por favor, preencha nome e e-mail do usuário."
      });
      return;
    }
    
    try {
      // Verificar se o email já existe
      const { data: existingUsers, error: checkError } = await supabase
        .from('system_users')
        .select('id')
        .eq('email', newUser.email);
      
      if (checkError) throw checkError;
      
      if (existingUsers && existingUsers.length > 0) {
        toast({
          variant: "destructive",
          title: "E-mail já cadastrado",
          description: "Este e-mail já está sendo utilizado por outro usuário."
        });
        return;
      }
      
      // Criar o usuário
      const { error } = await supabase
        .from('system_users')
        .insert([newUser as SystemUser]);
      
      if (error) throw error;
      
      toast({
        variant: "success",
        title: "Usuário adicionado",
        description: `O usuário ${newUser.name} foi adicionado com sucesso.`
      });
      
      // Resetar o formulário
      setNewUser({
        name: '',
        email: '',
        role: 'user',
        is_professional: false,
        status: 'active'
      });
      
      setOpenAddDialog(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao adicionar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar usuário",
        description: error.message
      });
    }
  };

  // Renderiza o status do usuário com badge colorida
  const renderStatus = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-500">Ativo</Badge>;
    }
    return <Badge variant="destructive">Inativo</Badge>;
  };

  // Renderiza o cargo do usuário formatado
  const renderRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'professional': 'Profissional',
      'receptionist': 'Recepcionista',
      'user': 'Usuário'
    };
    
    return roleMap[role] || role;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">Usuários do Sistema</h2>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <select 
                  id="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as SystemUser['role']})}
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="professional">Profissional</option>
                  <option value="receptionist">Recepcionista</option>
                  <option value="user">Usuário</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_professional" 
                  checked={newUser.is_professional}
                  onCheckedChange={(checked) => setNewUser({...newUser, is_professional: checked as boolean})}
                />
                <Label htmlFor="is_professional">É profissional do salão</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleAddUser}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{renderRole(user.role)}</TableCell>
                    <TableCell>{renderStatus(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => openUserPermissions(user)}
                          title="Editar permissões"
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-amber-600 border-amber-600 hover:bg-amber-50"
                            onClick={() => handleUpdateUserStatus(user.id, 'inactive')}
                            title="Desativar usuário"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleUpdateUserStatus(user.id, 'active')}
                            title="Ativar usuário"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Excluir usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Dialog de edição de permissões */}
      <Dialog open={openPermissionsDialog} onOpenChange={setOpenPermissionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Permissões do Usuário: {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Visualização</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_dashboard"
                      checked={permissions.view_dashboard} 
                      onCheckedChange={(checked) => handlePermissionChange('view_dashboard', checked as boolean)}
                    />
                    <Label htmlFor="view_dashboard">Dashboard</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_appointments"
                      checked={permissions.view_appointments} 
                      onCheckedChange={(checked) => handlePermissionChange('view_appointments', checked as boolean)}
                    />
                    <Label htmlFor="view_appointments">Agendamentos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_clients"
                      checked={permissions.view_clients} 
                      onCheckedChange={(checked) => handlePermissionChange('view_clients', checked as boolean)}
                    />
                    <Label htmlFor="view_clients">Clientes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_services"
                      checked={permissions.view_services} 
                      onCheckedChange={(checked) => handlePermissionChange('view_services', checked as boolean)}
                    />
                    <Label htmlFor="view_services">Serviços</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_professionals"
                      checked={permissions.view_professionals} 
                      onCheckedChange={(checked) => handlePermissionChange('view_professionals', checked as boolean)}
                    />
                    <Label htmlFor="view_professionals">Profissionais</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_pdv"
                      checked={permissions.view_pdv} 
                      onCheckedChange={(checked) => handlePermissionChange('view_pdv', checked as boolean)}
                    />
                    <Label htmlFor="view_pdv">PDV</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_financial"
                      checked={permissions.view_financial} 
                      onCheckedChange={(checked) => handlePermissionChange('view_financial', checked as boolean)}
                    />
                    <Label htmlFor="view_financial">Financeiro</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_stock"
                      checked={permissions.view_stock} 
                      onCheckedChange={(checked) => handlePermissionChange('view_stock', checked as boolean)}
                    />
                    <Label htmlFor="view_stock">Estoque</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_marketing"
                      checked={permissions.view_marketing} 
                      onCheckedChange={(checked) => handlePermissionChange('view_marketing', checked as boolean)}
                    />
                    <Label htmlFor="view_marketing">Marketing</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_messaging"
                      checked={permissions.view_messaging} 
                      onCheckedChange={(checked) => handlePermissionChange('view_messaging', checked as boolean)}
                    />
                    <Label htmlFor="view_messaging">Mensagens</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_reports"
                      checked={permissions.view_reports} 
                      onCheckedChange={(checked) => handlePermissionChange('view_reports', checked as boolean)}
                    />
                    <Label htmlFor="view_reports">Relatórios</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view_settings"
                      checked={permissions.view_settings} 
                      onCheckedChange={(checked) => handlePermissionChange('view_settings', checked as boolean)}
                    />
                    <Label htmlFor="view_settings">Configurações</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Edição</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit_appointments"
                      checked={permissions.edit_appointments} 
                      onCheckedChange={(checked) => handlePermissionChange('edit_appointments', checked as boolean)}
                    />
                    <Label htmlFor="edit_appointments">Agendamentos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit_clients"
                      checked={permissions.edit_clients} 
                      onCheckedChange={(checked) => handlePermissionChange('edit_clients', checked as boolean)}
                    />
                    <Label htmlFor="edit_clients">Clientes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit_services"
                      checked={permissions.edit_services} 
                      onCheckedChange={(checked) => handlePermissionChange('edit_services', checked as boolean)}
                    />
                    <Label htmlFor="edit_services">Serviços</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit_professionals"
                      checked={permissions.edit_professionals} 
                      onCheckedChange={(checked) => handlePermissionChange('edit_professionals', checked as boolean)}
                    />
                    <Label htmlFor="edit_professionals">Profissionais</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit_financial"
                      checked={permissions.edit_financial} 
                      onCheckedChange={(checked) => handlePermissionChange('edit_financial', checked as boolean)}
                    />
                    <Label htmlFor="edit_financial">Financeiro</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit_stock"
                      checked={permissions.edit_stock} 
                      onCheckedChange={(checked) => handlePermissionChange('edit_stock', checked as boolean)}
                    />
                    <Label htmlFor="edit_stock">Estoque</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit_marketing"
                      checked={permissions.edit_marketing} 
                      onCheckedChange={(checked) => handlePermissionChange('edit_marketing', checked as boolean)}
                    />
                    <Label htmlFor="edit_marketing">Marketing</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={savePermissions}>Salvar Permissões</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
