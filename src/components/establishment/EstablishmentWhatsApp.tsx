import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { QrCode, RefreshCw, Check, X, Smartphone } from "lucide-react";
import { useEstablishmentConfigs } from "@/hooks/useEstablishmentConfigs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { whatsAppService } from "@/lib/whatsappApi";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [instanceFormData, setInstanceFormData] = useState({
    name: "Pulse Salon Manager",
    systemName: "Pulse Salon Manager",
    adminField01: "",
    adminField02: ""
  });
  
  useEffect(() => {
    if (whatsAppConfig) {
      setStatus(whatsAppConfig.status === "connected" ? "connected" : "disconnected");
      setInstanceName(whatsAppConfig.instanceName || "");
      setInstanceToken(whatsAppConfig.instanceToken || "");
      setInstanceCreated(!!whatsAppConfig.instanceToken);
    }
  }, [whatsAppConfig]);
  
  // Função para abrir o modal de criação de instância
  const openCreateInstanceModal = () => {
    const userData = supabase.auth.getUser();
    userData.then((data) => {
      setInstanceFormData(prev => ({
        ...prev,
        adminField01: data.data?.user?.id || ""
      }));
    });
    setShowCreateInstanceModal(true);
  };
  
  // Função para atualizar os campos do formulário
  const handleInstanceFormChange = (field: string, value: string) => {
    setInstanceFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Função para criar uma nova instância do WhatsApp com as informações do formulário
  const createWhatsAppInstance = async () => {
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
      });
      
      // Criar a instância conforme a documentação da API uazapiGO
      const instance = await whatsAppService.createInstance(
        instanceFormData.name,
        instanceFormData.adminField01 || userId,
        instanceFormData.systemName,
        instanceFormData.adminField02
      );
      
      if (!instance.token) {
        throw new Error("Não foi possível criar a instância do WhatsApp");
      }
      
      // Atualizar o estado local
      setInstanceToken(instance.token);
      setInstanceName(instance.instanceName);
      setInstanceCreated(true);
      
      // Atualizar o estado local com as informações da nova instância
      const updatedConfig = {
        ...whatsAppConfig,
        instanceToken: instance.token,
        instanceName: instance.instanceName,
        status: "disconnected"
      };
      
      // Salvar as configurações no banco de dados
      await saveWhatsAppConfig(updatedConfig);
      
      toast({
        title: "Instância criada com sucesso",
        description: "Agora você pode gerar o QR Code para conectar seu WhatsApp",
        variant: "success",
      });
      
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      toast({
        title: "Erro ao criar instância",
        description: "Não foi possível criar a instância do WhatsApp. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Função para gerar o QR Code
  const generateQrCode = async () => {
    setIsConnecting(true);
    setQrCodeUrl("");
    setShowQrCode(false);
    setShowQrCodeModal(true);
    
    try {
      // Verifica se existe uma instância
      if (!instanceToken) {
        throw new Error("Não existe uma instância criada");
      }
      
      // Conecta com a instância para obter o QR Code
      const response = await whatsAppService.connectInstance(instanceToken);
      
      // Log completo da resposta para debug
      console.log("Resposta completa da API:", response);
      
      if (response && response.qrcode) {
        // A API retorna o QR code em diferentes formatos possíveis
        if (typeof response.qrcode === 'string') {
          setQrCodeUrl(response.qrcode);
        } else if (response.qrcode.base64) {
          setQrCodeUrl(response.qrcode.base64);
        }
        
        setShowQrCode(true);
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR code para conectar seu dispositivo",
          variant: "success",
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
        title: "Instância não encontrada",
        description: "Primeiro crie uma instância para verificar o status",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const statusResult = await whatsAppService.getInstanceStatus(instanceToken);
      console.log("Status da instância:", statusResult);
      
      // Verificamos diferentes estruturas possíveis para o status
      const isConnected = 
        statusResult.instance?.status === "connected" || 
        statusResult.status === "connected";
      
      if (isConnected) {
        setStatus("connected");
        
        // Atualizar as configurações no banco de dados
        const updatedConfig = {
          ...whatsAppConfig,
          status: "connected"
        };
        
        await saveWhatsAppConfig(updatedConfig);
        
        toast({
          title: "WhatsApp conectado",
          description: "Seu WhatsApp está conectado e pronto para uso!",
          variant: "success",
        });
      } else {
        setStatus("disconnected");
        
        toast({
          title: "WhatsApp desconectado",
          description: "Seu WhatsApp não está conectado. Gere um QR Code para conectar.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      setStatus("disconnected");
      
      toast({
        title: "Erro ao verificar status",
        description: "Não foi possível verificar o status da conexão",
        variant: "destructive",
      });
    }
  };
  
  // Função que desconecta o WhatsApp
  const disconnectWhatsApp = async () => {
    if (!instanceToken) {
      return;
    }
    
    try {
      await whatsAppService.disconnectInstance(instanceToken);
      
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
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar o WhatsApp",
        variant: "destructive",
      });
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
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Status:</span> 
                  {status === "connected" ? (
                    <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Conectado
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                      Desconectado
                    </span>
                  )}
                </div>
                
                {status === "connected" && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <span>Dispositivo conectado:</span>
                    <span className="text-green-800">{instanceName}</span>
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {!instanceCreated && (
                  <Button
                    onClick={openCreateInstanceModal}
                    disabled={isConnecting}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm gap-1.5"
                  >
                    <Smartphone className="h-4 w-4" />
                    Criar Instância
                  </Button>
                )}
                
                {instanceCreated && (
                  <div className="flex flex-col gap-2 mb-4 w-full">
                    {status !== "connected" && (
                      <div className="flex flex-row gap-2">
                        <Button
                          onClick={generateQrCode}
                          disabled={isConnecting}
                          className="bg-green-600 hover:bg-green-700 text-white shadow-sm gap-1.5"
                        >
                          {isConnecting ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Gerando QR Code...
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4" />
                              Gerar QR Code
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={checkConnectionStatus}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-1.5"
                        >
                          <Check className="h-4 w-4" />
                          Verificar Conexão
                        </Button>
                      </div>
                    )}
                    
                    {status === "connected" && (
                      <Button
                        onClick={disconnectWhatsApp}
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 gap-1.5"
                      >
                        <X className="h-4 w-4" />
                        Desconectar
                      </Button>
                    )}
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
            <Button type="submit" onClick={createWhatsAppInstance}>
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
                  {qrCodeUrl && qrCodeUrl.startsWith("data:image") ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code WhatsApp" 
                      className="h-60 w-60"
                    />
                  ) : (
                    <img 
                      src={`data:image/png;base64,${qrCodeUrl}`} 
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
    </div>
  );
};
