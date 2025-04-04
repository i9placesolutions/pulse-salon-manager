import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, Loader2, LogIn, Check } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { supabase } from "@/integrations/supabase/client";
import { sendTextMessage, MAIN_INSTANCE_TOKEN } from "@/lib/whatsappApi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profileState, setProfileState, establishmentName, setEstablishmentName } = useAppState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fazer login com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          throw new Error("E-mail não confirmado. Por favor, verifique sua caixa de entrada e confirme seu e-mail para continuar.");
        }
        throw error;
      }

      // Buscar dados do perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar dados de detalhes do estabelecimento
      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishment_details')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Não tratar como erro se não encontrar detalhes, só informações básicas são obrigatórias
      if (establishmentError && establishmentError.code !== 'PGRST116') {
        console.error("Erro ao buscar detalhes do estabelecimento:", establishmentError);
      }

      if (profileData) {
        // Atualizar estado do contexto com os dados do perfil
        setEstablishmentName(profileData.establishment_name);
        setProfileState({
          isProfileComplete: profileData.is_profile_complete,
          isFirstLogin: false,
          trialEndsAt: profileData.trial_ends_at ? new Date(profileData.trial_ends_at) : null,
          subscriptionActive: profileData.subscription_active
        });

        // Salvar no localStorage
        localStorage.setItem('profileComplete', profileData.is_profile_complete.toString());
        localStorage.setItem('firstLogin', 'false');
        localStorage.setItem('establishmentName', profileData.establishment_name);
        if (profileData.trial_ends_at) {
          localStorage.setItem('trialEndsAt', profileData.trial_ends_at);
        }
        localStorage.setItem('subscriptionActive', profileData.subscription_active.toString());

        // Redirecionar com base no estado do perfil
        redirectAfterLogin(profileData);
      }
      
    } catch (error: any) {
      setIsLoading(false);
      
      // Mensagem especial para e-mail não confirmado
      if (error.message.includes("E-mail não confirmado")) {
        toast({
          variant: "warning",
          title: "E-mail não confirmado",
          description: "Por favor, verifique sua caixa de entrada e confirme seu e-mail para continuar.",
          className: "shadow-xl animate-shake",
          duration: 10000 // 10 segundos para essa mensagem importante
        });
        return;
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message || "Por favor, verifique suas credenciais e tente novamente.",
        className: "shadow-xl animate-shake"
      });
    }
  };

  // Função para redirecionar com base no estado do perfil e da assinatura
  const redirectAfterLogin = (profileData: any) => {
    // Se o perfil estiver completo
    if (profileData.is_profile_complete) {
      // Verificar se a assinatura está ativa ou se ainda está no período de teste
      const today = new Date();
      const trialEndsAt = profileData.trial_ends_at ? new Date(profileData.trial_ends_at) : null;
      
      // Se o período de teste acabou e não tem assinatura ativa
      if (!profileData.subscription_active && trialEndsAt && today > trialEndsAt) {
        navigate("/mensalidade");
        toast({
          title: "Período de teste encerrado",
          description: "Seu período de teste de 7 dias acabou. Por favor, escolha um plano para continuar.",
          variant: "destructive",
          className: "shadow-xl"
        });
      } else {
        // Redirecionar para o dashboard (perfil completo e assinatura ativa ou ainda no período de teste)
        navigate("/dashboard");
        
        // Enviar notificação de login por WhatsApp
        sendLoginNotificationWhatsApp(profileData);
        
        // Se estiver no período de teste, mostrar mensagem com dias restantes
        if (!profileData.subscription_active && trialEndsAt && today <= trialEndsAt) {
          const daysLeft = Math.ceil((trialEndsAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          toast({
            title: `Bem-vindo ao ${profileData.establishment_name}`,
            description: `Você está no período de teste. Restam ${daysLeft} dias.`,
            variant: "info",
            className: "shadow-xl"
          });
        } else {
          // Usuário com assinatura ativa
          toast({
            title: `Bem-vindo ao ${profileData.establishment_name}`,
            description: "Login realizado com sucesso!",
            variant: "success",
            className: "shadow-xl"
          });
        }
      }
    } else {
      // Perfil incompleto, redirecionar para a página de perfil
      navigate("/establishment-profile");
      toast({
        title: "Complete seu perfil",
        description: "É necessário completar seu perfil para continuar.",
        variant: "warning",
        className: "shadow-xl"
      });
    }
    
    setIsLoading(false);
  };

  // Função para enviar notificação de login por WhatsApp
  const sendLoginNotificationWhatsApp = async (profileData: any) => {
    try {
      // Buscar dados detalhados do estabelecimento para obter o número de WhatsApp
      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishment_details')
        .select('whatsapp')
        .eq('id', profileData.id)
        .single();

      if (establishmentError || !establishmentData?.whatsapp) {
        console.error("Erro ao buscar WhatsApp do estabelecimento:", establishmentError);
        return;
      }

      // Formatar o número de telefone (remover formatação)
      const phoneNumber = establishmentData.whatsapp.replace(/\D/g, "");
      
      // Formatação da data e hora atuais
      const currentDate = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
      const currentTime = format(new Date(), "HH:mm", { locale: ptBR });

      // Preparar a mensagem
      const messageText = `✨ Login realizado com sucesso no *Pulse Salon Manager!*
👤 Usuário: *${email}*
🏢 Estabelecimento: *${profileData.establishment_name}*
📅 Data: *${currentDate}*
🕒 Horário: *${currentTime}*

Se não foi você, entre em contato com o suporte imediatamente. 🔒`;

      // Enviar a mensagem usando a instância principal de notificação
      await sendTextMessage({
        number: phoneNumber,
        text: messageText,
        token: MAIN_INSTANCE_TOKEN, // Usar o token da instância principal
        readchat: true
      });

      console.log("Notificação de login enviada com sucesso");
    } catch (error) {
      console.error("Erro ao enviar notificação de login:", error);
      // Não mostrar toast de erro para o usuário para não afetar a experiência
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 animate-fade-in">
      <div className="space-y-5">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-indigo-500" />
            Email
          </label>
          <div className="relative group">
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all duration-300 pl-3"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-indigo-500" />
              Senha
            </label>
            <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors duration-200 hover:underline">
              Esqueceu?
            </Link>
          </div>
          <div className="relative group">
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all duration-300 pl-3"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div 
          className={`w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-all duration-200 border ${
            rememberMe 
              ? 'bg-indigo-600 border-indigo-600' 
              : 'bg-white border-gray-300 hover:border-indigo-500'
          }`}
          onClick={() => setRememberMe(!rememberMe)}
        >
          {rememberMe && <Check className="h-3 w-3 text-white" />}
        </div>
        <label 
          htmlFor="remember" 
          className="text-sm text-gray-600 cursor-pointer select-none"
          onClick={() => setRememberMe(!rememberMe)}
        >
          Lembrar-me
        </label>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" /> Entrar
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
