import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { toast } from '../components/ui/use-toast';
import { 
  Bot, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import WhatsAppGPTService from '../services/whatsapp/whatsappGptService';
import { WebhookHandler } from '../components/whatsapp-ia/WebhookHandler';
import { IAWhatsappDashboard } from '../components/whatsapp-ia/IAWhatsappDashboard';

const IAWhatsapp: React.FC = () => {
  const { user } = useAppState();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Configurações da IA
  const [config, setConfig] = useState({
    establishment_id: '',
    active: false,
    welcome_message: 'Olá! Sou o assistente virtual do salão. Como posso ajudar você hoje?',
    establishment_info: '',
    openai_key: '',  // A chave será configurada pelo usuário na interface
    instance_id: '1U3F27-WDQ2RG-AGAT7I',
    instance_token: ''
  });
  
  // Estatísticas
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalConversations: 0,
    totalClients: 0,
    scheduledAppointments: 0,
    confirmedAppointments: 0,
    canceledAppointments: 0,
    averageResponseTime: 0,
    isConfigured: false,
    isActive: false,
    whatsappConnected: false,
  });

  useEffect(() => {
    document.title = 'IA WhatsApp | Pulse Salon Manager';
    return () => {
      document.title = 'Pulse Salon Manager';
    };
  }, []);

  useEffect(() => {
    fetchConfig();
  }, []);

  // ID do estabelecimento
  const getUserId = () => {
    return user?.currentUser?.id || 'f99712db-5da1-4c3e-a9c6-887b0809a6b2';
  };

  // Buscar configuração
  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      const userId = getUserId();
      
      // Buscar configuração da IA WhatsApp
      const { data, error } = await supabase
        .from('whatsapp_ia_config')
        .select('*')
        .eq('establishment_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Registro não encontrado, criar um novo
          const newConfig = {
            establishment_id: userId,
            active: false,
            welcome_message: 'Olá! Sou o assistente virtual do salão. Como posso ajudar você hoje?',
            establishment_info: '',
            openai_key: '',  // A chave será configurada pelo usuário na interface
            instance_id: '1U3F27-WDQ2RG-AGAT7I',
            instance_token: ''
          };
          
          const { data: newData, error: insertError } = await supabase
            .from('whatsapp_ia_config')
            .insert(newConfig)
            .select()
            .single();
          
          if (insertError) {
            console.error("Erro ao criar configuração:", insertError);
            toast({
              title: "Erro",
              description: "Não foi possível criar a configuração de IA WhatsApp.",
              variant: "destructive",
            });
          } else {
            console.log("Nova configuração criada:", newData);
            setConfig({
              ...newConfig
            });
            
            // Verificar se a instância está configurada com o serviço
            const service = new WhatsAppGPTService(userId);
            const isValid = await service.checkInstanceToken(newConfig.instance_token);
            
            setStats(prevStats => ({
              ...prevStats,
              isConfigured: !!newConfig.openai_key,
              isActive: newConfig.active,
              whatsappConnected: isValid
            }));
          }
        } else {
          console.error("Erro ao buscar configuração:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar a configuração de IA WhatsApp.",
            variant: "destructive",
          });
        }
      } else {
        console.log("Configuração carregada:", data);
        
        setConfig({
          establishment_id: data.establishment_id,
          active: data.active || false,
          welcome_message: data.welcome_message || 'Olá! Sou o assistente virtual do salão. Como posso ajudar você hoje?',
          establishment_info: data.establishment_info || '',
          openai_key: data.openai_key || '',  // A chave será obtida do banco de dados
          instance_id: data.instance_id || '1U3F27-WDQ2RG-AGAT7I',
          instance_token: data.instance_token || ''
        });
        
        // Verificar se a instância está configurada com o serviço
        const service = new WhatsAppGPTService(userId);
        const isValid = await service.checkInstanceToken(data.instance_token);
        
        setStats(prevStats => ({
          ...prevStats,
          isConfigured: !!data.openai_key,
          isActive: data.active || false,
          whatsappConnected: isValid
        }));
      }
    } catch (error) {
      console.error("Exceção ao buscar configuração:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar configuração
  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      
      // ID do estabelecimento
      const userId = getUserId();
      
      // Verificar se a configuração existe
      const { data: existingConfig } = await supabase
        .from('whatsapp_ia_config')
        .select('id')
        .eq('establishment_id', userId)
        .single();
      
      // Dados para salvar
      const configToSave = {
        establishment_id: userId,
        active: config.active,
        welcome_message: config.welcome_message,
        establishment_info: config.establishment_info,
        openai_key: config.openai_key,
        instance_id: config.instance_id,
        instance_token: config.instance_token
      };
      
      let result;
      
      if (existingConfig) {
        // Atualizar
        result = await supabase
          .from('whatsapp_ia_config')
          .update(configToSave)
          .eq('establishment_id', userId);
      } else {
        // Inserir
        result = await supabase
          .from('whatsapp_ia_config')
          .insert(configToSave);
      }
      
      if (result.error) {
        console.error('Erro ao salvar configuração:', result.error);
        toast({
          title: 'Erro',
          description: 'Erro ao salvar configuração: ' + result.error.message,
          variant: 'destructive',
        });
        return;
      }
      
      // Verificar se a instância está configurada com o serviço
      const service = new WhatsAppGPTService(userId);
      const isValid = await service.checkInstanceToken(config.instance_token);
      
      setStats(prevStats => ({
        ...prevStats,
        isConfigured: !!config.openai_key,
        isActive: config.active,
        whatsappConnected: isValid,
      }));
      
      toast({
        title: 'Sucesso',
        description: 'Configuração salva com sucesso!',
      });
      
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração. Consulte o console para mais detalhes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setConfig(prev => ({ ...prev, active: checked }));
  };

  // Componente de Configuração
  const renderConfig = () => {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="active" 
                checked={config.active} 
                onCheckedChange={handleSwitchChange} 
              />
              <Label htmlFor="active">Ativar IA WhatsApp</Label>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuração do ChatGPT 3.5</h3>
              <div className="space-y-2">
                <Label htmlFor="openai_key">Chave da API ChatGPT</Label>
                <Input
                  id="openai_key"
                  name="openai_key"
                  placeholder="sk-..."
                  value={config.openai_key}
                  onChange={handleChange}
                  type="password"
                />
                <p className="text-sm text-gray-500">
                  A API ChatGPT 3.5 será usada para processar mensagens.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuração da W-API</h3>
              <div className="space-y-2">
                <Label htmlFor="instance_id">ID da Instância</Label>
                <Input
                  id="instance_id"
                  name="instance_id"
                  placeholder="ID da instância W-API"
                  value={config.instance_id}
                  onChange={handleChange}
                  disabled
                />
                <p className="text-sm text-gray-500">
                  ID da instância W-API fixa conforme solicitado.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instance_token">Token da Instância</Label>
                <Input
                  id="instance_token"
                  name="instance_token"
                  placeholder="Token de acesso W-API"
                  value={config.instance_token}
                  onChange={handleChange}
                  type="password"
                />
                <p className="text-sm text-gray-500">
                  Token de acesso para sua instância da W-API.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuração de Mensagens</h3>
              <div className="space-y-2">
                <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
                <Textarea
                  id="welcome_message"
                  name="welcome_message"
                  placeholder="Mensagem enviada quando um cliente inicia a conversa"
                  value={config.welcome_message}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="establishment_info">Informações do Estabelecimento</Label>
                <Textarea
                  id="establishment_info"
                  name="establishment_info"
                  placeholder="Informações adicionais sobre o estabelecimento para a IA (horário de funcionamento, serviços, localização, etc.)"
                  value={config.establishment_info}
                  onChange={handleChange}
                  rows={6}
                />
                <p className="text-sm text-gray-500">
                  Essas informações serão usadas pela IA para responder perguntas sobre o estabelecimento.
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleSaveConfig} 
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? 
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </> : 
                  'Salvar Configurações'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderização principal
  return (
    <>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-8">
          <Bot className="h-8 w-8 mr-3 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">IA WhatsApp</h1>
            <p className="text-gray-600">
              Automatize o atendimento dos seus clientes com ChatGPT 3.5
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            {stats.isConfigured && stats.isActive ? (
              <IAWhatsappDashboard />
            ) : (
              <Alert className="mb-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuração necessária</AlertTitle>
                <AlertDescription>
                  {!stats.isConfigured 
                    ? 'Você precisa configurar sua integração com ChatGPT e W-API para começar a usar a IA do WhatsApp.' 
                    : 'A integração está configurada, mas não está ativa.'}
                  {' '}Vá para a aba de Configuração para {!stats.isConfigured ? 'completar a instalação' : 'ativar o serviço'}.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="config">
            {renderConfig()}
          </TabsContent>
          
          <TabsContent value="webhook">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Configuração de Webhook</h2>
              <p className="text-gray-600">
                Configure o webhook para receber mensagens do WhatsApp automaticamente. 
                O webhook é necessário para que a IA possa responder às mensagens.
              </p>
              
              {stats.isConfigured ? (
                <WebhookHandler 
                  instanceId={config.instance_id}
                  instanceToken={config.instance_token}
                  establishmentId={config.establishment_id}
                />
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Configuração necessária</AlertTitle>
                  <AlertDescription>
                    Primeiro configure o token da instância e a chave da API ChatGPT na aba Configuração.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default IAWhatsapp;
