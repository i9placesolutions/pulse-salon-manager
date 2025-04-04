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
  Save, 
  Plus,
  CheckCircle,
  XCircle,
  Shield,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  // Novos estados para profissionais
  const [novoUsuarioEhProfissional, setNovoUsuarioEhProfissional] = useState(false);
  const [novoUsuarioTelefone, setNovoUsuarioTelefone] = useState('');
  const [novoUsuarioEspecialidades, setNovoUsuarioEspecialidades] = useState<string[]>([]);
  const [novoUsuarioNivelExperiencia, setNovoUsuarioNivelExperiencia] = useState('beginner');
  const [novoUsuarioDataContratacao, setNovoUsuarioDataContratacao] = useState(
    new Date().toISOString().split('T')[0]
  );
  
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
  // Novos estados para edição de profissionais
  const [editUsuarioEhProfissional, setEditUsuarioEhProfissional] = useState(false);
  const [editUsuarioTelefone, setEditUsuarioTelefone] = useState('');
  const [editUsuarioEspecialidades, setEditUsuarioEspecialidades] = useState<string[]>([]);
  const [editUsuarioNivelExperiencia, setEditUsuarioNivelExperiencia] = useState('beginner');
  const [editUsuarioDataContratacao, setEditUsuarioDataContratacao] = useState('');
  
  // Lista de funções de usuário
  const [funcoes, setFuncoes] = useState([
    { id: 1, nome: 'Administrador', descricao: 'Acesso completo a todas as funcionalidades', editando: false },
    { id: 2, nome: 'Gerente', descricao: 'Acesso a gerenciamento sem configurações avançadas', editando: false },
    { id: 3, nome: 'Profissional', descricao: 'Acesso a agenda e clientes', editando: false },
    { id: 4, nome: 'Recepcionista', descricao: 'Acesso a agenda e atendimento', editando: false }
  ]);

  // Estados para o modal de especialidade
  const [isOpenNovaEspecialidade, setIsOpenNovaEspecialidade] = useState(false);
  const [novaEspecialidadeNome, setNovaEspecialidadeNome] = useState('');
  const [novaEspecialidadeCor, setNovaEspecialidadeCor] = useState('#4caf50');

  // Lista de usuários para o exemplo
  const [usuarios, setUsuarios] = useState([
    { 
      id: 1, 
      nome: 'João Silva', 
      cargo: 'Administrador', 
      email: 'joao@exemplo.com', 
      status: 'Ativo',
      ehProfissional: false
    },
    { 
      id: 2, 
      nome: 'Maria Santos', 
      cargo: 'Profissional', 
      email: 'maria@exemplo.com', 
      status: 'Ativo',
      ehProfissional: true,
      telefone: '(11) 99999-9999',
      especialidades: ['Cabeleireira', 'Maquiagem'],
      nivelExperiencia: 'expert',
      dataContratacao: '2023-01-15'
    },
    { 
      id: 3, 
      nome: 'Pedro Costa', 
      cargo: 'Recepcionista', 
      email: 'pedro@exemplo.com', 
      status: 'Inativo',
      ehProfissional: false
    }
  ]);

  // Especialidades disponíveis
  const [especialidades, setEspecialidades] = useState([
    { id: '1', name: 'Cabeleireira', color: '#ff9800', isActive: true },
    { id: '2', name: 'Barbeiro', color: '#2196f3', isActive: true },
    { id: '3', name: 'Manicure', color: '#4caf50', isActive: true },
    { id: '4', name: 'Maquiagem', color: '#e91e63', isActive: true },
    { id: '5', name: 'Pedicure', color: '#9c27b0', isActive: true }
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

  // Função para adicionar nova especialidade
  const handleAddEspecialidade = () => {
    if (novaEspecialidadeNome.trim() === '') {
      return;
    }

    const novaEspecialidade = {
      id: (Date.now().toString()),
      name: novaEspecialidadeNome,
      color: novaEspecialidadeCor,
      isActive: true
    };

    setEspecialidades([...especialidades, novaEspecialidade]);
    setNovaEspecialidadeNome('');
    setNovaEspecialidadeCor('#4caf50'); // Resetar para cor padrão
    setIsOpenNovaEspecialidade(false);
  };

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
    // Configurar campos de profissional se aplicável
    setEditUsuarioEhProfissional(usuario.ehProfissional || false);
    setEditUsuarioTelefone(usuario.telefone || '');
    setEditUsuarioEspecialidades(usuario.especialidades || []);
    setEditUsuarioNivelExperiencia(usuario.nivelExperiencia || 'beginner');
    setEditUsuarioDataContratacao(usuario.dataContratacao || new Date().toISOString().split('T')[0]);
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
    
    // Validar campos de profissional se aplicável
    if (editUsuarioEhProfissional) {
      if (editUsuarioTelefone.trim() === '') {
        // Mostrar erro
        return;
      }
      if (editUsuarioEspecialidades.length === 0) {
        // Mostrar erro
        return;
      }
    }
    
    // Atualizar usuário
    setUsuarios(usuarios.map(u => {
      if (u.id === usuarioEmEdicao.id) {
        const usuarioAtualizado = {
          ...u,
          nome: editUsuarioNome,
          email: editUsuarioEmail,
          cargo: editUsuarioCargo,
          status: editUsuarioStatus,
          ehProfissional: editUsuarioEhProfissional
        };
        
        // Adicionar campos de profissional se aplicável
        if (editUsuarioEhProfissional) {
          Object.assign(usuarioAtualizado, {
            telefone: editUsuarioTelefone,
            especialidades: editUsuarioEspecialidades,
            nivelExperiencia: editUsuarioNivelExperiencia,
            dataContratacao: editUsuarioDataContratacao
          });
        }
        
        return usuarioAtualizado;
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
    setEditUsuarioEhProfissional(false);
    setEditUsuarioTelefone('');
    setEditUsuarioEspecialidades([]);
    setEditUsuarioNivelExperiencia('beginner');
    setEditUsuarioDataContratacao('');
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
    
    // Validar campos de profissional se aplicável
    if (novoUsuarioEhProfissional) {
      if (novoUsuarioTelefone.trim() === '') {
        // Mostrar erro
        return;
      }
      if (novoUsuarioEspecialidades.length === 0) {
        // Mostrar erro
        return;
      }
    }
    
    // Criar novo usuário
    const novoUsuario: any = {
      id: usuarios.length + 1,
      nome: novoUsuarioNome,
      email: novoUsuarioEmail,
      cargo: novoUsuarioCargo,
      status: novoUsuarioStatus,
      ehProfissional: novoUsuarioEhProfissional
    };
    
    // Adicionar campos de profissional se aplicável
    if (novoUsuarioEhProfissional) {
      Object.assign(novoUsuario, {
        telefone: novoUsuarioTelefone,
        especialidades: novoUsuarioEspecialidades,
        nivelExperiencia: novoUsuarioNivelExperiencia,
        dataContratacao: novoUsuarioDataContratacao
      });
    }
    
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
    setNovoUsuarioEhProfissional(false);
    setNovoUsuarioTelefone('');
    setNovoUsuarioEspecialidades([]);
    setNovoUsuarioNivelExperiencia('beginner');
    setNovoUsuarioDataContratacao(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList className="bg-gradient-to-r from-indigo-50 via-indigo-100 to-indigo-50 p-1 rounded-lg border border-indigo-100 shadow-sm">
          <TabsTrigger 
            value="lista" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
          >
            <Users className="h-4 w-4 mr-2" />
            Lista de Usuários
          </TabsTrigger>
          <TabsTrigger 
            value="funcoes" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
          >
            <UserCog className="h-4 w-4 mr-2" />
            Funções de Usuários
          </TabsTrigger>
          <TabsTrigger 
            value="permissoes" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
          >
            <Shield className="h-4 w-4 mr-2" />
            Permissões
          </TabsTrigger>
          <TabsTrigger 
            value="configuracoes" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        {/* Aba de Lista de Usuários */}
        <TabsContent value="lista" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-indigo-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600"></div>
            <div className="p-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl text-indigo-700 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-indigo-600" />
                    Lista de Usuários
                  </CardTitle>
                  <CardDescription>
                    Gerencie os usuários do sistema, suas funções e permissões.
                  </CardDescription>
                  <div className="flex justify-end">
                    <Button onClick={() => setIsOpenNovoUsuario(true)} className="bg-indigo-600 hover:bg-indigo-700">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Novo Usuário
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="rounded-md border border-indigo-100">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-indigo-50">
                          <th className="p-2 text-left font-medium text-indigo-800">Nome</th>
                          <th className="p-2 text-left font-medium text-indigo-800">Email</th>
                          <th className="p-2 text-left font-medium text-indigo-800">Cargo</th>
                          <th className="p-2 text-left font-medium text-indigo-800">Status</th>
                          <th className="p-2 text-left font-medium text-indigo-800">Profissional</th>
                          <th className="p-2 text-right font-medium text-indigo-800">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((usuario) => (
                          <tr key={usuario.id} className="border-b last:border-b-0 hover:bg-indigo-50 transition-colors">
                            <td className="p-2">{usuario.nome}</td>
                            <td className="p-2">{usuario.email}</td>
                            <td className="p-2">{usuario.cargo}</td>
                            <td className="p-2">
                              <Badge variant={usuario.status === 'Ativo' ? 'default' : 'secondary'} className={usuario.status === 'Ativo' ? 'bg-green-600' : 'bg-gray-400'}>
                                {usuario.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant={usuario.ehProfissional ? 'default' : 'outline'} className={usuario.ehProfissional ? 'bg-indigo-600' : ''}>
                                {usuario.ehProfissional ? 'Sim' : 'Não'}
                              </Badge>
                            </td>
                            <td className="p-2 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleOpenEditUsuario(usuario)}
                                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Você tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={() => setUsuarios(usuarios.filter(u => u.id !== usuario.id))}
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Aba de Funções de Usuários */}
        <TabsContent value="funcoes" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-blue-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
            <div className="p-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl text-blue-700 flex items-center">
                      <UserCog className="h-5 w-5 mr-2 text-blue-600" />
                      Funções de Usuários
                    </CardTitle>
                    <CardDescription>
                      Crie e gerencie os tipos de funções de usuários do sistema
                    </CardDescription>
                  </div>
                  <Dialog open={isOpenNovaFuncao} onOpenChange={setIsOpenNovaFuncao}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
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
                        <Button onClick={handleAddFuncao} className="bg-blue-600 hover:bg-blue-700">Criar Função</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-4">
                    {funcoes.map((funcao) => (
                      <div key={funcao.id} className="rounded-lg border border-blue-50 p-4 shadow-sm hover:border-blue-200 transition-colors">
                        {funcao.editando ? (
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label>Nome da Função</Label>
                              <Input 
                                value={funcao.nome}
                                onChange={(e) => handleEditFuncao(funcao.id, 'nome', e.target.value)}
                                className="border-blue-200 focus:border-blue-400"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Descrição</Label>
                              <Textarea 
                                value={funcao.descricao}
                                onChange={(e) => handleEditFuncao(funcao.id, 'descricao', e.target.value)}
                                className="border-blue-200 focus:border-blue-400"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toggleEditandoFuncao(funcao.id)}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                Cancelar
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleSalvarEdicao(funcao.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Salvar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-blue-700">{funcao.nome}</h3>
                              <p className="text-sm text-muted-foreground">{funcao.descricao}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleEditandoFuncao(funcao.id)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {/* Apenas mostrar opção de excluir para funções customizadas (id > 4) */}
                              {funcao.id > 4 && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                      <Trash2 className="h-4 w-4" />
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
            </div>
          </div>
        </TabsContent>
        
        {/* Aba de Permissões */}
        <TabsContent value="permissoes" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-purple-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
            <div className="p-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl text-purple-700 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-600" />
                    Permissões
                  </CardTitle>
                  <CardDescription>
                    Configure as permissões de acesso para cada tipo de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-6">
                    <div className="grid gap-5">
                      {funcoes.map((perfil, index) => (
                        <Card key={index} className={cn(
                          "border-0 overflow-hidden transition-all duration-200 hover:shadow-md",
                          "bg-gradient-to-br from-white to-purple-50"
                        )}>
                          <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
                          <CardHeader className="pb-2 bg-purple-50/50">
                            <CardTitle className="text-lg flex items-center space-x-2">
                              {index === 0 && <Shield className="h-5 w-5 text-purple-600" />}
                              {index === 1 && <UserCog className="h-5 w-5 text-blue-600" />}
                              {index === 2 && <UserCircle className="h-5 w-5 text-indigo-600" />}
                              {index === 3 && <Users className="h-5 w-5 text-teal-600" />}
                              <span>{perfil.nome}</span>
                              {index === 0 && <Badge className="ml-2 bg-purple-600">Acesso Total</Badge>}
                            </CardTitle>
                            <CardDescription>{perfil.descricao}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                                <div className="bg-purple-100/60 p-3 flex items-center space-x-2">
                                  <CalendarRange className="h-4 w-4 text-purple-600" />
                                  <Label className="text-md font-medium text-purple-800">Agenda</Label>
                                </div>
                                <div className="p-3 space-y-3">
                                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                                    <Label htmlFor={`agenda-ver-${index}`} className="text-sm text-purple-800">Visualizar</Label>
                                    <Checkbox id={`agenda-ver-${index}`} defaultChecked={index <= 3} 
                                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                                  </div>
                                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                                    <Label htmlFor={`agenda-editar-${index}`} className="text-sm text-purple-800">Editar</Label>
                                    <Checkbox id={`agenda-editar-${index}`} defaultChecked={index <= 2} 
                                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor={`agenda-excluir-${index}`} className="text-sm text-purple-800">Excluir</Label>
                                    <Checkbox id={`agenda-excluir-${index}`} defaultChecked={index <= 1} 
                                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg border border-indigo-100 shadow-sm overflow-hidden">
                                <div className="bg-indigo-100/60 p-3 flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-indigo-600" />
                                  <Label className="text-md font-medium text-indigo-800">Clientes</Label>
                                </div>
                                <div className="p-3 space-y-3">
                                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                                    <Label htmlFor={`clientes-ver-${index}`} className="text-sm text-indigo-800">Visualizar</Label>
                                    <Checkbox id={`clientes-ver-${index}`} defaultChecked={index <= 3} 
                                      className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                                  </div>
                                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                                    <Label htmlFor={`clientes-editar-${index}`} className="text-sm text-indigo-800">Editar</Label>
                                    <Checkbox id={`clientes-editar-${index}`} defaultChecked={index <= 2} 
                                      className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor={`clientes-excluir-${index}`} className="text-sm text-indigo-800">Excluir</Label>
                                    <Checkbox id={`clientes-excluir-${index}`} defaultChecked={index <= 1} 
                                      className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100 shadow-sm overflow-hidden">
                                <div className="bg-green-100/60 p-3 flex items-center space-x-2">
                                  <Wallet className="h-4 w-4 text-green-600" />
                                  <Label className="text-md font-medium text-green-800">Financeiro</Label>
                                </div>
                                <div className="p-3 space-y-3">
                                  <div className="flex items-center justify-between border-b border-green-100 pb-2">
                                    <Label htmlFor={`financeiro-ver-${index}`} className="text-sm text-green-800">Visualizar</Label>
                                    <Checkbox id={`financeiro-ver-${index}`} defaultChecked={index <= 2} 
                                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                                  </div>
                                  <div className="flex items-center justify-between border-b border-green-100 pb-2">
                                    <Label htmlFor={`financeiro-editar-${index}`} className="text-sm text-green-800">Editar</Label>
                                    <Checkbox id={`financeiro-editar-${index}`} defaultChecked={index <= 1} 
                                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor={`financeiro-excluir-${index}`} className="text-sm text-green-800">Excluir</Label>
                                    <Checkbox id={`financeiro-excluir-${index}`} defaultChecked={index === 0} 
                                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-100 shadow-sm overflow-hidden">
                                <div className="bg-amber-100/60 p-3 flex items-center space-x-2">
                                  <PackageSearch className="h-4 w-4 text-amber-600" />
                                  <Label className="text-md font-medium text-amber-800">Estoque</Label>
                                </div>
                                <div className="p-3 space-y-3">
                                  <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                                    <Label htmlFor={`estoque-ver-${index}`} className="text-sm text-amber-800">Visualizar</Label>
                                    <Checkbox id={`estoque-ver-${index}`} defaultChecked={index <= 2} 
                                      className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600" />
                                  </div>
                                  <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                                    <Label htmlFor={`estoque-editar-${index}`} className="text-sm text-amber-800">Editar</Label>
                                    <Checkbox id={`estoque-editar-${index}`} defaultChecked={index <= 1} 
                                      className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor={`estoque-excluir-${index}`} className="text-sm text-amber-800">Excluir</Label>
                                    <Checkbox id={`estoque-excluir-${index}`} defaultChecked={index === 0} 
                                      className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100 shadow-sm overflow-hidden">
                                <div className="bg-blue-100/60 p-3 flex items-center space-x-2">
                                  <BarChart className="h-4 w-4 text-blue-600" />
                                  <Label className="text-md font-medium text-blue-800">Relatórios</Label>
                                </div>
                                <div className="p-3 space-y-3">
                                  <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                                    <Label htmlFor={`relatorios-ver-${index}`} className="text-sm text-blue-800">Visualizar</Label>
                                    <Checkbox id={`relatorios-ver-${index}`} defaultChecked={index <= 1} 
                                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                  </div>
                                  <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                                    <Label htmlFor={`relatorios-editar-${index}`} className="text-sm text-blue-800">Exportar</Label>
                                    <Checkbox id={`relatorios-editar-${index}`} defaultChecked={index === 0} 
                                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor={`relatorios-excluir-${index}`} className="text-sm text-blue-800">Configurar</Label>
                                    <Checkbox id={`relatorios-excluir-${index}`} defaultChecked={index === 0} 
                                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                                <div className="bg-slate-100/60 p-3 flex items-center space-x-2">
                                  <Settings className="h-4 w-4 text-slate-600" />
                                  <Label className="text-md font-medium text-slate-800">Configurações</Label>
                                </div>
                                <div className="p-3 space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <Label htmlFor={`config-ver-${index}`} className="text-sm text-slate-800">Visualizar</Label>
                                    <Checkbox id={`config-ver-${index}`} defaultChecked={index <= 1} 
                                      className="data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600" />
                                  </div>
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <Label htmlFor={`config-editar-${index}`} className="text-sm text-slate-800">Editar</Label>
                                    <Checkbox id={`config-editar-${index}`} defaultChecked={index === 0} 
                                      className="data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor={`config-sistema-${index}`} className="text-sm text-slate-800">Sistema</Label>
                                    <Checkbox id={`config-sistema-${index}`} defaultChecked={index === 0} 
                                      className="data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-6 border border-dashed border-purple-200 rounded-lg p-4 bg-purple-50/50">
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 bg-purple-100 rounded-full text-purple-600">
                          <Lock className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-purple-700">Segurança do Sistema de Permissões</h4>
                          <p className="text-sm text-purple-600 mt-1">
                            As alterações em permissões são registradas em logs de auditoria. 
                            Permissões específicas podem ser personalizadas nas configurações avançadas do sistema.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Aba de Configurações */}
        <TabsContent value="configuracoes" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-slate-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600"></div>
            <div className="p-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl text-slate-700 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-slate-600" />
                    Configurações
                  </CardTitle>
                  <CardDescription>
                    Defina opções gerais para o acesso de usuários
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-6">
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de novo usuário */}
      <Dialog open={isOpenNovoUsuario} onOpenChange={setIsOpenNovoUsuario}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo usuário.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações Básicas</TabsTrigger>
              <TabsTrigger value="professional" disabled={!novoUsuarioEhProfissional}>
                Dados Profissionais
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={novoUsuarioNome}
                    onChange={(e) => setNovoUsuarioNome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={novoUsuarioEmail}
                    onChange={(e) => setNovoUsuarioEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select value={novoUsuarioCargo} onValueChange={setNovoUsuarioCargo}>
                    <SelectTrigger id="cargo">
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
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={novoUsuarioStatus} onValueChange={setNovoUsuarioStatus}>
                    <SelectTrigger id="status" className={cn(
                      novoUsuarioStatus === "Ativo" && "text-green-600 border-green-200 bg-green-50",
                      novoUsuarioStatus === "Inativo" && "text-red-600 border-red-200 bg-red-50"
                    )}>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo" className="text-green-600">Ativo</SelectItem>
                      <SelectItem value="Inativo" className="text-red-600">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ao marcar um usuário como "Inativo", ele não poderá acessar o sistema.
                    {novoUsuarioEhProfissional && " Para profissionais, isso também significa que não aparecerão disponíveis para agendamentos."}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={novoUsuarioSenha}
                    onChange={(e) => setNovoUsuarioSenha(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha">Confirmar Senha</Label>
                  <Input
                    id="confirmar-senha"
                    type="password"
                    value={novoUsuarioConfirmarSenha}
                    onChange={(e) => setNovoUsuarioConfirmarSenha(e.target.value)}
                  />
                </div>
                {erroSenha && (
                  <div className="col-span-2">
                    <p className="text-sm text-red-500">{erroSenha}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="ehProfissional" 
                  checked={novoUsuarioEhProfissional} 
                  onCheckedChange={(checked) => setNovoUsuarioEhProfissional(checked === true)}
                />
                <Label htmlFor="ehProfissional" className="font-medium">
                  Este usuário é um profissional do salão
                </Label>
              </div>
              {novoUsuarioEhProfissional && (
                <p className="text-sm text-muted-foreground">
                  Marcar esta opção habilitará campos adicionais na aba "Dados Profissionais".
                  O usuário também aparecerá na tela de Profissionais.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="professional" className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={novoUsuarioTelefone}
                    onChange={(e) => setNovoUsuarioTelefone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-contratacao">Data de Contratação</Label>
                  <Input
                    id="data-contratacao"
                    type="date"
                    value={novoUsuarioDataContratacao}
                    onChange={(e) => setNovoUsuarioDataContratacao(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nivel-experiencia">Nível de Experiência</Label>
                  <Select value={novoUsuarioNivelExperiencia} onValueChange={setNovoUsuarioNivelExperiencia}>
                    <SelectTrigger id="nivel-experiencia">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="expert">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Especialidades</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsOpenNovaEspecialidade(true)}
                    className="text-xs h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Nova Especialidade
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 p-4 border rounded-md">
                  {especialidades.map((esp) => (
                    <div key={esp.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`esp-${esp.id}`} 
                        checked={novoUsuarioEspecialidades.includes(esp.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNovoUsuarioEspecialidades([...novoUsuarioEspecialidades, esp.name]);
                          } else {
                            setNovoUsuarioEspecialidades(
                              novoUsuarioEspecialidades.filter(name => name !== esp.name)
                            );
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`esp-${esp.id}`} 
                        className="flex items-center space-x-1 cursor-pointer"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: esp.color }}
                        />
                        <span>{esp.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
                {novoUsuarioEspecialidades.length === 0 && (
                  <p className="text-sm text-red-500">
                    Selecione pelo menos uma especialidade.
                  </p>
                )}
              </div>
              
              <div className="pt-4 text-sm text-muted-foreground">
                <p>
                  As configurações adicionais como comissão, modelo de pagamento e horários de trabalho podem ser
                  ajustadas posteriormente na tela de Profissionais.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpenNovoUsuario(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUsuario}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de editar usuário */}
      <Dialog open={isOpenEditarUsuario} onOpenChange={setIsOpenEditarUsuario}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere os dados do usuário conforme necessário.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações Básicas</TabsTrigger>
              <TabsTrigger value="professional" disabled={!editUsuarioEhProfissional}>
                Dados Profissionais
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome</Label>
                  <Input
                    id="edit-nome"
                    value={editUsuarioNome}
                    onChange={(e) => setEditUsuarioNome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUsuarioEmail}
                    onChange={(e) => setEditUsuarioEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cargo">Cargo</Label>
                  <Select value={editUsuarioCargo} onValueChange={setEditUsuarioCargo}>
                    <SelectTrigger id="edit-cargo">
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
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editUsuarioStatus} onValueChange={setEditUsuarioStatus}>
                    <SelectTrigger id="edit-status" className={cn(
                      editUsuarioStatus === "Ativo" && "text-green-600 border-green-200 bg-green-50",
                      editUsuarioStatus === "Inativo" && "text-red-600 border-red-200 bg-red-50"
                    )}>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo" className="text-green-600">Ativo</SelectItem>
                      <SelectItem value="Inativo" className="text-red-600">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ao marcar um usuário como "Inativo", ele não poderá acessar o sistema. 
                    {editUsuarioEhProfissional && " Para profissionais, isso também significa que não aparecerão disponíveis para agendamentos."}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-senha">Nova Senha (opcional)</Label>
                  <Input
                    id="edit-senha"
                    type="password"
                    value={editUsuarioSenha}
                    onChange={(e) => setEditUsuarioSenha(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-confirmar-senha">Confirmar Nova Senha</Label>
                  <Input
                    id="edit-confirmar-senha"
                    type="password"
                    value={editUsuarioConfirmarSenha}
                    onChange={(e) => setEditUsuarioConfirmarSenha(e.target.value)}
                  />
                </div>
                {editErroSenha && (
                  <div className="col-span-2">
                    <p className="text-sm text-red-500">{editErroSenha}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="edit-ehProfissional" 
                  checked={editUsuarioEhProfissional} 
                  onCheckedChange={(checked) => setEditUsuarioEhProfissional(checked === true)}
                />
                <Label htmlFor="edit-ehProfissional" className="font-medium">
                  Este usuário é um profissional do salão
                </Label>
              </div>
              {editUsuarioEhProfissional && (
                <p className="text-sm text-muted-foreground">
                  Marcar esta opção habilitará campos adicionais na aba "Dados Profissionais".
                  O usuário também aparecerá na tela de Profissionais.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="professional" className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-telefone">Telefone</Label>
                  <Input
                    id="edit-telefone"
                    value={editUsuarioTelefone}
                    onChange={(e) => setEditUsuarioTelefone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-data-contratacao">Data de Contratação</Label>
                  <Input
                    id="edit-data-contratacao"
                    type="date"
                    value={editUsuarioDataContratacao}
                    onChange={(e) => setEditUsuarioDataContratacao(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-nivel-experiencia">Nível de Experiência</Label>
                  <Select value={editUsuarioNivelExperiencia} onValueChange={setEditUsuarioNivelExperiencia}>
                    <SelectTrigger id="edit-nivel-experiencia">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="expert">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Especialidades</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsOpenNovaEspecialidade(true)}
                    className="text-xs h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Nova Especialidade
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 p-4 border rounded-md">
                  {especialidades.map((esp) => (
                    <div key={esp.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-esp-${esp.id}`} 
                        checked={editUsuarioEspecialidades.includes(esp.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditUsuarioEspecialidades([...editUsuarioEspecialidades, esp.name]);
                          } else {
                            setEditUsuarioEspecialidades(
                              editUsuarioEspecialidades.filter(name => name !== esp.name)
                            );
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`edit-esp-${esp.id}`} 
                        className="flex items-center space-x-1 cursor-pointer"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: esp.color }}
                        />
                        <span>{esp.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
                {editUsuarioEspecialidades.length === 0 && (
                  <p className="text-sm text-red-500">
                    Selecione pelo menos uma especialidade.
                  </p>
                )}
              </div>
              
              <div className="pt-4 text-sm text-muted-foreground">
                <p>
                  As configurações adicionais como comissão, modelo de pagamento e horários de trabalho podem ser
                  ajustadas posteriormente na tela de Profissionais.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpenEditarUsuario(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditUsuario}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de nova especialidade */}
      <Dialog open={isOpenNovaEspecialidade} onOpenChange={setIsOpenNovaEspecialidade}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Especialidade</DialogTitle>
            <DialogDescription>
              Cadastre uma nova especialidade para os profissionais.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome-especialidade">Nome da Especialidade</Label>
              <Input 
                id="nome-especialidade" 
                placeholder="Ex: Designer de Sobrancelhas" 
                value={novaEspecialidadeNome}
                onChange={(e) => setNovaEspecialidadeNome(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cor-especialidade">Cor da Especialidade</Label>
              <div className="flex space-x-2">
                <Input 
                  id="cor-especialidade" 
                  type="color" 
                  value={novaEspecialidadeCor}
                  onChange={(e) => setNovaEspecialidadeCor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <div className="flex-1 border rounded-md flex items-center px-3">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: novaEspecialidadeCor }}
                  />
                  <span className="text-sm">{novaEspecialidadeCor}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpenNovaEspecialidade(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEspecialidade}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
