import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Settings, 
  MessageSquare, 
  Users, 
  CreditCard, 
  FileText, 
  Shield, 
  Save,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfigGeral } from "@/components/configuracoes/ConfigGeral";
import { ConfigWhatsApp } from "@/components/configuracoes/ConfigWhatsApp";
import { ConfigSeguranca } from "@/components/configuracoes/ConfigSeguranca";
import { ConfigUsuarios } from "@/components/configuracoes/ConfigUsuarios";
import { ConfigPagamentos } from "@/components/configuracoes/ConfigPagamentos";
import { ConfigRelatorios } from "@/components/configuracoes/ConfigRelatorios";
import { ConfigLinkAgendamento } from "@/components/configuracoes/ConfigLinkAgendamento";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppState } from "@/contexts/AppStateContext";
import { supabase } from "@/integrations/supabase/client";
import { sendTextMessage, MAIN_INSTANCE_TOKEN } from "@/lib/whatsappApi";
import { saveConfigAndSendWhatsApp } from "@/lib/whatsapp";

export default function Configuracoes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("geral");
  const configGeralRef = useRef<any>(null);
  const configWhatsAppRef = useRef<any>(null);
  const configSegurancaRef = useRef<any>(null);
  const configUsuariosRef = useRef<any>(null);
  const configPagamentosRef = useRef<any>(null);
  const configRelatoriosRef = useRef<any>(null);
  const configLinkAgendamentoRef = useRef<any>(null);
  const { profileState, setProfileState, establishmentName } = useAppState();
  const [tentouSair, setTentouSair] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [estabelecimentoData, setEstabelecimentoData] = useState<any>(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [wasRedirected, setWasRedirected] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");
  
  // Verificar se o usuário foi redirecionado de outra página
  useEffect(() => {
    if (location.state && location.state.blockedRoute) {
      setWasRedirected(true);
      setRedirectMessage(location.state.message || "Complete seu cadastro antes de continuar.");
      
      // Limpar o estado para não mostrar a mensagem novamente após navegação
      navigate("/configuracoes", { replace: true });
      
      // Mostrar toast de aviso
      toast({
        title: "Acesso bloqueado",
        description: location.state.message || "Complete seu cadastro antes de continuar.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [location, navigate, toast]);
  
  // Verificar se é o primeiro login e se o perfil está incompleto
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Verificar se o perfil está completo
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // Verificar se há detalhes do estabelecimento
        const { data: estabelecimentoData } = await supabase
          .from('establishment_details')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // Determinar se é primeiro login e se o perfil está incompleto
        const isMissingEstablishmentDetails = !estabelecimentoData;
        
        const isProfileMissingInfo = !profileData?.establishment_name ||
          !estabelecimentoData?.whatsapp ||
          !estabelecimentoData?.address_street ||
          !estabelecimentoData?.address_city ||
          !estabelecimentoData?.address_state ||
          !estabelecimentoData?.address_zipcode;
        
        const urlParams = new URLSearchParams(window.location.search);
        const fromConfirmation = urlParams.get('fromConfirmation') === 'true';
        
        setIsFirstLogin(fromConfirmation || isMissingEstablishmentDetails);
        setProfileIncomplete(isProfileMissingInfo);
        
        // Se veio da confirmação de email, exibir toast de boas-vindas
        if (fromConfirmation) {
          toast({
            title: "Email confirmado com sucesso!",
            description: "Complete as informações do seu estabelecimento para começar a usar o sistema.",
            variant: "default",
            duration: 5000,
          });
          
          // Limpar o parâmetro da URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      } catch (error) {
        console.error("Erro ao verificar status do perfil:", error);
      }
    };
    
    checkProfileStatus();
  }, [supabase, toast]);
  
  // Interceptar tentativas de navegação se o perfil estiver incompleto
  useEffect(() => {
    // Bloquear navegação para perfis incompletos
    if (!profileState.isProfileComplete) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        setTentouSair(true);
        return '';
      };
      
      const handlePopState = (e: PopStateEvent) => {
        // Prevenir navegação do histórico se o perfil estiver incompleto
        if (!profileState.isProfileComplete) {
          e.preventDefault();
          setTentouSair(true);
          toast({
            title: "Ação não permitida",
            description: "Complete o cadastro antes de navegar para outras páginas.",
            variant: "destructive",
            duration: 3000,
          });
          // Forçar permanência na página atual
          window.history.pushState(null, '', window.location.pathname);
          return false;
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      // Forçar permanência na página atual adicionando um estado ao histórico
      window.history.pushState(null, '', window.location.pathname);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [profileState.isProfileComplete, toast]);
  
  // Obter a aba inicial da navegação, se disponível
  useEffect(() => {
    if (location.state && location.state.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location]);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Obter dados do formulário dos diferentes componentes
      const formDataGeral = configGeralRef.current?.getFormData();
      const formDataWhatsApp = configWhatsAppRef.current?.getFormData?.();
      const formDataSeguranca = configSegurancaRef.current?.getFormData?.();
      const formDataPagamentos = configPagamentosRef.current?.getFormData?.();
      const formDataRelatorios = configRelatoriosRef.current?.getFormData?.();
      const formDataLinkAgendamento = configLinkAgendamentoRef.current?.getFormData?.();
      
      if (!formDataGeral) {
        throw new Error("Não foi possível obter os dados do formulário");
      }
      
      // Verificar se os campos obrigatórios estão preenchidos
      const camposObrigatorios = ['nome', 'whatsapp', 'endereco', 'cidade', 'estado', 'cep'];
      const camposFaltantes = camposObrigatorios.filter(campo => !formDataGeral[campo]);
      
      if (camposFaltantes.length > 0) {
        toast({
          title: "Campos obrigatórios não preenchidos",
          description: `Os seguintes campos são obrigatórios: ${camposFaltantes.join(', ')}`,
          variant: "destructive",
          className: "shadow-xl"
        });
        setIsLoading(false);
        return;
      }
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro ao salvar",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Criar data para finalização do período de teste (7 dias a partir de hoje)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      
      // Atualizar perfil no Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          is_profile_complete: true,
          establishment_name: formDataGeral.nome,
          trial_ends_at: trialEndsAt.toISOString(),
          subscription_active: true // Ativo durante o período de teste
        })
        .eq('id', user.id)
        .select()
        .single();
        
      if (profileError) throw profileError;
      
      // Salvar detalhes do estabelecimento
      const { data: estabelecimentoData, error: estabelecimentoError } = await supabase
        .from('establishment_details')
        .upsert({
          id: user.id,
          
          // Informações gerais
          email: formDataGeral.email,
          whatsapp: formDataGeral.whatsapp,
          document_type: 'CNPJ',
          document_number: formDataGeral.cnpj,
          address_street: formDataGeral.endereco,
          address_city: formDataGeral.cidade,
          address_state: formDataGeral.estado,
          address_zipcode: formDataGeral.cep,
          address_latitude: formDataGeral.latitude || '',
          address_longitude: formDataGeral.longitude || '',
          description: formDataGeral.descricao || '',
          responsible_phone: formDataGeral.telefone || '',
          
          // Informações de horário
          working_hours: formDataGeral.horarios || {},
          
          // Configurações regionais
          timezone: formDataGeral.configRegionais?.fusoHorario || 'America/Sao_Paulo',
          date_format: formDataGeral.configRegionais?.formatoData || 'DD/MM/YYYY',
          time_format: formDataGeral.configRegionais?.formatoHora || '24h',
          currency: formDataGeral.configRegionais?.moeda || 'BRL',
          language: formDataGeral.configRegionais?.idiomaSistema || 'pt-BR',
          
          // Configurações de notificações
          notifications_settings: formDataGeral.configNotificacoes || {},
          
          // Informações de WhatsApp
          whatsapp_instance_token: formDataWhatsApp?.instanceToken || '',
          whatsapp_instance_status: formDataWhatsApp?.instanceStatus || '',
          whatsapp_instance_name: formDataWhatsApp?.instanceName || '',
          whatsapp_qrcode: formDataWhatsApp?.qrcode || '',
          whatsapp_paircode: formDataWhatsApp?.paircode || '',
          whatsapp_profile_name: formDataWhatsApp?.profileName || '',
          whatsapp_profile_pic_url: formDataWhatsApp?.profilePicUrl || '',
          
          // Link de agendamento
          custom_url: formDataLinkAgendamento?.customUrl || '',
          
          // Configurações de segurança
          security_settings: formDataSeguranca || {},
          
          // Configurações de pagamento
          payment_methods: formDataPagamentos?.metodosPagamento || {},
          installment_config: formDataPagamentos?.parcelamento || {},
          
          // Configurações de relatórios
          report_settings: formDataRelatorios?.configuracao || {},
          report_recipients: formDataRelatorios?.destinatarios || [],
          
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();
      
      if (estabelecimentoError) throw estabelecimentoError;
      
      // Atualizar estado de perfil completo
      setProfileState(prev => ({
        ...prev,
        isProfileComplete: true,
        isFirstLogin: false,
        trialEndsAt: trialEndsAt,
        subscriptionActive: true
      }));
      
      localStorage.setItem('profileComplete', 'true');
      localStorage.setItem('firstLogin', 'false');
      localStorage.setItem('trialEndsAt', trialEndsAt.toISOString());
      localStorage.setItem('subscriptionActive', 'true');
      
      // Se for o primeiro login e configurou tudo com sucesso, enviar mensagem WhatsApp
      if (isFirstLogin) {
        await saveConfigAndSendWhatsApp(formDataGeral.whatsapp, formDataGeral.nome);
        setIsFirstLogin(false);
        setProfileIncomplete(false);
        
        // Mostrar mensagem específica para primeiro cadastro concluído
        toast({
          title: "Cadastro concluído com sucesso!",
          description: `Parabéns! Seu estabelecimento foi cadastrado e você tem 7 dias de teste gratuito. Uma mensagem de confirmação foi enviada via WhatsApp.`,
          variant: "success",
          className: "shadow-xl",
          duration: 6000, // Duração maior para mensagem importante
        });
        
        // Adicionar alerta permanente sobre o período de teste
        setTimeout(() => {
          // Redirecionar para o dashboard após o cadastro
          navigate("/dashboard");
        }, 2000);
      } else {
        // Mostrar mensagem de sucesso para atualizações regulares
        toast({
          title: "Configurações salvas",
          description: "As configurações foram salvas com sucesso!",
          variant: "success",
          className: "shadow-xl"
        });
      }
      
      // Salvar os dados para referência
      setEstabelecimentoData(estabelecimentoData);
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
        className: "shadow-xl"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para enviar mensagem de boas-vindas via WhatsApp
  const enviarMensagemBoasVindas = async (whatsapp: string, nomeEstabelecimento: string) => {
    try {
      // Formatação do número (remover caracteres não numéricos)
      const phoneNumber = whatsapp.replace(/\D/g, "");
      
      // Preparar a mensagem
      const mensagem = `👋 Olá, *${nomeEstabelecimento}!*
✅ Seu cadastro foi concluído com sucesso!
🚀 A partir de agora, você tem _7 dias grátis_ para testar o sistema *Pulse Salon Manager.*

💬 Dúvidas? É só chamar, estou sempre por aqui pra te ajudar!`;

      // Enviar a mensagem
      await sendTextMessage({
        number: phoneNumber,
        text: mensagem,
        token: MAIN_INSTANCE_TOKEN,
        readchat: true
      });
      
      console.log("Mensagem de boas-vindas enviada com sucesso");
    } catch (error) {
      console.error("Erro ao enviar mensagem de boas-vindas:", error);
      // Não exibir erro para o usuário para não afetar a experiência
    }
  };
  
  return (
    <PageLayout>
      <PageHeader
        title="Configurações"
        subtitle="Personalize as configurações do seu estabelecimento"
        action={
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Salvando...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        }
      />
      
      {wasRedirected && redirectMessage && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-600">
            {redirectMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {profileIncomplete && !wasRedirected && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-600">
            {isFirstLogin 
              ? "Bem-vindo! Complete seu cadastro para começar a usar o sistema."
              : "Complete as informações do seu perfil para usar todas as funcionalidades."}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs 
        defaultValue="geral" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 mb-8">
          <TabsTrigger value="geral" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden md:inline">Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="agenda" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden md:inline">Link Agendamento</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4">
          <ConfigGeral ref={configGeralRef} isFirstLogin={isFirstLogin} />
        </TabsContent>
        
        <TabsContent value="whatsapp" className="space-y-4">
          <ConfigWhatsApp />
        </TabsContent>
        
        <TabsContent value="usuarios" className="space-y-4">
          <ConfigUsuarios />
        </TabsContent>
        
        <TabsContent value="pagamentos" className="space-y-4">
          <ConfigPagamentos />
        </TabsContent>
        
        <TabsContent value="relatorios" className="space-y-4">
          <ConfigRelatorios />
        </TabsContent>
        
        <TabsContent value="seguranca" className="space-y-4">
          <ConfigSeguranca />
        </TabsContent>
        
        <TabsContent value="agenda" className="space-y-4">
          <ConfigLinkAgendamento />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
