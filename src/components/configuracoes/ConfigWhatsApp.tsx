import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  QrCode, 
  Phone, 
  RefreshCcw, 
  Smartphone, 
  MessageSquare, 
  Info, 
  Calendar,
  Building,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { createWhatsAppInstance, getInstanceStatus } from "@/services/whatsapp/api";

// Interface para representar os dados da instância do WhatsApp
interface WhatsAppInstance {
  id: string;
  token: string;
  status: string;
  paircode?: string;
  qrcode?: string;
  name: string;
  profileName?: string;
  profilePicUrl?: string;
  isBusiness?: boolean;
  plataform?: string;
  systemName?: string;
  owner?: string;
  lastDisconnect?: string;
  lastDisconnectReason?: string;
  adminField01?: string;
  adminField02?: string;
  openai_apikey?: string;
  chatbot_enabled?: boolean;
  chatbot_ignoreGroups?: boolean;
  chatbot_stopConversation?: string;
  chatbot_stopMinutes?: number;
  created: string;
  updated: string;
}

// Interface para a resposta da API de criação de instância
interface ApiResponse {
  response: string;
  instance: WhatsAppInstance;
  connected: boolean;
  loggedIn: boolean;
  name: string;
  token: string;
  info?: string;
}

// Interface para a resposta da API de conexão
interface ConnectResponse {
  connected: boolean;
  loggedIn: boolean;
  jid: string | null;
  instance: WhatsAppInstance;
}

