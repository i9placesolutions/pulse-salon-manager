import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Heart, Send, Clock, Search, Info, Check, ChevronsUpDown, Image, Copy, UploadCloud, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBirthdayConfig, saveBirthdayConfig, sendBulkMessage, sendBulkMediaMessage, fetchBirthdayClients, type BirthdayMessageConfig } from "@/lib/uazapiService";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Tipo para serviço
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface BirthdayAutomationConfig {
  isEnabled: boolean;
  messageTemplate: string;
  rewardType: 'discount' | 'service' | 'none';
  rewardValue: number;
  sendTime: string;
  validityDays: number;
  selectedServiceId?: string;
  mediaUrl?: string;
  minDelay: number;
  maxDelay: number;
}

export function BirthdayAutomation() {
  // Serviços disponíveis (mock data)
  const [services] = useState<Service[]>([
    { id: "1", name: "Corte Feminino", price: 120, duration: 60 },
    { id: "2", name: "Corte Masculino", price: 70, duration: 30 },
    { id: "3", name: "Hidratação", price: 90, duration: 45 },
    { id: "4", name: "Coloração", price: 180, duration: 120 },
    { id: "5", name: "Escova", price: 80, duration: 45 },
    { id: "6", name: "Manicure", price: 60, duration: 40 },
    { id: "7", name: "Pedicure", price: 70, duration: 50 },
    { id: "8", name: "Design de Sobrancelhas", price: 50, duration: 30 },
    { id: "9", name: "Massagem Relaxante", price: 120, duration: 60 },
    { id: "10", name: "Limpeza de Pele", price: 150, duration: 75 },
  ]);

  const [config, setConfig] = useState<BirthdayAutomationConfig>({
    isEnabled: false,
    messageTemplate: "Feliz aniversário, {nome}! 🎉\n\nPara celebrar seu dia especial, preparamos um presente para você: [benefício].\n\nVálido por [validade] dias.\n\nAproveite! 🎁",
    rewardType: 'discount',
    rewardValue: 20,
    sendTime: "09:00",
    validityDays: 30,
    selectedServiceId: "",
    mediaUrl: "",
    minDelay: 3,
    maxDelay: 5
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("config");
  const [birthdayClients, setBirthdayClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Carregar configuração salva ao iniciar
  useEffect(() => {
    try {
      const savedConfig = getBirthdayConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
    }
  }, []);

  // Função para verificar e carregar aniversariantes
  const loadBirthdayClients = async () => {
    setIsLoading(true);
    try {
      const clients = await fetchBirthdayClients();
      setBirthdayClients(clients);
    } catch (error) {
      console.error("Erro ao carregar aniversariantes:", error);
      toast({
        title: "Erro ao carregar aniversariantes",
        description: "Não foi possível obter a lista de aniversariantes do dia.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar aniversariantes ao acessar a aba de aniversariantes
  useEffect(() => {
    if (activeTab === "aniversariantes") {
      loadBirthdayClients();
    }
  }, [activeTab]);

  // Função para lidar com o upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Verificar tipo e tamanho do arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Por favor, selecione uma imagem (JPG, PNG, GIF), vídeo (MP4) ou PDF.",
        variant: "destructive",
      });
      return;
    }

    // Limite de 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Criar preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Para outros tipos, mostrar apenas ícone
      setFilePreview(null);
    }
  };

  // Função para fazer upload do arquivo
  const uploadFile = async () => {
    if (!selectedFile) return null;
    
    setIsUploading(true);
    try {
      // Criar um FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Mock: Em um ambiente real, você enviaria para um endpoint de API
      // Por ora, vamos simular o upload gerando uma URL temporária
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular upload
      
      // URL simulada de CDN que seria retornada pelo servidor
      const uploadedUrl = URL.createObjectURL(selectedFile);
      
      // Em um ambiente de produção, a URL real seria retornada pelo servidor
      // const response = await fetch('/api/upload', { method: 'POST', body: formData });
      // const data = await response.json();
      // const uploadedUrl = data.url;
      
      setConfig({ ...config, mediaUrl: uploadedUrl });
      toast({
        title: "Arquivo carregado com sucesso",
        variant: "default",
      });
      return uploadedUrl;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Função para remover arquivo
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setConfig({ ...config, mediaUrl: "" });
  };

  // Modificar a função saveConfig para incluir o upload quando necessário
  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      // Se há um arquivo selecionado mas ainda não foi feito upload, fazer o upload
      if (selectedFile && (!config.mediaUrl || config.mediaUrl.startsWith('blob:'))) {
        const uploadedUrl = await uploadFile();
        if (uploadedUrl) {
          await saveBirthdayConfig({
            ...config,
            mediaUrl: uploadedUrl
          });
        } else {
          throw new Error("Falha ao fazer upload da mídia");
        }
      } else {
        // Se não há arquivo novo, salvar normalmente
        await saveBirthdayConfig(config);
      }
      
      toast({
        title: "Configurações salvas com sucesso",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMessage = async () => {
    let testMessage = "";
    
    if (config.rewardType === 'none') {
      // Para mensagem sem benefício, substituir apenas o nome
      testMessage = config.messageTemplate
        .replace("{nome}", "Maria Silva")
        .replace(/\[benefício\].*?\[validade\].*?dias\./gs, ""); // Remove a parte do benefício e validade
    } else {
      // Mensagem normal com benefício
      testMessage = config.messageTemplate
        .replace("{nome}", "Maria Silva")
        .replace("[benefício]", getRewardText())
        .replace("[validade]", config.validityDays.toString());
    }
    
    // Testar envio da mensagem
    toast({
      title: "Mensagem de teste",
      description: testMessage,
      variant: "default"
    });

    // Se tiver URL de mídia, mostrar preview
    if (config.mediaUrl) {
      toast({
        title: "Mídia incluída",
        description: `URL da mídia: ${config.mediaUrl}`,
        variant: "default"
      });
    }
  };
  
  // Função para enviar mensagens de aniversário para os clientes
  const handleSendBirthdayMessages = async () => {
    if (birthdayClients.length === 0) {
      toast({
        title: "Nenhum aniversariante",
        description: "Não há aniversariantes para enviar mensagens hoje.",
        variant: "default"
      });
      return;
    }

    setIsLoading(true);
    try {
      const numbers = birthdayClients.map(client => client.phone);
      const results = [];

      // Para cada cliente, personalizar a mensagem
      for (const client of birthdayClients) {
        let personalizedMessage = config.messageTemplate
          .replace("{nome}", client.name);

        if (config.rewardType !== 'none') {
          personalizedMessage = personalizedMessage
            .replace("[benefício]", getRewardText())
            .replace("[validade]", config.validityDays.toString());
        } else {
          // Remover menções a benefícios e validade
          personalizedMessage = personalizedMessage
            .replace(/\[benefício\].*?\[validade\].*?dias\./gs, "");
        }

        // Se tem mídia, enviar com mídia, senão apenas texto
        if (config.mediaUrl) {
          const mediaResult = await sendBulkMediaMessage(
            [client.phone],
            config.mediaUrl,
            personalizedMessage,
            config.minDelay,
            config.maxDelay
          );
          results.push(...mediaResult);
        } else {
          const textResult = await sendBulkMessage(
            [client.phone],
            personalizedMessage,
            config.minDelay,
            config.maxDelay
          );
          results.push(...textResult);
        }
      }

      // Contar sucessos e falhas
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      toast({
        title: "Mensagens de aniversário enviadas",
        description: `${successful} mensagens enviadas com sucesso. ${failed} falhas.`,
        variant: successful > 0 ? "default" : "destructive"
      });

    } catch (error) {
      console.error("Erro ao enviar mensagens de aniversário:", error);
      toast({
        title: "Erro ao enviar mensagens",
        description: "Ocorreu um erro ao enviar as mensagens de aniversário.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedService = () => {
    return services.find(s => s.id === config.selectedServiceId);
  };

  const getRewardText = () => {
    switch (config.rewardType) {
      case 'discount':
        return `${config.rewardValue}% de desconto em qualquer serviço`;
      case 'service': {
        const service = getSelectedService();
        return service 
          ? `um(a) ${service.name} gratuito(a)`
          : "um serviço gratuito à sua escolha*";
      }
      case 'none':
        return "nenhum benefício adicional";
      default:
        return "";
    }
  };

  const handleRewardTypeChange = (value: 'discount' | 'service' | 'none') => {
    if (value === 'none') {
      // Mudar o template da mensagem para remover menções a benefícios e validade
      setConfig({ 
        ...config, 
        rewardType: value,
        messageTemplate: "Feliz aniversário, {nome}! 🎉\n\nQueremos celebrar esta data especial com você.\n\nTenha um dia maravilhoso! 🎁"
      });
    } else if (config.rewardType === 'none') {
      // Se está mudando de 'none' para outro tipo, restaurar template com benefício
      setConfig({ 
        ...config, 
        rewardType: value,
        messageTemplate: "Feliz aniversário, {nome}! 🎉\n\nPara celebrar seu dia especial, preparamos um presente para você: [benefício].\n\nVálido por [validade] dias.\n\nAproveite! 🎁"
      });
    } else {
      // Apenas mudar o tipo sem alterar o template
      setConfig({ ...config, rewardType: value });
    }
  };

  // Filtra serviços com base no termo de busca
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Automação de Aniversários</CardTitle>
              <CardDescription>Configure mensagens e benefícios automáticos para aniversariantes</CardDescription>
            </div>
            <Switch 
              checked={config.isEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, isEnabled: checked })}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="config">Configurações</TabsTrigger>
              <TabsTrigger value="aniversariantes">Aniversariantes</TabsTrigger>
            </TabsList>
            <TabsContent value="config">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Benefício</Label>
                  <RadioGroup
                    value={config.rewardType}
                    onValueChange={handleRewardTypeChange}
                  >
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="discount" id="reward-discount" />
                        <Label htmlFor="reward-discount">Desconto Percentual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="service" id="reward-service" />
                        <Label htmlFor="reward-service">Serviço Gratuito</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="reward-none" />
                        <Label htmlFor="reward-none">Sem Benefício</Label>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  <Alert variant="info" className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Todas as informações do benefício ficarão registradas no histórico do cliente quando utilizadas.
                    </AlertDescription>
                  </Alert>
                </div>

                {config.rewardType === 'discount' && (
                  <div className="grid gap-2">
                    <Label htmlFor="reward-value">Valor do Desconto (%)</Label>
                    <Input 
                      id="reward-value"
                      type="number"
                      value={config.rewardValue}
                      onChange={(e) => setConfig({ ...config, rewardValue: Number(e.target.value) })}
                      min={1}
                      max={100}
                    />
                  </div>
                )}
                
                {config.rewardType === 'service' && (
                  <div className="grid gap-2">
                    <Label htmlFor="service-select">Serviço Gratuito</Label>
                    
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Buscar serviço..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    
                    <div className="border rounded-md p-1 max-h-[200px] overflow-y-auto">
                      {filteredServices.map((service) => {
                        const isSelected = config.selectedServiceId === service.id;
                        return (
                          <button
                            key={service.id}
                            type="button" 
                            className={`flex items-center w-full p-3 text-left hover:bg-slate-100 rounded-md ${
                              isSelected ? "bg-slate-100" : ""
                            }`}
                            onClick={() => setConfig({
                              ...config,
                              selectedServiceId: isSelected ? "" : service.id
                            })}
                          >
                            <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                              isSelected ? "bg-primary border-primary" : "border-gray-300"
                            }`}>
                              {isSelected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex justify-between items-center w-full">
                              <span>{service.name}</span>
                              <span className="text-sm text-muted-foreground">
                                R$ {service.price.toFixed(2)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      {filteredServices.length === 0 && (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Nenhum serviço encontrado
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {config.selectedServiceId ? "1 serviço selecionado" : "Nenhum serviço selecionado"}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="send-time">Horário de Envio (WhatsApp)</Label>
                    <Input 
                      id="send-time"
                      type="time"
                      value={config.sendTime}
                      onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {config.rewardType !== 'none' && (
                  <div className="grid gap-2">
                    <Label htmlFor="validity">Validade do Benefício (dias)</Label>
                    <Input 
                      id="validity"
                      type="number"
                      value={config.validityDays}
                      onChange={(e) => setConfig({ ...config, validityDays: Number(e.target.value) })}
                      min={1}
                      max={365}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Mídia da Mensagem</Label>
                  <div className="space-y-4">
                    {filePreview ? (
                      <div className="relative border rounded-md p-2 w-full">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                            {filePreview.startsWith('data:image') ? (
                              <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <Image className="h-10 w-10 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium truncate">{selectedFile?.name}</p>
                            <p className="text-sm text-gray-500">{(selectedFile?.size || 0) / 1024 < 1000 
                              ? `${Math.round((selectedFile?.size || 0) / 1024)} KB` 
                              : `${Math.round((selectedFile?.size || 0) / 1024 / 1024 * 10) / 10} MB`}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={removeFile} className="text-red-500">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 h-32">
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Clique para fazer upload</span>
                          <span className="text-xs text-gray-500">JPG, PNG, GIF, MP4 ou PDF até 5MB</span>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/*,video/mp4,application/pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message-template">Mensagem Personalizada</Label>
                  <Textarea 
                    id="message-template"
                    value={config.messageTemplate}
                    onChange={(e) => setConfig({ ...config, messageTemplate: e.target.value })}
                    className="min-h-[150px]"
                    placeholder={config.rewardType === 'none' 
                      ? "Use {nome} para inserir o nome do cliente" 
                      : "Use {nome}, [benefício] e [validade] como variáveis na mensagem"}
                  />
                  <p className="text-sm text-muted-foreground">
                    {config.rewardType === 'none' 
                      ? "Variáveis disponíveis: {nome}" 
                      : "Variáveis disponíveis: {nome}, [benefício], [validade]"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-delay">Delay Mínimo de Envio (minutos)</Label>
                  <Input 
                    id="min-delay"
                    type="number"
                    value={config.minDelay}
                    onChange={(e) => setConfig({ ...config, minDelay: Number(e.target.value) })}
                    min={0}
                    max={60}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-delay">Delay Máximo de Envio (minutos)</Label>
                  <Input 
                    id="max-delay"
                    type="number"
                    value={config.maxDelay}
                    onChange={(e) => setConfig({ ...config, maxDelay: Number(e.target.value) })}
                    min={0}
                    max={60}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleTestMessage}>
                    <Send className="mr-2 h-4 w-4" />
                    Testar Mensagem
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setConfig({
                      isEnabled: false,
                      messageTemplate: config.rewardType === 'none'
                        ? "Feliz aniversário, {nome}! 🎉\n\nQueremos celebrar esta data especial com você.\n\nTenha um dia maravilhoso! 🎁"
                        : "Feliz aniversário, {nome}! 🎉\n\nPara celebrar seu dia especial, preparamos um presente para você: [benefício].\n\nVálido por [validade] dias.\n\nAproveite! 🎁",
                      rewardType: config.rewardType,
                      rewardValue: 20,
                      sendTime: "09:00",
                      validityDays: 30,
                      selectedServiceId: "",
                      mediaUrl: "",
                      minDelay: 3,
                      maxDelay: 5
                    })}>
                      Redefinir
                    </Button>
                    <Button onClick={handleSaveConfig}>
                      <Heart className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="aniversariantes">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">Aniversariantes do Dia</h2>
                  <Button onClick={handleSendBirthdayMessages}>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagens
                  </Button>
                </div>
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Carregando aniversariantes...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {birthdayClients.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Nenhum aniversariante encontrado hoje.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {birthdayClients.map((client) => (
                          <div key={client.id} className="flex items-center justify-between p-4 border rounded-md">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold">{client.name}</span>
                              <span className="text-sm text-muted-foreground">{client.phone}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
