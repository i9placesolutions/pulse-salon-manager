import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { QrCode, RefreshCw, Check, X, Smartphone, Loader2, MessageSquare, AlertCircle, AlertTriangle, List, Trash } from "lucide-react";
import { useEstablishmentConfigs } from "@/hooks/useEstablishmentConfigs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createWhatsAppInstance, getInstanceStatus, connectInstance, disconnectInstance, listUserInstances, WhatsAppInstance, deleteInstance } from "@/services/whatsapp/api";
import { supabase } from "@/lib/supabaseClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const EstablishmentWhatsApp: React.FC = () => {
  const { whatsAppConfig, isLoading, saveWhatsAppConfig } = useEstablishmentConfigs();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<"connected" | "disconnected">("disconnected");
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [instanceName, setInstanceName] = useState<string>("");
  const [instanceToken, setInstanceToken] = useState<string>("");
  const [instanceCreated, setInstanceCreated] = useState(false);
  
  const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const [showInstancesModal, setShowInstancesModal] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<WhatsAppInstance | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [instanceFormData, setInstanceFormData] = useState({
    name: "Meu Estabelecimento",
    systemName: "PULSE SALON MANAGER",
    adminField01: "",
    adminField02: ""
  });
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userInstances, setUserInstances] = useState<WhatsAppInstance[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  
  useEffect(() => {
    if (whatsAppConfig) {
      setStatus(whatsAppConfig.status === "connected" ? "connected" : "disconnected");
      setInstanceName(whatsAppConfig.instanceName || "");
      setInstanceToken(whatsAppConfig.instanceToken || "");
      setInstanceCreated(!!whatsAppConfig.instanceToken);
    } else {
      // Garantir explicitamente que não há instância se não houver configuração
      setStatus("disconnected");
      setInstanceCreated(false);
    }
  }, [whatsAppConfig]);
  
  // Função para abrir o modal de criação de instância
  const openCreateInstanceModal = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      setInstanceFormData(prev => ({
        ...prev,
        adminField01: data?.user?.id || ""
      }));
      setShowCreateInstanceModal(true);
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível identificar seu usuário. Tente fazer login novamente.",
        variant: "destructive",
        className: "bg-red-50 border-red-200",
      });
    }
  };
  
  // Função para atualizar os campos do formulário
  const handleInstanceFormChange = (field: string, value: string) => {
    setInstanceFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Função para criar uma nova instância do WhatsApp com as informações do formulário
  const createInstanceHandler = async () => {
    setIsConnecting(true);
    setShowCreateInstanceModal(false);
    
    try {
      // Verificar se o usuário está autenticado
      const userData = await supabase.auth.getUser();
      const userId = userData.data?.user?.id;
      
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      toast({
        title: "Criando instância",
        description: "Aguarde enquanto criamos sua instância do WhatsApp...",
        variant: "default",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
      
      // Usar nosso novo serviço para criar a instância
      const requestData = {
        name: instanceFormData.name,
        systemName: "PULSE SALON MANAGER",
        adminField01: userId,
        adminField02: ""
      };
      
      const data = await createWhatsAppInstance(requestData);
      
      if (!data || !data.token) {
        throw new Error("Não foi possível criar a instância do WhatsApp");
      }
      
      // Garantir que o token esteja no localStorage
      localStorage.setItem('whatsapp_instance_token', data.token);
      
      // Atualizar o estado local
      setInstanceToken(data.token);
      setInstanceName(data.name);
      setInstanceCreated(true);
      
      // Atualizar o estado local com as informações da nova instância
      const updatedConfig = {
        ...whatsAppConfig,
        instanceToken: data.token,
        instanceName: data.name,
        status: "disconnected"
      };
      
      // Salvar as configurações no banco de dados
      await saveWhatsAppConfig(updatedConfig);
      
      toast({
        title: "Instância criada com sucesso",
        description: "Agora você pode gerar o QR Code para conectar seu WhatsApp",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      toast({
        title: "Erro ao criar instância",
        description: "Não foi possível criar a instância do WhatsApp. Tente novamente.",
        variant: "destructive",
        className: "bg-red-50 border-red-200",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Função para gerar o QR Code
  const generateQrCode = async () => {
    // Verificar se temos um token válido
    const token = instanceToken || localStorage.getItem('whatsapp_instance_token');
    setIsConnecting(true);
    setQrCodeUrl("");
    setShowQrCode(false);
    setShowQrCodeModal(true);
    
    try {
      console.log('Gerando QR Code com token:', token);
      const response = await connectInstance(token);
      
      // Log completo da resposta para debug
      console.log("Resposta completa da API:", response);
      
      if (response && response.instance && response.instance.qrcode) {
        setQrCodeUrl(response.instance.qrcode);
        setShowQrCode(true);
        
        // Iniciar a verificação periódica de status
        setTimeout(() => {
          checkConnectionStatus();
        }, 5000);
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp para conectar",
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        throw new Error("QR Code não disponível na resposta");
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Não foi possível gerar o QR Code. Tente novamente.",
        variant: "destructive",
        className: "bg-red-50 border-red-200",
      });
      setShowQrCodeModal(false);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Função para verificar o status da conexão
  const checkConnectionStatus = async () => {
    if (!instanceToken) {
      toast({
        title: "Erro de token",
        description: "Token da instância não encontrado. Tente criar uma nova instância.",
        variant: "destructive",
        className: "bg-red-50 border-red-200",
      });
      return;
    }
    
    // Atualizar o estado local com o token recuperado
    if (!instanceToken && localStorage.getItem('whatsapp_instance_token')) {
      setInstanceToken(localStorage.getItem('whatsapp_instance_token') as string);
    }
    
    try {
      const statusResult = await getInstanceStatus(instanceToken);
      console.log("Status da instância:", statusResult);
      
      // Verificamos diferentes estruturas possíveis para o status
      const isConnected = 
        statusResult.instance?.status === "connected" || 
        statusResult.status === "connected";
      
      if (statusResult.instance && statusResult.instance.status === "connected") {
        setStatus("connected");
        
        // Atualizar as configurações no banco de dados
        const updatedConfig = {
          ...whatsAppConfig,
          status: "connected",
          instanceName: statusResult.instance.name || instanceName,
        };
        
        await saveWhatsAppConfig(updatedConfig);
        
        toast({
          title: "WhatsApp conectado",
          description: "Seu WhatsApp está conectado e pronto para uso!",
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        setStatus("disconnected");
        
        toast({
          title: "WhatsApp desconectado",
          description: "Seu WhatsApp não está conectado. Gere um QR Code para conectar.",
          variant: "default",
          className: "bg-amber-50 border-amber-200 text-amber-800",
        });
      }
      
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      setStatus("disconnected");
      
      toast({
        title: "Erro ao verificar status",
        description: "Não foi possível verificar o status da conexão",
        variant: "destructive",
        className: "bg-red-50 border-red-200",
      });
    }
  };
  
  // Função que desconecta o WhatsApp
  const disconnectWhatsApp = async () => {
    if (!instanceToken) {
      return;
    }
    
    try {
      await disconnectInstance(instanceToken);
      
      setStatus("disconnected");
      
      // Atualizar as configurações no banco de dados
      const updatedConfig = {
        ...whatsAppConfig,
        status: "disconnected"
      };
      
      await saveWhatsAppConfig(updatedConfig);
      
      toast({
        title: "WhatsApp desconectado",
        description: "Seu WhatsApp foi desconectado com sucesso",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar o WhatsApp",
        variant: "destructive",
        className: "bg-red-50 border-red-200",
      });
    }
  };
  
  // Função para listar as instâncias do usuário
  const loadUserInstances = async () => {
    setIsLoadingInstances(true);
    
    try {
      // Obtém o ID do usuário logado
      const userData = await supabase.auth.getUser();
      const userId = userData.data?.user?.id;
      
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      // Busca as instâncias do usuário
      const instances = await listUserInstances(userId);
      setUserInstances(instances);
      
      // Abre o modal com a lista de instâncias
      setShowInstancesModal(true);
    } catch (error) {
      console.error('Erro ao carregar instâncias do usuário:', error);
      toast({
        title: "Erro ao carregar instâncias",
        description: error instanceof Error ? error.message : "Não foi possível carregar as instâncias",
        variant: "destructive",
        className: "bg-red-50 border-red-200",
      });
    } finally {
      setIsLoadingInstances(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Card de Conexão do WhatsApp */}
      <Card className="border-green-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b border-green-100">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium text-green-700">Status da Conexão</h3>
          </div>
        </div>
        
        <CardContent className="p-5">
          <div className="space-y-5">
            <div className="flex flex-col gap-5">
              {/* Informação sobre a instância selecionada */}
              <div className="border rounded-md p-4 bg-slate-50">
                <h4 className="text-base font-medium mb-3 text-slate-700 border-b pb-2">Instância de WhatsApp Selecionada</h4>
                
                {instanceCreated ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Nome:</span>
                        <span className="text-sm text-slate-800">{instanceName || "Sem nome"}</span>
                      </div>
                      
                      {userInstances.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadUserInstances}
                          className="text-xs px-2 py-0 h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          Trocar Instância
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Status:</span> 
                      {status === "connected" ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Conectado
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                          Desconectado (Gere o QR Code para conectar)
                        </span>
                      )}
                    </div>
                    
                    {status === "connected" && (
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <span>WhatsApp conectado e pronto para uso!</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 items-center justify-center py-3">
                    <p className="text-slate-500 text-sm text-center">Nenhuma instância selecionada.</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={loadUserInstances}
                        className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        Selecionar Instância Existente
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={openCreateInstanceModal}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white"
                      >
                        Criar Nova Instância
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Botões de ação */}
              
              <div className="flex flex-col sm:flex-row gap-2">
                {/* A seção de botões só aparece quando uma instância está criada */}
                {instanceCreated && (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-slate-700">Ações Disponíveis:</h4>
                      
                      {userInstances.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadUserInstances}
                          className="gap-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <List className="h-3.5 w-3.5" />
                          Ver Minhas Instâncias
                        </Button>
                      )}
                    </div>
                    
                    {status !== "connected" && (
                      <div className="flex flex-row gap-2">
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            generateQrCode();
                          }}
                          className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          {isConnecting ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Gerando QR Code...
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4" />
                              Gerar QR Code para Conectar
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            checkConnectionStatus();
                          }}
                          variant="outline"
                          className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          <Check className="h-4 w-4" />
                          Verificar Conexão
                        </Button>
                      </div>
                    )}
                    
                    {status === "connected" && (
                      <div className="w-full">
                        <div className="bg-green-50 border border-green-100 p-3 rounded-md mb-3 flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <p className="text-sm text-green-700">Esta instância está conectada e pronta para uso!</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-1">
                          <Button
                            onClick={disconnectWhatsApp}
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 gap-1.5"
                          >
                            <X className="h-4 w-4" />
                            Desconectar
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 gap-1.5"
                              >
                                <AlertTriangle className="h-4 w-4" />
                                Excluir Instância
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza que deseja excluir esta instância?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. A instância será desconectada e removida permanentemente.
                                  Você terá que criar uma nova instância se desejar usar o WhatsApp novamente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    try {
                                      await deleteInstance(instanceToken);
                                      
                                      setInstanceCreated(false);
                                      setInstanceToken("");
                                      setInstanceName("");
                                      setStatus("disconnected");
                                      
                                      // Limpar configuração no banco
                                      saveWhatsAppConfig({
                                        ...whatsAppConfig,
                                        instanceToken: "",
                                        instanceName: "",
                                        status: "disconnected"
                                      });
                                      
                                      toast({
                                        title: "Instância excluída",
                                        description: "A instância foi excluída com sucesso.",
                                        variant: "default",
                                        className: "bg-green-50 border-green-200 text-green-800",
                                      });
                                    } catch (error) {
                                      console.error("Erro ao excluir instância:", error);
                                      toast({
                                        title: "Erro ao excluir instância",
                                        description: error instanceof Error ? error.message : "Não foi possível excluir a instância",
                                        variant: "destructive",
                                        className: "bg-red-50 border-red-200",
                                      });
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir Instância
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Se não houver instância, mostrar botão para criar */}
                {!instanceCreated && (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-slate-700">Primeiros Passos:</h4>
                      
                      {userInstances.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadUserInstances}
                          className="gap-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <List className="h-3.5 w-3.5" />
                          Ver Minhas Instâncias
                        </Button>
                      )}
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm text-amber-800">
                      <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-600" /> Para usar o WhatsApp, primeiro crie uma instância ou selecione uma existente.</span>
                    </div>
                    
                    <Button
                      onClick={openCreateInstanceModal}
                      disabled={isConnecting}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-sm gap-1.5"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Criar Nova Instância do WhatsApp
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {showQrCode && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Escaneie o código QR para conectar</h4>
                {qrCodeUrl && qrCodeUrl.startsWith("data:image") ? (
                  <img src={qrCodeUrl} alt="QR Code WhatsApp" className="h-64 w-64 mb-2" />
                ) : (
                  <img src={`data:image/png;base64,${qrCodeUrl}`} alt="QR Code WhatsApp" className="h-64 w-64 mb-2" />
                )}
                <p className="text-xs text-gray-500">Abra o WhatsApp no seu celular &gt; Menu &gt; Dispositivos Conectados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de criação de instância */}
      <Dialog open={showCreateInstanceModal} onOpenChange={setShowCreateInstanceModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Instância WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome da Instância
              </Label>
              <Input
                id="name"
                value={instanceFormData.name}
                onChange={(e) => handleInstanceFormChange("name", e.target.value)}
                className="col-span-3"
                placeholder="Nome para controle interno"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="systemName" className="text-right">
                Nome do Sistema
              </Label>
              <Input
                id="systemName"
                value={instanceFormData.systemName}
                onChange={(e) => handleInstanceFormChange("systemName", e.target.value)}
                className="col-span-3"
                placeholder="Nome que aparecerá no WhatsApp"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adminField01" className="text-right">
                Campo Admin 1
              </Label>
              <Input
                id="adminField01"
                value={instanceFormData.adminField01}
                onChange={(e) => handleInstanceFormChange("adminField01", e.target.value)}
                className="col-span-3"
                placeholder="Campo para organização (opcional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adminField02" className="text-right">
                Campo Admin 2
              </Label>
              <Input
                id="adminField02"
                value={instanceFormData.adminField02}
                onChange={(e) => handleInstanceFormChange("adminField02", e.target.value)}
                className="col-span-3"
                placeholder="Campo para organização (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={(e) => {
              e.preventDefault();
              createInstanceHandler();
            }}>
              Criar Instância
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal do QR Code */}
      <Dialog open={showQrCodeModal} onOpenChange={setShowQrCodeModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-sm text-center text-gray-500 mb-4">
              Escaneie o QR code abaixo com seu WhatsApp para conectar
              <br />
              <span className="text-xs opacity-70">Abra o WhatsApp no seu celular &gt; Menu &gt; Dispositivos Conectados</span>
            </div>
            
            {isConnecting ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <RefreshCw className="h-12 w-12 animate-spin text-green-600" />
                <p className="text-sm text-gray-500">Gerando QR Code...</p>
              </div>
            ) : showQrCode ? (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  {qrCodeUrl && (
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code WhatsApp" 
                      className="h-60 w-60"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Este QR code expira em poucos minutos</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-8">Não foi possível gerar o QR Code.</p>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={checkConnectionStatus} className="w-full sm:w-auto">
              Verificar Conexão
            </Button>
            <Button type="button" onClick={() => setShowQrCodeModal(false)} variant="outline" className="w-full sm:w-auto">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para exibir as instâncias do usuário */}
      <Dialog open={showInstancesModal} onOpenChange={setShowInstancesModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Minhas Instâncias do WhatsApp</DialogTitle>
            <DialogDescription>
              Selecione uma das instâncias abaixo para utilizar ou excluir instâncias desconectadas.
              {instanceCreated && (
                <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                  Instância atual: <strong>{instanceName}</strong> ({status === "connected" ? "Conectada" : "Desconectada"})
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isLoadingInstances ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-3 text-gray-500">Carregando instâncias...</p>
              </div>
            ) : userInstances.length > 0 ? (
              <>
                <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                  <p><strong>Como usar:</strong> Clique em "Selecionar" na instância que deseja utilizar. A instância selecionada será a que receberá suas mensagens. Instâncias desconectadas podem ser excluídas.</p>
                </div>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sistema</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userInstances.map((instance) => (
                    <TableRow key={instance.id}>
                      <TableCell className="font-medium">{instance.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={instance.status === "connected" ? "default" : "secondary"}
                          className={instance.status === "connected" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {instance.status === "connected" ? "Conectado" : "Desconectado"}
                        </Badge>
                      </TableCell>
                      <TableCell>{instance.systemName}</TableCell>
                      <TableCell>{new Date(instance.created).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={(e) => {
                              e.preventDefault();
                              setInstanceToken(instance.token);
                              setInstanceName(instance.name);
                              setStatus(instance.status === "connected" ? "connected" : "disconnected");
                              setInstanceCreated(true);
                              setShowInstancesModal(false);
                              
                              // Atualizar a configuração no banco de dados
                              saveWhatsAppConfig({
                                ...whatsAppConfig,
                                instanceToken: instance.token,
                                instanceName: instance.name,
                                status: instance.status
                              });
                              
                              toast({
                                title: "Instância selecionada",
                                description: `A instância ${instance.name} foi selecionada com sucesso.`,
                                variant: "default",
                                className: "bg-green-50 border-green-200 text-green-800",
                              });
                            }} 
                            size="sm" 
                            variant="outline"
                          >
                            Selecionar
                          </Button>
                          
                          {/* Botão de exclusão (apenas para instâncias desconectadas) */}
                          {instance.status !== "connected" && (
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                setInstanceToDelete(instance);
                                setShowDeleteConfirm(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500 flex items-center gap-1"
                            >
                              <Trash className="h-3.5 w-3.5" />
                              Excluir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </>
            ) : (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-center">
                <p className="text-blue-700">Você ainda não possui instâncias do WhatsApp.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                loadUserInstances();
              }} 
              disabled={isLoadingInstances}
            >
              {isLoadingInstances ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>Atualizar Lista</>
              )}
            </Button>
            <Button 
              onClick={() => setShowInstancesModal(false)} 
              variant="outline"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão de instância */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir esta instância?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A instância "{instanceToDelete?.name}" será removida permanentemente.
              Você terá que criar uma nova instância se desejar usar o WhatsApp novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!instanceToDelete) return;
                
                try {
                  await deleteInstance(instanceToDelete.token);
                  
                  // Verificar se a instância excluída é a atual
                  if (instanceToken === instanceToDelete.token) {
                    setInstanceCreated(false);
                    setInstanceToken("");
                    setInstanceName("");
                    setStatus("disconnected");
                    
                    // Limpar configuração no banco
                    saveWhatsAppConfig({
                      ...whatsAppConfig,
                      instanceToken: "",
                      instanceName: "",
                      status: "disconnected"
                    });
                  }
                  
                  // Recarregar a lista de instâncias
                  loadUserInstances();
                  
                  toast({
                    title: "Instância excluída",
                    description: `A instância "${instanceToDelete.name}" foi excluída com sucesso.`,
                    variant: "default",
                    className: "bg-green-50 border-green-200 text-green-800",
                  });
                } catch (error) {
                  console.error("Erro ao excluir instância:", error);
                  toast({
                    title: "Erro ao excluir instância",
                    description: error instanceof Error ? error.message : "Não foi possível excluir a instância",
                    variant: "destructive",
                    className: "bg-red-50 border-red-200",
                  });
                } finally {
                  setInstanceToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Instância
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