export function ConfigWhatsApp() {
  // Configurações da API uazapi
  const SERVER_URL = 'https://i9place3.uazapi.com';
  
  // Token da instância principal para notificação dos estabelecimentos
  const MAIN_INSTANCE_TOKEN = '695fb204-5af9-4cfe-9f9f-676d2ca47e69';
  
  // Estados para os campos do formulário
  // Token admin fixo - não visível para o usuário
  const adminToken = '43TUukVMHTIQV5j4iqbX52ZhM63b7s2slt3q04vjygM3lpMf06';
  const [name, setName] = useState('');
  // Sistema com valor padrão fixo
  const systemName = 'PULSE';
  
  // Estado para controlar o modal do QR Code
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLoadingQrCode, setIsLoadingQrCode] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  // Referência para o intervalo de verificação de status
  const statusCheckIntervalRef = useRef<number | null>(null);
  
  // Estado para a conexão via pareamento
  const [phoneNumber, setPhoneNumber] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<boolean>(false);
  
  // Estados para controlar o processo de criação
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [instanceData, setInstanceData] = useState<ApiResponse | null>(null);
  const [instanceToken, setInstanceToken] = useState<string>('');
  
  // Estado para controlar o carregamento dos dados da instância
  const [isLoadingInstance, setIsLoadingInstance] = useState(false);
  const [connectedInstance, setConnectedInstance] = useState<WhatsAppInstance | null>(null);
  const [hasConnectedInstance, setHasConnectedInstance] = useState(false);
  
  // Estado para instância principal do sistema
  const [mainInstanceData, setMainInstanceData] = useState<WhatsAppInstance | null>(null);
  const [isLoadingMainInstance, setIsLoadingMainInstance] = useState(false);
  const [mainInstanceConnected, setMainInstanceConnected] = useState(false);
  
  // Verificar se existe uma instância conectada e a instância principal ao iniciar o componente
  useEffect(() => {
    // Verificar instância principal
    checkMainInstance();
    
    // Verificar se há uma instância conectada a partir do localStorage
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem('whatsapp_instance_token');
    
    if (token) {
      setInstanceToken(token);
      checkConnectedInstance(token);
    } else {
      // Se não houver token, definir explicitamente que não há instância conectada
      setHasConnectedInstance(false);
    }
  }, []);
  
  // Função para verificar a instância principal
  const checkMainInstance = async () => {
    setIsLoadingMainInstance(true);
    
    try {
      const response = await fetch(`${SERVER_URL}/instance/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'token': MAIN_INSTANCE_TOKEN
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.instance) {
        setMainInstanceData(data.instance);
        setMainInstanceConnected(data.connected || data.instance.status === 'connected');
      }
    } catch (err) {
      console.error('Erro ao verificar instância principal:', err);
    } finally {
      setIsLoadingMainInstance(false);
    }
  };
  
  // Função para atualizar a instância principal
  const refreshMainInstance = async () => {
    // Evita múltiplas chamadas
    if (isLoadingMainInstance) {
      return;
    }
    
    await checkMainInstance();
    
    toast({
      title: "Sucesso",
      description: "Dados da instância principal atualizados",
      variant: "default",
      id: "main-instance-updated"
    });
  };
  
  // Função para verificar se há uma instância conectada
  const checkConnectedInstance = async (token: string) => {
    setIsLoadingInstance(true);
    
    try {
      const response = await fetch(`${SERVER_URL}/instance/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'token': token
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Se a instância estiver conectada, salvar os dados
        if (data.instance) {
          setConnectedInstance(data.instance);
          setHasConnectedInstance(data.connected || data.instance.status === 'connected');
          
          // Atualizar o estado global com as informações da instância
          setInstanceData({
            response: "success",
            instance: data.instance,
            connected: data.connected,
            loggedIn: data.connected,
            name: data.instance.name,
            token: token,
            info: "Instância carregada"
          });
          
          setSuccess(true);
        }
      }
    } catch (err) {
      console.error('Erro ao verificar instância:', err);
    } finally {
      setIsLoadingInstance(false);
    }
  };

  // Função para verificar o status da instância
  const checkInstanceStatus = async () => {
    if (!instanceToken) return;
    
    setIsCheckingStatus(true);
    
    try {
      // Usar o serviço de API para verificar o status da instância
      const data = await getInstanceStatus(instanceToken);
      
      if (data.instance && data.instance.status === 'connected') {
        // Se a instância estiver conectada, fechar o modal e atualizar os dados
        setIsQrModalOpen(false);
        setConnectSuccess(true);
        
        // Atualizar os dados da instância
        setInstanceData(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            instance: {
              ...prev.instance,
              status: 'connected',
              profileName: data.instance.profileName || prev.instance.profileName
            },
            connected: true,
            loggedIn: true
          };
        });
        
        // Atualizar a instância conectada
        setConnectedInstance(data.instance);
        setHasConnectedInstance(true);
        
        // Salvar o token no localStorage
        localStorage.setItem('whatsapp_instance_token', instanceToken);
        
        // Limpar o intervalo
        if (statusCheckIntervalRef.current) {
          window.clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        
        // Notificar o usuário
        toast({
          title: "WhatsApp conectado",
          description: `Conexão estabelecida com sucesso para ${data.instance.profileName || 'sua conta do WhatsApp'}`,
          variant: "default"
        });
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      toast({
        title: "Erro ao verificar status",
        description: err instanceof Error ? err.message : 'Erro desconhecido ao verificar status',
        variant: "destructive"
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Função para atualizar a instância conectada
  const refreshConnectedInstance = async () => {
    if (!instanceToken) {
      toast({
        title: "Erro",
        description: "Não há token de instância disponível",
        variant: "destructive",
        id: "whatsapp-instance-error"
      });
      return;
    }
    
    // Verifica se já está carregando para evitar múltiplas chamadas
    if (isLoadingInstance) {
      return;
    }
    
    setIsLoadingInstance(true);
    
    try {
      await checkConnectedInstance(instanceToken);
      
      // Exibe o toast de sucesso apenas uma vez com ID único
      toast({
        title: "Sucesso",
        description: "Dados da instância atualizados",
        variant: "default",
        id: "whatsapp-instance-updated"
      });
    } catch (err) {
      console.error('Erro ao atualizar dados da instância:', err);
      
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados da instância",
        variant: "destructive",
        id: "whatsapp-instance-update-error"
      });
    } finally {
      setIsLoadingInstance(false);
    }
  };
  
  // Função para iniciar a verificação periódica de status
  const startStatusCheck = () => {
    // Limpar qualquer intervalo existente
    if (statusCheckIntervalRef.current) {
      window.clearInterval(statusCheckIntervalRef.current);
    }
    
    // Verificar imediatamente
    checkInstanceStatus();
    
    // Configurar verificação a cada 3 segundos
    statusCheckIntervalRef.current = window.setInterval(() => {
      checkInstanceStatus();
    }, 3000);
  };
  
  // Limpar o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        window.clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);
  
  // Função para atualizar o QR Code
  const refreshQrCode = async () => {
    if (!instanceToken) return;
    
    setIsLoadingQrCode(true);
    
    try {
      // Fazer a chamada à API para obter um novo QR Code
      const response = await fetch(`${SERVER_URL}/instance/connect`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': instanceToken
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao gerar QR Code');
      }
      
      // Atualizar os dados da instância com o novo QR Code
      if (data.instance) {
        setInstanceData(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            instance: {
              ...prev.instance,
              qrcode: data.instance.qrcode,
              paircode: data.instance.paircode
            }
          };
        });
      }
    } catch (err) {
      console.error('Erro ao atualizar QR Code:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao gerar QR Code');
    } finally {
      setIsLoadingQrCode(false);
    }
  };

  // Função para conectar a instância com número de telefone
  const connectInstance = async (phone: string) => {
    // Resetar estados
    setConnectError(null);
    setConnectSuccess(false);
    setConnectLoading(true);
    
    try {
      // Preparar os dados para a requisição
      const requestData = {
        phone
      };
      
      // Fazer a chamada à API
      const response = await fetch(`${SERVER_URL}/instance/connect`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': instanceToken
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao conectar instância');
      }
      
      // Configurar o estado de sucesso
      setConnectSuccess(true);
      
      // Atualizar os dados da instância se necessário
      if (data.instance) {
        setInstanceData(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            instance: data.instance,
            connected: data.connected,
            loggedIn: data.loggedIn
          };
        });
      }
    } catch (err) {
      console.error('Erro ao conectar instância:', err);
      setConnectError(err instanceof Error ? err.message : 'Erro desconhecido ao conectar instância');
    } finally {
      setConnectLoading(false);
    }
  };
  
  // Função para criar a instância
  const createInstance = async () => {
    // Resetar estados
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    
    try {
      // Preparar os dados para a requisição
      const requestData = {
        name,
        systemName,
        adminField01: "custom-metadata-1",
        adminField02: "custom-metadata-2"
      };
      
      // Usar o serviço de API para criar a instância
      const data = await createWhatsAppInstance(requestData);
      
      // Configurar o estado de sucesso e armazenar os dados retornados
      setSuccess(true);
      setInstanceData(data);
      setInstanceToken(data.token);
      
      // Informar o usuário sobre o sucesso
      toast({
        title: "Instância criada com sucesso",
        description: `A instância "${data.name}" foi criada com sucesso. Token: ${data.token.substring(0, 8)}...`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erro ao criar instância:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao criar instância');
      
      // Informar o usuário sobre o erro
      toast({
        title: "Erro ao criar instância",
        description: err instanceof Error ? err.message : 'Erro desconhecido ao criar instância',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Instância principal do sistema */}
      <div className="border border-blue-200 p-4 rounded-lg bg-blue-50">
        <h2 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
          <Building className="h-5 w-5 mr-2 text-blue-700" />
          Instância Principal do Sistema
        </h2>
        <p className="text-sm text-blue-700 mb-4">
          Esta instância é responsável por notificar os estabelecimentos. Cada estabelecimento terá sua própria instância para se comunicar com seus clientes.
        </p>
        
        {isLoadingMainInstance ? (
          <div className="flex items-center justify-center p-4 rounded-md bg-white bg-opacity-50">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
            <p className="text-blue-600 font-medium">Verificando instância principal...</p>
          </div>
        ) : mainInstanceData ? (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge className={mainInstanceConnected ? "bg-green-500" : "bg-amber-500"}>
                  {mainInstanceConnected ? "Conectado" : "Desconectado"}
                </Badge>
                <h3 className="text-md font-medium mt-2">{mainInstanceData.profileName || mainInstanceData.name}</h3>
                <p className="text-sm text-gray-500">{mainInstanceData.owner || "Número não disponível"}</p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshMainInstance}
                disabled={isLoadingMainInstance}
              >
                {isLoadingMainInstance ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    Atualizar
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <div className="font-mono text-xs bg-gray-50 p-1 mt-1 rounded border border-gray-200">
                  {mainInstanceData.id}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <div className="mt-1">
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full mr-1.5 ${mainInstanceData.status === 'connected' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <span>{mainInstanceData.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700">Atenção</AlertTitle>
            <AlertDescription className="text-amber-700">
              Não foi possível verificar a instância principal. Contate o administrador do sistema.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Separator className="my-6" />
      
      <div className="flex items-center space-x-2 mb-4">
        <User className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-medium text-purple-800">Instância do Estabelecimento</h2>
      </div>
      
      {isLoadingInstance && (
        <div className="flex items-center justify-center p-4 rounded-md bg-blue-50 border border-blue-200">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
          <p className="text-blue-600 font-medium">Verificando status da instância...</p>
        </div>
      )}
      
      {/* Seção de Instância Conectada */}
      {hasConnectedInstance && connectedInstance && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="border-b border-green-100 bg-green-100/30 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-green-800">
                  <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                  Instância WhatsApp do Estabelecimento
                </CardTitle>
                <CardDescription className="text-green-700">
                  Esta instância está conectada e pronta para uso com seus clientes
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-200 text-green-700 hover:bg-green-100"
                onClick={refreshConnectedInstance}
                disabled={isLoadingInstance}
              >
                {isLoadingInstance ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    Atualizar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-green-700">Status da Conexão</Label>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${connectedInstance.status === 'connected' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span className="font-medium">
                    {connectedInstance.status === 'connected' ? 'Conectado' : 'Status: ' + connectedInstance.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-green-700">Nome do Perfil</Label>
                <div className="font-medium">
                  {connectedInstance.profileName || 'Não disponível'}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-green-700">Número do WhatsApp</Label>
                <div className="font-medium flex items-center">
                  <Smartphone className="h-4 w-4 mr-1 text-green-600" />
                  {connectedInstance.owner || 'Não disponível'}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-green-700">Plataforma</Label>
                <div className="font-medium">
                  {connectedInstance.plataform || 'Não disponível'}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-green-700">ID da Instância</Label>
                <div className="font-mono text-sm bg-white/50 p-1 rounded border border-green-100">
                  {connectedInstance.id}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-green-700">Tipo de Conta</Label>
                <div className="font-medium">
                  {connectedInstance.isBusiness ? (
                    <Badge variant="default" className="bg-blue-500">WhatsApp Business</Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-200 text-green-700">WhatsApp Pessoal</Badge>
                  )}
                </div>
              </div>
              
              {connectedInstance.lastDisconnect && (
                <div className="space-y-2">
                  <Label className="text-green-700">Última Desconexão</Label>
                  <div className="font-medium">
                    {new Date(connectedInstance.lastDisconnect).toLocaleString()}
                  </div>
                </div>
              )}
              
              {connectedInstance.lastDisconnectReason && (
                <div className="space-y-2">
                  <Label className="text-green-700">Motivo da Última Desconexão</Label>
                  <div className="font-medium">
                    {connectedInstance.lastDisconnectReason}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-green-700">Criado em</Label>
                <div className="font-medium">
                  {new Date(connectedInstance.created).toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-green-700">Última Atualização</Label>
                <div className="font-medium">
                  {new Date(connectedInstance.updated).toLocaleString()}
                </div>
              </div>
            </div>
            
            {connectedInstance.profilePicUrl && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-green-200">
                  <img 
                    src={connectedInstance.profilePicUrl} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {(!hasConnectedInstance || !connectedInstance) && (
        <Card className="bg-white shadow-lg border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-100">
            <CardTitle className="flex items-center text-green-800">
              <MessageSquare className="h-5 w-5 mr-2 text-green-700" />
              Conexão do WhatsApp do Estabelecimento
            </CardTitle>
            <CardDescription className="text-green-700">
              Configure a integração com o WhatsApp para envio de mensagens automáticas aos seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && instanceData && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Sucesso!</AlertTitle>
                <AlertDescription>
                  Instância criada com sucesso. Use o código de pareamento ou o QR Code para conectar.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Instância</Label>
                <Input 
                  id="name" 
                  placeholder="Digite o nome da instância" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="systemName">Nome do Sistema</Label>
                <Input 
                  id="systemName" 
                  value={systemName}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={createInstance} 
              disabled={isLoading || !name}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Criar Instância do WhatsApp
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {success && instanceData && !hasConnectedInstance && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Instância</CardTitle>
              <CardDescription>
                Informações sobre a instância criada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="block mb-1">ID da Instância</Label>
                  <div className="text-sm p-2 bg-gray-100 rounded-md">{instanceData.instance.id}</div>
                </div>
                
                <div>
                  <Label className="block mb-1">Token da Instância</Label>
                  <div className="text-sm p-2 bg-gray-100 rounded-md font-mono">{instanceData.token}</div>
                </div>
                

                
                <div>
                  <Label className="block mb-1">Status</Label>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${instanceData.instance.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">{instanceData.instance.status === 'connected' ? 'Conectado' : 'Aguardando conexão'}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1">Informações Adicionais</Label>
                  <div className="text-sm p-2 bg-gray-100 rounded-md">{instanceData.info}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Conectar Instância</CardTitle>
              <CardDescription>
                Conecte sua instância do WhatsApp via QR Code ou pareamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{connectError}</AlertDescription>
                </Alert>
              )}
              
              {connectSuccess && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">Sucesso!</AlertTitle>
                  <AlertDescription>
                    Instância conectada com sucesso.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-4">
                <h3 className="text-lg font-medium">Conexão via QR Code</h3>
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para exibir o QR Code e conectar seu WhatsApp.
                </p>
                <Button 
                  variant="default" 
                  className="flex items-center gap-2 w-full"
                  onClick={() => {
                    setIsQrModalOpen(true);
                    refreshQrCode();
                    startStatusCheck();
                  }}
                >
                  <QrCode className="h-5 w-5" />
                  Abrir QR Code
                </Button>
                
                <Separator className="my-2" />
                
                <h3 className="text-md font-medium">Opção 2: Pareamento via telefone</h3>
                <p className="text-sm text-muted-foreground">
                  Informe o número de telefone com código do país (ex: 5511999999999) para receber o código de pareamento.
                </p>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="phone" className="sr-only">Número de telefone</Label>
                    <Input 
                      id="phone" 
                      placeholder="Ex: 5511999999999" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => connectInstance(phoneNumber)}
                    disabled={connectLoading || !phoneNumber || phoneNumber.length < 10}
                    variant="secondary"
                  >
                    {connectLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      'Parear'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {hasConnectedInstance && (
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Automáticas</CardTitle>
            <CardDescription>
              Configure mensagens automáticas para seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confirmação de Agendamento</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar mensagem quando um novo agendamento for realizado
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lembrete de Agendamento</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar lembrete 24h antes do horário marcado
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aniversário</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar mensagem de felicitação no aniversário do cliente
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modal do QR Code */}
      <Dialog open={isQrModalOpen} onOpenChange={(open) => {
        setIsQrModalOpen(open);
        if (!open && statusCheckIntervalRef.current) {
          // Limpar o intervalo quando o modal é fechado
          window.clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code para Conexão</DialogTitle>
            <DialogDescription>
              Abra o WhatsApp no seu celular, acesse Configurações &gt; Aparelhos vinculados e escaneie o QR Code abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            {instanceData && instanceData.instance.qrcode ? (
              <div className="bg-white p-6 border rounded-md">
                <img 
                  src={instanceData.instance.qrcode} 
                  alt="QR Code para conexão" 
                  className="w-full max-w-[350px]"
                />
              </div>
            ) : (
              <div className="p-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p>Carregando QR Code...</p>
              </div>
            )}
          </div>
          {isLoadingQrCode && (
            <div className="text-center text-sm text-muted-foreground">
              <Button 
                variant="outline" 
                size="sm" 
                className="mx-auto" 
                onClick={refreshQrCode}
                disabled={isLoadingQrCode}
              >
                {isLoadingQrCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar QR Code'
                )}
              </Button>
            </div>
          )}
          {instanceData && instanceData.instance.paircode && (
            <div className="text-center text-sm text-muted-foreground mb-4">
              Ou use o código de pareamento: <span className="font-mono font-bold">{instanceData.instance.paircode}</span>
            </div>
          )}
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsQrModalOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

