import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { sendTextMessage, sendMediaMessage, sendLocationMessage } from "@/lib/whatsappApi";
import { Send, Loader2, MapPin, Image, FileText } from "lucide-react";

interface WhatsAppSenderProps {
  defaultPhoneNumber?: string;
  token?: string; // Token da instância
}

export function WhatsAppSender({ defaultPhoneNumber = '', token }: WhatsAppSenderProps) {
  // Estado para a guia ativa
  const [activeTab, setActiveTab] = useState('text');
  
  // Estados para mensagem de texto
  const [textMessage, setTextMessage] = useState({
    number: defaultPhoneNumber,
    text: '',
    linkPreview: false,
    readchat: true,
    token: token
  });
  
  // Estados para mensagem de mídia
  const [mediaMessage, setMediaMessage] = useState({
    number: defaultPhoneNumber,
    text: '',
    type: 'image' as 'document' | 'video' | 'image' | 'audio' | 'ptt' | 'sticker',
    file: '',
    docName: '',
    readchat: true,
    token: token
  });
  
  // Estados para localização
  const [locationMessage, setLocationMessage] = useState({
    number: defaultPhoneNumber,
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    readchat: true,
    token: token
  });
  
  // Atualizar o token quando ele mudar
  useEffect(() => {
    setTextMessage(prev => ({ ...prev, token }));
    setMediaMessage(prev => ({ ...prev, token }));
    setLocationMessage(prev => ({ ...prev, token }));
  }, [token]);
  
  // Estado de carregamento
  const [loading, setLoading] = useState(false);
  
  // Referência para prevenir múltiplos envios
  const isSubmittingRef = useRef(false);
  
  // Manipuladores de alteração para os formulários
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTextMessage(prev => ({ ...prev, [name]: value, token }));
  };
  
  const handleTextToggle = (name: string, value: boolean) => {
    setTextMessage(prev => ({ ...prev, [name]: value, token }));
  };
  
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMediaMessage(prev => ({ ...prev, [name]: value, token }));
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocationMessage(prev => ({ ...prev, [name]: value, token }));
  };
  
  // Funções para enviar mensagens
  const sendText = async () => {
    // Prevenir múltiplos envios
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);
    
    try {
      await sendTextMessage(textMessage);
      toast({
        title: "Mensagem enviada",
        description: "A mensagem de texto foi enviada com sucesso",
        variant: "default",
        id: "whatsapp-text-success"
      });
      // Limpar o formulário após envio bem-sucedido
      setTextMessage(prev => ({ ...prev, text: '' }));
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
        id: "whatsapp-text-error"
      });
    } finally {
      setLoading(false);
      // Pequeno delay antes de permitir novo envio
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  };
  
  const sendMedia = async () => {
    // Prevenir múltiplos envios
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);
    
    try {
      await sendMediaMessage(mediaMessage);
      toast({
        title: "Mídia enviada",
        description: "A mídia foi enviada com sucesso",
        variant: "default",
        id: "whatsapp-media-success"
      });
      // Limpar o formulário após envio bem-sucedido
      setMediaMessage(prev => ({ ...prev, file: '', text: '' }));
    } catch (error) {
      toast({
        title: "Erro ao enviar mídia",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
        id: "whatsapp-media-error"
      });
    } finally {
      setLoading(false);
      // Pequeno delay antes de permitir novo envio
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  };
  
  const sendLocation = async () => {
    // Prevenir múltiplos envios
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);
    
    try {
      await sendLocationMessage(locationMessage);
      toast({
        title: "Localização enviada",
        description: "A localização foi enviada com sucesso",
        variant: "default",
        id: "whatsapp-location-success"
      });
      // Limpar o formulário após envio bem-sucedido
      setLocationMessage(prev => ({
        ...prev,
        name: '',
        address: '',
        latitude: 0,
        longitude: 0
      }));
    } catch (error) {
      toast({
        title: "Erro ao enviar localização",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
        id: "whatsapp-location-error"
      });
    } finally {
      setLoading(false);
      // Pequeno delay antes de permitir novo envio
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Enviar Mensagem WhatsApp</CardTitle>
          {token ? (
            <Badge className="bg-blue-100 text-blue-800">
              Instância Principal
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-800">
              Instância do Estabelecimento
            </Badge>
          )}
        </div>
        <CardDescription>
          Envie mensagens de texto, mídia ou localização via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="text">Texto</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="location">Localização</TabsTrigger>
          </TabsList>
          
          {/* Mensagem de texto */}
          <TabsContent value="text">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número de telefone (com código do país)</Label>
                <Input
                  id="number"
                  name="number"
                  placeholder="Ex: 5511999999999"
                  value={textMessage.number}
                  onChange={handleTextChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="text">Mensagem</Label>
                <Textarea
                  id="text"
                  name="text"
                  placeholder="Digite a mensagem que deseja enviar..."
                  value={textMessage.text}
                  onChange={handleTextChange}
                  rows={5}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="linkPreview"
                  checked={textMessage.linkPreview}
                  onCheckedChange={(checked) => handleTextToggle('linkPreview', checked)}
                />
                <Label htmlFor="linkPreview">Mostrar prévia dos links</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="readchat"
                  checked={textMessage.readchat}
                  onCheckedChange={(checked) => handleTextToggle('readchat', checked)}
                />
                <Label htmlFor="readchat">Marcar chat como lido</Label>
              </div>
            </div>
          </TabsContent>
          
          {/* Mídia */}
          <TabsContent value="media">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="media-number">Número de telefone (com código do país)</Label>
                <Input
                  id="media-number"
                  name="number"
                  placeholder="Ex: 5511999999999"
                  value={mediaMessage.number}
                  onChange={handleMediaChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de mídia</Label>
                <select
                  id="type"
                  name="type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={mediaMessage.type}
                  onChange={handleMediaChange}
                >
                  <option value="image">Imagem</option>
                  <option value="video">Vídeo</option>
                  <option value="document">Documento</option>
                  <option value="audio">Áudio</option>
                  <option value="ptt">Mensagem de voz (PTT)</option>
                  <option value="sticker">Sticker</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file">URL do arquivo</Label>
                <Input
                  id="file"
                  name="file"
                  placeholder="https://exemplo.com/arquivo.jpg"
                  value={mediaMessage.file}
                  onChange={handleMediaChange}
                />
              </div>
              
              {mediaMessage.type === 'document' && (
                <div className="space-y-2">
                  <Label htmlFor="docName">Nome do documento</Label>
                  <Input
                    id="docName"
                    name="docName"
                    placeholder="Nome do arquivo"
                    value={mediaMessage.docName}
                    onChange={handleMediaChange}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="media-text">Mensagem (opcional)</Label>
                <Textarea
                  id="media-text"
                  name="text"
                  placeholder="Digite uma mensagem para acompanhar a mídia..."
                  value={mediaMessage.text}
                  onChange={handleMediaChange}
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Localização */}
          <TabsContent value="location">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location-number">Número de telefone (com código do país)</Label>
                <Input
                  id="location-number"
                  name="number"
                  placeholder="Ex: 5511999999999"
                  value={locationMessage.number}
                  onChange={handleLocationChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome do local</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Shopping Center"
                  value={locationMessage.name}
                  onChange={handleLocationChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
                  value={locationMessage.address}
                  onChange={handleLocationChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.0000001"
                    placeholder="Ex: -23.5505"
                    value={locationMessage.latitude || ''}
                    onChange={(e) => setLocationMessage(prev => ({
                      ...prev,
                      latitude: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.0000001"
                    placeholder="Ex: -46.6333"
                    value={locationMessage.longitude || ''}
                    onChange={(e) => setLocationMessage(prev => ({
                      ...prev,
                      longitude: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => {
            // Verificar se já está processando
            if (loading || isSubmittingRef.current) return;
            
            if (activeTab === 'text') sendText();
            else if (activeTab === 'media') sendMedia();
            else if (activeTab === 'location') sendLocation();
          }} 
          disabled={loading || isSubmittingRef.current || (
            (activeTab === 'text' && (!textMessage.number || !textMessage.text)) ||
            (activeTab === 'media' && (!mediaMessage.number || !mediaMessage.file)) ||
            (activeTab === 'location' && (!locationMessage.number || !locationMessage.name || !locationMessage.address || !locationMessage.latitude || !locationMessage.longitude))
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              {activeTab === 'text' && <Send className="mr-2 h-4 w-4" />}
              {activeTab === 'media' && (
                mediaMessage.type === 'document' ? 
                <FileText className="mr-2 h-4 w-4" /> : 
                <Image className="mr-2 h-4 w-4" />
              )}
              {activeTab === 'location' && <MapPin className="mr-2 h-4 w-4" />}
              Enviar {activeTab === 'text' ? 'Mensagem' : activeTab === 'media' ? 'Mídia' : 'Localização'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 