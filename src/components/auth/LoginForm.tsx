import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, Loader2, LogIn, Check } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profileState, establishmentName } = useAppState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simular login (a ser implementado com backend real)
      setTimeout(() => {
        // Verificar para onde redirecionar com base no estado do perfil/assinatura
        redirectAfterLogin();
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Por favor, verifique suas credenciais e tente novamente.",
        className: "shadow-xl animate-shake"
      });
    }
  };

  // Função para redirecionar com base no estado do perfil e da assinatura
  const redirectAfterLogin = () => {
    // Se o perfil estiver completo
    if (profileState.isProfileComplete) {
      // Verificar se a assinatura está ativa ou se ainda está no período de teste
      const today = new Date();
      
      // Se o período de teste acabou e não tem assinatura ativa
      if (!profileState.subscriptionActive && profileState.trialEndsAt && today > profileState.trialEndsAt) {
        navigate("/mensalidade");
        toast({
          title: "Período de teste encerrado",
          description: "Seu período de teste acabou. Por favor, escolha um plano para continuar.",
          variant: "destructive",
          className: "shadow-xl"
        });
      } else {
        // Redirecionar para o dashboard (perfil completo e assinatura ativa ou ainda no período de teste)
        navigate("/dashboard");
        
        // Se estiver no período de teste, mostrar mensagem com dias restantes
        if (!profileState.subscriptionActive && profileState.trialEndsAt && today <= profileState.trialEndsAt) {
          const daysLeft = Math.ceil((profileState.trialEndsAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          toast({
            title: `Bem-vindo ao ${establishmentName}`,
            description: `Você está no período de teste. Restam ${daysLeft} dias.`,
            variant: "info",
            className: "shadow-xl"
          });
        } else {
          // Usuário com assinatura ativa
          toast({
            title: `Bem-vindo ao ${establishmentName}`,
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

  const handleTestLogin = () => {
    setIsLoading(true);
    // Usar a mesma lógica de redirecionamento
    setTimeout(() => {
      redirectAfterLogin();
    }, 1000);
  };

  const handleQuickFill = () => {
    setEmail("teste@pulse.com");
    setPassword("123456");
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Acesso rápido</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="bg-blue-50/50 hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 font-medium rounded-lg transition-all duration-200 text-sm"
          onClick={handleQuickFill}
        >
          Preencher Demo
        </Button>
        <Button
          type="button"
          className="bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 font-medium rounded-lg transition-all duration-200 text-sm"
          onClick={handleTestLogin}
        >
          Acessar Demo
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
