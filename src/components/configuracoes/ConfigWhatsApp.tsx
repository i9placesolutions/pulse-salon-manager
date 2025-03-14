
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
import { AlertCircle, CheckCircle, Loader2, QrCode } from "lucide-react";

// Interface para representar os dados da instância do WhatsApp
interface WhatsAppInstance {
  id: string;
  token: string;
  status: string;
  paircode: string;
  qrcode: string;
  name: string;
  profileName: string;
  profilePicUrl: string;
  isBusiness: boolean;
  plataform: string;
  systemName: string;
  owner: string;
  lastDisconnect: string;
  lastDisconnectReason: string;
  adminField01: string;
  openai_apikey: string;
  chatbot_enabled: boolean;
  chatbot_ignoreGroups: boolean;
  chatbot_stopConversation: string;
  chatbot_stopMinutes: number;
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
  info: string;
}

// Interface para a resposta da API de conexão
interface ConnectResponse {
  connected: boolean;
  loggedIn: boolean;
  jid: string | null;
  instance: WhatsAppInstance;
}

export function ConfigWhatsApp() {
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
  
  // Função para verificar o status da instância
  const checkInstanceStatus = async () => {
    if (!instanceToken) return;
    
    setIsCheckingStatus(true);
    
    try {
      const response = await fetch('https://i9place3.uazapi.com/instance/status', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'token': instanceToken
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.instance && data.instance.status === 'connected') {
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
        
        // Limpar o intervalo
        if (statusCheckIntervalRef.current) {
          window.clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    } finally {
      setIsCheckingStatus(false);
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
      const response = await fetch('https://i9place3.uazapi.com/instance/connect', {
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
      const response = await fetch('https://i9place3.uazapi.com/instance/connect', {
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
        systemName
      };
      
      // Fazer a chamada à API
      const response = await fetch('https://i9place3.uazapi.com/instance/init', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'admintoken': adminToken
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar instância');
      }
      
      // Configurar o estado de sucesso e armazenar os dados retornados
      setSuccess(true);
      setInstanceData(data);
      setInstanceToken(data.token);
    } catch (err) {
      console.error('Erro ao criar instância:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao criar instância');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conexão do WhatsApp</CardTitle>
              <CardDescription>
                Configure a integração com o WhatsApp para envio de mensagens automáticas
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
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Criar Instância'
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {success && instanceData && (
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
            </>
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
