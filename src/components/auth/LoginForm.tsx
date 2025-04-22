import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { sendLoginNotification } from "@/services/whatsapp/api";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função para buscar os dados do estabelecimento
  const fetchEstablishmentData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("establishment, whatsapp")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar dados do estabelecimento:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar dados do estabelecimento:", error);
      return null;
    }
  };

  // Função para enviar notificação de login
  const sendLoginAlert = async (userId: string) => {
    try {
      // Buscar dados do estabelecimento
      const establishmentData = await fetchEstablishmentData(userId);
      
      if (establishmentData && establishmentData.whatsapp && establishmentData.establishment) {
        // Remover caracteres não numéricos do WhatsApp
        const phoneNumber = establishmentData.whatsapp.replace(/\D/g, '');
        
        // Adicionar o prefixo do país se não tiver
        const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
        
        // Enviar notificação (não aguardamos a conclusão)
        sendLoginNotification(establishmentData.establishment, formattedPhone);
      }
    } catch (error) {
      console.error("Erro ao enviar notificação de login:", error);
      // Não bloqueamos o fluxo principal em caso de erro
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios");
      }

      // Validação básica de email
      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error("Formato de email inválido");
      }
      
      console.log(`Tentando login com email: ${email.substring(0, 3)}...`);
      
      // Autenticação com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error("Erro de autenticação:", error.message);
        throw error;
      }

      if (data && data.user) {
        toast({
          title: "Login realizado com sucesso",
          description: "Você será redirecionado para o dashboard.",
          variant: "success"
        });
        
        // Enviar notificação de login via WhatsApp de forma assíncrona
        // para não bloquear o fluxo principal
        setTimeout(() => {
          sendLoginAlert(data.user.id).catch(err => {
            console.error("Erro ao enviar alerta de login:", err);
          });
        }, 100);
        
        // Redirecionar para o dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error) {
      let mensagem = "Por favor, verifique suas credenciais e tente novamente.";
      
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          mensagem = "Credenciais inválidas. Verifique seu email e senha.";
        } else if (error.message.includes("Email")) {
          mensagem = error.message;
        } else if (error.message.includes("rate limited")) {
          mensagem = "Muitas tentativas de login. Tente novamente mais tarde.";
        }
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: mensagem,
        className: "shadow-xl"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={20} />
          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
            required
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={20} />
          <Input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="rounded border-gray-300 text-pink-500 focus:ring-pink-300"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember" className="text-sm text-neutral-soft">
            Lembrar-me
          </label>
        </div>

        <Link to="/forgot-password" className="text-sm text-pink-600 hover:text-pink-700 transition-colors duration-200">
          Esqueceu sua senha?
        </Link>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg flex items-center justify-center"
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
