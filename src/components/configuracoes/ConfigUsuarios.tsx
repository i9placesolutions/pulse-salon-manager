import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  Users, 
  Eye, 
  Home, 
  PlusCircle, 
  CalendarRange, 
  UserCircle, 
  UserCog,
  Wallet, 
  PackageSearch, 
  BarChart, 
  Settings, 
  Clock, 
  Edit, 
  Trash2, 
  Save 
} from "lucide-react";

export function ConfigUsuarios() {
  // Estados para o modal de nova função
  const [isOpenNovaFuncao, setIsOpenNovaFuncao] = useState(false);
  const [novaFuncaoNome, setNovaFuncaoNome] = useState('');
  const [novaFuncaoDescricao, setNovaFuncaoDescricao] = useState('');
  
  // Estados para o modal de novo usuário
  const [isOpenNovoUsuario, setIsOpenNovoUsuario] = useState(false);
  const [novoUsuarioNome, setNovoUsuarioNome] = useState('');
  const [novoUsuarioEmail, setNovoUsuarioEmail] = useState('');
  const [novoUsuarioCargo, setNovoUsuarioCargo] = useState('Profissional');
  const [novoUsuarioStatus, setNovoUsuarioStatus] = useState('Ativo');
  const [novoUsuarioSenha, setNovoUsuarioSenha] = useState('');
  const [novoUsuarioConfirmarSenha, setNovoUsuarioConfirmarSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  
  // Estados para o modal de edição de usuário
  const [isOpenEditarUsuario, setIsOpenEditarUsuario] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<any>(null);
  const [editUsuarioNome, setEditUsuarioNome] = useState('');
  const [editUsuarioEmail, setEditUsuarioEmail] = useState('');
  const [editUsuarioCargo, setEditUsuarioCargo] = useState('');
  const [editUsuarioStatus, setEditUsuarioStatus] = useState('');
  const [editUsuarioSenha, setEditUsuarioSenha] = useState('');
  const [editUsuarioConfirmarSenha, setEditUsuarioConfirmarSenha] = useState('');
  const [editErroSenha, setEditErroSenha] = useState('');
  
  // Lista de funções de usuário
  const [funcoes, setFuncoes] = useState([
    { id: 1, nome: 'Administrador', descricao: 'Acesso completo a todas as funcionalidades', editando: false },
    { id: 2, nome: 'Gerente', descricao: 'Acesso a gerenciamento sem configurações avançadas', editando: false },
    { id: 3, nome: 'Profissional', descricao: 'Acesso a agenda e clientes', editando: false },
    { id: 4, nome: 'Recepcionista', descricao: 'Acesso a agenda e atendimento', editando: false }
  ]);

  const handleAddFuncao = () => {
    if (novaFuncaoNome.trim() === '') return;
    
    const novaFuncao = {
      id: funcoes.length + 1,
      nome: novaFuncaoNome,
      descricao: novaFuncaoDescricao,
      editando: false
    };
    
    setFuncoes([...funcoes, novaFuncao]);
    setNovaFuncaoNome('');
    setNovaFuncaoDescricao('');
    setIsOpenNovaFuncao(false);
  };

  const toggleEditandoFuncao = (id: number) => {
    setFuncoes(funcoes.map(f => {
      if (f.id === id) {
        return { ...f, editando: !f.editando };
      }
      return f;
    }));
  };

  const handleEditFuncao = (id: number, campo: string, valor: string) => {
    setFuncoes(funcoes.map(f => {
      if (f.id === id) {
        return { ...f, [campo]: valor };
      }
      return f;
    }));
  };

  const handleSalvarEdicao = (id: number) => {
    toggleEditandoFuncao(id);
  };

  const handleExcluirFuncao = (id: number) => {
    setFuncoes(funcoes.filter(f => f.id !== id));
  };

  // Lista de usuários para o exemplo
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'João Silva', cargo: 'Administrador', email: 'joao@exemplo.com', status: 'Ativo' },
    { id: 2, nome: 'Maria Santos', cargo: 'Profissional', email: 'maria@exemplo.com', status: 'Ativo' },
    { id: 3, nome: 'Pedro Costa', cargo: 'Recepcionista', email: 'pedro@exemplo.com', status: 'Inativo' }
  ]);

  // Função para abrir o modal de edição de usuário
  const handleOpenEditUsuario = (usuario: any) => {
    setUsuarioEmEdicao(usuario);
    setEditUsuarioNome(usuario.nome);
    setEditUsuarioEmail(usuario.email);
    setEditUsuarioCargo(usuario.cargo);
    setEditUsuarioStatus(usuario.status);
    setEditUsuarioSenha('');
    setEditUsuarioConfirmarSenha('');
    setEditErroSenha('');
    setIsOpenEditarUsuario(true);
  };
  
  // Função para salvar as edições do usuário
  const handleSaveEditUsuario = () => {
    // Validação básica dos campos
    if (editUsuarioNome.trim() === '' || editUsuarioEmail.trim() === '') {
      return;
    }
    
    // Validação de senhas
    if (editUsuarioSenha && editUsuarioSenha !== editUsuarioConfirmarSenha) {
      setEditErroSenha('As senhas não coincidem');
      return;
    }
    
    // Atualizar usuário
    setUsuarios(usuarios.map(u => {
      if (u.id === usuarioEmEdicao.id) {
        return {
          ...u,
          nome: editUsuarioNome,
          email: editUsuarioEmail,
          cargo: editUsuarioCargo,
          status: editUsuarioStatus
        };
      }
      return u;
    }));
    
    // Fechar modal e limpar formulário
    setIsOpenEditarUsuario(false);
    setUsuarioEmEdicao(null);
    setEditUsuarioNome('');
    setEditUsuarioEmail('');
    setEditUsuarioCargo('');
    setEditUsuarioStatus('');
    setEditUsuarioSenha('');
    setEditUsuarioConfirmarSenha('');
    setEditErroSenha('');
  };

  // Função para adicionar novo usuário
  const handleAddUsuario = () => {
    // Validação básica dos campos
    if (novoUsuarioNome.trim() === '' || novoUsuarioEmail.trim() === '') {
      return;
    }
    
    // Validação de senhas
    if (novoUsuarioSenha !== novoUsuarioConfirmarSenha) {
      setErroSenha('As senhas não coincidem');
      return;
    }
    
    // Criar novo usuário
    const novoUsuario = {
      id: usuarios.length + 1,
      nome: novoUsuarioNome,
      email: novoUsuarioEmail,
      cargo: novoUsuarioCargo,
      status: novoUsuarioStatus
    };
    
    // Adicionar à lista e resetar o formulário
    setUsuarios([...usuarios, novoUsuario]);
    setIsOpenNovoUsuario(false);
    setNovoUsuarioNome('');
    setNovoUsuarioEmail('');
    setNovoUsuarioCargo('Profissional');
    setNovoUsuarioStatus('Ativo');
    setNovoUsuarioSenha('');
    setNovoUsuarioConfirmarSenha('');
    setErroSenha('');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">
            <Users className="mr-2 h-4 w-4" />
            Lista de Usuários
          </TabsTrigger>
          <TabsTrigger value="funcoes">
            <UserCog className="mr-2 h-4 w-4" />
            Funções de Usuários
          </TabsTrigger>
          <TabsTrigger value="permissoes">
            <Eye className="mr-2 h-4 w-4" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="configuracoes">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        {/* Aba de Lista de Usuários */}
        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={isOpenNovoUsuario} onOpenChange={setIsOpenNovoUsuario}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Usuário</DialogTitle>
                      <DialogDescription>
                        Preencha os dados para cadastrar um novo usuário no sistema
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nome-usuario">Nome Completo</Label>
                        <Input 
                          id="nome-usuario" 
                          placeholder="Ex: João Silva" 
                          value={novoUsuarioNome}
                          onChange={(e) => setNovoUsuarioNome(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email-usuario">E-mail</Label>
                        <Input 
                          id="email-usuario" 
                          type="email"
                          placeholder="Ex: joao@exemplo.com" 
                          value={novoUsuarioEmail}
                          onChange={(e) => setNovoUsuarioEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="cargo-usuario">Cargo</Label>
                        <Select value={novoUsuarioCargo} onValueChange={setNovoUsuarioCargo}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cargo" />
                          </SelectTrigger>
                          <SelectContent>
                            {funcoes.map((funcao) => (
                              <SelectItem key={funcao.id} value={funcao.nome}>
                                {funcao.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="status-usuario">Status</Label>
                        <Select value={novoUsuarioStatus} onValueChange={setNovoUsuarioStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid gap-2">
                        <Label htmlFor="senha-usuario">Senha</Label>
                        <Input 
                          id="senha-usuario" 
                          type="password"
                          placeholder="Digite a senha" 
                          value={novoUsuarioSenha}
                          onChange={(e) => {
                            setNovoUsuarioSenha(e.target.value);
                            setErroSenha('');
                          }}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="confirmar-senha-usuario">Confirmar Senha</Label>
                        <Input 
                          id="confirmar-senha-usuario" 
                          type="password"
                          placeholder="Confirme a senha" 
                          value={novoUsuarioConfirmarSenha}
                          onChange={(e) => {
                            setNovoUsuarioConfirmarSenha(e.target.value);
                            setErroSenha('');
                          }}
                        />
                        {erroSenha && <p className="text-sm text-red-500">{erroSenha}</p>}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsOpenNovoUsuario(false);
                        setErroSenha('');
                      }}>Cancelar</Button>
                      <Button onClick={handleAddUsuario}>Criar Usuário</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Modal de Edição de Usuário */}
                <Dialog open={isOpenEditarUsuario} onOpenChange={setIsOpenEditarUsuario}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Editar Usuário</DialogTitle>
                      <DialogDescription>
                        Edite as informações do usuário
                      </DialogDescription>
                    </DialogHeader>
                    
                    {usuarioEmEdicao && (
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-nome-usuario">Nome Completo</Label>
                          <Input 
                            id="edit-nome-usuario" 
                            placeholder="Ex: João Silva" 
                            value={editUsuarioNome}
                            onChange={(e) => setEditUsuarioNome(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-email-usuario">E-mail</Label>
                          <Input 
                            id="edit-email-usuario" 
                            type="email"
                            placeholder="Ex: joao@exemplo.com" 
                            value={editUsuarioEmail}
                            onChange={(e) => setEditUsuarioEmail(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-cargo-usuario">Cargo</Label>
                          <Select value={editUsuarioCargo} onValueChange={setEditUsuarioCargo}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cargo" />
                            </SelectTrigger>
                            <SelectContent>
                              {funcoes.map((funcao) => (
                                <SelectItem key={funcao.id} value={funcao.nome}>
                                  {funcao.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-status-usuario">Status</Label>
                          <Select value={editUsuarioStatus} onValueChange={setEditUsuarioStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ativo">Ativo</SelectItem>
                              <SelectItem value="Inativo">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="edit-senha-usuario">Nova Senha (opcional)</Label>
                            <p className="text-xs text-muted-foreground">Deixe em branco para não alterar</p>
                          </div>
                          <Input 
                            id="edit-senha-usuario" 
                            type="password"
                            placeholder="Digite a nova senha" 
                            value={editUsuarioSenha}
                            onChange={(e) => {
                              setEditUsuarioSenha(e.target.value);
                              setEditErroSenha('');
                            }}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-confirmar-senha-usuario">Confirmar Nova Senha</Label>
                          <Input 
                            id="edit-confirmar-senha-usuario" 
                            type="password"
                            placeholder="Confirme a nova senha" 
                            value={editUsuarioConfirmarSenha}
                            onChange={(e) => {
                              setEditUsuarioConfirmarSenha(e.target.value);
                              setEditErroSenha('');
                            }}
                          />
                          {editErroSenha && <p className="text-sm text-red-500">{editErroSenha}</p>}
                        </div>
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsOpenEditarUsuario(false);
                        setEditErroSenha('');
                      }}>Cancelar</Button>
                      <Button onClick={handleSaveEditUsuario}>Salvar Alterações</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {usuarios.map((usuario, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{usuario.nome}</p>
                      <p className="text-sm text-muted-foreground">{usuario.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={usuario.status === 'Ativo' ? 'default' : 'secondary'}>
                        {usuario.status}
                      </Badge>
                      <p className="text-sm">{usuario.cargo}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenEditUsuario(usuario)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Funções de Usuários */}
        <TabsContent value="funcoes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Funções de Usuários</CardTitle>
                <CardDescription>
                  Crie e gerencie os tipos de funções de usuários do sistema
                </CardDescription>
              </div>
              <Dialog open={isOpenNovaFuncao} onOpenChange={setIsOpenNovaFuncao}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Função
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Função</DialogTitle>
                    <DialogDescription>
                      Defina um nome e uma descrição para a nova função de usuário
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nome-funcao">Nome da Função</Label>
                      <Input 
                        id="nome-funcao" 
                        placeholder="Ex: Assistente, Estagiário, Coordenador..." 
                        value={novaFuncaoNome}
                        onChange={(e) => setNovaFuncaoNome(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="descricao-funcao">Descrição</Label>
                      <Textarea 
                        id="descricao-funcao" 
                        placeholder="Descreva as responsabilidades desta função..."
                        value={novaFuncaoDescricao}
                        onChange={(e) => setNovaFuncaoDescricao(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpenNovaFuncao(false)}>Cancelar</Button>
                    <Button onClick={handleAddFuncao}>Criar Função</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funcoes.map((funcao) => (
                  <div key={funcao.id} className="rounded-lg border p-4 shadow-sm">
                    {funcao.editando ? (
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label>Nome da Função</Label>
                          <Input 
                            value={funcao.nome}
                            onChange={(e) => handleEditFuncao(funcao.id, 'nome', e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Descrição</Label>
                          <Textarea 
                            value={funcao.descricao}
                            onChange={(e) => handleEditFuncao(funcao.id, 'descricao', e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleEditandoFuncao(funcao.id)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleSalvarEdicao(funcao.id)}
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">{funcao.nome}</h3>
                          <p className="text-sm text-muted-foreground">{funcao.descricao}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleEditandoFuncao(funcao.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {/* Apenas mostrar opção de excluir para funções customizadas (id > 4) */}
                          {funcao.id > 4 && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Função</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a função "{funcao.nome}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleExcluirFuncao(funcao.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Permissões */}
        <TabsContent value="permissoes">
          <Card>
            <CardHeader>
              <CardTitle>Permissões de Acesso</CardTitle>
              <CardDescription>
                Configure as permissões de acesso para cada tipo de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {funcoes.map((perfil, index) => (
                  <Card key={index} className="border-2 border-gray-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{perfil.nome}</CardTitle>
                      <CardDescription>{perfil.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="border p-4 rounded-md">
                            <div className="mb-3">
                              <Label className="text-md font-medium">Agenda</Label>
                              <p className="text-sm text-muted-foreground">Controle de agendamentos</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`agenda-ver-${index}`} defaultChecked={index <= 3} />
                                <Label htmlFor={`agenda-ver-${index}`}>Visualizar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`agenda-editar-${index}`} defaultChecked={index <= 2} />
                                <Label htmlFor={`agenda-editar-${index}`}>Editar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`agenda-excluir-${index}`} defaultChecked={index <= 1} />
                                <Label htmlFor={`agenda-excluir-${index}`}>Excluir</Label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border p-4 rounded-md">
                            <div className="mb-3">
                              <Label className="text-md font-medium">Clientes</Label>
                              <p className="text-sm text-muted-foreground">Gerenciamento de clientes</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`clientes-ver-${index}`} defaultChecked={index <= 3} />
                                <Label htmlFor={`clientes-ver-${index}`}>Visualizar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`clientes-editar-${index}`} defaultChecked={index <= 2} />
                                <Label htmlFor={`clientes-editar-${index}`}>Editar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`clientes-excluir-${index}`} defaultChecked={index <= 1} />
                                <Label htmlFor={`clientes-excluir-${index}`}>Excluir</Label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border p-4 rounded-md">
                            <div className="mb-3">
                              <Label className="text-md font-medium">Financeiro</Label>
                              <p className="text-sm text-muted-foreground">Controle financeiro</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`financeiro-ver-${index}`} defaultChecked={index <= 2} />
                                <Label htmlFor={`financeiro-ver-${index}`}>Visualizar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`financeiro-editar-${index}`} defaultChecked={index <= 1} />
                                <Label htmlFor={`financeiro-editar-${index}`}>Editar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`financeiro-excluir-${index}`} defaultChecked={index === 0} />
                                <Label htmlFor={`financeiro-excluir-${index}`}>Excluir</Label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border p-4 rounded-md">
                            <div className="mb-3">
                              <Label className="text-md font-medium">Estoque</Label>
                              <p className="text-sm text-muted-foreground">Controle de produtos</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`estoque-ver-${index}`} defaultChecked={index <= 2} />
                                <Label htmlFor={`estoque-ver-${index}`}>Visualizar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`estoque-editar-${index}`} defaultChecked={index <= 1} />
                                <Label htmlFor={`estoque-editar-${index}`}>Editar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`estoque-excluir-${index}`} defaultChecked={index === 0} />
                                <Label htmlFor={`estoque-excluir-${index}`}>Excluir</Label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border p-4 rounded-md">
                            <div className="mb-3">
                              <Label className="text-md font-medium">Relatórios</Label>
                              <p className="text-sm text-muted-foreground">Acesso a relatórios</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`relatorios-ver-${index}`} defaultChecked={index <= 1} />
                                <Label htmlFor={`relatorios-ver-${index}`}>Visualizar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`relatorios-editar-${index}`} defaultChecked={index === 0} />
                                <Label htmlFor={`relatorios-editar-${index}`}>Exportar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`relatorios-excluir-${index}`} defaultChecked={index === 0} />
                                <Label htmlFor={`relatorios-excluir-${index}`}>Configurar</Label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border p-4 rounded-md">
                            <div className="mb-3">
                              <Label className="text-md font-medium">Configurações</Label>
                              <p className="text-sm text-muted-foreground">Acesso a configurações do sistema</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`config-ver-${index}`} defaultChecked={index <= 1} />
                                <Label htmlFor={`config-ver-${index}`}>Visualizar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`config-editar-${index}`} defaultChecked={index === 0} />
                                <Label htmlFor={`config-editar-${index}`}>Editar</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`config-sistema-${index}`} defaultChecked={index === 0} />
                                <Label htmlFor={`config-sistema-${index}`}>Sistema</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Configurações */}
        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Usuários</CardTitle>
              <CardDescription>
                Defina opções gerais para o acesso de usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Página Inicial por Perfil</h3>
                <p className="text-sm text-muted-foreground">Defina qual será a primeira página exibida após o login para cada tipo de usuário</p>
                
                <div className="space-y-4">
                  {funcoes.map((perfil, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 font-medium">{perfil.nome}</div>
                      
                      <div className="flex-1">
                        <Select defaultValue={index === 0 ? 'dashboard' : 
                                          index === 1 ? 'relatorios' : 
                                          index === 2 ? 'agenda' : 'agenda'}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a página inicial" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dashboard">Dashboard</SelectItem>
                            <SelectItem value="agenda">Agenda</SelectItem>
                            <SelectItem value="clientes">Clientes</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="estoque">Estoque</SelectItem>
                            <SelectItem value="relatorios">Relatórios</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Opções de Segurança</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bloqueio Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Bloquear sessão após inatividade
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tentativas de Login</Label>
                      <p className="text-sm text-muted-foreground">
                        Número máximo de tentativas de login
                      </p>
                    </div>
                    <Select defaultValue="3">
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
